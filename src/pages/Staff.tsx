import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, GraduationCap, Phone, Mail, FileText, Briefcase } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";

const HIGH_SCHOOL_CLASSES = ["6", "7", "8", "9", "10"];
const PRIMARY_CLASSES = ["1", "2", "3", "4", "5"];

const isPrincipal = (t: any) =>
  /principal/i.test(t?.designation ?? "") && !/vice|school/i.test(t?.designation ?? "");

const isSchoolPrincipal = (t: any) =>
  /school principal|vice principal/i.test(t?.designation ?? "");

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const Staff = () => {
  const location = useLocation();
  const { t } = useTranslation();

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

  const { data: nonTeachingStaff, isLoading: loadingStaff } = useQuery({
    queryKey: ["public-non-teaching-staff"],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff").select("*").eq("staff_type", "non-teaching").order("name");
      if (error) throw error;
      return data;
    },
  });

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

  const allTeachers = teachersData ?? [];

  const principal = allTeachers.find(isPrincipal);
  const schoolPrincipal = allTeachers.find(isSchoolPrincipal);

  const principalIds = new Set([principal?.id, schoolPrincipal?.id].filter(Boolean));

  const teachesAnyOf = (tch: any, classes: string[]) =>
    (tch.assigned_classes ?? []).some((c: string) => classes.includes(c));

  const highSchoolTeachers = allTeachers.filter(
    (tch: any) => !principalIds.has(tch.id) && teachesAnyOf(tch, HIGH_SCHOOL_CLASSES)
  );

  const primaryTeachers = allTeachers.filter(
    (tch: any) =>
      !principalIds.has(tch.id) &&
      !teachesAnyOf(tch, HIGH_SCHOOL_CLASSES) &&
      teachesAnyOf(tch, PRIMARY_CLASSES)
  );

  const renderLeader = (person: any, label: string) => (
    <div className="mb-12">
      <h3 className="mb-6 flex items-center gap-2 font-serif text-2xl text-foreground">
        <GraduationCap className="h-6 w-6 text-primary" />
        {label}
      </h3>
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <TeacherCard teacher={person} t={t} />
        </motion.div>
      </div>
    </div>
  );

  const renderTeacherGroup = (list: any[], label: string, anchor: string) => (
    <div id={anchor} className="mb-16 scroll-mt-32">
      <h3 className="mb-6 flex items-center gap-2 font-serif text-2xl text-foreground">
        <GraduationCap className="h-6 w-6 text-primary" />
        {label}
      </h3>
      {list.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">{t("staff.noTeachers")}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {list.map((teacher: any, i: number) => (
            <motion.div key={teacher.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <TeacherCard teacher={teacher} t={t} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <section className="bg-primary py-24 text-primary-foreground">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-secondary">{t("staff.label")}</span>
            <h1 className="font-serif text-4xl md:text-6xl">{t("staff.title")}</h1>
            <p className="mt-4 max-w-2xl opacity-80">{t("staff.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          <section className="py-16">
            <div className="container">
              <SectionHeading title={t("staff.teachingStaff")} description={t("staff.subtitle")} />

              {principal && renderLeader(principal, principal.designation || "Principal")}

              {renderTeacherGroup(highSchoolTeachers, "High School Faculty (Classes 6–10)", "high-school")}

              {schoolPrincipal && renderLeader(schoolPrincipal, schoolPrincipal.designation || "School Principal")}

              {renderTeacherGroup(primaryTeachers, "Primary School Faculty (Classes 1–5)", "primary-school")}
            </div>
          </section>

          {(nonTeachingStaff ?? []).length > 0 && (
            <section className="bg-muted/30 py-16" id="non-teaching">
              <div className="container">
                <SectionHeading title={t("staff.nonTeachingStaff")} description={t("staff.supportAdmin")} />
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
                          <Badge variant="secondary" className="mt-3 capitalize">{t("staff.nonTeaching")}</Badge>
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

const TeacherCard = ({ teacher: tch, t }: { teacher: any; t: any }) => (
  <Card className="relative overflow-hidden border shadow-md transition-all duration-300 hover:shadow-xl">
    <CardContent className="flex gap-5 p-5">
      <div className="flex-shrink-0">
        {tch.photo_url ? (
          <img src={tch.photo_url} alt={tch.name} className="h-28 w-28 rounded-lg object-cover ring-2 ring-primary/20" />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-primary/10">
            <User className="h-12 w-12 text-primary/40" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        {tch.id_number && <p className="text-xs font-medium text-muted-foreground">ID: {tch.id_number}</p>}
        <h4 className="font-serif text-lg font-bold text-foreground truncate">{tch.name}</h4>
        {tch.designation && <p className="text-sm text-muted-foreground">{tch.designation}</p>}
        {tch.qualification && (
          <p className="text-xs text-muted-foreground"><span className="font-medium">{t("staff.qualification")}:</span> {tch.qualification}</p>
        )}
        {tch.subject && (
          <p className="text-xs text-muted-foreground"><span className="font-medium">{t("staff.subjects")}:</span> {tch.subject}</p>
        )}
        {tch.area_of_expertise && (
          <p className="text-xs text-secondary"><span className="font-medium text-muted-foreground">{t("staff.expertise")}:</span> {tch.area_of_expertise}</p>
        )}
        {tch.experience && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Briefcase className="h-3 w-3" /> {tch.experience}</div>
        )}
        <div className="flex flex-wrap gap-3 pt-1">
          {tch.phone && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {tch.phone}</span>}
          {tch.email && <a href={`mailto:${tch.email}`} className="flex items-center gap-1 text-xs text-primary hover:underline"><Mail className="h-3 w-3" /> {tch.email}</a>}
        </div>
        {tch.resume_url && (
          <a href={tch.resume_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <FileText className="h-3 w-3" /> {t("staff.downloadResume")}
          </a>
        )}
      </div>
      <GraduationCap className="absolute bottom-3 end-3 h-8 w-8 text-primary/10" />
    </CardContent>
  </Card>
);

export default Staff;
