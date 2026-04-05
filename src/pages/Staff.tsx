import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import SectionHeading from "@/components/shared/SectionHeading";

const filters = ["All", "Teaching", "Non-Teaching"];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const Staff = () => {
  const [active, setActive] = useState("All");

  const { data: staff, isLoading } = useQuery({
    queryKey: ["public-staff"],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = active === "All"
    ? (staff ?? [])
    : (staff ?? []).filter((s) => s.staff_type.toLowerCase() === active.toLowerCase());

  return (
    <>
      <section className="bg-primary py-24 text-primary-foreground">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Our Team</span>
            <h1 className="font-serif text-4xl md:text-6xl">Staff Directory</h1>
            <p className="mt-4 max-w-2xl opacity-80">Meet our dedicated teaching and non-teaching staff who make Shaheen a great place to learn.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container">
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={cn(
                  "rounded px-4 py-2 text-sm font-medium transition-colors",
                  active === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground">No staff members found.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((s, i) => (
                <motion.div key={s.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <Card className="group h-full border-none shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <CardContent className="flex flex-col items-center p-6 text-center">
                      {s.photo_url ? (
                        <img
                          src={s.photo_url}
                          alt={s.name}
                          className="mb-4 h-24 w-24 rounded-full object-cover ring-2 ring-primary/20"
                        />
                      ) : (
                        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-10 w-10 text-primary/50" />
                        </div>
                      )}
                      <h3 className="font-serif text-lg">{s.name}</h3>
                      <p className="text-sm text-muted-foreground">{s.designation}</p>
                      {s.qualification && (
                        <p className="mt-1 text-xs text-muted-foreground">{s.qualification}</p>
                      )}
                      {s.area_of_expertise && (
                        <p className="mt-1 text-xs text-secondary">{s.area_of_expertise}</p>
                      )}
                      <Badge
                        variant={s.staff_type === "teaching" ? "default" : "secondary"}
                        className="mt-3 capitalize"
                      >
                        {s.staff_type}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Staff;
