import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherAssignment } from "./useTeacherStudents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Eye, FileText, Bot, Pencil, Upload } from "lucide-react";

const SUBJECTS = ["English", "Hindi", "Marathi", "Urdu", "Math", "Science", "Social Studies"];

interface QuestionForm {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  marks: string;
}

const emptyQuestion: QuestionForm = {
  question_text: "", option_a: "", option_b: "", option_c: "", option_d: "",
  correct_option: "A", marks: "1",
};

const TestsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: assignment } = useTeacherAssignment();

  const [createOpen, setCreateOpen] = useState(false);
  const [questionsOpen, setQuestionsOpen] = useState<string | null>(null);
  const [submissionsOpen, setSubmissionsOpen] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [testType, setTestType] = useState("mcq");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [totalMarks, setTotalMarks] = useState("100");
  const [dueDate, setDueDate] = useState("");
  const [questions, setQuestions] = useState<QuestionForm[]>([{ ...emptyQuestion }]);

  // File-based question states
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [questionFileUrl, setQuestionFileUrl] = useState("");
  const [extractedQuestions, setExtractedQuestions] = useState<any>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const { data: tests, isLoading } = useQuery({
    queryKey: ["teacher-tests", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tests")
        .select("*")
        .eq("created_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const { data: viewQuestions } = useQuery({
    queryKey: ["test-questions", questionsOpen],
    queryFn: async () => {
      const { data } = await supabase
        .from("test_questions")
        .select("*")
        .eq("test_id", questionsOpen!)
        .order("sort_order");
      return data ?? [];
    },
    enabled: !!questionsOpen,
  });

  const { data: submissions } = useQuery({
    queryKey: ["test-submissions", submissionsOpen],
    queryFn: async () => {
      const { data } = await supabase
        .from("test_submissions")
        .select("*, students(name, roll_number)")
        .eq("test_id", submissionsOpen!);
      return data ?? [];
    },
    enabled: !!submissionsOpen,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!assignment) throw new Error("No class assigned");

      const insertData: any = {
        title,
        description,
        test_type: testType,
        subject,
        class_name: assignment.class_name,
        section: assignment.section,
        total_marks: parseFloat(totalMarks),
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        created_by: user!.id,
      };

      // If file-based questions, add file data
      if (testType === "file_upload" && questionFileUrl) {
        insertData.question_file_url = questionFileUrl;
        insertData.extracted_questions = extractedQuestions;
        insertData.test_type = "upload"; // Students upload answer sheets
      }

      const { data: test, error } = await supabase.from("tests").insert(insertData).select("id").single();
      if (error) throw error;

      if ((testType === "mcq" || testType === "both") && questions.length > 0) {
        const qRecords = questions
          .filter((q) => q.question_text.trim())
          .map((q, i) => ({
            test_id: test.id,
            question_text: q.question_text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_option: q.correct_option,
            marks: parseFloat(q.marks) || 1,
            sort_order: i,
          }));
        if (qRecords.length > 0) {
          const { error: qErr } = await supabase.from("test_questions").insert(qRecords);
          if (qErr) throw qErr;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-tests"] });
      toast({ title: "Test created!" });
      resetForm();
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const gradeMutation = useMutation({
    mutationFn: async ({ submissionId, score }: { submissionId: string; score: number }) => {
      const { error } = await supabase
        .from("test_submissions")
        .update({ score, status: "graded", graded_at: new Date().toISOString() })
        .eq("id", submissionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-submissions"] });
      toast({ title: "Score updated!" });
    },
  });

  const aiGradeMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const { data, error } = await supabase.functions.invoke("grade-submission", {
        body: { submission_id: submissionId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["test-submissions"] });
      toast({
        title: `AI Graded: ${data.score} marks`,
        description: data.reason || undefined,
      });
    },
    onError: (e: Error) => toast({ title: "AI Grading Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-tests"] });
      toast({ title: "Test deleted" });
    },
  });

  const resetForm = () => {
    setCreateOpen(false);
    setTitle("");
    setDescription("");
    setTestType("mcq");
    setSubject(SUBJECTS[0]);
    setTotalMarks("100");
    setDueDate("");
    setQuestions([{ ...emptyQuestion }]);
    setQuestionFile(null);
    setQuestionFileUrl("");
    setExtractedQuestions(null);
  };

  const addQuestion = () => setQuestions([...questions, { ...emptyQuestion }]);
  const removeQuestion = (i: number) => setQuestions(questions.filter((_, idx) => idx !== i));
  const updateQuestion = (i: number, field: keyof QuestionForm, value: string) => {
    const updated = [...questions];
    updated[i] = { ...updated[i], [field]: value };
    setQuestions(updated);
  };

  const handleQuestionFileUpload = async (file: File) => {
    setUploadingFile(true);
    setQuestionFile(file);
    const path = `question-papers/${user!.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploadingFile(false);
      return;
    }
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    setQuestionFileUrl(data.publicUrl);
    setUploadingFile(false);
    toast({ title: "File uploaded! Now click 'Extract Questions' to analyze." });
  };

  const handleExtractQuestions = async () => {
    if (!questionFileUrl) return;
    setExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-questions", {
        body: { test_id: "preview", file_url: questionFileUrl },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setExtractedQuestions(data);
      if (data.total_marks) setTotalMarks(String(data.total_marks));
      toast({ title: `Extracted ${data.questions?.length || 0} questions!` });
    } catch (e: any) {
      toast({ title: "Extraction failed", description: e.message, variant: "destructive" });
    } finally {
      setExtracting(false);
    }
  };

  if (!assignment) {
    return <Card><CardContent className="py-12 text-center text-muted-foreground">No class assigned. Contact admin.</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tests & Assignments</h2>
        <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" /> Create Test</Button>
      </div>

      {/* Tests List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests?.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No tests created yet</TableCell></TableRow>
                )}
                {tests?.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">
                      {t.title}
                      {(t as any).question_file_url && <Badge variant="outline" className="ml-2 text-xs">File Q</Badge>}
                    </TableCell>
                    <TableCell>{t.subject}</TableCell>
                    <TableCell><Badge variant="outline">{t.test_type.toUpperCase()}</Badge></TableCell>
                    <TableCell>{t.due_date ? new Date(t.due_date).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSubmissionsOpen(t.id)}>
                        <Eye className="mr-1 h-3 w-3" /> View
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      {(t.test_type === "mcq" || t.test_type === "both") && (
                        <Button variant="ghost" size="icon" onClick={() => setQuestionsOpen(t.id)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(t.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Test Dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { if (!o) resetForm(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Create Test</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Unit Test 1 - Math" />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Test Type</Label>
                <Select value={testType} onValueChange={setTestType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">MCQ Only</SelectItem>
                    <SelectItem value="upload">Upload Only</SelectItem>
                    <SelectItem value="both">MCQ + Upload</SelectItem>
                    <SelectItem value="file_upload">Upload Question Paper (Word/PDF)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Total Marks</Label>
                <Input type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Due Date</Label>
                <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Instructions for students..." />
            </div>

            {/* File-based Question Upload */}
            {testType === "file_upload" && (
              <div className="space-y-4">
                <Card className="p-4">
                  <Label className="mb-2 block font-semibold">Upload Question Paper (Word/PDF)</Label>
                  <p className="mb-3 text-sm text-muted-foreground">Upload a Word or PDF file containing questions. AI will extract and analyze them.</p>
                  
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleQuestionFileUpload(f);
                        }}
                      />
                      <Button type="button" variant="outline" asChild disabled={uploadingFile}>
                        <span>
                          {uploadingFile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                          {questionFile ? questionFile.name : "Choose File"}
                        </span>
                      </Button>
                    </label>

                    {questionFileUrl && !extractedQuestions && (
                      <Button onClick={handleExtractQuestions} disabled={extracting}>
                        {extracting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                        Extract Questions with AI
                      </Button>
                    )}
                  </div>

                  {questionFileUrl && (
                    <p className="mt-2 text-sm text-primary">✓ File uploaded</p>
                  )}
                </Card>

                {/* Extracted Questions Preview */}
                {extractedQuestions && (
                  <Card className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <Label className="font-semibold">Extracted Questions ({extractedQuestions.questions?.length || 0})</Label>
                      <Badge variant="outline">{extractedQuestions.summary || "Question Paper"}</Badge>
                    </div>
                    <div className="max-h-60 space-y-2 overflow-y-auto">
                      {extractedQuestions.questions?.map((q: any, i: number) => (
                        <div key={i} className="rounded border p-2 text-sm">
                          <p className="font-medium">Q{q.number || i + 1}. {q.text}</p>
                          <p className="text-xs text-muted-foreground">Marks: {q.marks} • Type: {q.type}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* MCQ Questions */}
            {(testType === "mcq" || testType === "both") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">MCQ Questions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion}><Plus className="mr-1 h-3 w-3" /> Add</Button>
                </div>
                {questions.map((q, i) => (
                  <Card key={i} className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Q{i + 1}</span>
                      {questions.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeQuestion(i)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Textarea value={q.question_text} onChange={(e) => updateQuestion(i, "question_text", e.target.value)} placeholder="Question text" className="mb-3" />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input value={q.option_a} onChange={(e) => updateQuestion(i, "option_a", e.target.value)} placeholder="Option A" />
                      <Input value={q.option_b} onChange={(e) => updateQuestion(i, "option_b", e.target.value)} placeholder="Option B" />
                      <Input value={q.option_c} onChange={(e) => updateQuestion(i, "option_c", e.target.value)} placeholder="Option C" />
                      <Input value={q.option_d} onChange={(e) => updateQuestion(i, "option_d", e.target.value)} placeholder="Option D" />
                    </div>
                    <div className="mt-3 flex gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Correct</Label>
                        <Select value={q.correct_option} onValueChange={(v) => updateQuestion(i, "correct_option", v)}>
                          <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["A", "B", "C", "D"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Marks</Label>
                        <Input type="number" value={q.marks} onChange={(e) => updateQuestion(i, "marks", e.target.value)} className="w-20" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!title.trim() || createMutation.isPending || (testType === "file_upload" && !questionFileUrl)}
              >
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Questions Dialog */}
      <Dialog open={!!questionsOpen} onOpenChange={(o) => { if (!o) setQuestionsOpen(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>Questions</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {viewQuestions?.map((q, i) => (
              <Card key={q.id} className="p-3">
                <p className="font-medium">Q{i + 1}. {q.question_text}</p>
                <div className="mt-2 grid grid-cols-2 gap-1 text-sm">
                  {["A", "B", "C", "D"].map((opt) => (
                    <span key={opt} className={q.correct_option === opt ? "font-bold text-primary" : "text-muted-foreground"}>
                      {opt}) {(q as any)[`option_${opt.toLowerCase()}`]}
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Marks: {q.marks}</p>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Submissions Dialog */}
      <Dialog open={!!submissionsOpen} onOpenChange={(o) => { if (!o) setSubmissionsOpen(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Submissions</DialogTitle></DialogHeader>
          {submissions?.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">No submissions yet.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={aiGradeMutation.isPending}
                  onClick={() => {
                    const ungraded = submissions?.filter((s: any) => s.status !== "graded");
                    if (ungraded?.length) {
                      ungraded.forEach((s: any) => aiGradeMutation.mutate(s.id));
                    } else {
                      toast({ title: "All submissions already graded" });
                    }
                  }}
                >
                  {aiGradeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                  AI Grade All
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions?.map((s: any) => {
                    const aiGrade = s.answers?._ai_grade;
                    return (
                      <TableRow key={s.id}>
                        <TableCell>{s.students?.name}</TableCell>
                        <TableCell>{s.students?.roll_number}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              className="w-20"
                              defaultValue={s.score ?? ""}
                              placeholder="Score"
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && val !== s.score) {
                                  gradeMutation.mutate({ submissionId: s.id, score: val });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const val = parseFloat((e.target as HTMLInputElement).value);
                                  if (!isNaN(val)) gradeMutation.mutate({ submissionId: s.id, score: val });
                                }
                              }}
                            />
                            <Pencil className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.status === "graded" ? "default" : "secondary"}>
                            {s.status}
                            {aiGrade?.graded_by === "ai" && " (AI)"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={aiGradeMutation.isPending}
                              onClick={() => aiGradeMutation.mutate(s.id)}
                              title="Grade with AI"
                            >
                              <Bot className="h-4 w-4" />
                            </Button>
                            {s.file_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={s.file_url} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                          {/* AI per-question grades */}
                          {aiGrade?.question_grades && (
                            <div className="mt-2 space-y-1">
                              {aiGrade.question_grades.map((qg: any, i: number) => (
                                <p key={i} className="text-xs text-muted-foreground">
                                  Q{qg.question_number}: {qg.marks_given}/{qg.max_marks} — {qg.feedback}
                                </p>
                              ))}
                            </div>
                          )}
                          {aiGrade?.reason && !aiGrade?.question_grades && (
                            <p className="mt-1 text-xs text-muted-foreground max-w-[200px] truncate" title={aiGrade.reason}>
                              AI: {aiGrade.reason}
                            </p>
                          )}
                          {aiGrade?.overall_feedback && (
                            <p className="mt-1 text-xs font-medium text-muted-foreground" title={aiGrade.overall_feedback}>
                              {aiGrade.overall_feedback}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestsTab;
