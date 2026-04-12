import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut, ClipboardList, FileText, TrendingUp, BookOpen, Loader2, User } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import { useToast } from "@/hooks/use-toast";

const SUBJECTS = ["English", "Hindi", "Marathi", "Math", "Science", "Social Studies"];

const StudentDashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate("/student-portal");
  }, [loading, user, navigate]);

  const { data: student, isLoading: loadingStudent } = useQuery({
    queryKey: ["my-student-record", user?.email],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*").eq("email", user!.email!).maybeSingle();
      return data;
    },
    enabled: !!user?.email,
  });

  const { data: attendance } = useQuery({
    queryKey: ["my-attendance", student?.id],
    queryFn: async () => {
      const { data } = await supabase.from("attendance").select("*").eq("student_id", student!.id).order("date", { ascending: false }).limit(90);
      return data ?? [];
    },
    enabled: !!student?.id,
  });

  const { data: results } = useQuery({
    queryKey: ["my-results", student?.id],
    queryFn: async () => {
      const { data } = await supabase.from("student_results").select("*").eq("student_id", student!.id).order("created_at");
      return data ?? [];
    },
    enabled: !!student?.id,
  });

  const { data: tests } = useQuery({
    queryKey: ["my-tests", student?.class],
    queryFn: async () => {
      const { data } = await supabase.from("tests").select("*").eq("class_name", student!.class).eq("is_active", true).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!student?.class,
  });

  const { data: mySubmissions } = useQuery({
    queryKey: ["my-submissions", student?.id],
    queryFn: async () => {
      const { data } = await supabase.from("test_submissions").select("*").eq("student_id", student!.id);
      return data ?? [];
    },
    enabled: !!student?.id,
  });

  if (loading || loadingStudent) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!student) {
    return <div className="flex min-h-screen items-center justify-center"><Card className="max-w-md"><CardContent className="py-12 text-center text-muted-foreground">No student record found. Contact admin.</CardContent></Card></div>;
  }

  const totalDays = attendance?.length ?? 0;
  const presentDays = attendance?.filter((a) => a.status === "present").length ?? 0;
  const absentDays = attendance?.filter((a) => a.status === "absent").length ?? 0;
  const lateDays = attendance?.filter((a) => a.status === "late").length ?? 0;
  const attendancePercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const examTypes = ["Unit Test 1", "Unit Test 2", "Half Yearly", "Annual"];
  const resultsByExam = examTypes.map((exam) => {
    const examResults = results?.filter((r) => r.exam_type === exam) ?? [];
    const subjectMarks: Record<string, number> = {};
    examResults.forEach((r) => { subjectMarks[r.subject] = Number(r.marks_obtained); });
    const total = examResults.reduce((s, r) => s + Number(r.marks_obtained), 0);
    const maxTotal = examResults.reduce((s, r) => s + Number(r.total_marks), 0);
    const percent = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
    return { exam, subjectMarks, total, maxTotal, percent, count: examResults.length };
  });

  const progressData = resultsByExam.filter((r) => r.count > 0).map((r) => ({ name: r.exam, percentage: r.percent }));
  const latestExamWithData = [...resultsByExam].reverse().find((r) => r.count > 0);
  const subjectChartData = latestExamWithData ? SUBJECTS.map((s) => ({ subject: s, marks: latestExamWithData.subjectMarks[s] ?? 0 })) : [];

  const attendanceTrend = (() => {
    const monthMap: Record<string, { present: number; total: number }> = {};
    (attendance ?? []).forEach((a) => {
      const d = new Date(a.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap[key]) monthMap[key] = { present: 0, total: 0 };
      monthMap[key].total++;
      if (a.status === "present") monthMap[key].present++;
    });
    return Object.keys(monthMap).sort().map((key) => {
      const [y, m] = key.split("-");
      const label = new Date(Number(y), Number(m) - 1).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      return { month: label, present: monthMap[key].present, total: monthMap[key].total };
    });
  })();

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b bg-background shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <h1 className="font-serif text-2xl font-bold text-primary">Student Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{student.name} — {student.class}{student.section ? `-${student.section}` : ""}</span>
            <Button variant="outline" size="sm" onClick={() => { signOut(); navigate("/student-portal"); }}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><User className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Roll Number</p><p className="font-bold">{student.roll_number || "-"}</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><ClipboardList className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Attendance</p><p className="font-bold">{attendancePercent}%</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><TrendingUp className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Latest Result</p><p className="font-bold">{latestExamWithData ? `${latestExamWithData.percent}%` : "-"}</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><BookOpen className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Pending Tests</p><p className="font-bold">{(tests?.length ?? 0) - (mySubmissions?.length ?? 0)}</p></div>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="progress" className="gap-2"><TrendingUp className="h-4 w-4" /> Progress</TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2"><ClipboardList className="h-4 w-4" /> Attendance</TabsTrigger>
            <TabsTrigger value="results" className="gap-2"><FileText className="h-4 w-4" /> Results</TabsTrigger>
            <TabsTrigger value="tests" className="gap-2"><BookOpen className="h-4 w-4" /> Tests</TabsTrigger>
          </TabsList>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Exam-wise Progress</CardTitle></CardHeader>
                <CardContent>
                  {progressData.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">No results to show progress.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="percentage" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Subject-wise Marks ({latestExamWithData?.exam ?? "Latest"})</CardTitle></CardHeader>
                <CardContent>
                  {subjectChartData.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">No data available.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={subjectChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subject" fontSize={11} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="marks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Attendance Trend (Month-wise)</CardTitle></CardHeader>
                <CardContent>
                  {attendanceTrend.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">No attendance data.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={attendanceTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value: number, name: string) => [value, name === "present" ? "Present Days" : name]} />
                        <Bar dataKey="present" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Present Days" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
                <div className="mt-2 flex gap-3">
                  <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">Present: {presentDays}</Badge>
                  <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Absent: {absentDays}</Badge>
                  <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">Late: {lateDays}</Badge>
                  <Badge variant="outline">Total: {totalDays}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {totalDays === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No attendance records yet.</p>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {attendance?.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell>{new Date(a.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                            <TableCell>
                              <Badge variant={a.status === "present" ? "default" : a.status === "absent" ? "destructive" : "secondary"}>
                                {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            <div className="space-y-4">
              {resultsByExam.filter((r) => r.count > 0).length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground">No results available yet.</CardContent></Card>
              ) : (
                resultsByExam.filter((r) => r.count > 0).map((r) => (
                  <Card key={r.exam}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{r.exam}</CardTitle>
                        <Badge variant="outline" className="text-sm font-bold">{r.percent}%</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead className="text-center">Marks</TableHead><TableHead className="text-center">Total</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {SUBJECTS.map((sub) => {
                            const marks = r.subjectMarks[sub];
                            return marks !== undefined ? (
                              <TableRow key={sub}><TableCell>{sub}</TableCell><TableCell className="text-center font-medium">{marks}</TableCell><TableCell className="text-center">100</TableCell></TableRow>
                            ) : null;
                          })}
                          <TableRow className="font-bold"><TableCell>Total</TableCell><TableCell className="text-center">{r.total}</TableCell><TableCell className="text-center">{r.maxTotal}</TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests">
            <StudentTestsSection tests={tests ?? []} submissions={mySubmissions ?? []} student={student} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const StudentTestsSection = ({ tests, submissions, student }: { tests: any[]; submissions: any[]; student: any }) => {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submittedIds = new Set(submissions.map((s) => s.test_id));

  const { data: questions } = useQuery({
    queryKey: ["test-questions-student", activeTest],
    queryFn: async () => {
      const { data } = await supabase.from("test_questions").select("*").eq("test_id", activeTest!).order("sort_order");
      return data ?? [];
    },
    enabled: !!activeTest,
  });

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const test = tests.find((t) => t.id === activeTest);

  const submitMutation = useMutation({
    mutationFn: async () => {
      let score: number | null = null;
      if (test && questions?.length) {
        score = 0;
        questions.forEach((q) => {
          if (answers[q.id] === q.correct_option) score! += Number(q.marks);
        });
      }

      const { error } = await supabase.from("test_submissions").insert({
        test_id: activeTest!,
        student_id: student.id,
        answers: answers,
        score,
        status: "graded",
        graded_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-submissions"] });
      toast({ title: "Test submitted!" });
      setActiveTest(null);
      setAnswers({});
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      {tests.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No tests assigned yet.</CardContent></Card>
      ) : (
        tests.map((t) => {
          const submission = submissions.find((s) => s.test_id === t.id);
          return (
            <Card key={t.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-semibold">{t.title}</h3>
                  <p className="text-sm text-muted-foreground">{t.subject} • Total: {t.total_marks}</p>
                  {t.due_date && <p className="text-xs text-muted-foreground">Due: {new Date(t.due_date).toLocaleDateString()}</p>}
                  {t.description && <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>}
                </div>
                <div className="text-right">
                  {submission ? (
                    <div>
                      <Badge variant={submission.status === "graded" ? "default" : "secondary"}>{submission.status}</Badge>
                      {submission.score !== null && <p className="mt-1 text-sm font-bold">Score: {submission.score}/{t.total_marks}</p>}
                    </div>
                  ) : (
                    <Button onClick={() => setActiveTest(t.id)}>Take Test</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Take Test Dialog */}
      <Dialog open={!!activeTest} onOpenChange={(o) => { if (!o) { setActiveTest(null); setAnswers({}); } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{test?.title}</DialogTitle></DialogHeader>
          {test?.description && <p className="text-sm text-muted-foreground">{test.description}</p>}

          <div className="space-y-6">
            {/* MCQ Questions */}
            {questions?.map((q, i) => (
              <Card key={q.id} className="p-4">
                <p className="mb-3 font-medium">Q{i + 1}. {q.question_text} <span className="text-xs text-muted-foreground">({q.marks} marks)</span></p>
                <RadioGroup value={answers[q.id] ?? ""} onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })}>
                  {[
                    { key: "A", text: q.option_a },
                    { key: "B", text: q.option_b },
                    { key: "C", text: q.option_c },
                    { key: "D", text: q.option_d },
                  ].map((opt) => (
                    <div key={opt.key} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.key} id={`${q.id}-${opt.key}`} />
                      <Label htmlFor={`${q.id}-${opt.key}`}>{opt.key}) {opt.text}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </Card>
            ))}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setActiveTest(null); setAnswers({}); }}>Cancel</Button>
              <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
                {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
