import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import ImageCropDialog from "@/components/shared/ImageCropDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const MANAGEMENT_DESIGNATIONS = [
  "Founder",
  "Secretary",
  "Joint Secretary",
  "Director",
  "High School Principal",
  "School Principal",
] as const;

const isManagementDesignation = (designation: string | null | undefined) => {
  if (!designation) return false;
  const d = designation.toLowerCase();
  return MANAGEMENT_DESIGNATIONS.some((role) => d.includes(role.toLowerCase()));
};

interface ManagementForm {
  name: string;
  designation: string;
  qualification: string;
  area_of_expertise: string;
  experience: string;
  phone: string;
  email: string;
  photo_url: string;
  joining_date: string;
}

const emptyForm: ManagementForm = {
  name: "",
  designation: "",
  qualification: "",
  area_of_expertise: "",
  experience: "",
  phone: "",
  email: "",
  photo_url: "",
  joining_date: new Date().toISOString().split("T")[0],
};

const AdminManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ManagementForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const { data: members, isLoading } = useQuery({
    queryKey: ["admin-management"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*").order("name");
      if (error) throw error;
      return (data ?? []).filter((t: any) => isManagementDesignation(t.designation));
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: ManagementForm) => {
      const payload = { ...values, subject: "" };
      if (editId) {
        const { error } = await supabase.from("teachers").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("teachers").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-management"] });
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["public-leadership"] });
      queryClient.invalidateQueries({ queryKey: ["public-teachers-with-classes"] });
      toast({ title: editId ? "Member updated!" : "Member added!" });
      closeDialog();
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teachers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-management"] });
      queryClient.invalidateQueries({ queryKey: ["public-leadership"] });
      toast({ title: "Member deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const openEdit = (m: any) => {
    setEditId(m.id);
    setForm({
      name: m.name,
      designation: m.designation || "",
      qualification: m.qualification || "",
      area_of_expertise: m.area_of_expertise || "",
      experience: m.experience || "",
      phone: m.phone || "",
      email: m.email || "",
      photo_url: m.photo_url || "",
      joining_date: m.joining_date || "",
    });
    setDialogOpen(true);
  };

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCroppedUpload = async (blob: Blob) => {
    setCropSrc(null);
    setUploading(true);
    const path = `management/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("site-assets").upload(path, blob, { contentType: "image/jpeg" });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    setForm((prev) => ({ ...prev, photo_url: data.publicUrl }));
    setUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (!form.designation.trim()) {
      toast({ title: "Designation is required", variant: "destructive" });
      return;
    }
    saveMutation.mutate(form);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Founder, Secretary, Joint Secretary, Director & Principals — appears in "Our Desk" on the homepage.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) closeDialog(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setForm(emptyForm); setEditId(null); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Management Member" : "Add Management Member"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Designation *</Label>
                  <Select
                    value={form.designation}
                    onValueChange={(val) => setForm({ ...form, designation: val })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
                    <SelectContent>
                      {MANAGEMENT_DESIGNATIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Qualification</Label>
                  <Input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Area of Expertise</Label>
                  <Input value={form.area_of_expertise} onChange={(e) => setForm({ ...form, area_of_expertise: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Experience</Label>
                  <Input placeholder="e.g. 15 years" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Joining Date</Label>
                  <Input type="date" value={form.joining_date} onChange={(e) => setForm({ ...form, joining_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Photo</Label>
                <div className="flex items-center gap-3">
                  {form.photo_url && <img src={form.photo_url} alt="Preview" className="h-16 w-16 rounded-full object-cover" />}
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                    <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
                      <span>{uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}Upload</span>
                    </Button>
                  </label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: Edit each member's long message under <strong>Site Content</strong> (Leadership Messages section).
              </p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editId ? "Update" : "Add"} Member
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(members ?? []).length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No management members added yet</TableCell></TableRow>
              )}
              {(members ?? []).map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell>
                    {m.photo_url ? (
                      <img src={m.photo_url} alt={m.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {m.name.charAt(0)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.designation || "-"}</TableCell>
                  <TableCell>{m.qualification || "-"}</TableCell>
                  <TableCell>{m.phone || "-"}</TableCell>
                  <TableCell>{m.email || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(m.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ImageCropDialog
        open={!!cropSrc}
        imageSrc={cropSrc || ""}
        onClose={() => setCropSrc(null)}
        onCropped={handleCroppedUpload}
        title="Crop Photo"
      />
    </div>
  );
};

export default AdminManagement;
