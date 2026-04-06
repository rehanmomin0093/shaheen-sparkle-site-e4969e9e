import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit2, Upload, ChevronDown, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import ImageCropDialog from "@/components/shared/ImageCropDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const SUBJECTS = [
  "All Subjects", "English", "Hindi", "Urdu", "Marathi",
  "Math", "Science", "Social Studies", "Computer Science",
  "Physical Education", "Art", "Music",
];

interface TeacherForm {
  name: string;
  id_number: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
  designation: string;
  area_of_expertise: string;
  experience: string;
  photo_url: string;
  resume_url: string;
  joining_date: string;
  assigned_classes: string[];
  assigned_section: string;
}

const emptyForm: TeacherForm = {
  name: "",
  id_number: "",
  email: "",
  phone: "",
  subject: "",
  qualification: "",
  designation: "",
  area_of_expertise: "",
  experience: "",
  photo_url: "",
  resume_url: "",
  joining_date: new Date().toISOString().split("T")[0],
  assigned_classes: [],
  assigned_section: "",
};

const AdminTeachers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<TeacherForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const { data: teachers, isLoading } = useQuery({
    queryKey: ["admin-teachers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*").order("name");
      if (error) throw error;
      const { data: assignments } = await supabase.from("teacher_class_assignments").select("*");
      return (data ?? []).map((t: any) => {
        const teacherAssignments = (assignments ?? []).filter((a: any) => a.teacher_id === t.id);
        return {
          ...t,
          assigned_classes: teacherAssignments.map((a: any) => a.class_name),
          assigned_section: teacherAssignments[0]?.section || "",
        };
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: TeacherForm) => {
      const { assigned_classes, assigned_section, ...teacherValues } = values;
      let teacherId = editId;
      if (editId) {
        const { error } = await supabase.from("teachers").update(teacherValues).eq("id", editId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("teachers").insert(teacherValues).select("id").single();
        if (error) throw error;
        teacherId = data.id;
      }
      // Upsert class assignments (multiple)
      if (teacherId) {
        await supabase.from("teacher_class_assignments").delete().eq("teacher_id", teacherId);
        if (assigned_classes.length > 0) {
          const rows = assigned_classes.map((cls) => ({
            teacher_id: teacherId!,
            class_name: cls,
            section: assigned_section || null,
          }));
          await supabase.from("teacher_class_assignments").insert(rows);
        }
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["public-teachers-with-classes"] });
      toast({ title: editId ? "Teacher updated!" : "Teacher added!" });
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
      queryClient.invalidateQueries({ queryKey: ["public-teachers-with-classes"] });
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
      id_number: teacher.id_number || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
      subject: teacher.subject || "",
      qualification: teacher.qualification || "",
      designation: teacher.designation || "",
      area_of_expertise: teacher.area_of_expertise || "",
      experience: teacher.experience || "",
      photo_url: teacher.photo_url || "",
      resume_url: teacher.resume_url || "",
      joining_date: teacher.joining_date || "",
      assigned_classes: teacher.assigned_classes || [],
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

  const handleResumeUpload = async (file: File) => {
    setUploadingResume(true);
    const path = `resumes/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, file, { contentType: file.type });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploadingResume(false);
      return;
    }
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    setForm({ ...form, resume_url: data.publicUrl });
    setUploadingResume(false);
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
                  <Label>ID Number</Label>
                  <Input value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} placeholder="e.g. T-001" />
                </div>
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Senior Teacher" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Subjects (select multiple)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between font-normal">
                        {form.subject
                          ? form.subject.split(", ").length > 2
                            ? `${form.subject.split(", ").slice(0, 2).join(", ")} +${form.subject.split(", ").length - 2}`
                            : form.subject
                          : "Select subjects"}
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="start">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {SUBJECTS.filter(s => s !== "All Subjects").map((s) => {
                          const selected = form.subject.split(", ").filter(Boolean);
                          const isChecked = selected.includes(s);
                          return (
                            <label key={s} className="flex items-center gap-2 cursor-pointer text-sm hover:bg-muted rounded px-1 py-0.5">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const current = form.subject.split(", ").filter(Boolean);
                                  const updated = checked ? [...current, s] : current.filter((x) => x !== s);
                                  setForm({ ...form, subject: updated.join(", ") });
                                }}
                              />
                              {s}
                            </label>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Assigned Classes (select multiple)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between font-normal">
                        {form.assigned_classes.length > 0
                          ? form.assigned_classes.length > 3
                            ? `${form.assigned_classes.slice(0, 3).join(", ")} +${form.assigned_classes.length - 3}`
                            : form.assigned_classes.join(", ")
                          : "Select classes"}
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="start">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {CLASSES.map((c) => {
                          const isChecked = form.assigned_classes.includes(c);
                          return (
                            <label key={c} className="flex items-center gap-2 cursor-pointer text-sm hover:bg-muted rounded px-1 py-0.5">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const updated = checked
                                    ? [...form.assigned_classes, c]
                                    : form.assigned_classes.filter((x) => x !== c);
                                  setForm({ ...form, assigned_classes: updated });
                                }}
                              />
                              Class {c}
                            </label>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Input value={form.assigned_section} onChange={(e) => setForm({ ...form, assigned_section: e.target.value })} placeholder="e.g. A" />
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
                  <Label>Area of Expertise</Label>
                  <Input value={form.area_of_expertise} onChange={(e) => setForm({ ...form, area_of_expertise: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Experience</Label>
                  <Input value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="e.g. 5 years" />
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
              <div className="space-y-2">
                <Label>Resume (PDF)</Label>
                <div className="flex items-center gap-3">
                  {form.resume_url && (
                    <a href={form.resume_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline flex items-center gap-1">
                      <FileText className="h-4 w-4" /> View Resume
                    </a>
                  )}
                  <label className="cursor-pointer">
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleResumeUpload(f); }} />
                    <Button type="button" variant="outline" size="sm" asChild disabled={uploadingResume}>
                      <span>{uploadingResume ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}Upload Resume</span>
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
                <TableHead>Designation</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers?.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No teachers added yet</TableCell></TableRow>
              )}
              {teachers?.map((t: any) => (
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
                  <TableCell>{t.designation || "-"}</TableCell>
                  <TableCell>{t.subject || "-"}</TableCell>
                  <TableCell>{t.assigned_classes?.length > 0 ? t.assigned_classes.join(", ") : "-"}</TableCell>
                  <TableCell>{t.phone || "-"}</TableCell>
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
