import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";
import { ChevronRight, Loader2, Users } from "lucide-react";

const ROLE_MAP: Record<string, { label: string; contentKey: string }> = {
  founder: { label: "Founder", contentKey: "leader_message_founder" },
  secretary: { label: "Secretary", contentKey: "leader_message_secretary" },
  "joint-secretary": { label: "Joint Secretary", contentKey: "leader_message_joint_secretary" },
  director: { label: "Director", contentKey: "leader_message_director" },
  "school-principal": { label: "School Principal", contentKey: "leader_message_school_principal" },
  "high-school-principal": { label: "High School Principal", contentKey: "leader_message_high_school_principal" },
};

const matchRole = (designation: string | null, role: string) => {
  if (!designation) return false;
  const d = designation.toLowerCase();
  const r = role.toLowerCase();
  if (r === "school principal") return d.includes("school principal") && !d.includes("high school");
  if (r === "secretary") return d.includes("secretary") && !d.includes("joint");
  return d.includes(r);
};

const LeaderMessage = () => {
  const { role } = useParams<{ role: string }>();
  const cfg = role ? ROLE_MAP[role] : undefined;
  const { data: content } = useSiteContent();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [role]);

  const { data: leader, isLoading } = useQuery({
    queryKey: ["leader-by-role", cfg?.label],
    enabled: !!cfg,
    queryFn: async () => {
      const { data } = await supabase
        .from("teachers")
        .select("id, name, designation, qualification, photo_url, experience, area_of_expertise")
        .ilike("designation", `%${cfg!.label}%`);
      return (data ?? []).find((t) => matchRole(t.designation, cfg!.label)) ?? null;
    },
  });

  if (!cfg) return <Navigate to="/" replace />;

  const message = (content?.[cfg.contentKey] ?? "").trim();
  const heading = `Message by ${cfg.label}`;

  return (
    <>
      {/* Breadcrumb header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="font-serif text-3xl md:text-5xl">{heading}</h1>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm opacity-90">
              <Link to="/" className="hover:text-secondary transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-secondary">{heading}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="py-16">
        <div className="container max-w-6xl">
          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-10 md:grid-cols-[280px_1fr]">
              {/* Photo column */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="overflow-hidden rounded-md border bg-card shadow-md">
                  <div className="aspect-[3/4] bg-muted">
                    {leader?.photo_url ? (
                      <img
                        src={leader.photo_url}
                        alt={leader.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Users className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h2 className="font-serif text-xl text-primary">
                      {leader?.name ?? cfg.label}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-secondary">
                      {leader?.designation ?? cfg.label}
                    </p>
                    {leader?.qualification && (
                      <p className="mt-1 text-xs text-muted-foreground">{leader.qualification}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Message column */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="font-serif text-2xl md:text-3xl text-foreground">{heading}</h2>
                <div className="mt-2 h-1 w-12 rounded-full bg-primary" />

                <div className="prose prose-neutral mt-6 max-w-none text-muted-foreground">
                  {message ? (
                    message.split(/\n\s*\n/).map((para, i) => (
                      <p key={i} className="mb-4 text-justify leading-relaxed">
                        {para}
                      </p>
                    ))
                  ) : (
                    <p className="italic">
                      Message coming soon. The {cfg.label}'s message will be published here shortly.
                    </p>
                  )}
                </div>

                {(leader?.experience || leader?.area_of_expertise) && (
                  <div className="mt-8 rounded-md border-s-4 border-primary bg-muted p-5">
                    {leader?.area_of_expertise && (
                      <p className="text-sm">
                        <span className="font-semibold text-foreground">Area of Expertise: </span>
                        <span className="text-muted-foreground">{leader.area_of_expertise}</span>
                      </p>
                    )}
                    {leader?.experience && (
                      <p className="mt-2 text-sm">
                        <span className="font-semibold text-foreground">Experience: </span>
                        <span className="text-muted-foreground">{leader.experience}</span>
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default LeaderMessage;
