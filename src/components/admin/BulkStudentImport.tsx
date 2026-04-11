import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileSpreadsheet, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as XLSX from "xlsx";

interface ImportRow {
  name: string;
  father_name?: string;
  mother_name?: string;
  class: string;
  section?: string;
  roll_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  date_of_birth?: string;
  admission_date?: string;
}

const EXPECTED_COLUMNS = ["name", "father_name", "mother_name", "class", "section", "roll_number", "phone", "email", "address", "date_of_birth", "admission_date"];

const normalizeHeader = (h: string) =>
  h.trim().toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");

const headerMap: Record<string, string> = {
  name: "name",
  student_name: "name",
  father_name: "father_name",
  fathers_name: "father_name",
  father_s_name: "father_name",
  mother_name: "mother_name",
  mothers_name: "mother_name",
  mother_s_name: "mother_name",
  class: "class",
  grade: "class",
  section: "section",
  roll_number: "roll_number",
  roll_no: "roll_number",
  rollno: "roll_number",
  sl_no: "roll_number",
  slno: "roll_number",
  urn_no: "roll_number",
  urn: "roll_number",
  phone: "phone",
  mobile: "phone",
  contact: "phone",
  email: "email",
  email_id: "email",
  address: "address",
  date_of_birth: "date_of_birth",
  dob: "date_of_birth",
  birth_date: "date_of_birth",
  admission_date: "admission_date",
};

interface Props {
  onImported: () => void;
}

const BulkStudentImport = ({ onImported }: Props) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Name", "Father Name", "Mother Name", "Class", "Section", "Roll Number", "Phone", "Email", "Address", "Date of Birth", "Admission Date"],
      ["Ahmed Khan", "Rashid Khan", "Fatima Khan", "10th", "A", "101", "9876543210", "ahmed@example.com", "123 Main St", "2010-05-15", "2024-04-01"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student_import_template.xlsx");
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });

        if (json.length === 0) {
          setErrors(["File is empty or has no data rows"]);
          return;
        }

        const rawHeaders = Object.keys(json[0]);
        const colMap: Record<string, string> = {};
        rawHeaders.forEach((h) => {
          const norm = normalizeHeader(h);
          if (headerMap[norm]) colMap[h] = headerMap[norm];
        });

        if (!Object.values(colMap).includes("name") || !Object.values(colMap).includes("class")) {
          setErrors(["File must have at least 'Name' and 'Class' columns"]);
          return;
        }

        const errs: string[] = [];
        const parsed: ImportRow[] = [];

        json.forEach((row, i) => {
          const mapped: any = {};
          Object.entries(colMap).forEach(([raw, field]) => {
            mapped[field] = String(row[raw] || "").trim();
          });

          if (!mapped.name) {
            errs.push(`Row ${i + 2}: Name is empty`);
            return;
          }
          if (!mapped.class) {
            errs.push(`Row ${i + 2}: Class is empty`);
            return;
          }

          parsed.push({
            name: mapped.name,
            father_name: mapped.father_name || "",
            mother_name: mapped.mother_name || "",
            class: mapped.class,
            section: mapped.section || "",
            roll_number: mapped.roll_number || "",
            phone: mapped.phone || "",
            email: mapped.email || "",
            address: mapped.address || "",
            date_of_birth: mapped.date_of_birth || "",
            admission_date: mapped.admission_date || new Date().toISOString().split("T")[0],
          });
        });

        setErrors(errs);
        setRows(parsed);
      } catch {
        setErrors(["Failed to parse file. Please use a valid Excel or CSV file."]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    try {
      const payload = rows.map((r) => ({
        ...r,
        date_of_birth: r.date_of_birth || null,
        admission_date: r.admission_date || null,
        photo_url: "",
      }));

      // Insert in batches of 50
      const batchSize = 50;
      for (let i = 0; i < payload.length; i += batchSize) {
        const batch = payload.slice(i, i + batchSize);
        const { error } = await supabase.from("students").insert(batch);
        if (error) throw error;
      }

      toast({ title: `${rows.length} students imported successfully!` });
      setRows([]);
      setErrors([]);
      setOpen(false);
      onImported();
    } catch (e: any) {
      toast({ title: "Import failed", description: e.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setRows([]);
    setErrors([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); setOpen(o); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Import Excel/CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Students</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" /> Download Template
            </Button>
            <span className="text-sm text-muted-foreground">Use this template for correct format</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select File (Excel or CSV)</label>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) parseFile(f);
              }}
            />
          </div>

          {errors.length > 0 && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm font-medium text-destructive mb-1">Errors found:</p>
              <ul className="list-disc pl-5 text-sm text-destructive">
                {errors.slice(0, 10).map((err, i) => <li key={i}>{err}</li>)}
                {errors.length > 10 && <li>...and {errors.length - 10} more</li>}
              </ul>
            </div>
          )}

          {rows.length > 0 && (
            <>
              <p className="text-sm font-medium text-green-600">
                ✓ {rows.length} students ready to import
              </p>
              <div className="max-h-60 overflow-auto rounded border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 20).map((r, i) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>{r.class}</TableCell>
                        <TableCell>{r.section}</TableCell>
                        <TableCell>{r.roll_number}</TableCell>
                        <TableCell>{r.phone}</TableCell>
                      </TableRow>
                    ))}
                    {rows.length > 20 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          ...and {rows.length - 20} more rows
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={reset}>Cancel</Button>
                <Button onClick={handleImport} disabled={importing}>
                  {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Import {rows.length} Students
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkStudentImport;
