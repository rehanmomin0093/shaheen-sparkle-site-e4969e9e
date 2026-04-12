import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTeacherAssignment, useTeacherStudents } from "./useTeacherStudents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search } from "lucide-react";

const AttendanceReportSection = () => {
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(thirtyDaysAgo);
  const [toDate, setToDate] = useState(today);
  const [appliedRange, setAppliedRange] = useState({ from: thirtyDaysAgo, to: today });

  const { data: assignment } = useTeacherAssignment();
  const { data: students } = useTeacherStudents(assignment?.class_name, assignment?.section);

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["attendance-report", appliedRange.from, appliedRange.to, assignment?.class_name],
    queryFn: async () => {
      if (!students?.length) return [];
      const ids = students.map((s) => s.id);
      const { data } = await supabase
        .from("attendance")
        .select("student_id, date, status")
        .gte("date", appliedRange.from)
        .lte("date", appliedRange.to)
        .in("student_id", ids);
      return data ?? [];
    },
    enabled: !!students?.length,
  });

  if (!assignment || !students?.length) return null;

  // Build per-student summary
  const summary = students.map((s) => {
    const records = attendanceData?.filter((a) => a.student_id === s.id) || [];
    const present = records.filter((a) => a.status === "present").length;
    const absent = records.filter((a) => a.status === "absent").length;
    const total = present + absent;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { ...s, present, absent, total, percentage };
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Attendance Report</CardTitle>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <label className="text-sm font-medium mb-1 block">From Date</label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-auto" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">To Date</label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-auto" />
          </div>
          <Button onClick={() => setAppliedRange({ from: fromDate, to: toDate })}>
            <Search className="mr-2 h-4 w-4" /> Show Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-center">Present</TableHead>
                <TableHead className="text-center">Absent</TableHead>
                <TableHead className="text-center">Total Days</TableHead>
                <TableHead className="text-center">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.roll_number || "-"}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-green-50 text-green-700">{s.present}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-red-50 text-red-700">{s.absent}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{s.total}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={s.percentage >= 75 ? "default" : "destructive"}>
                      {s.percentage}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceReportSection;
