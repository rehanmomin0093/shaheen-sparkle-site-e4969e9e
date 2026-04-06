import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, GraduationCap, Phone, Mail, FileText, Briefcase } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";

const CLASS_LABELS = [
  { value: "1", label: "1st Standard", id: "1st-standard" },
  { value: "2", label: "2nd Standard", id: "2nd-standard" },
  { value: "3", label: "3rd Standard", id: "3rd-standard" },
  { value: "4", label: "4th Standard", id: "4th-standard" },
  { value: "5", label: "5th Standard", id: "5th-standard" },
  { value: "6", label: "6th Standard", id: "6th-standard" },
  { value: "7", label: "7th Standard", id: "7th-standard" },
  { value: "8", label: "8th Standard", id: "8th-standard" },
  { value: "9", label: "9th Standard", id: "9th-standard" },
  { value: "10", label: "10th Standard", id: "10th-standard" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const Staff = () => {
  const location = useLocation();

  // Fetch teachers with their class assignments
  const { data: teachersData, isLoading: loadingTeachers } = useQuery({
    queryKey: ["public-teachers-with-classes"],
    queryFn: async () => {
      const { data: teachers, error } = await supabase.from("teachers").select("*").order("name");
      if (error) throw error;
      const { data: assignments } = await supabase.from("teacher_class_assignments").select("*");
      return (teachers ?? []).map((t: any) => {
        const teacherAssignments = (assignments ?? []).filter((a: any) => a.teacher_id === t.id);
        return { ...t, assigned_classes: teacherAssignments.map((a: any) => a.class_name) };
      });
    },
  });

  // Fetch non-teaching staff
  const { data: nonTeachingStaff, isLoading: loadingStaff } = useQuery({
    queryKey: ["public-non-teaching-staff"],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff").select("*").eq("staff_type", "non-teaching").order("name");
      if (error) throw error;
      return data;
    },
  });

  // Smooth scroll to hash on load
  useEffect(() => {
    if (location.hash) {
      const timer = setTimeout(() => {
        const el = document.getElementById(location.hash.slice(1));
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  const isLoading = loadingTeachers || loadingStaff;

  // Group teachers by class
  const teachersByClass = CLASS_LABELS.map((cls) => ({
    ...cls,
    teachers: (teachersData ?? []).filter((t: any) => t.assigned_classes.includes(cls.value)),
  }));

  return (
    <>
      {/* Hero */}
      <section className="bg-primary py-24 text-primary-foreground">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Our Team</span>
            <h1 className="font-serif text-4xl md:text-6xl">Staff Directory</h1>
            <p className="mt-4 max-w-2xl opacity-80">Meet our dedicated teaching and non-teaching staff who make Shaheen a great place to learn.</p>
          </motion.div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Teaching Staff by Class */}
          <section className="py-16">
            <div className="container">
              <SectionHeading title="Teaching Staff" subtitle="Organized by class" />

              {teachersByClass.map((cls) => (
                <div key={cls.value} id={cls.id} className="mb-16 scroll-mt-32">
                  <h3 className="mb-6 flex items-center gap-2 font-serif text-2xl text-foreground">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    {cls.label}
                  </h3>

                  {cls.teachers.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No teachers assigned to this class yet.</p>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {cls.teachers.map((t: any, i: number) => (
                        <motion.div key={t.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                          <TeacherCard teacher={t} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Non-Teaching Staff */}
          {(nonTeachingStaff ?? []).length > 0 && (
            <section className="bg-muted/30 py-16" id="non-teaching">
              <div className="container">
                <SectionHeading title="Non-Teaching Staff" subtitle="Support & administration" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {(nonTeachingStaff ?? []).map((s: any, i: number) => (
                    <motion.div key={s.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                      <Card className="group h-full border shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <CardContent className="flex flex-col items-center p-6 text-center">
                          {s.photo_url ? (
                            <img src={s.photo_url} alt={s.name} className="mb-4 h-24 w-24 rounded-full object-cover ring-2 ring-primary/20" />
                          ) : (
                            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                              <User className="h-10 w-10 text-primary/50" />
                            </div>
                          )}
                          <h3 className="font-serif text-lg">{s.name}</h3>
                          <p className="text-sm text-muted-foreground">{s.designation}</p>
                          {s.qualification && <p className="mt-1 text-xs text-muted-foreground">{s.qualification}</p>}
                          <Badge variant="secondary" className="mt-3 capitalize">Non-Teaching</Badge>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
};

/* ── Teacher Card (horizontal layout) ── */
const TeacherCard = ({ teacher: t }: { teacher: any }) => (
  <Card className="relative overflow-hidden border shadow-md transition-all duration-300 hover:shadow-xl">
    <CardContent className="flex gap-5 p-5">
      {/* Photo */}
      <div className="flex-shrink-0">
        {t.photo_url ? (
          <img src={t.photo_url} alt={t.name} className="h-28 w-28 rounded-lg object-cover ring-2 ring-primary/20" />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-primary/10">
            <User className="h-12 w-12 text-primary/40" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="font-serif text-lg font-bold text-foreground truncate">{t.name}</h4>
        {t.designation && <p className="text-sm text-muted-foreground">{t.designation}</p>}
        {t.qualification && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Qualification:</span> {t.qualification}
          </p>
        )}
        {t.subject && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Subjects:</span> {t.subject}
          </p>
        )}
        {t.area_of_expertise && (
          <p className="text-xs text-secondary">
            <span className="font-medium text-muted-foreground">Expertise:</span> {t.area_of_expertise}
          </p>
        )}
        {t.experience && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Briefcase className="h-3 w-3" /> {t.experience}
          </div>
        )}
        <div className="flex flex-wrap gap-3 pt-1">
          {t.phone && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" /> {t.phone}
            </span>
          )}
          {t.email && (
            <a href={`mailto:${t.email}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
              <Mail className="h-3 w-3" /> {t.email}
            </a>
          )}
        </div>
        {t.resume_url && (
          <a href={t.resume_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <FileText className="h-3 w-3" /> Download Resume
          </a>
        )}
      </div>

      {/* Decorative icon */}
      <GraduationCap className="absolute bottom-3 right-3 h-8 w-8 text-primary/10" />
    </CardContent>
  </Card>
);

export default Staff;
