import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AdminContent = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  const { data: content, isLoading } = useQuery({
    queryKey: ["admin-site-content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("*").order("section");
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase.from("site_content").update({ value }).eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-content"] });
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast({ title: "Saved!" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleSave = (key: string) => {
    const value = editValues[key];
    if (value !== undefined) {
      updateMutation.mutate({ key, value });
    }
  };

  const handleImageUpload = async (key: string, file: File) => {
    setUploading(key);
    const ext = file.name.split(".").pop();
    const path = `content/${key}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("site-assets").upload(path, file);
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage.from("site-assets").getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    const { error } = await supabase.from("site_content").update({ value: publicUrl }).eq("key", key);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["admin-site-content"] });
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast({ title: "Image updated!" });
    }
    setUploading(null);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Sections hidden from the generic Site Content editor (managed elsewhere in admin).
  const HIDDEN_SECTIONS = new Set(["Leadership Messages", "Hero", "hero"]);

  // Group by section, skipping hidden ones.
  const sections: Record<string, typeof content> = {};
  content?.forEach((item) => {
    if (HIDDEN_SECTIONS.has(item.section)) return;
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section]!.push(item);
  });

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl">Site Content</h1>
      <div className="space-y-8">
        {Object.entries(sections).map(([section, items]) => (
          <Card key={section}>
            <CardHeader>
              <CardTitle className="capitalize">{section}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {items?.map((item) => (
                <div key={item.key} className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">{item.key.replace(/_/g, " ")}</label>
                  {item.content_type === "image_url" ? (
                    <div className="space-y-3">
                      {(editValues[item.key] ?? item.value) && (
                        <img
                          src={editValues[item.key] ?? item.value}
                          alt={item.key}
                          className="h-32 w-auto rounded border object-cover"
                        />
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={editValues[item.key] ?? item.value}
                          onChange={(e) => setEditValues({ ...editValues, [item.key]: e.target.value })}
                          placeholder="Image URL"
                        />
                        <Button size="sm" onClick={() => handleSave(item.key)} disabled={updateMutation.isPending}>
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(item.key, file);
                            }}
                          />
                          <Button variant="outline" size="sm" asChild disabled={uploading === item.key}>
                            <span>
                              {uploading === item.key ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="mr-2 h-4 w-4" />
                              )}
                              Upload Image
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  ) : item.value.length > 100 ? (
                    <div className="flex gap-2">
                      <Textarea
                        value={editValues[item.key] ?? item.value}
                        onChange={(e) => setEditValues({ ...editValues, [item.key]: e.target.value })}
                        rows={3}
                      />
                      <Button size="sm" className="shrink-0" onClick={() => handleSave(item.key)} disabled={updateMutation.isPending}>
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={editValues[item.key] ?? item.value}
                        onChange={(e) => setEditValues({ ...editValues, [item.key]: e.target.value })}
                      />
                      <Button size="sm" onClick={() => handleSave(item.key)} disabled={updateMutation.isPending}>
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminContent;
