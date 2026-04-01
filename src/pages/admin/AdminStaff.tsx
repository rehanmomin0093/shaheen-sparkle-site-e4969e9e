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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageCropDialog from "@/components/shared/ImageCropDialog";

interface StaffForm {
  staff_type: string;
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

const emptyForm: StaffForm = {
  staff_type: "teaching",
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

const AdminStaff = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("teaching");

  const { data: staff, isLoading } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const teaching = staff?.filter((s) => s.staff_type === "teaching") ?? [];
  const nonTeaching = staff?.filter((s) => s.staff_type === "non-teaching") ?? [];

  const saveMutation = useMutation({
    mutationFn: async (values: StaffForm) => {
      if (editId) {
        const { error } = await supabase.from("staff").update(values).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("staff").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
      toast({ title: editId ? "Staff updated!" : "Staff added!" });
      closeDialog();
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("staff").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
      toast({ title: "Staff member deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const openAdd = (type: string) => {
    setForm({ ...emptyForm, staff_type: type });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (member: any) => {
    setEditId(member.id);
    setForm({
      staff_type: member.staff_type,
      name: member.name,
      designation: member.designation || "",
      qualification: member.qualification || "",
      area_of_expertise: member.area_of_expertise || "",
      experience: member.experience || "",
      phone: member.phone || "",
      email: member.email || "",
      photo_url: member.photo_url || "",
      joining_date: member.joining_date || "",
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
    const path = `staff/${Date.now()}.jpg`;
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

  const renderTable = (list: typeof teaching) => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>Expertise</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                  No staff members added yet
                </TableCell>
              </TableRow>
            )}
            {list.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  {s.photo_url ? (
                    <img src={s.photo_url} alt={s.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                      {s.name.charAt(0)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.designation}</TableCell>
                <TableCell>{s.qualification}</TableCell>
                <TableCell>{s.area_of_expertise}</TableCell>
                <TableCell>{s.experience}</TableCell>
                <TableCell>{s.phone}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(s.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl">Staff Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-4 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="teaching">Teaching Staff ({teaching.length})</TabsTrigger>
            <TabsTrigger value="non-teaching">Non-Teaching Staff ({nonTeaching.length})</TabsTrigger>
          </TabsList>
          <Button onClick={() => openAdd(activeTab)}>
            <Plus className="mr-2 h-4 w-4" /> Add {activeTab === "teaching" ? "Teaching" : "Non-Teaching"} Staff
          </Button>
        </div>
        <TabsContent value="teaching">{renderTable(teaching)}</TabsContent>
        <TabsContent value="non-teaching">{renderTable(nonTeaching)}</TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) closeDialog(); else setDialogOpen(true); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit" : "Add"} Staff Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Staff Type *</Label>
                <Select value={form.staff_type} onValueChange={(v) => setForm({ ...form, staff_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teaching">Teaching</SelectItem>
                    <SelectItem value="non-teaching">Non-Teaching</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Designation *</Label>
                <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
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
                <Input placeholder="e.g. 5 years" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
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
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editId ? "Update" : "Add"} Staff
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ImageCropDialog
        open={!!cropSrc}
        imageSrc={cropSrc || ""}
        onClose={() => setCropSrc(null)}
        onCropped={handleCroppedUpload}
        title="Crop Staff Photo"
      />
    </div>
  );
};

export default AdminStaff;
