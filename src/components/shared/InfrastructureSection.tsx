import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, Building2 } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";

const SECTION_ORDER = [
  "Basic Information",
  "Academic Infrastructure",
  "Sanitation Facilities",
  "Library & Learning Resources",
  "Utilities & Safety",
  "Sports & Additional Facilities",
];

const formatValue = (value: string, type: string) => {
  if (type === "boolean") {
    const truthy = value === "true" || value === "1" || value === "yes";
    return (
      <span
        className={
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold " +
          (truthy
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground")
        }
      >
        {truthy ? "Yes" : "No"}
      </span>
    );
  }
  return (
    <span className="font-medium text-foreground">
      {value?.trim() ? value : "—"}
    </span>
  );
};

const InfrastructureSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["infrastructure-facilities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("infrastructure_facilities" as any)
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as any[];
    },
  });

  const grouped: Record<string, any[]> = {};
  (data ?? []).forEach((row) => {
    if (!grouped[row.section]) grouped[row.section] = [];
    grouped[row.section].push(row);
  });

  const orderedSections = [
    ...SECTION_ORDER.filter((s) => grouped[s]),
    ...Object.keys(grouped).filter((s) => !SECTION_ORDER.includes(s)),
  ];

  return (
    <section id="infrastructure" className="bg-background py-24">
      <div className="container">
        <SectionHeading
          label="Campus"
          title="Infrastructure & Facilities"
          description="A modern campus thoughtfully designed to support learning, safety, and well-being."
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orderedSections.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Infrastructure details will be available soon.
          </p>
        ) : (
          <div className="mx-auto max-w-4xl">
            <Accordion type="multiple" className="space-y-3">
              {orderedSections.map((section) => (
                <AccordionItem
                  key={section}
                  value={section}
                  className="overflow-hidden rounded-md border border-border bg-card shadow-sm"
                >
                  <AccordionTrigger className="px-5 py-4 text-left hover:no-underline">
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <span className="font-serif text-lg">{section}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-border bg-muted/30 px-5 py-4">
                    <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                      {grouped[section].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-4 border-b border-border/60 pb-2 last:border-b-0"
                        >
                          <dt className="text-sm text-muted-foreground">
                            {item.label}
                          </dt>
                          <dd className="text-sm">
                            {formatValue(item.value, item.value_type)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>
    </section>
  );
};

export default InfrastructureSection;
