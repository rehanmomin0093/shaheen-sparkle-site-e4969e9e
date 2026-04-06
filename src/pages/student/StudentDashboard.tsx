import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, ClipboardList, FileText, TrendingUp, Loader2, User } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

const SUBJECTS = ["English", "Hindi", "Marathi", "Math", "Science", "Social Studies"];

const StudentDashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/student-portal");
  }, [loading, user, navigate]);

  // Get student record by email
  const { data: student, isLoading: loadingStudent } = useQuery({
    queryKey: ["my-student-record", user?.email],
    queryFn: async () => {
      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("email", user!.email!)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.email,
  });

  // Attendance data
  const { data: attendance } = useQuery({
    queryKey: ["my-attendance", student?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", student!.id)
        .order("date", { ascending: false })
        .limit(90);
      return data ?? [];
    },
    enabled: !!student?.id,
  });

  // Results data
  const { data: results } = useQuery({
    queryKey: ["my-results", student?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("student_results")
        .select("*")
        .eq("student_id", student!.id)
        .order("created_at");
      return data ?? [];
    },
    enabled: !!student?.id,
  });

  // Physical data
  const { data: physicalData } = useQuery({
    queryKey: ["my-physical", student?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("student_physical_data")
        .select("*")
        .eq("student_id", student!.id)
        .order("recorded_date", { ascending: false })
        .limit(1);
      return data?.[0] ?? null;
    },
    enabled: !!student?.id,
  });

  if (loading || loadingStudent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md"><CardContent className="py-12 text-center text-muted-foreground">
          No student record found for your account. Contact admin.
        </CardContent></Card>
      </div>
    );
  }

  // Attendance stats
  const totalDays = attendance?.length ?? 0;
  const presentDays = attendance?.filter((a) => a.status === "present").length ?? 0;
  const absentDays = attendance?.filter((a) => a.status === "absent").length ?? 0;
  const lateDays = attendance?.filter((a) => a.status === "late").length ?? 0;
  const attendancePercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // Results by exam
  const examTypes = ["Unit Test 1", "Unit Test 2", "Half Yearly", "Annual"];
  const resultsByExam = examTypes.map((exam) => {
    const examResults = results?.filter((r) => r.exam_type === exam) ?? [];
    const subjectMarks: Record<string, number> = {};
    examResults.forEach((r) => {
      subjectMarks[r.subject] = Number(r.marks_obtained);
    });
    const total = examResults.reduce((s, r) => s + Number(r.marks_obtained), 0);
    const maxTotal = examResults.reduce((s, r) => s + Number(r.total_marks), 0);
    const percent = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
    return { exam, subjectMarks, total, maxTotal, percent, count: examResults.length };
  });

  // Progress chart data (percent per exam)
  const progressData = resultsByExam
    .filter((r) => r.count > 0)
    .map((r) => ({ name: r.exam, percentage: r.percent }));

  // Subject-wise chart for latest exam with data
  const latestExamWithData = [...resultsByExam].reverse().find((r) => r.count > 0);
  const subjectChartData = latestExamWithData
    ? SUBJECTS.map((s) => ({
        subject: s,
        marks: latestExamWithData.subjectMarks[s] ?? 0,
      }))
    : [];

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
        {/* Quick Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Roll Number</p>
                <p className="font-bold">{student.roll_number || "-"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <ClipboardList className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Attendance</p>
                <p className="font-bold">{attendancePercent}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Height / Weight</p>
                <p className="font-bold">{physicalData ? `${physicalData.height_cm} cm / ${physicalData.weight_kg} kg` : "-"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Latest Result</p>
                <p className="font-bold">{latestExamWithData ? `${latestExamWithData.percent}%` : "-"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="attendance" className="gap-2">
              <ClipboardList className="h-4 w-4" /> Attendance
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2">
              <FileText className="h-4 w-4" /> Results
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2">
              <TrendingUp className="h-4 w-4" /> Progress
            </TabsTrigger>
          </TabsList>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Summary</CardTitle>
                <div className="mt-2 flex gap-3">
                  <Badge variant="outline" className="bg-green-50 text-green-700">Present: {presentDays}</Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700">Absent: {absentDays}</Badge>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Late: {lateDays}</Badge>
                  <Badge variant="outline">Total: {totalDays} days</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {totalDays === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No attendance records yet.</p>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
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
                resultsByExam
                  .filter((r) => r.count > 0)
                  .map((r) => (
                    <Card key={r.exam}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{r.exam}</CardTitle>
                          <Badge variant="outline" className="text-sm font-bold">{r.percent}%</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Subject</TableHead>
                              <TableHead className="text-center">Marks</TableHead>
                              <TableHead className="text-center">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {SUBJECTS.map((sub) => {
                              const marks = r.subjectMarks[sub];
                              return marks !== undefined ? (
                                <TableRow key={sub}>
                                  <TableCell>{sub}</TableCell>
                                  <TableCell className="text-center font-medium">{marks}</TableCell>
                                  <TableCell className="text-center">100</TableCell>
                                </TableRow>
                              ) : null;
                            })}
                            <TableRow className="font-bold">
                              <TableCell>Total</TableCell>
                              <TableCell className="text-center">{r.total}</TableCell>
                              <TableCell className="text-center">{r.maxTotal}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Overall progress chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Exam-wise Progress</CardTitle>
                </CardHeader>
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

              {/* Subject-wise bar chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject-wise Marks ({latestExamWithData?.exam ?? "Latest"})</CardTitle>
                </CardHeader>
                <CardContent>
                  {subjectChartData.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">No subject data available.</p>
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
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;
