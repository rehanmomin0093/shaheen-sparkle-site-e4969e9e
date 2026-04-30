import * as XLSX from "xlsx";
import {
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
} from "./cce";

export interface ExcelStudent {
  id: string;
  name: string;
  roll_number?: string | null;
  section?: string | null;
}

interface BuildArgs {
  schoolName: string;
  className: string;
  section?: string | null;
  academicYear: string;
  students: ExcelStudent[];
  subjects: string[];
  // configBySubject[subject][semester] => CCEConfig
  configBySubject: Record<string, { sem1?: CCEConfig; sem2?: CCEConfig }>;
  // resultsByStudent[studentId][subject][semester] => CCEResult
  resultsByStudent: Record<string, Record<string, { sem1?: CCEResult; sem2?: CCEResult }>>;
  sheets?: Array<"sem1" | "sem2" | "annual">;
}

const buildSemesterAOA = (
  args: BuildArgs,
  semester: "1" | "2",
  semLabel: string,
): any[][] => {
  const { schoolName, className, section, academicYear, students, subjects, configBySubject, resultsByStudent } = args;

  const aoa: any[][] = [];
  aoa.push([`RESULT - ${semLabel} - ${schoolName}`]);
  aoa.push([`Class: ${className}${section ? ` - ${section}` : ""}`, "", "", `Year: ${academicYear}`]);
  aoa.push([]);

  // Header rows
  const top: any[] = ["Roll No", "Student Name"];
  const sub: any[] = ["", ""];
  subjects.forEach((s) => {
    top.push(s, "", "", "");
    sub.push("Summative", "Formative", "Total", "Grade");
  });
  top.push("Total Marks", "Percentage", "Grade");
  sub.push("", "", "");
  aoa.push(top);
  aoa.push(sub);

  students.forEach((stu) => {
    const row: any[] = [stu.roll_number || "", stu.name];
    let obtained = 0;
    let max = 0;
    subjects.forEach((subj) => {
      const cfg = semester === "1" ? configBySubject[subj]?.sem1 : configBySubject[subj]?.sem2;
      const r = semester === "1"
        ? resultsByStudent[stu.id]?.[subj]?.sem1
        : resultsByStudent[stu.id]?.[subj]?.sem2;
      if (r) {
        const sm = sumOf(r);
        const fm = formOf(r);
        const tot = sm + fm;
        const mx = maxTotalOf(cfg);
        obtained += tot;
        max += mx;
        row.push(
          `${sm}/${maxSumOf(cfg)}`,
          `${fm}/${maxFormOf(cfg)}`,
          `${tot}/${mx}`,
          mx > 0 ? gradeFor(percentOf(tot, mx), className) : "-",
        );
      } else {
        row.push("-", "-", "-", "-");
      }
    });
    const pct = percentOf(obtained, max);
    row.push(
      `${obtained}/${max}`,
      max > 0 ? `${pct}%` : "-",
      max > 0 ? gradeFor(pct, className) : "-",
    );
    aoa.push(row);
  });

  return aoa;
};

const buildAnnualAOA = (args: BuildArgs): any[][] => {
  const { schoolName, className, section, academicYear, students, subjects, configBySubject, resultsByStudent } = args;
  const aoa: any[][] = [];
  aoa.push([`ANNUAL RESULT SHEET - ${schoolName}`]);
  aoa.push([`Class: ${className}${section ? ` - ${section}` : ""}`, "", "", `Year: ${academicYear}`]);
  aoa.push([]);

  const top: any[] = ["Roll No", "Student Name"];
  const sub: any[] = ["", ""];
  subjects.forEach((s) => {
    top.push(s, "", "", "");
    sub.push("Sem I Total", "Sem II Total", "Annual Total", "Grade");
  });
  top.push("Grand Total", "Percentage", "Grade");
  sub.push("", "", "");
  aoa.push(top);
  aoa.push(sub);

  students.forEach((stu) => {
    const row: any[] = [stu.roll_number || "", stu.name];
    let grandObt = 0;
    let grandMax = 0;
    subjects.forEach((subj) => {
      const c1 = configBySubject[subj]?.sem1;
      const c2 = configBySubject[subj]?.sem2;
      const r1 = resultsByStudent[stu.id]?.[subj]?.sem1;
      const r2 = resultsByStudent[stu.id]?.[subj]?.sem2;
      const t1 = r1 ? totalOf(r1) : 0;
      const t2 = r2 ? totalOf(r2) : 0;
      const m1 = maxTotalOf(c1);
      const m2 = maxTotalOf(c2);
      const annT = t1 + t2;
      const annM = m1 + m2;
      grandObt += annT;
      grandMax += annM;
      row.push(
        r1 ? `${t1}/${m1}` : "-",
        r2 ? `${t2}/${m2}` : "-",
        (r1 || r2) ? `${annT}/${annM}` : "-",
        annM > 0 && (r1 || r2) ? gradeFor(percentOf(annT, annM), className) : "-",
      );
    });
    const pct = percentOf(grandObt, grandMax);
    row.push(
      `${grandObt}/${grandMax}`,
      grandMax > 0 ? `${pct}%` : "-",
      grandMax > 0 ? gradeFor(pct, className) : "-",
    );
    aoa.push(row);
  });

  return aoa;
};

const aoaToSheet = (aoa: any[][], subjectsCount: number): XLSX.WorkSheet => {
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  // Set column widths: roll(8), name(24), then 4 cols per subject(12), then trailing 3 cols(14)
  const widths = [{ wch: 8 }, { wch: 24 }];
  for (let i = 0; i < subjectsCount; i++) widths.push({ wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 8 });
  widths.push({ wch: 14 }, { wch: 12 }, { wch: 8 });
  ws["!cols"] = widths;

  // Merge subject header cells (row index 3 in 0-based, since rows 0,1,2 are title/info/blank)
  // Title row: row 0 across all columns
  const totalCols = 2 + subjectsCount * 4 + 3;
  const merges: XLSX.Range[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
  ];
  // Subject merges on row 3
  for (let i = 0; i < subjectsCount; i++) {
    const start = 2 + i * 4;
    merges.push({ s: { r: 3, c: start }, e: { r: 3, c: start + 3 } });
  }
  ws["!merges"] = merges;

  return ws;
};

export const generateCCEExcelReport = (args: BuildArgs) => {
  const wb = XLSX.utils.book_new();
  const sheets = args.sheets && args.sheets.length ? args.sheets : ["sem1", "sem2", "annual"];

  if (sheets.includes("sem1")) {
    XLSX.utils.book_append_sheet(
      wb,
      aoaToSheet(buildSemesterAOA(args, "1", "FIRST SEMESTER"), args.subjects.length),
      "First Semester",
    );
  }
  if (sheets.includes("sem2")) {
    XLSX.utils.book_append_sheet(
      wb,
      aoaToSheet(buildSemesterAOA(args, "2", "SECOND SEMESTER"), args.subjects.length),
      "Second Semester",
    );
  }
  if (sheets.includes("annual")) {
    XLSX.utils.book_append_sheet(
      wb,
      aoaToSheet(buildAnnualAOA(args), args.subjects.length),
      "Annual",
    );
  }

  const suffix =
    sheets.length === 1
      ? sheets[0] === "sem1"
        ? "_Sem1"
        : sheets[0] === "sem2"
          ? "_Sem2"
          : "_Annual"
      : "";
  const fileName = `Result_Class${args.className}${args.section ? `-${args.section}` : ""}_${args.academicYear}${suffix}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
