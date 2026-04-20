import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Save, Upload, Video, Trophy, Newspaper } from "lucide-react";

type MediaType = "video" | "achievement" | "press";

interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  external_url: string | null;
  source: string | null;
  item_date: string | null;
  sort_order: number;
  is_active: boolean;
}

const TYPE_META: Record<MediaType, { label: string; icon: typeof Video; description: string }> = {
  video: { label: "Videos", icon: Video, description: "YouTube/embed URLs displayed on the Videos page." },
  achievement: { label: "Achievements", icon: Trophy, description: "Awards, milestones and accolades for the school." },
  press: { label: "Press & Media", icon: Newspaper, description: "News articles and press mentions about the school." },
};

const AdminMedia = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<MediaType>("video");
  const [edits, setEdits] = useState<Record<string, Partial<MediaItem>>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-media-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_items")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("item_date", { ascending: false });
      if (error) throw error;
      return data as MediaItem[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (type: MediaType) => {
      const { error } = await supabase.from("media_items").insert({
        type,
        title: "New entry",
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media-items"] });
      queryClient.invalidateQueries({ queryKey: ["media-items"] });
      toast({ title: "Added" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<MediaItem> }) => {
      const { error } = await supabase.from("media_items").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-media-items"] });
      queryClient.invalidateQueries({ queryKey: ["media-items"] });
      setEdits((prev) => {
        const { [vars.id]: _omit, ...rest } = prev;
        return rest;
      });
      toast({ title: "Saved" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("media_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media-items"] });
      queryClient.invalidateQueries({ queryKey: ["media-items"] });
      toast({ title: "Deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleField = (id: string, field: keyof MediaItem, value: string | number | boolean) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSave = (item: MediaItem) => {
    const patch = edits[item.id];
    if (!patch || Object.keys(patch).length === 0) return;
    updateMutation.mutate({ id: item.id, patch });
  };

  const handleToggle = (item: MediaItem, value: boolean) => {
    updateMutation.mutate({ id: item.id, patch: { is_active: value } });
  };

  const handleImageUpload = async (item: MediaItem, file: File) => {
    setUploadingId(item.id);
    const ext = file.name.split(".").pop();
    const path = `media/${item.type}-${item.id}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("site-assets").upload(path, file);
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploadingId(null);
      return;
    }
    const { data: urlData } = supabase.storage.from("site-assets").getPublicUrl(path);
    updateMutation.mutate({ id: item.id, patch: { image_url: urlData.publicUrl } });
    setUploadingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filtered = (type: MediaType) => items?.filter((i) => i.type === type) ?? [];

  const renderItem = (item: MediaItem) => {
    const e = edits[item.id] ?? {};
    const get = <K extends keyof MediaItem>(field: K): MediaItem[K] =>
      (e[field] !== undefined ? e[field] : item[field]) as MediaItem[K];

    return (
      <Card key={item.id} className={item.is_active ? "" : "opacity-60"}>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Title</Label>
              <Input
                value={(get("title") as string) ?? ""}
                onChange={(ev) => handleField(item.id, "title", ev.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={item.is_active} onCheckedChange={(v) => handleToggle(item, v)} />
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Date</Label>
              <Input
                type="date"
                value={(get("item_date") as string) ?? ""}
                onChange={(ev) => handleField(item.id, "item_date", ev.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Sort order</Label>
              <Input
                type="number"
                value={(get("sort_order") as number) ?? 0}
                onChange={(ev) => handleField(item.id, "sort_order", Number(ev.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
            <Textarea
              rows={3}
              value={(get("description") as string) ?? ""}
              onChange={(ev) => handleField(item.id, "description", ev.target.value)}
            />
          </div>

          {item.type === "video" && (
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Video URL (YouTube watch/embed link)
              </Label>
              <Input
                value={(get("video_url") as string) ?? ""}
                onChange={(ev) => handleField(item.id, "video_url", ev.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          )}

          {item.type === "press" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Publication / Source</Label>
                <Input
                  value={(get("source") as string) ?? ""}
                  onChange={(ev) => handleField(item.id, "source", ev.target.value)}
                  placeholder="e.g. The Times of India"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Article URL</Label>
                <Input
                  value={(get("external_url") as string) ?? ""}
                  onChange={(ev) => handleField(item.id, "external_url", ev.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          {item.type === "achievement" && (
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">External link (optional)</Label>
              <Input
                value={(get("external_url") as string) ?? ""}
                onChange={(ev) => handleField(item.id, "external_url", ev.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              {item.type === "video" ? "Thumbnail image (optional)" : "Image"}
            </Label>
            {(get("image_url") as string) && (
              <img
                src={get("image_url") as string}
                alt={item.title}
                className="h-32 w-auto rounded border object-cover"
              />
            )}
            <div className="flex gap-2">
              <Input
                value={(get("image_url") as string) ?? ""}
                onChange={(ev) => handleField(item.id, "image_url", ev.target.value)}
                placeholder="Image URL"
              />
              <label>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(ev) => {
                    const file = ev.target.files?.[0];
                    if (file) handleImageUpload(item, file);
                  }}
                />
                <Button variant="outline" size="sm" asChild disabled={uploadingId === item.id}>
                  <span>
                    {uploadingId === item.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload
                  </span>
                </Button>
              </label>
            </div>
          </div>

          <div className="flex justify-between border-t pt-4">
            <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(item.id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(item)}
              disabled={!edits[item.id] || updateMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl">Media Manager</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Manage entries shown on the public Videos, Achievements, and Press &amp; Media pages.
      </p>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MediaType)}>
        <TabsList>
          {(Object.keys(TYPE_META) as MediaType[]).map((t) => {
            const Icon = TYPE_META[t].icon;
            return (
              <TabsTrigger key={t} value={t} className="gap-2">
                <Icon className="h-4 w-4" />
                {TYPE_META[t].label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(TYPE_META) as MediaType[]).map((t) => (
          <TabsContent key={t} value={t} className="space-y-4 pt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{TYPE_META[t].label}</CardTitle>
                  <p className="text-sm text-muted-foreground">{TYPE_META[t].description}</p>
                </div>
                <Button onClick={() => addMutation.mutate(t)} disabled={addMutation.isPending}>
                  <Plus className="mr-2 h-4 w-4" /> Add {TYPE_META[t].label.replace(/s$/, "")}
                </Button>
              </CardHeader>
            </Card>

            {filtered(t).length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No entries yet. Click "Add" to create one.
              </p>
            ) : (
              <div className="grid gap-4">{filtered(t).map(renderItem)}</div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminMedia;
