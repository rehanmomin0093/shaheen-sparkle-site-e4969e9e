import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  CCE_FORM_COMPONENTS,
  CCE_SUM_COMPONENTS,
  CCEConfig,
  CCEResult,
  gradeFor,
  maxFormOf,
  maxSumOf,
  maxTotalOf,
  percentOf,
  totalOf,
} from "./cce";

interface StudentInfo {
  name: string;
  roll_number?: string | null;
  class: string;
  section?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
}

interface ReportInput {
  schoolName: string;
  student: StudentInfo;
  academicYear: string;
  configBySubject: Record<string, { sem1?: CCEConfig; sem2?: CCEConfig }>;
  resultsBySubject: Record<string, { sem1?: CCEResult; sem2?: CCEResult }>;
  subjects: string[];
}

export const generateCCEReportPDF = ({
  schoolName,
  student,
  academicYear,
  configBySubject,
  resultsBySubject,
  subjects,
}: ReportInput) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(schoolName, pageWidth / 2, 14, { align: "center" });
  doc.setFontSize(12);
  doc.text("Annual Progress Report (CCE)", pageWidth / 2, 20, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Academic Year: ${academicYear}`, pageWidth / 2, 26, { align: "center" });

  // Student info
  doc.setFontSize(10);
  const infoY = 34;
  doc.text(`Name: ${student.name}`, 14, infoY);
  doc.text(`Class: ${student.class}${student.section ? ` - ${student.section}` : ""}`, 100, infoY);
  doc.text(`Roll No: ${student.roll_number || "-"}`, 160, infoY);
  if (student.father_name) doc.text(`Father: ${student.father_name}`, 200, infoY);

  // Build rows
  const head = [
    [
      { content: "Subject", rowSpan: 2 },
      { content: "Semester I", colSpan: 4 },
      { content: "Semester II", colSpan: 4 },
      { content: "Annual", colSpan: 3 },
    ],
    [
      "Summative",
      "Formative",
      "Total",
      "Grade",
      "Summative",
      "Formative",
      "Total",
      "Grade",
      "Total",
      "%",
      "Grade",
    ],
  ];

  const body: any[] = [];
  let grandObtained = 0;
  let grandMax = 0;

  subjects.forEach((sub) => {
    const c1 = configBySubject[sub]?.sem1;
    const c2 = configBySubject[sub]?.sem2;
    const r1 = resultsBySubject[sub]?.sem1 ?? ({} as CCEResult);
    const r2 = resultsBySubject[sub]?.sem2 ?? ({} as CCEResult);

    const s1Sum = CCE_SUM_COMPONENTS.reduce((s, c) => s + (Number((r1 as any)[c.key]) || 0), 0);
    const s1Form = CCE_FORM_COMPONENTS.reduce((s, c) => s + (Number((r1 as any)[c.key]) || 0), 0);
    const s1Total = s1Sum + s1Form;
    const s1Max = maxTotalOf(c1);
    const s1Grade = s1Max > 0 && Object.keys(r1).length > 0 ? gradeFor(percentOf(s1Total, s1Max)) : "-";

    const s2Sum = CCE_SUM_COMPONENTS.reduce((s, c) => s + (Number((r2 as any)[c.key]) || 0), 0);
    const s2Form = CCE_FORM_COMPONENTS.reduce((s, c) => s + (Number((r2 as any)[c.key]) || 0), 0);
    const s2Total = s2Sum + s2Form;
    const s2Max = maxTotalOf(c2);
    const s2Grade = s2Max > 0 && Object.keys(r2).length > 0 ? gradeFor(percentOf(s2Total, s2Max)) : "-";

    const annualTotal = s1Total + s2Total;
    const annualMax = s1Max + s2Max;
    const annualPercent = percentOf(annualTotal, annualMax);
    const annualGrade = annualMax > 0 ? gradeFor(annualPercent) : "-";

    grandObtained += annualTotal;
    grandMax += annualMax;

    body.push([
      sub,
      `${s1Sum} / ${maxSumOf(c1)}`,
      `${s1Form} / ${maxFormOf(c1)}`,
      `${s1Total} / ${s1Max}`,
      s1Grade,
      `${s2Sum} / ${maxSumOf(c2)}`,
      `${s2Form} / ${maxFormOf(c2)}`,
      `${s2Total} / ${s2Max}`,
      s2Grade,
      `${annualTotal} / ${annualMax}`,
      `${annualPercent}%`,
      annualGrade,
    ]);
  });

  // Grand total row
  const grandPercent = percentOf(grandObtained, grandMax);
  body.push([
    { content: "Grand Total", styles: { fontStyle: "bold" } },
    "", "", "", "", "", "", "", "",
    { content: `${grandObtained} / ${grandMax}`, styles: { fontStyle: "bold" } },
    { content: `${grandPercent}%`, styles: { fontStyle: "bold" } },
    { content: grandMax > 0 ? gradeFor(grandPercent) : "-", styles: { fontStyle: "bold" } },
  ]);

  autoTable(doc, {
    startY: 40,
    head,
    body,
    theme: "grid",
    styles: { fontSize: 8, halign: "center", cellPadding: 1.8 },
    headStyles: { fillColor: [10, 80, 60], textColor: 255, fontStyle: "bold", halign: "center" },
    columnStyles: { 0: { halign: "left", fontStyle: "bold" } },
  });

  const finalY = (doc as any).lastAutoTable?.finalY ?? 60;

  // Footer
  doc.setFontSize(9);
  doc.text("Class Teacher", 30, finalY + 30);
  doc.text("Principal", pageWidth / 2, finalY + 30, { align: "center" });
  doc.text("Parent Signature", pageWidth - 30, finalY + 30, { align: "right" });

  doc.save(
    `Report_${student.name.replace(/\s+/g, "_")}_${student.class}_${academicYear}.pdf`,
  );
};
