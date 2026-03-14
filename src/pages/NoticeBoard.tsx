import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { FileDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = ["All", "Circulars", "Results", "Events", "General"];

const NoticeBoard = () => {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("id");
  const [active, setActive] = useState("All");
  const highlightRef = useRef<HTMLDivElement>(null);

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
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [highlightId, notices]);

  const filtered = active === "All" ? (notices ?? []) : (notices ?? []).filter((n) => n.category === active);

  return (
    <>
      <section className="bg-primary py-24 text-primary-foreground">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Notices</span>
            <h1 className="font-serif text-4xl md:text-6xl">Notice Board & Downloads</h1>
            <p className="mt-4 max-w-2xl opacity-80">Stay updated with the latest announcements, circulars, and downloadable documents.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container">
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={cn(
                  "rounded px-4 py-2 text-sm font-medium transition-colors",
                  active === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {cat}
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
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Card className="group transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center justify-between gap-4 p-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{n.date}</span>
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{n.category}</span>
                        </div>
                        <p className="mt-1 font-medium">{n.title}</p>
                      </div>
                      {n.pdf_url && (
                        <a
                          href={n.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded p-2 text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
                          title="Download PDF"
                        >
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
            <p className="mt-10 text-center text-muted-foreground">No notices in this category.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default NoticeBoard;
