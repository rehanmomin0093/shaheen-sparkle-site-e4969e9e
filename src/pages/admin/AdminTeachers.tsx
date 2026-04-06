import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit2, X, Save, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageCropDialog from "@/components/shared/ImageCropDialog";

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const SUBJECTS = [
  "All Subjects", "English", "Hindi", "Urdu", "Marathi",
  "Math", "Science", "Social Studies", "Computer Science",
  "Physical Education", "Art", "Music",
];

interface TeacherForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
  photo_url: string;
  joining_date: string;
  assigned_class: string;
  assigned_section: string;
}

const emptyForm: TeacherForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  qualification: "",
  photo_url: "",
  joining_date: new Date().toISOString().split("T")[0],
  assigned_class: "",
  assigned_section: "",
};

const AdminTeachers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<TeacherForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const { data: teachers, isLoading } = useQuery({
    queryKey: ["admin-teachers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*").order("name");
      if (error) throw error;
      // Fetch class assignments for each teacher
      const { data: assignments } = await supabase.from("teacher_class_assignments").select("*");
      return (data ?? []).map((t: any) => {
        const a = assignments?.find((a: any) => a.teacher_id === t.id);
        return { ...t, assigned_class: a?.class_name || "", assigned_section: a?.section || "" };
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: TeacherForm) => {
      const { assigned_class, assigned_section, ...teacherValues } = values;
      let teacherId = editId;
      if (editId) {
        const { error } = await supabase.from("teachers").update(teacherValues).eq("id", editId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("teachers").insert(teacherValues).select("id").single();
        if (error) throw error;
        teacherId = data.id;
      }
      // Upsert class assignment
      if (teacherId && assigned_class && assigned_class !== "none") {
        await supabase.from("teacher_class_assignments").delete().eq("teacher_id", teacherId);
        await supabase.from("teacher_class_assignments").insert({
          teacher_id: teacherId,
          class_name: assigned_class,
          section: assigned_section || null,
        });
      } else if (teacherId && !assigned_class) {
        await supabase.from("teacher_class_assignments").delete().eq("teacher_id", teacherId);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      toast({ title: editId ? "Teacher updated!" : "Teacher added!" });
      // Send invite if new teacher with email
      if (!editId && variables.email) {
        sendInvite(variables.email, "teacher");
      }
      closeDialog();
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const sendInvite = async (email: string, role: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("invite-user", {
        body: { email, role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Invite sent!", description: `Invitation email sent to ${email}` });
    } catch (e: any) {
      toast({ title: "Invite failed", description: e.message, variant: "destructive" });
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teachers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      toast({ title: "Teacher deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const openEdit = (teacher: any) => {
    setEditId(teacher.id);
    setForm({
      name: teacher.name,
      email: teacher.email || "",
      phone: teacher.phone || "",
      subject: teacher.subject || "",
      qualification: teacher.qualification || "",
      photo_url: teacher.photo_url || "",
      joining_date: teacher.joining_date || "",
      assigned_class: teacher.assigned_class || "",
      assigned_section: teacher.assigned_section || "",
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
    const path = `teachers/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("site-assets").upload(path, blob, { contentType: "image/jpeg" });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    setForm({ ...form, photo_url: data.publicUrl });
    setUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
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
        <h1 className="font-serif text-3xl">Teachers</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) closeDialog(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setForm(emptyForm); setEditId(null); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Teacher" : "Add Teacher"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Qualification</Label>
                  <Input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Joining Date</Label>
                  <Input type="date" value={form.joining_date} onChange={(e) => setForm({ ...form, joining_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Assigned Class</Label>
                  <Select value={form.assigned_class} onValueChange={(v) => setForm({ ...form, assigned_class: v })}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Input value={form.assigned_section} onChange={(e) => setForm({ ...form, assigned_section: e.target.value })} placeholder="e.g. A" />
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
                  {editId ? "Update" : "Add"} Teacher
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
                <TableHead>Subject</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers?.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No teachers added yet</TableCell></TableRow>
              )}
              {teachers?.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    {t.photo_url ? (
                      <img src={t.photo_url} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {t.name.charAt(0)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell>{t.phone}</TableCell>
                  <TableCell>{t.qualification}</TableCell>
                  <TableCell>{(t as any).assigned_class ? `${(t as any).assigned_class}${(t as any).assigned_section ? `-${(t as any).assigned_section}` : ""}` : "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(t.id)}><Trash2 className="h-4 w-4" /></Button>
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
        title="Crop Teacher Photo"
      />
    </div>
  );
};

export default AdminTeachers;
