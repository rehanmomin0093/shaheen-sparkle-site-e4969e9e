import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SectionHeading from "@/components/shared/SectionHeading";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const categories = ["All", "Campus", "Labs", "Sports", "Classrooms", "Events"];

const Gallery = () => {
  const [active, setActive] = useState("All");

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
      <section className="bg-primary py-24 text-primary-foreground">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Gallery</span>
            <h1 className="font-serif text-4xl md:text-6xl">Campus & Infrastructure</h1>
            <p className="mt-4 max-w-2xl opacity-80">Explore our world-class facilities, vibrant events, and campus life.</p>
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
          <SectionHeading label="Infrastructure" title="Our Facilities" description="Purpose-built spaces designed for modern education." />
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {[
              { title: "Smart Classrooms", desc: "Interactive whiteboards and projectors in every classroom." },
              { title: "Science Laboratories", desc: "Fully equipped Physics, Chemistry, and Biology labs." },
              { title: "Computer Center", desc: "100+ workstations with high-speed internet." },
              { title: "Sports Complex", desc: "Cricket ground, basketball court, indoor games, and gym." },
              { title: "Library & Reading Room", desc: "10,000+ books with a quiet, air-conditioned reading area." },
              { title: "Transport", desc: "Fleet of school buses covering all major routes in the city." },
            ].map((f, i) => (
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
