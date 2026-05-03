import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Building2, Check, X, Loader2 } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";

type Field = {
  id: string;
  section: string;
  label: string;
  value: string;
  value_type: string;
  sort_order: number;
  is_visible: boolean;
};

const InfrastructureSection = () => {
  const [items, setItems] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("infrastructure_facilities")
        .select("*")
        .eq("is_visible", true)
        .order("section")
        .order("sort_order");
      if (active) {
        setItems((data as Field[]) ?? []);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel("infra-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "infrastructure_facilities" }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const grouped = items.reduce<Record<string, Field[]>>((acc, f) => {
    (acc[f.section] ||= []).push(f);
    return acc;
  }, {});

  const sections = Object.keys(grouped);

  const renderValue = (f: Field) => {
    if (f.value_type === "boolean") {
      const yes = f.value === "true";
      return (
        <Badge variant={yes ? "default" : "secondary"} className="gap-1">
          {yes ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          {yes ? "Yes" : "No"}
        </Badge>
      );
    }
    return <span className="font-medium">{f.value || <span className="text-muted-foreground">—</span>}</span>;
  };

  return (
    <section id="infrastructure" className="bg-muted py-24">
      <div className="container">
        <SectionHeading
          label="Campus"
          title="Infrastructure & Facilities"
          description="A comprehensive overview of our campus, academic infrastructure, and amenities."
        />
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : sections.length === 0 ? (
          <p className="text-center text-muted-foreground">No infrastructure data available.</p>
        ) : (
          <Accordion type="multiple" defaultValue={[sections[0]]} className="mx-auto max-w-4xl space-y-3">
            {sections.map((section) => (
              <AccordionItem
                key={section}
                value={section}
                className="overflow-hidden rounded-lg border-none bg-card shadow-sm"
              >
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-accent/40">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded bg-primary/10 text-primary">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <span className="font-serif text-lg">{section}</span>
                    <Badge variant="outline" className="ms-2">{grouped[section].length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {grouped[section].map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between gap-3 rounded-md border bg-background px-4 py-3"
                      >
                        <span className="text-sm text-muted-foreground">{f.label}</span>
                        {renderValue(f)}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </section>
  );
};

export default InfrastructureSection;
