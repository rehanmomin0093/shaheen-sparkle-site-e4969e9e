import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = ["Campus", "Labs", "Sports", "Classrooms", "Events", "General"];

const AdminGallery = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newAlt, setNewAlt] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newSrc, setNewSrc] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: images, isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_images").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (img: { src: string; alt: string; category: string }) => {
      const { error } = await supabase.from("gallery_images").insert({
        src: img.src,
        alt: img.alt,
        category: img.category,
        sort_order: (images?.length ?? 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      setNewAlt("");
      setNewSrc("");
      toast({ title: "Image added!" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      toast({ title: "Image removed" });
    },
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `gallery/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    setNewSrc(data.publicUrl);
    setUploading(false);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl">Gallery Management</h1>

      {/* Add new */}
      <Card className="mb-8">
        <CardContent className="space-y-4 p-6">
          <h2 className="font-serif text-xl">Add Image</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Input
                placeholder="Image URL"
                value={newSrc}
                onChange={(e) => setNewSrc(e.target.value)}
              />
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
                <Button variant="outline" size="sm" asChild>
                  <span>
                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Or Upload
                  </span>
                </Button>
              </label>
            </div>
            <div className="space-y-2">
              <Input placeholder="Alt text" value={newAlt} onChange={(e) => setNewAlt(e.target.value)} />
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => addMutation.mutate({ src: newSrc, alt: newAlt, category: newCategory })} disabled={!newSrc || addMutation.isPending}>
            <Plus className="mr-2 h-4 w-4" /> Add Image
          </Button>
        </CardContent>
      </Card>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images?.map((img) => (
          <Card key={img.id} className="overflow-hidden">
            <div className="aspect-[4/3]">
              <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
            </div>
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-medium">{img.alt}</p>
                <p className="text-xs text-muted-foreground">{img.category}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(img.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminGallery;
