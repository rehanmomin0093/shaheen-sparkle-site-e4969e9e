import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SectionHeading from "@/components/shared/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FlaskConical, Palette, Trophy, Monitor, Globe } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Academics = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const streams = [
    {
      title: t("academics.primary"),
      subjects: ["English", "Hindi/Urdu", "Mathematics", "EVS", "General Knowledge", "Art & Craft", "Physical Education"],
      highlight: t("academics.primaryHighlight"),
    },
    {
      title: t("academics.secondary"),
      subjects: ["English", "Hindi/Urdu", "Mathematics", "Science", "Social Studies", "Computer Science", "Sanskrit/Arabic"],
      highlight: t("academics.secondaryHighlight"),
    },
    {
      title: t("academics.highSchool"),
      subjects: ["Science (PCM/PCB)", "Commerce (with Maths/without)", "Arts / Humanities"],
      highlight: t("academics.highSchoolHighlight"),
    },
  ];

  const extras = [
    { icon: Trophy, title: t("academics.sportsAcademy"), desc: t("academics.sportsAcademyDesc") },
    { icon: Palette, title: t("academics.artsCulture"), desc: t("academics.artsCultureDesc") },
    { icon: Monitor, title: t("academics.computerLabs"), desc: t("academics.computerLabsDesc") },
    { icon: FlaskConical, title: t("academics.scienceLabs"), desc: t("academics.scienceLabsDesc") },
    { icon: Globe, title: t("academics.languagePrograms"), desc: t("academics.languageProgramsDesc") },
    { icon: BookOpen, title: t("academics.library"), desc: t("academics.libraryDesc") },
  ];

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  return (
    <>
      <section className="bg-primary py-24 text-primary-foreground">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-secondary">{t("academics.label")}</span>
            <h1 className="font-serif text-4xl md:text-6xl">{t("academics.title")}</h1>
            <p className="mt-4 max-w-2xl opacity-80">{t("academics.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      <section id="curriculum" className="py-24">
        <div className="container">
          <SectionHeading label={t("academics.streamsLabel")} title={t("academics.academicPrograms")} />
          <div className="space-y-8">
            {streams.map((s, i) => (
              <motion.div key={s.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className="border-none shadow-md">
                  <CardContent className="p-8">
                    <h3 className="font-serif text-2xl">{s.title}</h3>
                    <p className="mt-1 text-sm font-medium text-secondary">{s.highlight}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {s.subjects.map((sub) => (
                        <span key={sub} className="rounded bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{sub}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="departments" className="bg-muted py-24">
        <div className="container">
          <SectionHeading label={t("academics.beyondLabel")} title={t("academics.extraTitle")} description={t("academics.extraDesc")} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {extras.map((e, i) => (
              <motion.div key={e.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className="h-full border-none shadow-md">
                  <CardContent className="p-8">
                    <e.icon className="mb-3 h-8 w-8 text-secondary" />
                    <h3 className="font-serif text-lg">{e.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{e.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Academics;
