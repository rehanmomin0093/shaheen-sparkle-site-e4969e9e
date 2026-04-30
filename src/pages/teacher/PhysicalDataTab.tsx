import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherAssignments, useTeacherStudents } from "./useTeacherStudents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface PhysicalEntry {
  height: string;
  weight: string;
}

const PhysicalDataTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split("T")[0]);
  const [entries, setEntries] = useState<Record<string, PhysicalEntry>>({});

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

  const { data: existingData } = useQuery({
    queryKey: ["physical-data", recordDate, assignment?.class_name],
    queryFn: async () => {
      if (!students?.length) return [];
      const ids = students.map((s) => s.id);
      const { data } = await supabase
        .from("student_physical_data")
        .select("*")
        .eq("recorded_date", recordDate)
        .in("student_id", ids);
      return data ?? [];
    },
    enabled: !!students?.length,
  });

  useEffect(() => {
    if (!students) return;
    const map: Record<string, PhysicalEntry> = {};
    students.forEach((s) => {
      const existing = existingData?.find((d) => d.student_id === s.id);
      map[s.id] = {
        height: existing?.height_cm ? String(existing.height_cm) : "",
        weight: existing?.weight_kg ? String(existing.weight_kg) : "",
      };
    });
    setEntries(map);
  }, [students, existingData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!students) return;
      const records = students
        .filter((s) => entries[s.id]?.height || entries[s.id]?.weight)
        .map((s) => ({
          student_id: s.id,
          recorded_date: recordDate,
          height_cm: entries[s.id].height ? parseFloat(entries[s.id].height) : null,
          weight_kg: entries[s.id].weight ? parseFloat(entries[s.id].weight) : null,
          recorded_by: user?.id,
        }));
      if (records.length === 0) return;
      const { error } = await supabase
        .from("student_physical_data")
        .upsert(records, { onConflict: "student_id,recorded_date" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["physical-data"] });
      toast({ title: "Physical data saved!" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateEntry = (studentId: string, field: "height" | "weight", value: string) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
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
            <CardTitle>Student Physical Data</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Class {assignment.class_name}{assignment.section ? ` - ${assignment.section}` : ""} • Height (cm) & Weight (kg)
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {classTeacherAssignments.length > 1 && (
              <Select value={selectedAssignmentId} onValueChange={setSelectedAssignmentId}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classTeacherAssignments.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>
                      Class {a.class_name}{a.section ? ` - ${a.section}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} className="w-auto" />
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roll No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">Height (cm)</TableHead>
              <TableHead className="text-center">Weight (kg)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students?.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.roll_number || "-"}</TableCell>
                <TableCell>{s.name}</TableCell>
                <TableCell className="text-center">
                  <Input
                    type="number"
                    step="0.1"
                    value={entries[s.id]?.height ?? ""}
                    onChange={(e) => updateEntry(s.id, "height", e.target.value)}
                    className="mx-auto w-20 text-center"
                    placeholder="-"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Input
                    type="number"
                    step="0.1"
                    value={entries[s.id]?.weight ?? ""}
                    onChange={(e) => updateEntry(s.id, "weight", e.target.value)}
                    className="mx-auto w-20 text-center"
                    placeholder="-"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PhysicalDataTab;
