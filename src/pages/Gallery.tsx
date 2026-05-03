import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import SectionHeading from "@/components/shared/SectionHeading";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import LifeMarquee from "@/components/shared/LifeMarquee";

const Gallery = () => {
  const [active, setActive] = useState("All");
  const { t } = useTranslation();

  const categories = [
    { key: "All", label: t("gallery.all") },
    { key: "Campus", label: t("gallery.campus") },
    { key: "Labs", label: t("gallery.labs") },
    { key: "Sports", label: t("gallery.sports") },
    { key: "Classrooms", label: t("gallery.classrooms") },
    { key: "Events", label: t("gallery.events") },
  ];

  const facilities = [
    { title: t("gallery.smartClassrooms"), desc: t("gallery.smartClassroomsDesc") },
    { title: t("gallery.scienceLabs"), desc: t("gallery.scienceLabsDesc") },
    { title: t("gallery.computerCenter"), desc: t("gallery.computerCenterDesc") },
    { title: t("gallery.sportsComplex"), desc: t("gallery.sportsComplexDesc") },
    { title: t("gallery.libraryReading"), desc: t("gallery.libraryReadingDesc") },
    { title: t("gallery.transport"), desc: t("gallery.transportDesc") },
  ];

  const { data: images, isLoading } = useQuery({
    queryKey: ["public-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_images").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const filtered = active === "All" ? (images ?? []) : (images ?? []).filter((img) => img.category === active);

  return (
    <>
      <PageHero label={t("gallery.label")} title={t("gallery.title")} subtitle={t("gallery.subtitle")} />

      <section className="py-24">
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
            <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((img) => (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group overflow-hidden rounded"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={img.src} alt={img.alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="text-sm font-medium text-primary-foreground">{img.alt}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      <section className="bg-muted py-24">
        <div className="container">
          <SectionHeading label={t("gallery.infrastructure")} title={t("gallery.ourFacilities")} description={t("gallery.facilitiesDesc")} />
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {facilities.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="rounded border border-border bg-card p-6 shadow-sm"
              >
                <h3 className="font-serif text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Gallery;
