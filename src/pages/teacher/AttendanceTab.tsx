import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherAssignment, useTeacherStudents } from "./useTeacherStudents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, CheckCircle, XCircle, Clock } from "lucide-react";

type Status = "present" | "absent" | "late";

const AttendanceTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  const { data: assignment, isLoading: loadingAssignment } = useTeacherAssignment();
  const { data: students, isLoading: loadingStudents } = useTeacherStudents(
    assignment?.class_name,
    assignment?.section
  );

  // Fetch existing attendance for this date
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

  // Populate statuses from existing attendance
  useEffect(() => {
    if (!students) return;
    const map: Record<string, Status> = {};
    students.forEach((s) => {
      const existing = existingAttendance?.find((a) => a.student_id === s.id);
      map[s.id] = (existing?.status as Status) ?? "present";
    });
    setStatuses(map);
  }, [students, existingAttendance]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!students) return;
      const records = students.map((s) => ({
        student_id: s.id,
        date,
        status: statuses[s.id] || "present",
        marked_by: user?.id,
      }));
      // Upsert attendance
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

  const toggleStatus = (studentId: string) => {
    setStatuses((prev) => {
      const current = prev[studentId] || "present";
      const next: Status = current === "present" ? "absent" : current === "absent" ? "late" : "present";
      return { ...prev, [studentId]: next };
    });
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

  const presentCount = Object.values(statuses).filter((s) => s === "present").length;
  const absentCount = Object.values(statuses).filter((s) => s === "absent").length;
  const lateCount = Object.values(statuses).filter((s) => s === "late").length;

  return (
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
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Late: {lateCount}</Badge>
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
              const status = statuses[s.id] || "present";
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.roll_number || "-"}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(s.id)}
                      className={
                        status === "present" ? "text-green-600 hover:text-green-700" :
                        status === "absent" ? "text-red-600 hover:text-red-700" :
                        "text-yellow-600 hover:text-yellow-700"
                      }
                    >
                      {status === "present" && <><CheckCircle className="mr-1 h-4 w-4" /> Present</>}
                      {status === "absent" && <><XCircle className="mr-1 h-4 w-4" /> Absent</>}
                      {status === "late" && <><Clock className="mr-1 h-4 w-4" /> Late</>}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AttendanceTab;
