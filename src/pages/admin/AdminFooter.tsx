import { useEffect, useState } from "react";
import { useSiteContent, useUpdateSiteContent } from "@/hooks/useSiteContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const FIELDS: { key: string; label: string; type?: "text" | "textarea" | "url"; placeholder?: string }[] = [
  { key: "footer_tagline", label: "About / Tagline", type: "textarea" },
  { key: "footer_address", label: "Address" },
  { key: "footer_phone", label: "Phone" },
  { key: "footer_email", label: "Email" },
  { key: "footer_facebook_url", label: "Facebook URL", type: "url", placeholder: "https://facebook.com/..." },
  { key: "footer_instagram_url", label: "Instagram URL", type: "url", placeholder: "https://instagram.com/..." },
  { key: "footer_twitter_url", label: "Twitter / X URL", type: "url", placeholder: "https://twitter.com/..." },
  { key: "footer_youtube_url", label: "YouTube URL", type: "url", placeholder: "https://youtube.com/..." },
];

const QUICK_LINKS = [1, 2, 3, 4, 5, 6];

const AdminFooter = () => {
  const { data: content, isLoading } = useSiteContent();
  const update = useUpdateSiteContent();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content) setValues(content);
  }, [content]);

  const set = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const keys = [
        ...FIELDS.map((f) => f.key),
        ...QUICK_LINKS.flatMap((i) => [`footer_link${i}_label`, `footer_link${i}_url`]),
      ];
      await Promise.all(
        keys
          .filter((k) => values[k] !== undefined && values[k] !== content?.[k])
          .map((k) => update.mutateAsync({ key: k, value: values[k] ?? "" }))
      );
      toast.success("Footer updated");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Footer</h1>
          <p className="text-sm text-muted-foreground">Manage the content shown in the website footer.</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About & Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea
                  id={f.key}
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  rows={3}
                  maxLength={500}
                />
              ) : (
                <Input
                  id={f.key}
                  type={f.type === "url" ? "url" : "text"}
                  placeholder={f.placeholder}
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  maxLength={300}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Links</CardTitle>
          <p className="text-xs text-muted-foreground">Leave label empty to hide that link.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {QUICK_LINKS.map((i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`footer_link${i}_label`}>Link {i} Label</Label>
                <Input
                  id={`footer_link${i}_label`}
                  value={values[`footer_link${i}_label`] ?? ""}
                  onChange={(e) => set(`footer_link${i}_label`, e.target.value)}
                  maxLength={50}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`footer_link${i}_url`}>Link {i} URL</Label>
                <Input
                  id={`footer_link${i}_url`}
                  placeholder="/about or https://..."
                  value={values[`footer_link${i}_url`] ?? ""}
                  onChange={(e) => set(`footer_link${i}_url`, e.target.value)}
                  maxLength={300}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} size="lg">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default AdminFooter;
