import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Sparkles } from "lucide-react";
import {
  CCE_FORM_COMPONENTS,
  CCE_SUM_COMPONENTS,
  CCEConfig,
} from "@/lib/cce";

const CLASSES = [
  "Nursery", "LKG", "UKG",
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
];
const SUBJECTS = [
  "English",
  "Hindi",
  "Urdu",
  "Marathi",
  "Math",
  "Science",
  "Social Studies",
  "ARTS",
  "W.ESP",
  "PHY.EDU",
];
const SEMESTERS: Array<"1" | "2"> = ["1", "2"];

const DEFAULT_MAX = {
  max_sum_oral: 5,
  max_sum_practical: 5,
  max_sum_project: 5,
  max_sum_assignment: 5,
  max_sum_unit_test: 10,
  max_sum_classwork: 5,
  max_sum_other: 5,
  max_form_oral: 10,
  max_form_written: 50,
};

type Row = {
  subject: string;
  values: Record<string, number>;
};

const AdminCCEConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tableRef = useRef<HTMLDivElement | null>(null);

  const [className, setClassName] = useState<string>("1");
  const [semester, setSemester] = useState<"1" | "2">("1");

  const { data: existing, isLoading } = useQuery({
    queryKey: ["cce-config-admin", className, semester],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cce_subject_config")
        .select("*")
        .eq("class_name", className)
        .eq("semester", semester);
      if (error) throw error;
      return (data || []) as CCEConfig[];
    },
  });

  const [rows, setRows] = useState<Row[]>([]);

  // Build rows for all subjects, populated from existing config or defaults
  useEffect(() => {
    const map = new Map<string, CCEConfig>();
    (existing || []).forEach((c) => map.set(c.subject, c));

    const next: Row[] = SUBJECTS.map((sub) => {
      const cfg = map.get(sub);
      const values: Record<string, number> = {};
      [...CCE_SUM_COMPONENTS, ...CCE_FORM_COMPONENTS].forEach((c) => {
        const key = c.maxKey;
        values[key] = cfg
          ? Number((cfg as any)[key]) || 0
          : (DEFAULT_MAX as any)[key] || 0;
      });
      return { subject: sub, values };
    });
    setRows(next);
  }, [existing, className, semester]);

  const updateValue = (subject: string, key: string, val: string) => {
    const num = val === "" ? 0 : Math.max(0, Number(val) || 0);
    setRows((prev) =>
      prev.map((r) =>
        r.subject === subject ? { ...r, values: { ...r.values, [key]: num } } : r,
      ),
    );
  };

  const handleCellArrowNavigation = (
    event: KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number,
  ) => {
    const moves: Record<string, { row: number; col: number }> = {
      ArrowUp: { row: -1, col: 0 },
      ArrowDown: { row: 1, col: 0 },
      ArrowLeft: { row: 0, col: -1 },
      ArrowRight: { row: 0, col: 1 },
    };

    const move = moves[event.key];
    if (!move) return;

    event.preventDefault();

    const nextRow = rowIndex + move.row;
    const nextCol = colIndex + move.col;

    if (
      nextRow < 0 ||
      nextRow >= rows.length ||
      nextCol < 0 ||
      nextCol >= CCE_SUM_COMPONENTS.length + CCE_FORM_COMPONENTS.length
    ) {
      return;
    }

    const nextInput = tableRef.current?.querySelector<HTMLInputElement>(
      `[data-cce-cell="true"][data-row-index="${nextRow}"][data-col-index="${nextCol}"]`,
    );

    nextInput?.focus();
    nextInput?.select();
  };

  const applyDefaults = () => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        values: { ...DEFAULT_MAX },
      })),
    );
    toast({ title: "Defaults applied", description: "Click Save to persist." });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = rows.map((r, idx) => ({
        class_name: className,
        semester,
        subject: r.subject,
        sort_order: idx,
        ...r.values,
      }));

      const { error } = await supabase
        .from("cce_subject_config")
        .upsert(payload, { onConflict: "class_name,subject,semester" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "CCE max marks updated." });
      queryClient.invalidateQueries({ queryKey: ["cce-config-admin"] });
    },
    onError: (e: any) => {
      toast({
        title: "Save failed",
        description: e?.message || "Could not save configuration.",
        variant: "destructive",
      });
    },
  });

  const totals = useMemo(() => {
    return rows.map((r) => {
      const sumMax = CCE_SUM_COMPONENTS.reduce(
        (s, c) => s + (Number(r.values[c.maxKey]) || 0),
        0,
      );
      const formMax = CCE_FORM_COMPONENTS.reduce(
        (s, c) => s + (Number(r.values[c.maxKey]) || 0),
        0,
      );
      return { subject: r.subject, sumMax, formMax, total: sumMax + formMax };
    });
  }, [rows]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">CCE Result Configuration</h1>
        <p className="text-muted-foreground">
          Set maximum marks for each Summative and Formative component, per class, semester, and subject.
          Components with max = 0 will be hidden in teacher entry forms.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Class & Semester</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Class</Label>
            <Select value={className} onValueChange={setClassName}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>
                    Class {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Semester</Label>
            <Select value={semester} onValueChange={(v) => setSemester(v as "1" | "2")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEMESTERS.map((s) => (
                  <SelectItem key={s} value={s}>
                    Semester {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button variant="outline" onClick={applyDefaults} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Apply Defaults
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Max Marks – Class {className}, Semester {semester}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div ref={tableRef} className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead rowSpan={2} className="border-r align-bottom">
                      Subject
                    </TableHead>
                    <TableHead
                      colSpan={CCE_SUM_COMPONENTS.length + 1}
                      className="border-r text-center"
                    >
                      Summative
                    </TableHead>
                    <TableHead
                      colSpan={CCE_FORM_COMPONENTS.length + 1}
                      className="border-r text-center"
                    >
                      Formative
                    </TableHead>
                    <TableHead className="text-center align-bottom" rowSpan={2}>
                      Grand Total
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    {CCE_SUM_COMPONENTS.map((c) => (
                      <TableHead key={c.key} className="text-center text-xs">
                        {c.label}
                      </TableHead>
                    ))}
                    <TableHead className="border-r text-center text-xs font-semibold">
                      Total
                    </TableHead>
                    {CCE_FORM_COMPONENTS.map((c) => (
                      <TableHead key={c.key} className="text-center text-xs">
                        {c.label}
                      </TableHead>
                    ))}
                    <TableHead className="border-r text-center text-xs font-semibold">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => {
                    const t = totals[i];
                    return (
                      <TableRow key={r.subject}>
                        <TableCell className="border-r font-medium">
                          {r.subject}
                        </TableCell>
                        {CCE_SUM_COMPONENTS.map((c, sumIndex) => (
                          <TableCell key={c.key} className="p-1">
                            <Input
                              type="number"
                              min={0}
                              data-cce-cell="true"
                              data-row-index={i}
                              data-col-index={sumIndex}
                              value={r.values[c.maxKey] ?? 0}
                              onChange={(e) =>
                                updateValue(r.subject, c.maxKey, e.target.value)
                              }
                              onKeyDown={(e) =>
                                handleCellArrowNavigation(e, i, sumIndex)
                              }
                              className="h-8 w-16 text-center"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="border-r text-center font-semibold">
                          {t?.sumMax}
                        </TableCell>
                        {CCE_FORM_COMPONENTS.map((c, formIndex) => (
                          <TableCell key={c.key} className="p-1">
                            <Input
                              type="number"
                              min={0}
                              data-cce-cell="true"
                              data-row-index={i}
                              data-col-index={CCE_SUM_COMPONENTS.length + formIndex}
                              value={r.values[c.maxKey] ?? 0}
                              onChange={(e) =>
                                updateValue(r.subject, c.maxKey, e.target.value)
                              }
                              onKeyDown={(e) =>
                                handleCellArrowNavigation(
                                  e,
                                  i,
                                  CCE_SUM_COMPONENTS.length + formIndex,
                                )
                              }
                              className="h-8 w-16 text-center"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="border-r text-center font-semibold">
                          {t?.formMax}
                        </TableCell>
                        <TableCell className="text-center font-bold text-primary">
                          {t?.total}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCCEConfig;
