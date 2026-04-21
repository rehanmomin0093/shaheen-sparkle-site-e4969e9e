import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, FileText } from "lucide-react";
import {
  CCEConfig,
  CCEResult,
  gradeFor,
  maxFormOf,
  maxSumOf,
  maxTotalOf,
  percentOf,
  totalOf,
  formOf,
  sumOf,
} from "@/lib/cce";
import { generateCCEReportPDF } from "@/lib/cceReportPdf";
import { useSiteContent } from "@/hooks/useSiteContent";

interface Props {
  student: {
    id: string;
    name: string;
    class: string;
    section?: string | null;
    roll_number?: string | null;
    father_name?: string | null;
    mother_name?: string | null;
  };
  academicYear?: string;
}

const CCEResultsView = ({ student, academicYear = "2025-26" }: Props) => {
  const { data: content } = useSiteContent();
  const schoolName = content?.["footer_tagline"]?.trim() || "Shaheen High School, Karad";

  const { data: configs, isLoading: loadingCfg } = useQuery({
    queryKey: ["cce-config-public", student.class],
    queryFn: async () => {
      const { data } = await supabase
        .from("cce_subject_config")
        .select("*")
        .eq("class_name", student.class)
        .order("sort_order");
      return (data ?? []) as CCEConfig[];
    },
  });

  const { data: results, isLoading: loadingRes } = useQuery({
    queryKey: ["my-cce-results", student.id, academicYear],
    queryFn: async () => {
      const { data } = await supabase
        .from("cce_results")
        .select("*")
        .eq("student_id", student.id)
        .eq("academic_year", academicYear)
        .eq("published", true);
      return (data ?? []) as CCEResult[];
    },
  });

  const { subjects, configBySubject, resultsBySubject } = useMemo(() => {
    const cbs: Record<string, { sem1?: CCEConfig; sem2?: CCEConfig }> = {};
    (configs ?? []).forEach((c) => {
      cbs[c.subject] = cbs[c.subject] || {};
      if (c.semester === "1") cbs[c.subject].sem1 = c;
      else cbs[c.subject].sem2 = c;
    });
    const rbs: Record<string, { sem1?: CCEResult; sem2?: CCEResult }> = {};
    (results ?? []).forEach((r) => {
      rbs[r.subject] = rbs[r.subject] || {};
      if (r.semester === "1") rbs[r.subject].sem1 = r;
      else rbs[r.subject].sem2 = r;
    });
    const subs = Array.from(
      new Set([...(configs ?? []).map((c) => c.subject)]),
    ).sort((a, b) => {
      const sa = (configs ?? []).find((c) => c.subject === a)?.sort_order ?? 0;
      const sb = (configs ?? []).find((c) => c.subject === b)?.sort_order ?? 0;
      return sa - sb;
    });
    return { subjects: subs, configBySubject: cbs, resultsBySubject: rbs };
  }, [configs, results]);

  if (loadingCfg || loadingRes) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!subjects.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No CCE results available yet.
        </CardContent>
      </Card>
    );
  }

  const hasAnyResults = (results ?? []).length > 0;

  let grandObtained = 0;
  let grandMax = 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Annual Progress Report (CCE)
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {schoolName} • Class {student.class}
                {student.section ? ` - ${student.section}` : ""} • {academicYear}
              </p>
            </div>
            <Button
              onClick={() =>
                generateCCEReportPDF({
                  schoolName,
                  student,
                  academicYear,
                  configBySubject,
                  resultsBySubject,
                  subjects,
                })
              }
              disabled={!hasAnyResults}
            >
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead rowSpan={2} className="align-bottom">Subject</TableHead>
                <TableHead colSpan={4} className="text-center">Semester I</TableHead>
                <TableHead colSpan={4} className="text-center">Semester II</TableHead>
                <TableHead colSpan={3} className="text-center">Annual</TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="text-center text-xs">Sum.</TableHead>
                <TableHead className="text-center text-xs">Form.</TableHead>
                <TableHead className="text-center text-xs">Total</TableHead>
                <TableHead className="text-center text-xs">Grade</TableHead>
                <TableHead className="text-center text-xs">Sum.</TableHead>
                <TableHead className="text-center text-xs">Form.</TableHead>
                <TableHead className="text-center text-xs">Total</TableHead>
                <TableHead className="text-center text-xs">Grade</TableHead>
                <TableHead className="text-center text-xs">Total</TableHead>
                <TableHead className="text-center text-xs">%</TableHead>
                <TableHead className="text-center text-xs">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((sub) => {
                const c1 = configBySubject[sub]?.sem1;
                const c2 = configBySubject[sub]?.sem2;
                const r1 = resultsBySubject[sub]?.sem1;
                const r2 = resultsBySubject[sub]?.sem2;
                const t1 = totalOf(r1 ?? {});
                const t2 = totalOf(r2 ?? {});
                const m1 = maxTotalOf(c1);
                const m2 = maxTotalOf(c2);
                const aT = t1 + t2;
                const aM = m1 + m2;
                grandObtained += aT;
                grandMax += aM;
                const aP = percentOf(aT, aM);
                return (
                  <TableRow key={sub}>
                    <TableCell className="font-medium">{sub}</TableCell>
                    <TableCell className="text-center">{r1 ? `${sumOf(r1)}/${maxSumOf(c1)}` : "-"}</TableCell>
                    <TableCell className="text-center">{r1 ? `${formOf(r1)}/${maxFormOf(c1)}` : "-"}</TableCell>
                    <TableCell className="text-center font-semibold">{r1 ? `${t1}/${m1}` : "-"}</TableCell>
                    <TableCell className="text-center">
                      {r1 ? <Badge variant="outline">{gradeFor(percentOf(t1, m1))}</Badge> : "-"}
                    </TableCell>
                    <TableCell className="text-center">{r2 ? `${sumOf(r2)}/${maxSumOf(c2)}` : "-"}</TableCell>
                    <TableCell className="text-center">{r2 ? `${formOf(r2)}/${maxFormOf(c2)}` : "-"}</TableCell>
                    <TableCell className="text-center font-semibold">{r2 ? `${t2}/${m2}` : "-"}</TableCell>
                    <TableCell className="text-center">
                      {r2 ? <Badge variant="outline">{gradeFor(percentOf(t2, m2))}</Badge> : "-"}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {(r1 || r2) ? `${aT}/${aM}` : "-"}
                    </TableCell>
                    <TableCell className="text-center">{(r1 || r2) ? `${aP}%` : "-"}</TableCell>
                    <TableCell className="text-center font-bold text-primary">
                      {(r1 || r2) ? gradeFor(aP) : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
              {hasAnyResults && (
                <TableRow className="bg-muted/50">
                  <TableCell className="font-bold" colSpan={9}>Grand Total</TableCell>
                  <TableCell className="text-center font-bold">{grandObtained}/{grandMax}</TableCell>
                  <TableCell className="text-center font-bold">{percentOf(grandObtained, grandMax)}%</TableCell>
                  <TableCell className="text-center font-bold text-primary">
                    {grandMax > 0 ? gradeFor(percentOf(grandObtained, grandMax)) : "-"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CCEResultsView;
