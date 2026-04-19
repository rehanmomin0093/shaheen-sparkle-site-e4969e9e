import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Upload, ArrowUp, ArrowDown } from "lucide-react";

const AdminHeroImages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: images, isLoading } = useQuery({
    queryKey: ["admin-hero-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_images")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-hero-images"] });
    queryClient.invalidateQueries({ queryKey: ["public-hero-images"] });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `hero/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("site-assets").upload(path, file);
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("site-assets").getPublicUrl(path);
    const nextOrder = (images?.length ?? 0) + 1;

    const { error } = await supabase.from("hero_images").insert({
      image_url: urlData.publicUrl,
      sort_order: nextOrder,
      is_active: true,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      invalidate();
      toast({ title: "Hero image added!" });
    }
    setUploading(false);
  };

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("hero_images").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hero_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Image removed" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, sort_order }: { id: string; sort_order: number }) => {
      const { error } = await supabase.from("hero_images").update({ sort_order }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const move = (index: number, dir: -1 | 1) => {
    if (!images) return;
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    const a = images[index];
    const b = images[target];
    reorderMutation.mutate({ id: a.id, sort_order: b.sort_order });
    reorderMutation.mutate({ id: b.id, sort_order: a.sort_order });
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl">Homepage Hero Images</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Add, remove, reorder, or temporarily disable images shown in the homepage hero carousel.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Hero Image</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
            <Button variant="default" asChild disabled={uploading}>
              <span>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload Hero Image
              </span>
            </Button>
          </label>
          <p className="mt-2 text-xs text-muted-foreground">Recommended: 1920×1080 or larger, landscape orientation.</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {images?.map((img, index) => (
          <Card key={img.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <img src={img.image_url} alt="" className="h-20 w-32 rounded object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium">Slide #{index + 1}</p>
                <p className="text-xs text-muted-foreground">{new Date(img.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => move(index, -1)} disabled={index === 0}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => move(index, 1)} disabled={index === (images.length - 1)}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{img.is_active ? "Active" : "Hidden"}</span>
                  <Switch
                    checked={img.is_active}
                    onCheckedChange={(checked) => toggleMutation.mutate({ id: img.id, is_active: checked })}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(img.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {images?.length === 0 && (
          <p className="text-center text-muted-foreground">No hero images yet. Upload your first one above.</p>
        )}
      </div>
    </div>
  );
};

export default AdminHeroImages;
