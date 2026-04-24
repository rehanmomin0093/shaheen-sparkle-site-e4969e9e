import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherAssignments } from "./useTeacherStudents";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";

const SUBJECTS = [
  "English",
  "Hindi",
  "Marathi",
  "Math",
  "Science",
  "Social Studies",
  "ARTS",
  "W.ESP",
  "PHY.EDU",
  "General",
  "Other",
];

const LinksTab = () => {
  const { user } = useAuth();
  const { data: assignments, isLoading: assignmentsLoading } = useTeacherAssignments();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("General");
  const [selectedClass, setSelectedClass] = useState("");

  const { data: links, isLoading } = useQuery({
    queryKey: ["teacher-links", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_links")
        .select("*")
        .eq("created_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const getClassLabel = (className: string, section: string | null) =>
    `${className}${section ? `-${section}` : ""}`;

  const addLink = useMutation({
    mutationFn: async () => {
      const assignment = assignments?.find(
        (a) => `${a.class_name}|${a.section ?? ""}` === selectedClass
      );
      if (!assignment) throw new Error("Please select a class");
      const { error } = await supabase.from("teacher_links").insert({
        title,
        url: url.startsWith("http") ? url : `https://${url}`,
        description: description || null,
        subject,
        class_name: assignment.class_name,
        section: assignment.section,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-links"] });
      toast({ title: "Link shared successfully" });
      setTitle("");
      setUrl("");
      setDescription("");
      setSubject("General");
      setSelectedClass("");
      setOpen(false);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teacher_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-links"] });
      toast({ title: "Link deleted" });
    },
  });

  if (assignmentsLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!assignments?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No class assigned. Contact admin.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Important Links</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Share Link</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Important Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Class *</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {assignments.map((a) => {
                      const val = `${a.class_name}|${a.section ?? ""}`;
                      return (
                        <SelectItem key={a.id} value={val}>
                          {getClassLabel(a.class_name, a.section)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title *</Label>
                <Input placeholder="e.g. Chapter 5 Video" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <Label>URL *</Label>
                <Input placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
              </div>
              <div>
                <Label>Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Optional description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              <Button
                className="w-full"
                disabled={!title.trim() || !url.trim() || !selectedClass || addLink.isPending}
                onClick={() => addLink.mutate()}
              >
                {addLink.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Share with Students
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !links?.length ? (
            <p className="py-8 text-center text-muted-foreground">No links shared yet. Click "Share Link" to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-medium text-primary hover:underline">
                          {link.title} <ExternalLink className="h-3 w-3" />
                        </a>
                        {link.description && <p className="mt-0.5 text-xs text-muted-foreground">{link.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getClassLabel(link.class_name, link.section)}</Badge>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{link.subject}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(link.created_at).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteLink.mutate(link.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LinksTab;
