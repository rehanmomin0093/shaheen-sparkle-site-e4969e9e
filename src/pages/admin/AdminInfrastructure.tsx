import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

const DEFAULT_SECTIONS = [
  "Basic Information",
  "Academic Infrastructure",
  "Sanitation Facilities",
  "Library & Learning Resources",
  "Utilities & Safety",
  "Sports & Additional Facilities",
];

type Row = {
  id: string;
  section: string;
  label: string;
  value: string;
  value_type: string;
  sort_order: number;
};

const AdminInfrastructure = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [edits, setEdits] = useState<Record<string, Partial<Row>>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [newRow, setNewRow] = useState({
    section: DEFAULT_SECTIONS[0],
    label: "",
    value: "",
    value_type: "text",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-infrastructure"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("infrastructure_facilities" as any)
        .select("*")
        .order("section")
        .order("sort_order");
      if (error) throw error;
      return data as unknown as Row[];
    },
  });

  const updateMut = useMutation({
    mutationFn: async (row: Row) => {
      const patch = edits[row.id] ?? {};
      const { error } = await supabase
        .from("infrastructure_facilities" as any)
        .update(patch)
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: (_d, row) => {
      setEdits((e) => {
        const c = { ...e };
        delete c[row.id];
        return c;
      });
      qc.invalidateQueries({ queryKey: ["admin-infrastructure"] });
      qc.invalidateQueries({ queryKey: ["infrastructure-facilities"] });
      toast({ title: "Saved" });
    },
    onError: (e: Error) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("infrastructure_facilities" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-infrastructure"] });
      qc.invalidateQueries({ queryKey: ["infrastructure-facilities"] });
      toast({ title: "Deleted" });
    },
  });

  const insertMut = useMutation({
    mutationFn: async () => {
      if (!newRow.label.trim() || !newRow.section.trim()) {
        throw new Error("Section and label are required");
      }
      const maxOrder =
        (data ?? [])
          .filter((r) => r.section === newRow.section)
          .reduce((m, r) => Math.max(m, r.sort_order), 0) + 1;
      const { error } = await supabase
        .from("infrastructure_facilities" as any)
        .insert({ ...newRow, sort_order: maxOrder });
      if (error) throw error;
    },
    onSuccess: () => {
      setAddOpen(false);
      setNewRow({
        section: DEFAULT_SECTIONS[0],
        label: "",
        value: "",
        value_type: "text",
      });
      qc.invalidateQueries({ queryKey: ["admin-infrastructure"] });
      qc.invalidateQueries({ queryKey: ["infrastructure-facilities"] });
      toast({ title: "Added" });
    },
    onError: (e: Error) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const setEdit = (id: string, patch: Partial<Row>) =>
    setEdits((e) => ({ ...e, [id]: { ...e[id], ...patch } }));

  const grouped: Record<string, Row[]> = {};
  (data ?? []).forEach((r) => {
    if (!grouped[r.section]) grouped[r.section] = [];
    grouped[r.section].push(r);
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const allSections = Array.from(
    new Set([...DEFAULT_SECTIONS, ...Object.keys(grouped)]),
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Infrastructure & Facilities</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage what visitors see in the About → Infrastructure section.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Infrastructure Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Section</Label>
                <Input
                  list="admin-infra-sections"
                  value={newRow.section}
                  onChange={(e) =>
                    setNewRow({ ...newRow, section: e.target.value })
                  }
                />
                <datalist id="admin-infra-sections">
                  {allSections.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label>Label</Label>
                <Input
                  value={newRow.label}
                  onChange={(e) =>
                    setNewRow({ ...newRow, label: e.target.value })
                  }
                  placeholder="e.g. Total Classrooms"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={newRow.value_type}
                  onValueChange={(v) =>
                    setNewRow({
                      ...newRow,
                      value_type: v,
                      value: v === "boolean" ? "false" : "",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Yes / No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Value</Label>
                {newRow.value_type === "boolean" ? (
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={newRow.value === "true"}
                      onCheckedChange={(c) =>
                        setNewRow({ ...newRow, value: c ? "true" : "false" })
                      }
                    />
                    <span className="text-sm">
                      {newRow.value === "true" ? "Yes" : "No"}
                    </span>
                  </div>
                ) : (
                  <Input
                    type={newRow.value_type === "number" ? "number" : "text"}
                    value={newRow.value}
                    onChange={(e) =>
                      setNewRow({ ...newRow, value: e.target.value })
                    }
                  />
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => insertMut.mutate()}
                disabled={insertMut.isPending}
              >
                {insertMut.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {Object.keys(grouped).length === 0 && (
          <p className="text-muted-foreground">No items yet. Add one above.</p>
        )}
        {Object.entries(grouped).map(([section, rows]) => (
          <Card key={section}>
            <CardHeader>
              <CardTitle>{section}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rows.map((row) => {
                const e = edits[row.id] ?? {};
                const merged = { ...row, ...e };
                const dirty = Object.keys(e).length > 0;
                return (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 items-center gap-2 rounded border p-3 md:grid-cols-[1.5fr_1fr_1.2fr_auto]"
                  >
                    <Input
                      value={merged.label}
                      onChange={(ev) =>
                        setEdit(row.id, { label: ev.target.value })
                      }
                      placeholder="Label"
                    />
                    <Select
                      value={merged.value_type}
                      onValueChange={(v) =>
                        setEdit(row.id, {
                          value_type: v,
                          value:
                            v === "boolean" && merged.value !== "true"
                              ? "false"
                              : merged.value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Yes / No</SelectItem>
                      </SelectContent>
                    </Select>
                    {merged.value_type === "boolean" ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={merged.value === "true"}
                          onCheckedChange={(c) =>
                            setEdit(row.id, { value: c ? "true" : "false" })
                          }
                        />
                        <span className="text-sm text-muted-foreground">
                          {merged.value === "true" ? "Yes" : "No"}
                        </span>
                      </div>
                    ) : (
                      <Input
                        type={
                          merged.value_type === "number" ? "number" : "text"
                        }
                        value={merged.value}
                        onChange={(ev) =>
                          setEdit(row.id, { value: ev.target.value })
                        }
                        placeholder="Value"
                      />
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={!dirty || updateMut.isPending}
                        onClick={() => updateMut.mutate(row)}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm("Delete this item?"))
                            deleteMut.mutate(row.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminInfrastructure;
