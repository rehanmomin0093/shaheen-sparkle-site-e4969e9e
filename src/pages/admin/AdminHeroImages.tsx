import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Upload, Plus, ImageIcon } from "lucide-react";

const AdminHeroImages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

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

  const uploadFile = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `hero/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("site-assets").upload(path, file);
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      return null;
    }
    const { data: urlData } = supabase.storage.from("site-assets").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleReplaceSlot = async (slotNumber: number, file: File, existingId?: string) => {
    setUploadingSlot(slotNumber);
    const url = await uploadFile(file);
    if (!url) {
      setUploadingSlot(null);
      return;
    }

    if (existingId) {
      const { error } = await supabase.from("hero_images").update({ image_url: url }).eq("id", existingId);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: `Slide ${slotNumber} updated!` });
    } else {
      const { error } = await supabase.from("hero_images").insert({
        image_url: url,
        sort_order: slotNumber,
        is_active: true,
      });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: `Slide ${slotNumber} added!` });
    }
    invalidate();
    setUploadingSlot(null);
  };

  const handleAddNewSlot = async (file: File) => {
    const nextSlot = (images?.length ?? 0) + 1;
    await handleReplaceSlot(nextSlot, file);
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
      toast({ title: "Slide removed" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl">Homepage Hero Images</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Manage numbered slides shown in the homepage hero carousel. Replace any slide, hide it temporarily, or remove it.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {images?.map((img, index) => {
          const slotNumber = index + 1;
          const isUploading = uploadingSlot === slotNumber;
          return (
            <Card key={img.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>Slide #{slotNumber}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-normal text-muted-foreground">{img.is_active ? "Active" : "Hidden"}</span>
                    <Switch
                      checked={img.is_active}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: img.id, is_active: checked })}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <img src={img.image_url} alt={`Hero slide ${slotNumber}`} className="aspect-video w-full rounded object-cover" />
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleReplaceSlot(slotNumber, file, img.id);
                        e.target.value = "";
                      }}
                    />
                    <Button variant="outline" asChild disabled={isUploading} className="w-full">
                      <span>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Replace
                      </span>
                    </Button>
                  </label>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(img.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add new slot card */}
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-muted-foreground">
              Slide #{(images?.length ?? 0) + 1} (new)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingSlot !== null}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAddNewSlot(file);
                  e.target.value = "";
                }}
              />
              <div className="flex aspect-video w-full flex-col items-center justify-center rounded border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:bg-muted/50">
                {uploadingSlot !== null && uploadingSlot > (images?.length ?? 0) ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Plus className="mb-2 h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Add New Slide</span>
                  </>
                )}
              </div>
            </label>
            <p className="mt-2 text-xs text-muted-foreground">Recommended: 1920×1080 landscape.</p>
          </CardContent>
        </Card>
      </div>

      {images?.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No hero slides yet. Click the dashed card above to add your first one.
        </p>
      )}
    </div>
  );
};

export default AdminHeroImages;
