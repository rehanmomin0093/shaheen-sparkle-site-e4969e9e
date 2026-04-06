import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherAssignment, useTeacherStudents } from "./useTeacherStudents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

const EXAM_TYPES = ["Unit Test 1", "Unit Test 2", "Half Yearly", "Annual"] as const;
const SUBJECTS = ["English", "Hindi", "Marathi", "Math", "Science", "Social Studies"] as const;

interface MarksEntry {
  [subject: string]: { marks: string; total: string };
}

const ResultsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [examType, setExamType] = useState<string>(EXAM_TYPES[0]);
  const [academicYear, setAcademicYear] = useState("2025-26");
  const [marks, setMarks] = useState<Record<string, MarksEntry>>({});

  const { data: assignment, isLoading: loadingAssignment } = useTeacherAssignment();
  const { data: students, isLoading: loadingStudents } = useTeacherStudents(
    assignment?.class_name,
    assignment?.section
  );

  // Fetch existing results
  const { data: existingResults } = useQuery({
    queryKey: ["student-results", examType, academicYear, assignment?.class_name],
    queryFn: async () => {
      if (!students?.length) return [];
      const ids = students.map((s) => s.id);
      const { data } = await supabase
        .from("student_results")
        .select("*")
        .eq("exam_type", examType)
        .eq("academic_year", academicYear)
        .in("student_id", ids);
      return data ?? [];
    },
    enabled: !!students?.length,
  });

  useEffect(() => {
    if (!students) return;
    const map: Record<string, MarksEntry> = {};
    students.forEach((s) => {
      const entry: MarksEntry = {};
      SUBJECTS.forEach((sub) => {
        const existing = existingResults?.find(
          (r) => r.student_id === s.id && r.subject === sub
        );
        entry[sub] = {
          marks: existing ? String(existing.marks_obtained) : "",
          total: existing ? String(existing.total_marks) : "100",
        };
      });
      map[s.id] = entry;
    });
    setMarks(map);
  }, [students, existingResults]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!students) return;
      const records: any[] = [];
      students.forEach((s) => {
        const entry = marks[s.id];
        if (!entry) return;
        SUBJECTS.forEach((sub) => {
          const m = entry[sub];
          if (m?.marks && m.marks !== "") {
            records.push({
              student_id: s.id,
              exam_type: examType,
              subject: sub,
              marks_obtained: parseFloat(m.marks),
              total_marks: parseFloat(m.total) || 100,
              academic_year: academicYear,
              entered_by: user?.id,
            });
          }
        });
      });
      if (records.length === 0) return;
      const { error } = await supabase
        .from("student_results")
        .upsert(records, { onConflict: "student_id,exam_type,subject,academic_year" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-results"] });
      toast({ title: "Results saved!" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMark = (studentId: string, subject: string, value: string) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: { ...prev[studentId]?.[subject], marks: value },
      },
    }));
  };

  if (loadingAssignment || loadingStudents) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!assignment) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No class assigned to you yet. Please contact the admin.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Student Results</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Class {assignment.class_name}{assignment.section ? ` - ${assignment.section}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {EXAM_TYPES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-28" placeholder="2025-26" />
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-background">Roll</TableHead>
              <TableHead className="sticky left-12 bg-background">Name</TableHead>
              {SUBJECTS.map((s) => <TableHead key={s} className="text-center min-w-[80px]">{s}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {students?.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="sticky left-0 bg-background font-medium">{s.roll_number || "-"}</TableCell>
                <TableCell className="sticky left-12 bg-background">{s.name}</TableCell>
                {SUBJECTS.map((sub) => (
                  <TableCell key={sub} className="text-center">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={marks[s.id]?.[sub]?.marks ?? ""}
                      onChange={(e) => updateMark(s.id, sub, e.target.value)}
                      className="mx-auto w-16 text-center"
                      placeholder="-"
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ResultsTab;
