import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SectionHeading from "@/components/shared/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FlaskConical, Palette, Trophy, Monitor, Globe } from "lucide-react";
import PageHero from "@/components/shared/PageHero";

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
      title: t("academics.highSchool"),
      subjects: ["English", "Hindi/Urdu", "Mathematics", "Science", "Social Studies", "Computer Science", "Sanskrit/Arabic"],
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
      <PageHero label={t("academics.label")} title={t("academics.title")} subtitle={t("academics.subtitle")} />

      <section id="curriculum" className="py-24">
        <div className="container">
          <SectionHeading label={t("academics.streamsLabel")} title={t("academics.academicPrograms")} />
          <div className="space-y-8">
            {streams.map((s, i) => (
              <motion.div key={s.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className="card-gradient-border group border-none shadow-none">
                  <CardContent className="relative overflow-hidden p-8">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary/10 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
                    <h3 className="font-serif text-2xl underline-grow">{s.title}</h3>
                    <p className="mt-1 text-sm font-medium text-secondary">{s.highlight}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {s.subjects.map((sub) => (
                        <span key={sub} className="rounded border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-secondary/60 hover:text-foreground">{sub}</span>
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
                <Card className="card-gradient-border group h-full border-none shadow-none">
                  <CardContent className="p-8">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-secondary/20 to-primary/10 text-secondary transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                      <e.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-serif text-lg underline-grow">{e.title}</h3>
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
