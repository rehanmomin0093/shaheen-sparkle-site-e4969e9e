import { useState, useEffect, useRef, useCallback } from "react";
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
import { Loader2, Save, Upload, FileSpreadsheet, FileDown, ChevronDown, ChevronUp, CheckCircle2, CloudOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";

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
  const [totalMarks, setTotalMarks] = useState<Record<string, string>>(
    Object.fromEntries(SUBJECTS.map((s) => [s, "100"]))
  );
  const totalMarksRef = useRef(totalMarks);
  const [showActions, setShowActions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: assignment, isLoading: loadingAssignment } = useTeacherAssignment();
  const { data: students, isLoading: loadingStudents } = useTeacherStudents(
    assignment?.class_name,
    assignment?.section
  );

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
    const loadedTotals: Record<string, string> = { ...totalMarks };
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
        // Load total_marks from first found existing result per subject
        if (existing) {
          loadedTotals[sub] = String(existing.total_marks);
        }
      });
      map[s.id] = entry;
    });
    setMarks(map);
    setTotalMarks(loadedTotals);
    totalMarksRef.current = loadedTotals;
  }, [students, existingResults]);

  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save as draft (published=false)
  const autoSaveMutation = useMutation({
    mutationFn: async (currentMarks: Record<string, MarksEntry>) => {
      if (!students) return;
      const records: any[] = [];
      students.forEach((s) => {
        const entry = currentMarks[s.id];
        if (!entry) return;
        SUBJECTS.forEach((sub) => {
          const m = entry[sub];
          if (m?.marks && m.marks !== "") {
            records.push({
              student_id: s.id,
              exam_type: examType,
              subject: sub,
              marks_obtained: parseFloat(m.marks),
              total_marks: parseFloat(totalMarksRef.current[sub]) || 100,
              academic_year: academicYear,
              entered_by: user?.id,
              published: false,
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
      setAutoSaveStatus("saved");
      queryClient.invalidateQueries({ queryKey: ["student-results"] });
    },
    onError: () => setAutoSaveStatus("error"),
  });

  // Publish to students (published=true)
  const publishMutation = useMutation({
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
              total_marks: parseFloat(totalMarks[sub]) || 100,
              academic_year: academicYear,
              entered_by: user?.id,
              published: true,
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
      toast({ title: "Results published! Students can now see their marks." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const triggerAutoSave = useCallback((updatedMarks: Record<string, MarksEntry>) => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setAutoSaveStatus("saving");
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveMutation.mutate(updatedMarks);
    }, 1500);
  }, [examType, academicYear, students, totalMarks, user?.id]);

  const updateMark = (studentId: string, subject: string, value: string) => {
    setMarks((prev) => {
      const updated = {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [subject]: { ...prev[studentId]?.[subject], marks: value },
        },
      };
      triggerAutoSave(updated);
      return updated;
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !students) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rows.length) {
          toast({ title: "Error", description: "No data found in file", variant: "destructive" });
          return;
        }

        const newMarks = { ...marks };
        let matched = 0;

        rows.forEach((row) => {
          const rollNo = String(row["Roll"] || row["Roll No"] || row["roll_number"] || "").trim();
          const student = students.find((s) => s.roll_number === rollNo);
          if (!student) return;

          SUBJECTS.forEach((sub) => {
            const val = row[sub];
            if (val !== undefined && val !== null && val !== "" && val !== "-") {
              if (!newMarks[student.id]) newMarks[student.id] = {};
              newMarks[student.id][sub] = {
                marks: String(val),
                total: newMarks[student.id]?.[sub]?.total || "100",
              };
              matched++;
            }
          });
        });

        setMarks(newMarks);
        toast({ title: `Imported ${matched} marks from ${rows.length} rows. Click Save to store.` });
      } catch (err) {
        toast({ title: "Error", description: "Failed to parse file", variant: "destructive" });
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExport = (format: "xlsx" | "csv") => {
    if (!students) return;
    const rows = students.map((s) => {
      const row: any = { "Roll": s.roll_number || "-", "Name": s.name };
      SUBJECTS.forEach((sub) => {
        row[sub] = marks[s.id]?.[sub]?.marks || "-";
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    const filename = `Results_${assignment?.class_name}_${examType}_${academicYear}`;
    XLSX.writeFile(wb, `${filename}.${format}`, format === "csv" ? { bookType: "csv" } : undefined);
  };

  const downloadTemplate = () => {
    if (!students) return;
    const rows = students.map((s) => {
      const row: any = { "Roll": s.roll_number || "", "Name": s.name };
      SUBJECTS.forEach((sub) => { row[sub] = ""; });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `Marks_Template_${assignment?.class_name}.xlsx`);
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
            <Button onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white">
              {publishMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Publish to Students
            </Button>
            {autoSaveStatus === "saving" && <Badge variant="outline" className="animate-pulse"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Auto-saving...</Badge>}
            {autoSaveStatus === "saved" && <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700"><CheckCircle2 className="mr-1 h-3 w-3" /> Draft saved</Badge>}
            {autoSaveStatus === "error" && <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700"><CloudOff className="mr-1 h-3 w-3" /> Save failed</Badge>}
          </div>
        </div>
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowActions((prev) => !prev)}
          >
            {showActions ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
            {showActions ? "Hide Options" : "Show Options"}
          </Button>
          {showActions && (
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileImport}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Import Excel/CSV
              </Button>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <FileDown className="mr-2 h-4 w-4" /> Download Template
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("xlsx")}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
                <FileDown className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-background">Roll</TableHead>
              <TableHead className="sticky left-12 bg-background">Name</TableHead>
              {SUBJECTS.map((s) => <TableHead key={s} className="text-center min-w-[80px]">{s}</TableHead>)}
              <TableHead className="text-center min-w-[80px] font-bold">Total</TableHead>
              <TableHead className="text-center min-w-[80px] font-bold">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-muted/50">
              <TableCell className="sticky left-0 bg-muted/50 font-bold" colSpan={2}>Out of Marks</TableCell>
              {SUBJECTS.map((sub) => (
                <TableCell key={sub} className="text-center">
                  <Input
                    type="number"
                    min="1"
                    value={totalMarks[sub]}
                    onChange={(e) => {
                      const newTotalMarks = { ...totalMarks, [sub]: e.target.value };
                      setTotalMarks(newTotalMarks);
                      // Trigger auto-save with updated total marks
                      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
                      setAutoSaveStatus("saving");
                      autoSaveTimerRef.current = setTimeout(() => {
                        autoSaveMutation.mutate(marks);
                      }, 1500);
                    }}
                    className="mx-auto w-16 text-center font-bold"
                  />
                </TableCell>
              ))}
              <TableCell className="text-center font-bold">
                {SUBJECTS.reduce((s, sub) => s + (parseFloat(totalMarks[sub]) || 100), 0)}
              </TableCell>
              <TableCell className="text-center font-bold">-</TableCell>
            </TableRow>
            {students?.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="sticky left-0 bg-background font-medium">{s.roll_number || "-"}</TableCell>
                <TableCell className="sticky left-12 bg-background">{s.name}</TableCell>
                {SUBJECTS.map((sub) => (
                  <TableCell key={sub} className="text-center">
                    <Input
                      type="number"
                      min="0"
                      max={totalMarks[sub] || "100"}
                      value={marks[s.id]?.[sub]?.marks ?? ""}
                      onChange={(e) => updateMark(s.id, sub, e.target.value)}
                      className="mx-auto w-16 text-center"
                      placeholder="-"
                    />
                  </TableCell>
                ))}
                {(() => {
                  const obtained = SUBJECTS.reduce((sum, sub) => {
                    const v = parseFloat(marks[s.id]?.[sub]?.marks || "");
                    return isNaN(v) ? sum : sum + v;
                  }, 0);
                  const maxMarks = SUBJECTS.reduce((s, sub) => s + (parseFloat(totalMarks[sub]) || 100), 0);
                  const hasAny = SUBJECTS.some((sub) => marks[s.id]?.[sub]?.marks !== "" && marks[s.id]?.[sub]?.marks !== undefined);
                  return (
                    <>
                      <TableCell className="text-center font-semibold">{hasAny ? obtained : "-"}</TableCell>
                      <TableCell className="text-center font-semibold">{hasAny ? `${Math.round((obtained / maxMarks) * 100)}%` : "-"}</TableCell>
                    </>
                  );
                })()}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ResultsTab;
