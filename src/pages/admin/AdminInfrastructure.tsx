import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

type Field = {
  id: string;
  section: string;
  label: string;
  value: string;
  value_type: string;
  sort_order: number;
};

const VALUE_TYPES = ["text", "number", "boolean"];

const empty = (): Partial<Field> => ({
  section: "",
  label: "",
  value: "",
  value_type: "text",
  sort_order: 0,
});

const AdminInfrastructure = () => {
  const [items, setItems] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Field>>(empty());
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("infrastructure_facilities")
      .select("*")
      .order("section")
      .order("sort_order");
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setItems((data as Field[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(empty()); setOpen(true); };
  const openEdit = (f: Field) => { setForm(f); setOpen(true); };

  const handleSave = async () => {
    if (!form.section || !form.label) {
      toast({ title: "Missing fields", description: "Section and label are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      section: form.section,
      label: form.label,
      value: form.value ?? "",
      value_type: form.value_type ?? "text",
      sort_order: Number(form.sort_order ?? 0),
    };
    const res = form.id
      ? await supabase.from("infrastructure_facilities").update(payload).eq("id", form.id)
      : await supabase.from("infrastructure_facilities").insert(payload);
    setSaving(false);
    if (res.error) {
      toast({ title: "Error", description: res.error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saved" });
    setOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this field?")) return;
    const { error } = await supabase.from("infrastructure_facilities").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Deleted" });
    load();
  };

  const grouped = items.reduce<Record<string, Field[]>>((acc, f) => {
    (acc[f.section] ||= []).push(f); return acc;
  }, {});
  const sections = Object.keys(grouped);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Infrastructure & Facilities</h1>
          <p className="text-muted-foreground">Manage fields shown in the About page accordion.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Add Field</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : sections.length === 0 ? (
        <p className="text-muted-foreground">No fields yet. Add the first one.</p>
      ) : (
        <div className="space-y-4">
          {sections.map((s) => (
            <Card key={s}>
              <CardHeader><CardTitle className="font-serif text-xl">{s}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {grouped[s].map((f) => (
                  <div key={f.id} className="flex flex-wrap items-center justify-between gap-3 rounded border p-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{f.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {f.value_type} · order {f.sort_order} · value:{" "}
                        <span className="font-mono">{f.value || "—"}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(f.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{form.id ? "Edit Field" : "Add Field"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Section</Label>
              <Input
                list="infra-sections"
                value={form.section ?? ""}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                placeholder="e.g. Basic Information"
              />
              <datalist id="infra-sections">
                {sections.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div>
              <Label>Label</Label>
              <Input value={form.label ?? ""} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            <div>
              <Label>Value Type</Label>
              <Select value={form.value_type ?? "text"} onValueChange={(v) => setForm({ ...form, value_type: v, value: v === "boolean" ? "false" : "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{VALUE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              {form.value_type === "boolean" ? (
                <div className="flex items-center gap-3 pt-2">
                  <Switch checked={form.value === "true"} onCheckedChange={(c) => setForm({ ...form, value: c ? "true" : "false" })} />
                  <span className="text-sm">{form.value === "true" ? "Yes" : "No"}</span>
                </div>
              ) : (
                <Input
                  type={form.value_type === "number" ? "number" : "text"}
                  value={form.value ?? ""}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                />
              )}
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInfrastructure;
