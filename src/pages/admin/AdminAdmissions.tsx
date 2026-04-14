import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Trash2, Eye, Download, Maximize2, Minimize2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import * as XLSX from "xlsx";

const AdminAdmissions = () => {
  const queryClient = useQueryClient();
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["admin-admission-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admission_inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("admission_inquiries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-admission-inquiries"] });
      toast({ title: "Deleted", description: "Inquiry removed successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete inquiry.", variant: "destructive" });
    },
  });

  const handleExport = () => {
    if (!inquiries?.length) return;
    const rows = inquiries.map((i) => ({
      "Student Name": i.student_name,
      "Parent Name": i.parent_name || "",
      Phone: i.phone,
      Email: i.email || "",
      "Class Applying": i.class_applying,
      Message: i.message || "",
      Date: format(new Date(i.created_at), "dd-MM-yyyy hh:mm a"),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Admissions");
    XLSX.writeFile(wb, "admission_inquiries.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Admission Inquiries</h1>
        <Button onClick={handleExport} disabled={!inquiries?.length} variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Inquiries ({inquiries?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !inquiries?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No admission inquiries yet.</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Parent Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inq) => (
                    <TableRow key={inq.id}>
                      <TableCell className="font-medium">{inq.student_name}</TableCell>
                      <TableCell>{inq.parent_name || "—"}</TableCell>
                      <TableCell>{inq.phone}</TableCell>
                      <TableCell>{inq.email || "—"}</TableCell>
                      <TableCell>{inq.class_applying}</TableCell>
                      <TableCell>{format(new Date(inq.created_at), "dd MMM yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => setSelectedInquiry(inq)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm("Delete this inquiry?")) deleteMutation.mutate(inq.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={(o) => !o && setSelectedInquiry(null)}>
        <DialogContent className={isFullScreen ? "h-screen max-h-screen w-screen max-w-full rounded-none" : "max-w-lg"}>
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle>Inquiry Details</DialogTitle>
              <Button size="icon" variant="ghost" onClick={() => setIsFullScreen(!isFullScreen)}>
                {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-3 text-sm">
              {[
                ["Student Name", selectedInquiry.student_name],
                ["Parent Name", selectedInquiry.parent_name],
                ["Phone", selectedInquiry.phone],
                ["Email", selectedInquiry.email],
                ["Class Applying", selectedInquiry.class_applying],
                ["Message", selectedInquiry.message],
                ["Submitted", format(new Date(selectedInquiry.created_at), "dd MMM yyyy, hh:mm a")],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <span className="font-medium text-muted-foreground">{label}:</span>{" "}
                  <span>{(value as string) || "—"}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAdmissions;
