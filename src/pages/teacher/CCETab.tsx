import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherAssignments, useTeacherStudents } from "./useTeacherStudents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, BookOpen, FileSpreadsheet } from "lucide-react";
import {
  CCE_FORM_COMPONENTS,
  CCE_SUM_COMPONENTS,
  CCEConfig,
  CCEResult,
  formOf,
  gradeFor,
  maxFormOf,
  maxSumOf,
  maxTotalOf,
  percentOf,
  sumOf,
  totalOf,
} from "@/lib/cce";
import { generateCCEExcelReport } from "@/lib/cceExcelReport";
import { useSiteContent } from "@/hooks/useSiteContent";

type Marks = Record<string, Record<string, string>>; // studentId -> componentKey -> value

const assignmentLabel = (a: any) =>
  `Class ${a.class_name}${a.section ? ` - ${a.section}` : ""}${a.is_class_teacher ? " (Class Teacher)" : ""}`;

const CCETab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: assignments, isLoading: loadingAssignments } = useTeacherAssignments();
  const { data: siteContent } = useSiteContent();
  const [exporting, setExporting] = useState(false);
  const [exportScope, setExportScope] = useState<"all" | "sem1" | "sem2" | "annual">("all");

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");

  // Auto-select first assignment (prefer class teacher) when loaded
  useEffect(() => {
    if (!selectedAssignmentId && assignments?.length) {
      const sorted = [...assignments].sort(
        (a: any, b: any) => Number(b.is_class_teacher) - Number(a.is_class_teacher),
      );
      setSelectedAssignmentId(sorted[0].id);
    }
  }, [assignments, selectedAssignmentId]);

  const assignment = useMemo(
    () => assignments?.find((a: any) => a.id === selectedAssignmentId) ?? null,
    [assignments, selectedAssignmentId],
  );

  const { data: students, isLoading: loadingStudents } = useTeacherStudents(
    (assignment as any)?.class_name,
    (assignment as any)?.section,
  );

  const [semester, setSemester] = useState<"1" | "2">("1");
  const [academicYear, setAcademicYear] = useState("2025-26");
  const [subject, setSubject] = useState<string>("");
  const [marks, setMarks] = useState<Marks>({});

  // Reset subject when class changes
  useEffect(() => {
    setSubject("");
  }, [selectedAssignmentId]);

  const teacherSubjects: string[] = useMemo(() => {
    const raw: string = (assignment as any)?.subjects || "";
    if (!raw.trim()) return [];
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }, [assignment]);

  const isClassTeacher = !!(assignment as any)?.is_class_teacher;

  const { data: configsForClass } = useQuery({
    queryKey: ["cce-config", (assignment as any)?.class_name],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cce_subject_config")
        .select("*")
        .eq("class_name", (assignment as any)!.class_name)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as CCEConfig[];
    },
    enabled: !!(assignment as any)?.class_name,
  });

  const allSubjects = useMemo(
    () => Array.from(new Set((configsForClass ?? []).map((c) => c.subject))),
    [configsForClass],
  );

  const editableSubjects = useMemo(() => {
    if (isClassTeacher) return allSubjects;
    return allSubjects.filter((s) =>
      teacherSubjects.some((ts) => ts.toLowerCase() === s.toLowerCase()),
    );
  }, [allSubjects, teacherSubjects, isClassTeacher]);

  useEffect(() => {
    if (!subject && editableSubjects.length) setSubject(editableSubjects[0]);
  }, [editableSubjects, subject]);

  const config = useMemo<CCEConfig | undefined>(
    () =>
      (configsForClass ?? []).find(
        (c) => c.subject === subject && c.semester === semester,
      ),
    [configsForClass, subject, semester],
  );

  const { data: existing } = useQuery({
    queryKey: ["cce-results", (assignment as any)?.class_name, subject, semester, academicYear, students?.length],
    queryFn: async () => {
      if (!students?.length || !subject) return [] as CCEResult[];
      const ids = students.map((s) => s.id);
      const { data, error } = await supabase
        .from("cce_results")
        .select("*")
        .eq("subject", subject)
        .eq("semester", semester)
        .eq("academic_year", academicYear)
        .in("student_id", ids);
      if (error) throw error;
      return (data ?? []) as CCEResult[];
    },
    enabled: !!students?.length && !!subject,
  });

  // Hydrate marks state when data arrives
  useEffect(() => {
    if (!students) return;
    const m: Marks = {};
    students.forEach((s) => {
      const r = existing?.find((e) => e.student_id === s.id);
      const entry: Record<string, string> = {};
      [...CCE_SUM_COMPONENTS, ...CCE_FORM_COMPONENTS].forEach((c) => {
        const v = r ? (r as any)[c.key] : null;
        entry[c.key] = v === null || v === undefined ? "" : String(v);
      });
      m[s.id] = entry;
    });
    setMarks(m);
  }, [students, existing]);

  const updateMark = (studentId: string, key: string, value: string) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [key]: value },
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async (publish: boolean) => {
      if (!students || !subject) return;
      const records = students
        .map((s) => {
          const entry = marks[s.id] || {};
          const hasAny = Object.values(entry).some((v) => v !== "");
          if (!hasAny) return null;
          const row: any = {
            student_id: s.id,
            subject,
            semester,
            academic_year: academicYear,
            entered_by: user?.id,
            published: publish,
          };
          [...CCE_SUM_COMPONENTS, ...CCE_FORM_COMPONENTS].forEach((c) => {
            const v = entry[c.key];
            row[c.key] = v === "" || v === undefined ? null : Number(v);
          });
          return row;
        })
        .filter(Boolean);
      if (!records.length) return;
      const { error } = await supabase
        .from("cce_results")
        .upsert(records, { onConflict: "student_id,academic_year,semester,subject" });
      if (error) throw error;
    },
    onSuccess: (_d, publish) => {
      toast({
        title: publish ? "Marks published to students" : "Draft saved",
      });
      queryClient.invalidateQueries({ queryKey: ["cce-results"] });
    },
    onError: (e: any) =>
      toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const handleExportExcel = async (scope: "all" | "sem1" | "sem2" | "annual" = exportScope) => {
    if (!assignment || !students?.length) {
      toast({ title: "No students to export", variant: "destructive" });
      return;
    }
    try {
      setExporting(true);
      const className = (assignment as any).class_name as string;
      const section = (assignment as any).section as string | null;

      // Fetch all configs for this class (all subjects, both semesters)
      const { data: cfgRows, error: cfgErr } = await supabase
        .from("cce_subject_config")
        .select("*")
        .eq("class_name", className)
        .order("sort_order");
      if (cfgErr) throw cfgErr;

      // Fetch all CCE results for these students in selected academic year
      const ids = students.map((s) => s.id);
      const { data: resRows, error: resErr } = await supabase
        .from("cce_results")
        .select("*")
        .eq("academic_year", academicYear)
        .in("student_id", ids);
      if (resErr) throw resErr;

      const configBySubject: Record<string, { sem1?: CCEConfig; sem2?: CCEConfig }> = {};
      (cfgRows ?? []).forEach((c: any) => {
        configBySubject[c.subject] = configBySubject[c.subject] || {};
        if (c.semester === "1") configBySubject[c.subject].sem1 = c;
        else configBySubject[c.subject].sem2 = c;
      });
      const subjectsList = Array.from(new Set((cfgRows ?? []).map((c: any) => c.subject)));

      const resultsByStudent: Record<string, Record<string, { sem1?: CCEResult; sem2?: CCEResult }>> = {};
      (resRows ?? []).forEach((r: any) => {
        resultsByStudent[r.student_id] = resultsByStudent[r.student_id] || {};
        resultsByStudent[r.student_id][r.subject] = resultsByStudent[r.student_id][r.subject] || {};
        if (r.semester === "1") resultsByStudent[r.student_id][r.subject].sem1 = r;
        else resultsByStudent[r.student_id][r.subject].sem2 = r;
      });

      await generateCCEExcelReport({
        schoolName: "Shaheen School & Shaheen High School Karad",
        className,
        section,
        academicYear,
        students: students.map((s: any) => ({
          id: s.id,
          name: s.name,
          roll_number: s.roll_number,
          section: s.section,
          gender: s.gender ?? null,
        })),
        subjects: subjectsList,
        configBySubject,
        resultsByStudent,
        sheets: scope === "all" ? ["sem1", "sem2", "annual"] : [scope],
      });
      toast({ title: "Excel report downloaded" });
    } catch (e: any) {
      toast({ title: "Export failed", description: e.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  if (loadingAssignments) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assignments?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No class assigned. Please contact admin.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> CCE Result Entry
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Continuous Comprehensive Evaluation
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedAssignmentId} onValueChange={setSelectedAssignmentId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {assignments.map((a: any) => (
                  <SelectItem key={a.id} value={a.id}>
                    {assignmentLabel(a)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={subject} onValueChange={setSubject} disabled={!editableSubjects.length}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {editableSubjects.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={semester} onValueChange={(v) => setSemester(v as "1" | "2")}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-28"
              placeholder="2025-26"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={exporting || !students?.length}>
                  {exporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                  )}
                  Download Excel
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportExcel("all")}>
                  All (Sem 1 + Sem 2 + Annual)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportExcel("sem1")}>
                  Semester 1
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportExcel("sem2")}>
                  Semester 2
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportExcel("annual")}>
                  Annual
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              onClick={() => saveMutation.mutate(false)}
              disabled={saveMutation.isPending || !subject}
            >
              {saveMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Draft
            </Button>
            <Button
              onClick={() => saveMutation.mutate(true)}
              disabled={saveMutation.isPending || !subject}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>
        {assignment && (
          <p className="mt-2 text-sm text-muted-foreground">
            Entering marks for <strong>{assignmentLabel(assignment)}</strong>
            {teacherSubjects.length > 0 && !isClassTeacher
              ? ` • Your subjects: ${teacherSubjects.join(", ")}`
              : ""}
          </p>
        )}
        {config && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">Summative max: {maxSumOf(config)}</Badge>
            <Badge variant="outline">Formative max: {maxFormOf(config)}</Badge>
            <Badge variant="outline">Total max: {maxTotalOf(config)}</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {loadingStudents ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !editableSubjects.length ? (
          <p className="py-8 text-center text-muted-foreground">
            No CCE subjects you can edit for this class. Ask the admin to assign subjects.
          </p>
        ) : !config ? (
          <p className="py-8 text-center text-muted-foreground">
            No CCE configuration for {subject} (Sem {semester}). Ask admin.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background">Roll</TableHead>
                <TableHead className="sticky left-12 min-w-[140px] bg-background">Name</TableHead>
                {CCE_SUM_COMPONENTS.map((c) => {
                  const max = Number((config as any)[c.maxKey]) || 0;
                  if (max === 0) return null;
                  return (
                    <TableHead key={c.key} className="text-center">
                      <div className="text-[10px] uppercase text-muted-foreground">Sum.</div>
                      <div>
                        {c.label}
                        <span className="text-xs text-muted-foreground"> /{max}</span>
                      </div>
                    </TableHead>
                  );
                })}
                {CCE_FORM_COMPONENTS.map((c) => {
                  const max = Number((config as any)[c.maxKey]) || 0;
                  if (max === 0) return null;
                  return (
                    <TableHead key={c.key} className="text-center">
                      <div className="text-[10px] uppercase text-muted-foreground">Form.</div>
                      <div>
                        {c.label}
                        <span className="text-xs text-muted-foreground"> /{max}</span>
                      </div>
                    </TableHead>
                  );
                })}
                <TableHead className="text-center font-bold">Total</TableHead>
                <TableHead className="text-center font-bold">%</TableHead>
                <TableHead className="text-center font-bold">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students?.map((s) => {
                const entry = marks[s.id] || {};
                const partial: any = {};
                Object.keys(entry).forEach((k) => (partial[k] = Number(entry[k]) || 0));
                const total = totalOf(partial);
                const max = maxTotalOf(config);
                const pct = percentOf(total, max);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="sticky left-0 bg-background font-medium">
                      {s.roll_number || "-"}
                    </TableCell>
                    <TableCell className="sticky left-12 bg-background">{s.name}</TableCell>
                    {CCE_SUM_COMPONENTS.map((c) => {
                      const max = Number((config as any)[c.maxKey]) || 0;
                      if (max === 0) return null;
                      return (
                        <TableCell key={c.key} className="text-center">
                          <Input
                            type="number"
                            min={0}
                            max={max}
                            step="0.5"
                            value={entry[c.key] ?? ""}
                            onChange={(e) => updateMark(s.id, c.key, e.target.value)}
                            className="mx-auto h-8 w-16 text-center"
                          />
                        </TableCell>
                      );
                    })}
                    {CCE_FORM_COMPONENTS.map((c) => {
                      const max = Number((config as any)[c.maxKey]) || 0;
                      if (max === 0) return null;
                      return (
                        <TableCell key={c.key} className="text-center">
                          <Input
                            type="number"
                            min={0}
                            max={max}
                            step="0.5"
                            value={entry[c.key] ?? ""}
                            onChange={(e) => updateMark(s.id, c.key, e.target.value)}
                            className="mx-auto h-8 w-16 text-center"
                          />
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center font-semibold">
                      {total}/{max}
                    </TableCell>
                    <TableCell className="text-center">{pct}%</TableCell>
                    <TableCell className="text-center font-bold text-primary">
                      {max > 0 ? gradeFor(pct, (assignment as any)?.class_name) : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default CCETab;
