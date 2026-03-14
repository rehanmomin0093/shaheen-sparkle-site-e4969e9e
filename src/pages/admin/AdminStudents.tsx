import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit2, Upload, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StudentForm {
  name: string;
  father_name: string;
  mother_name: string;
  class: string;
  section: string;
  roll_number: string;
  phone: string;
  email: string;
  address: string;
  date_of_birth: string;
  admission_date: string;
  photo_url: string;
}

const emptyForm: StudentForm = {
  name: "",
  father_name: "",
  mother_name: "",
  class: "",
  section: "",
  roll_number: "",
  phone: "",
  email: "",
  address: "",
  date_of_birth: "",
  admission_date: new Date().toISOString().split("T")[0],
  photo_url: "",
};

const AdminStudents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const { data: students, isLoading } = useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*").order("class").order("name");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: StudentForm) => {
      const payload = {
        ...values,
        date_of_birth: values.date_of_birth || null,
      };
      if (editId) {
        const { error } = await supabase.from("students").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("students").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      toast({ title: editId ? "Student updated!" : "Student added!" });
      // Send invite if new student with email
      if (!editId && variables.email) {
        sendInvite(variables.email, "user");
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
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      toast({ title: "Student deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const openEdit = (s: any) => {
    setEditId(s.id);
    setForm({
      name: s.name,
      father_name: s.father_name || "",
      mother_name: s.mother_name || "",
      class: s.class || "",
      section: s.section || "",
      roll_number: s.roll_number || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
      date_of_birth: s.date_of_birth || "",
      admission_date: s.admission_date || "",
      photo_url: s.photo_url || "",
    });
    setDialogOpen(true);
  };

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `students/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, file);
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
    if (!form.name.trim() || !form.class.trim()) {
      toast({ title: "Name and Class are required", variant: "destructive" });
      return;
    }
    saveMutation.mutate(form);
  };

  const filteredStudents = students?.filter((s) => {
    const matchesSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.roll_number || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = !classFilter || s.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const uniqueClasses = [...new Set(students?.map((s) => s.class).filter(Boolean))].sort();

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl">Students</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) closeDialog(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setForm(emptyForm); setEditId(null); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Student" : "Add Student"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Class *</Label>
                  <Input value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} placeholder="e.g. 10th" />
                </div>
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="e.g. A" />
                </div>
                <div className="space-y-2">
                  <Label>Roll Number</Label>
                  <Input value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Father's Name</Label>
                  <Input value={form.father_name} onChange={(e) => setForm({ ...form, father_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Mother's Name</Label>
                  <Input value={form.mother_name} onChange={(e) => setForm({ ...form, mother_name: e.target.value })} />
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
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Admission Date</Label>
                  <Input type="date" value={form.admission_date} onChange={(e) => setForm({ ...form, admission_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Photo</Label>
                <div className="flex items-center gap-3">
                  {form.photo_url && <img src={form.photo_url} alt="Preview" className="h-16 w-16 rounded-full object-cover" />}
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }} />
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
                  {editId ? "Update" : "Add"} Student
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or roll number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Classes</option>
          {uniqueClasses.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Roll No.</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents?.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No students found</TableCell></TableRow>
              )}
              {filteredStudents?.map((s) => (
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
                  <TableCell>{s.class}</TableCell>
                  <TableCell>{s.section}</TableCell>
                  <TableCell>{s.roll_number}</TableCell>
                  <TableCell>{s.phone}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(s.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="mt-3 text-sm text-muted-foreground">
        Total: {filteredStudents?.length ?? 0} student{(filteredStudents?.length ?? 0) !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

export default AdminStudents;
