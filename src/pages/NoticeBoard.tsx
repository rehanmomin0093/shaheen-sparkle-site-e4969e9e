import { useState, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { FileDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PageHero from "@/components/shared/PageHero";

const NoticeBoard = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("id");
  const [active, setActive] = useState("All");
  const highlightRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const categories = [
    { key: "All", label: t("notices.all") },
    { key: "Circulars", label: t("notices.circulars") },
    { key: "Results", label: t("notices.results") },
    { key: "Events", label: t("notices.events") },
    { key: "General", label: t("notices.general") },
  ];

  const { data: notices, isLoading } = useQuery({
    queryKey: ["public-all-notices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notices").select("*").order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      setTimeout(() => { highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 300);
    }
  }, [highlightId, notices]);

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => { document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" }); }, 100);
    }
  }, [location]);

  const filtered = active === "All" ? (notices ?? []) : (notices ?? []).filter((n) => n.category === active);

  return (
    <>
      <PageHero label={t("notices.label")} title={t("notices.title")} subtitle={t("notices.subtitle")} />

      <section id="latest" className="py-24">
        <div className="container">
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActive(cat.key)}
                className={cn(
                  "rounded px-4 py-2 text-sm font-medium transition-colors",
                  active === cat.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-3">
              {filtered.map((n, i) => (
                <motion.div
                  key={n.id}
                  ref={n.id === highlightId ? highlightRef : undefined}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Card className={cn("group transition-all hover:shadow-md", n.id === highlightId && "ring-2 ring-secondary shadow-lg")}>
                    <CardContent className="flex items-center justify-between gap-4 p-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{n.date}</span>
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{n.category}</span>
                        </div>
                        <p className="mt-1 font-medium">{n.title}</p>
                      </div>
                      {n.pdf_url && (
                        <a href={n.pdf_url} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded p-2 text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100" title={t("notices.downloadPdf")}>
                          <FileDown className="h-5 w-5" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <p className="mt-10 text-center text-muted-foreground">{t("notices.noNotices")}</p>
          )}
        </div>
      </section>
    </>
  );
};

export default NoticeBoard;
