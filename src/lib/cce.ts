// Shared utilities for the CCE (Continuous Comprehensive Evaluation) result system

export const CCE_SUM_COMPONENTS = [
  { key: "sum_oral", label: "Oral", maxKey: "max_sum_oral" },
  { key: "sum_practical", label: "Practical", maxKey: "max_sum_practical" },
  { key: "sum_project", label: "Project", maxKey: "max_sum_project" },
  { key: "sum_assignment", label: "Assignment", maxKey: "max_sum_assignment" },
  { key: "sum_unit_test", label: "Unit Test", maxKey: "max_sum_unit_test" },
  { key: "sum_classwork", label: "Classwork", maxKey: "max_sum_classwork" },
  { key: "sum_other", label: "Other", maxKey: "max_sum_other" },
] as const;

export const CCE_FORM_COMPONENTS = [
  { key: "form_oral", label: "Oral", maxKey: "max_form_oral" },
  { key: "form_written", label: "Written", maxKey: "max_form_written" },
] as const;

export type CCEResult = {
  id?: string;
  student_id: string;
  academic_year: string;
  semester: "1" | "2";
  subject: string;
  sum_oral: number | null;
  sum_practical: number | null;
  sum_project: number | null;
  sum_assignment: number | null;
  sum_unit_test: number | null;
  sum_classwork: number | null;
  sum_other: number | null;
  form_oral: number | null;
  form_written: number | null;
  published: boolean;
};

export type CCEConfig = {
  id?: string;
  class_name: string;
  subject: string;
  semester: "1" | "2";
  max_sum_oral: number;
  max_sum_practical: number;
  max_sum_project: number;
  max_sum_assignment: number;
  max_sum_unit_test: number;
  max_sum_other: number;
  max_form_oral: number;
  max_form_written: number;
  sort_order: number;
};

export const sumOf = (r: Partial<CCEResult>) =>
  CCE_SUM_COMPONENTS.reduce((s, c) => s + (Number(r[c.key as keyof CCEResult]) || 0), 0);

export const formOf = (r: Partial<CCEResult>) =>
  CCE_FORM_COMPONENTS.reduce((s, c) => s + (Number(r[c.key as keyof CCEResult]) || 0), 0);

export const maxSumOf = (cfg: Partial<CCEConfig> | undefined) =>
  cfg ? CCE_SUM_COMPONENTS.reduce((s, c) => s + (Number(cfg[c.maxKey as keyof CCEConfig]) || 0), 0) : 0;

export const maxFormOf = (cfg: Partial<CCEConfig> | undefined) =>
  cfg ? CCE_FORM_COMPONENTS.reduce((s, c) => s + (Number(cfg[c.maxKey as keyof CCEConfig]) || 0), 0) : 0;

export const maxTotalOf = (cfg: Partial<CCEConfig> | undefined) =>
  maxSumOf(cfg) + maxFormOf(cfg);

export const totalOf = (r: Partial<CCEResult>) => sumOf(r) + formOf(r);

// CBSE-style grade scale based on percentage
export const gradeFor = (percent: number): string => {
  if (percent >= 91) return "A1";
  if (percent >= 81) return "A2";
  if (percent >= 71) return "B1";
  if (percent >= 61) return "B2";
  if (percent >= 51) return "C1";
  if (percent >= 41) return "C2";
  if (percent >= 33) return "D";
  if (percent >= 21) return "E1";
  return "E2";
};

export const percentOf = (obtained: number, max: number) =>
  max > 0 ? Math.round((obtained / max) * 1000) / 10 : 0;
