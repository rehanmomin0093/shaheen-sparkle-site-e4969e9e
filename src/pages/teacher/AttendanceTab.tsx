import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherAssignment, useTeacherAssignments, useTeacherStudents } from "./useTeacherStudents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, CheckCircle, XCircle, BarChart3, ClipboardList } from "lucide-react";
import AttendanceReportSection from "./AttendanceReportSection";

type Status = "present" | "absent" | "unmarked";
type View = "daily" | "report";

const AttendanceTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [absentInput, setAbsentInput] = useState("");
  const [view, setView] = useState<View>("daily");

  const { data: allAssignments, isLoading: loadingAssignment } = useTeacherAssignments();
  const classTeacherAssignments = (allAssignments ?? []).filter((a: any) => a.is_class_teacher);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!selectedAssignmentId && classTeacherAssignments.length > 0) {
      setSelectedAssignmentId(classTeacherAssignments[0].id);
    }
  }, [classTeacherAssignments, selectedAssignmentId]);

  const assignment: any = classTeacherAssignments.find((a: any) => a.id === selectedAssignmentId)
    ?? (allAssignments ?? [])[0]
    ?? null;

  const { data: students, isLoading: loadingStudents } = useTeacherStudents(
    assignment?.class_name,
    assignment?.section
  );

  const { data: existingAttendance } = useQuery({
    queryKey: ["attendance", date, assignment?.class_name],
    queryFn: async () => {
      if (!students?.length) return [];
      const ids = students.map((s) => s.id);
      const { data } = await supabase
        .from("attendance")
        .select("*")
        .eq("date", date)
        .in("student_id", ids);
      return data ?? [];
    },
    enabled: !!students?.length,
  });

  useEffect(() => {
    if (!students) return;
    const map: Record<string, Status> = {};
    students.forEach((s) => {
      const existing = existingAttendance?.find((a) => a.student_id === s.id);
      if (existing?.status === "present") map[s.id] = "present";
      else if (existing?.status === "absent") map[s.id] = "absent";
      else map[s.id] = "unmarked";
    });
    setStatuses(map);
  }, [students, existingAttendance]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!students) return;
      const unmarkedCount = students.filter((s) => statuses[s.id] === "unmarked").length;
      if (unmarkedCount > 0) {
        throw new Error(`Please mark attendance for all students. ${unmarkedCount} remaining.`);
      }
      const records = students.map((s) => ({
        student_id: s.id,
        date,
        status: statuses[s.id] as "present" | "absent",
        marked_by: user?.id,
      }));
      const { error } = await supabase
        .from("attendance")
        .upsert(records, { onConflict: "student_id,date" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", date] });
      toast({ title: "Attendance saved!" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

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

  const isClassTeacher = !!(assignment as any).is_class_teacher;

  const presentCount = Object.values(statuses).filter((s) => s === "present").length;
  const absentCount = Object.values(statuses).filter((s) => s === "absent").length;
  const unmarkedCount = Object.values(statuses).filter((s) => s === "unmarked").length;

  return (
    <>
      <div className="flex gap-2 mb-4">
        <Button
          variant={view === "daily" ? "default" : "outline"}
          onClick={() => setView("daily")}
        >
          <ClipboardList className="mr-2 h-4 w-4" /> Daily Attendance
        </Button>
        <Button
          variant={view === "report" ? "default" : "outline"}
          onClick={() => setView("report")}
        >
          <BarChart3 className="mr-2 h-4 w-4" /> Attendance Report
        </Button>
      </div>

      {view === "daily" ? (
        !isClassTeacher ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Only class teachers can mark attendance. Please contact the admin if you believe this is an error.
            </CardContent>
          </Card>
        ) :
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Daily Attendance</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Class {assignment.class_name}{assignment.section ? ` - ${assignment.section}` : ""} • {students?.length ?? 0} students
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save
                </Button>
              </div>
            </div>
            <div className="mt-3 flex gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700">Present: {presentCount}</Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700">Absent: {absentCount}</Badge>
              {unmarkedCount > 0 && <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Unmarked: {unmarkedCount}</Badge>}
            </div>
            <div className="mt-4 flex items-end gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Quick Absent — Enter roll numbers (comma separated)</label>
                <Input
                  placeholder="e.g. 3101, 3110, 3120"
                  value={absentInput}
                  onChange={(e) => setAbsentInput(e.target.value)}
                />
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  if (!students || !absentInput.trim()) return;
                  const absentRolls = absentInput.split(",").map((r) => r.trim()).filter(Boolean);
                  const newStatuses: Record<string, Status> = {};
                  students.forEach((s) => {
                    if (absentRolls.includes(s.roll_number || "")) {
                      newStatuses[s.id] = "absent";
                    } else {
                      newStatuses[s.id] = "present";
                    }
                  });
                  setStatuses(newStatuses);
                  toast({ title: `${absentRolls.length} marked absent, rest marked present` });
                }}
              >
                Apply
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.map((s) => {
                  const status = statuses[s.id] || "unmarked";
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.roll_number || "-"}</TableCell>
                      <TableCell>{s.name}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={status === "present" ? "default" : "outline"}
                            className={status === "present" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                            onClick={() => setStatuses((prev) => ({ ...prev, [s.id]: "present" }))}
                          >
                            Present
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={status === "absent" ? "default" : "outline"}
                            className={status === "absent" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                            onClick={() => setStatuses((prev) => ({ ...prev, [s.id]: "absent" }))}
                          >
                            Absent
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : view === "report" ? (
        <AttendanceReportSection />
      ) : null}
    </>
  );
};

export default AttendanceTab;
