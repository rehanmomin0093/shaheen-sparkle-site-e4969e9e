import ExcelJS from "exceljs";
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
  gender?: string | null;
}

interface BuildArgs {
  schoolName: string;
  className: string;
  section?: string | null;
  academicYear: string;
  students: ExcelStudent[];
  subjects: string[];
  configBySubject: Record<string, { sem1?: CCEConfig; sem2?: CCEConfig }>;
  resultsByStudent: Record<string, Record<string, { sem1?: CCEResult; sem2?: CCEResult }>>;
  sheets?: Array<"sem1" | "sem2" | "annual">;
}

const THIN: Partial<ExcelJS.Borders> = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

const applyBorders = (ws: ExcelJS.Worksheet, startRow: number, endRow: number, startCol: number, endCol: number) => {
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const cell = ws.getCell(r, c);
      cell.border = THIN;
      if (!cell.alignment) cell.alignment = { horizontal: "center", vertical: "middle" };
    }
  }
};

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFE8F0E8" },
};

const TITLE_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF064E3B" }, // Deep emerald
};

const appendSignatureFooter = (ws: ExcelJS.Worksheet, startRow: number, totalCols: number) => {
  // Two blank spacer rows for signature space
  ws.getRow(startRow).height = 30;
  ws.getRow(startRow + 1).height = 30;

  const lineRow = startRow + 2;
  const labelRow = startRow + 3;

  const leftEnd = Math.max(2, Math.floor(totalCols / 3));
  const rightStart = Math.max(leftEnd + 2, totalCols - leftEnd + 1);

  // Signature lines (top border on the line row creates the underline)
  ws.mergeCells(lineRow, 1, lineRow, leftEnd);
  const leftLine = ws.getCell(lineRow, 1);
  leftLine.border = { top: { style: "thin" } };

  ws.mergeCells(lineRow, rightStart, lineRow, totalCols);
  const rightLine = ws.getCell(lineRow, rightStart);
  rightLine.border = { top: { style: "thin" } };

  // Labels under the lines
  ws.mergeCells(labelRow, 1, labelRow, leftEnd);
  const leftLabel = ws.getCell(labelRow, 1);
  leftLabel.value = "Class Teacher";
  leftLabel.font = { name: "Arial", bold: true, size: 11, color: { argb: "FF064E3B" } };
  leftLabel.alignment = { horizontal: "center", vertical: "middle" };

  ws.mergeCells(labelRow, rightStart, labelRow, totalCols);
  const rightLabel = ws.getCell(labelRow, rightStart);
  rightLabel.value = "Principal";
  rightLabel.font = { name: "Arial", bold: true, size: 11, color: { argb: "FF064E3B" } };
  rightLabel.alignment = { horizontal: "center", vertical: "middle" };

  ws.getRow(labelRow).height = 20;
};

const buildSemesterSheet = (
  wb: ExcelJS.Workbook,
  args: BuildArgs,
  semester: "1" | "2",
  semLabel: string,
  sheetName: string,
) => {
  const { schoolName, className, section, academicYear, students, subjects, configBySubject, resultsByStudent } = args;
  const ws = wb.addWorksheet(sheetName, {
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  // Columns: Roll(1), Name(2), Gender(3), then subjects * 4 (Sum, Form, Total, Grade), then Total/Pct/Grade(3)
  const subjectCols = subjects.length * 4;
  const totalCols = 3 + subjectCols + 3;

  // Row 1: School name title
  ws.mergeCells(1, 1, 1, totalCols);
  const t1 = ws.getCell(1, 1);
  t1.value = schoolName.toUpperCase();
  t1.font = { name: "Arial", bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  t1.alignment = { horizontal: "center", vertical: "middle" };
  t1.fill = TITLE_FILL;
  ws.getRow(1).height = 28;

  // Row 2: Subtitle (semester label)
  ws.mergeCells(2, 1, 2, totalCols);
  const t2 = ws.getCell(2, 1);
  t2.value = `${semLabel} RESULT SHEET`;
  t2.font = { name: "Arial", bold: true, size: 12, color: { argb: "FF064E3B" } };
  t2.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(2).height = 20;

  // Row 3: Class / Section / Year info
  const r3 = ws.getRow(3);
  r3.getCell(1).value = "CLASS:";
  r3.getCell(1).font = { bold: true, size: 10 };
  r3.getCell(1).alignment = { horizontal: "right" };
  ws.mergeCells(3, 2, 3, 4);
  r3.getCell(2).value = `Class ${className}${section ? ` - ${section}` : ""}`;
  r3.getCell(2).font = { bold: true, size: 11 };
  r3.getCell(2).alignment = { horizontal: "left" };

  const midCol = Math.max(5, Math.floor(totalCols / 2) - 2);
  r3.getCell(midCol).value = "ACADEMIC YEAR:";
  r3.getCell(midCol).font = { bold: true, size: 10 };
  r3.getCell(midCol).alignment = { horizontal: "right" };
  ws.mergeCells(3, midCol + 1, 3, midCol + 3);
  r3.getCell(midCol + 1).value = academicYear;
  r3.getCell(midCol + 1).font = { bold: true, size: 11 };
  r3.getCell(midCol + 1).alignment = { horizontal: "left" };

  const endCol = totalCols;
  r3.getCell(endCol - 4).value = "SEMESTER:";
  r3.getCell(endCol - 4).font = { bold: true, size: 10 };
  r3.getCell(endCol - 4).alignment = { horizontal: "right" };
  ws.mergeCells(3, endCol - 3, 3, endCol);
  r3.getCell(endCol - 3).value = semLabel;
  r3.getCell(endCol - 3).font = { bold: true, size: 11 };
  r3.getCell(endCol - 3).alignment = { horizontal: "left" };

  // Row 4 = blank spacer
  // Header rows 5 (top) and 6 (sub)
  const headerTop = 5;
  const headerSub = 6;

  // Roll No / Name / Gender — merged across two header rows
  ws.mergeCells(headerTop, 1, headerSub, 1);
  ws.getCell(headerTop, 1).value = "ROLL NO";
  ws.mergeCells(headerTop, 2, headerSub, 2);
  ws.getCell(headerTop, 2).value = "STUDENT NAME";
  ws.mergeCells(headerTop, 3, headerSub, 3);
  ws.getCell(headerTop, 3).value = "GENDER";

  // Subject headers
  subjects.forEach((subj, i) => {
    const startC = 4 + i * 4;
    ws.mergeCells(headerTop, startC, headerTop, startC + 3);
    ws.getCell(headerTop, startC).value = subj.toUpperCase();
    ws.getCell(headerSub, startC).value = "SUMMATIVE";
    ws.getCell(headerSub, startC + 1).value = "FORMATIVE";
    ws.getCell(headerSub, startC + 2).value = "TOTAL";
    ws.getCell(headerSub, startC + 3).value = "GRADE";
  });

  // Trailing 3 columns: Total Marks, Percentage, Grade
  const tailStart = 4 + subjectCols;
  ws.mergeCells(headerTop, tailStart, headerSub, tailStart);
  ws.getCell(headerTop, tailStart).value = "TOTAL MARKS";
  ws.mergeCells(headerTop, tailStart + 1, headerSub, tailStart + 1);
  ws.getCell(headerTop, tailStart + 1).value = "PERCENTAGE";
  ws.mergeCells(headerTop, tailStart + 2, headerSub, tailStart + 2);
  ws.getCell(headerTop, tailStart + 2).value = "GRADE";

  // Style header rows
  for (let r = headerTop; r <= headerSub; r++) {
    for (let c = 1; c <= totalCols; c++) {
      const cell = ws.getCell(r, c);
      cell.font = { name: "Arial", bold: true, size: 9 };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.fill = HEADER_FILL;
      cell.border = THIN;
    }
  }
  ws.getRow(headerTop).height = 22;
  ws.getRow(headerSub).height = 30;

  // Data rows
  let rowIdx = headerSub + 1;
  students.forEach((stu, i) => {
    const row = ws.getRow(rowIdx);
    row.getCell(1).value = stu.roll_number || (i + 1);
    row.getCell(2).value = stu.name;
    row.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
    row.getCell(3).value = stu.gender ? String(stu.gender).charAt(0).toUpperCase() : "-";

    let obtained = 0;
    let max = 0;
    subjects.forEach((subj, si) => {
      const startC = 4 + si * 4;
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
        row.getCell(startC).value = `${sm}/${maxSumOf(cfg)}`;
        row.getCell(startC + 1).value = `${fm}/${maxFormOf(cfg)}`;
        row.getCell(startC + 2).value = `${tot}/${mx}`;
        row.getCell(startC + 3).value = mx > 0 ? gradeFor(percentOf(tot, mx), className) : "-";
      } else {
        row.getCell(startC).value = "-";
        row.getCell(startC + 1).value = "-";
        row.getCell(startC + 2).value = "-";
        row.getCell(startC + 3).value = "-";
      }
    });

    const pct = percentOf(obtained, max);
    row.getCell(tailStart).value = `${obtained}/${max}`;
    row.getCell(tailStart + 1).value = max > 0 ? `${pct}%` : "-";
    row.getCell(tailStart + 2).value = max > 0 ? gradeFor(pct, className) : "-";

    for (let c = 1; c <= totalCols; c++) {
      const cell = row.getCell(c);
      cell.font = cell.font ?? { name: "Arial", size: 10 };
      if (!cell.alignment) cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = THIN;
    }
    row.height = 18;
    rowIdx++;
  });

  // Column widths
  ws.getColumn(1).width = 8;
  ws.getColumn(2).width = 26;
  ws.getColumn(3).width = 8;
  for (let i = 0; i < subjects.length; i++) {
    const startC = 4 + i * 4;
    ws.getColumn(startC).width = 11;
    ws.getColumn(startC + 1).width = 11;
    ws.getColumn(startC + 2).width = 11;
    ws.getColumn(startC + 3).width = 8;
  }
  ws.getColumn(tailStart).width = 14;
  ws.getColumn(tailStart + 1).width = 12;
  ws.getColumn(tailStart + 2).width = 8;

  // Signature footer
  appendSignatureFooter(ws, rowIdx + 1, totalCols);

  // Freeze header
  ws.views = [{ state: "frozen", ySplit: headerSub, xSplit: 3 }];
};

const buildAnnualSheet = (wb: ExcelJS.Workbook, args: BuildArgs) => {
  const { schoolName, className, section, academicYear, students, subjects, configBySubject, resultsByStudent } = args;
  const ws = wb.addWorksheet("Annual", {
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  const subjectCols = subjects.length * 4; // Sem1 / Sem2 / Annual / Grade
  const totalCols = 3 + subjectCols + 3;

  ws.mergeCells(1, 1, 1, totalCols);
  const t1 = ws.getCell(1, 1);
  t1.value = schoolName.toUpperCase();
  t1.font = { name: "Arial", bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  t1.alignment = { horizontal: "center", vertical: "middle" };
  t1.fill = TITLE_FILL;
  ws.getRow(1).height = 28;

  ws.mergeCells(2, 1, 2, totalCols);
  const t2 = ws.getCell(2, 1);
  t2.value = "ANNUAL RESULT SHEET";
  t2.font = { name: "Arial", bold: true, size: 12, color: { argb: "FF064E3B" } };
  t2.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(2).height = 20;

  const r3 = ws.getRow(3);
  r3.getCell(1).value = "CLASS:";
  r3.getCell(1).font = { bold: true, size: 10 };
  r3.getCell(1).alignment = { horizontal: "right" };
  ws.mergeCells(3, 2, 3, 4);
  r3.getCell(2).value = `Class ${className}${section ? ` - ${section}` : ""}`;
  r3.getCell(2).font = { bold: true, size: 11 };
  r3.getCell(2).alignment = { horizontal: "left" };

  r3.getCell(totalCols - 4).value = "ACADEMIC YEAR:";
  r3.getCell(totalCols - 4).font = { bold: true, size: 10 };
  r3.getCell(totalCols - 4).alignment = { horizontal: "right" };
  ws.mergeCells(3, totalCols - 3, 3, totalCols);
  r3.getCell(totalCols - 3).value = academicYear;
  r3.getCell(totalCols - 3).font = { bold: true, size: 11 };
  r3.getCell(totalCols - 3).alignment = { horizontal: "left" };

  const headerTop = 5;
  const headerSub = 6;

  ws.mergeCells(headerTop, 1, headerSub, 1);
  ws.getCell(headerTop, 1).value = "ROLL NO";
  ws.mergeCells(headerTop, 2, headerSub, 2);
  ws.getCell(headerTop, 2).value = "STUDENT NAME";
  ws.mergeCells(headerTop, 3, headerSub, 3);
  ws.getCell(headerTop, 3).value = "GENDER";

  subjects.forEach((subj, i) => {
    const startC = 4 + i * 4;
    ws.mergeCells(headerTop, startC, headerTop, startC + 3);
    ws.getCell(headerTop, startC).value = subj.toUpperCase();
    ws.getCell(headerSub, startC).value = "SEM I";
    ws.getCell(headerSub, startC + 1).value = "SEM II";
    ws.getCell(headerSub, startC + 2).value = "ANNUAL";
    ws.getCell(headerSub, startC + 3).value = "GRADE";
  });

  const tailStart = 4 + subjectCols;
  ws.mergeCells(headerTop, tailStart, headerSub, tailStart);
  ws.getCell(headerTop, tailStart).value = "GRAND TOTAL";
  ws.mergeCells(headerTop, tailStart + 1, headerSub, tailStart + 1);
  ws.getCell(headerTop, tailStart + 1).value = "PERCENTAGE";
  ws.mergeCells(headerTop, tailStart + 2, headerSub, tailStart + 2);
  ws.getCell(headerTop, tailStart + 2).value = "GRADE";

  for (let r = headerTop; r <= headerSub; r++) {
    for (let c = 1; c <= totalCols; c++) {
      const cell = ws.getCell(r, c);
      cell.font = { name: "Arial", bold: true, size: 9 };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.fill = HEADER_FILL;
      cell.border = THIN;
    }
  }
  ws.getRow(headerTop).height = 22;
  ws.getRow(headerSub).height = 26;

  let rowIdx = headerSub + 1;
  students.forEach((stu, i) => {
    const row = ws.getRow(rowIdx);
    row.getCell(1).value = stu.roll_number || (i + 1);
    row.getCell(2).value = stu.name;
    row.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
    row.getCell(3).value = stu.gender ? String(stu.gender).charAt(0).toUpperCase() : "-";

    let grandObt = 0;
    let grandMax = 0;
    subjects.forEach((subj, si) => {
      const startC = 4 + si * 4;
      const c1 = configBySubject[subj]?.sem1;
      const c2 = configBySubject[subj]?.sem2;
      const r1 = resultsByStudent[stu.id]?.[subj]?.sem1;
      const r2 = resultsByStudent[stu.id]?.[subj]?.sem2;
      const t1v = r1 ? totalOf(r1) : 0;
      const t2v = r2 ? totalOf(r2) : 0;
      const m1 = maxTotalOf(c1);
      const m2 = maxTotalOf(c2);
      const annT = t1v + t2v;
      const annM = m1 + m2;
      grandObt += annT;
      grandMax += annM;
      row.getCell(startC).value = r1 ? `${t1v}/${m1}` : "-";
      row.getCell(startC + 1).value = r2 ? `${t2v}/${m2}` : "-";
      row.getCell(startC + 2).value = (r1 || r2) ? `${annT}/${annM}` : "-";
      row.getCell(startC + 3).value = annM > 0 && (r1 || r2) ? gradeFor(percentOf(annT, annM), className) : "-";
    });

    const pct = percentOf(grandObt, grandMax);
    row.getCell(tailStart).value = `${grandObt}/${grandMax}`;
    row.getCell(tailStart + 1).value = grandMax > 0 ? `${pct}%` : "-";
    row.getCell(tailStart + 2).value = grandMax > 0 ? gradeFor(pct, className) : "-";

    for (let c = 1; c <= totalCols; c++) {
      const cell = row.getCell(c);
      cell.font = cell.font ?? { name: "Arial", size: 10 };
      if (!cell.alignment) cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = THIN;
    }
    row.height = 18;
    rowIdx++;
  });

  ws.getColumn(1).width = 8;
  ws.getColumn(2).width = 26;
  ws.getColumn(3).width = 8;
  for (let i = 0; i < subjects.length; i++) {
    const startC = 4 + i * 4;
    ws.getColumn(startC).width = 11;
    ws.getColumn(startC + 1).width = 11;
    ws.getColumn(startC + 2).width = 11;
    ws.getColumn(startC + 3).width = 8;
  }
  ws.getColumn(tailStart).width = 14;
  ws.getColumn(tailStart + 1).width = 12;
  ws.getColumn(tailStart + 2).width = 8;

  appendSignatureFooter(ws, rowIdx + 1, totalCols);

  ws.views = [{ state: "frozen", ySplit: headerSub, xSplit: 3 }];
};

export const generateCCEExcelReport = async (args: BuildArgs) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = args.schoolName;
  wb.created = new Date();
  const sheets = args.sheets && args.sheets.length ? args.sheets : ["sem1", "sem2", "annual"];

  if (sheets.includes("sem1")) buildSemesterSheet(wb, args, "1", "FIRST SEMESTER", "First Semester");
  if (sheets.includes("sem2")) buildSemesterSheet(wb, args, "2", "SECOND SEMESTER", "Second Semester");
  if (sheets.includes("annual")) buildAnnualSheet(wb, args);

  const suffix =
    sheets.length === 1
      ? sheets[0] === "sem1"
        ? "_Sem1"
        : sheets[0] === "sem2"
          ? "_Sem2"
          : "_Annual"
      : "";
  const fileName = `Result_Class${args.className}${args.section ? `-${args.section}` : ""}_${args.academicYear}${suffix}.xlsx`;

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
