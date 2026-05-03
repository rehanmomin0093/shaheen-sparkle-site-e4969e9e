import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SectionHeading from "@/components/shared/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";
import InfrastructureSection from "@/components/shared/InfrastructureSection";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const About = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const leaders = [
    { name: "Dr. Ahmed Khan", role: "Founder & Chairman", desc: "Visionary educationist with 30+ years in academic leadership." },
    { name: "Mrs. Fatima Begum", role: "Principal — Shaheen School", desc: "Dedicated to nurturing young minds with innovative pedagogy." },
    { name: "Mr. Irfan Patel", role: "Principal — Shaheen High School", desc: "Focused on academic excellence and competitive exam readiness." },
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
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-secondary">{t("about.label")}</span>
            <h1 className="font-serif text-4xl md:text-6xl">{t("about.title")}</h1>
            <p className="mt-4 max-w-2xl opacity-80">{t("about.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      <section id="history" className="py-24">
        <div className="container grid items-start gap-16 lg:grid-cols-[200px_1fr]">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">{t("about.historyLabel")}</span>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif text-3xl md:text-4xl">{t("about.historyTitle")}</h2>
            <p className="mt-6 max-w-3xl leading-relaxed text-muted-foreground">{t("about.historyP1")}</p>
            <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">{t("about.historyP2")}</p>
          </motion.div>
        </div>
      </section>

      <section id="vision" className="bg-muted py-24">
        <div className="container">
          <SectionHeading label={t("about.purposeLabel")} title={t("about.visionMissionTitle")} />
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <Card className="border-none shadow-md">
              <CardContent className="p-8">
                <h3 className="mb-3 font-serif text-2xl">{t("about.vision")}</h3>
                <p className="leading-relaxed text-muted-foreground">{t("about.visionText")}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="p-8">
                <h3 className="mb-3 font-serif text-2xl">{t("about.mission")}</h3>
                <p className="leading-relaxed text-muted-foreground">{t("about.missionText")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container grid items-start gap-16 lg:grid-cols-[200px_1fr]">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">{t("about.messageLabel")}</span>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif text-3xl md:text-4xl">{t("about.principalTitle")}</h2>
            <blockquote className="mt-6 border-s-4 border-secondary ps-6 text-lg italic leading-relaxed text-muted-foreground">
              {t("about.principalQuote")}
            </blockquote>
            <p className="mt-4 font-medium">{t("about.principalName")}</p>
          </motion.div>
        </div>
      </section>

      <section id="management" className="bg-muted py-24">
        <div className="container">
          <SectionHeading label={t("about.leadershipLabel")} title={t("about.ourManagement")} description={t("about.ourManagementDesc")} />
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {leaders.map((l, i) => (
              <motion.div key={l.name} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className="border-none text-center shadow-md">
                  <CardContent className="p-8">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <span className="font-serif text-2xl text-primary">{l.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-serif text-lg">{l.name}</h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-secondary">{l.role}</p>
                    <p className="mt-3 text-sm text-muted-foreground">{l.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <InfrastructureSection />
    </>
  );
};

export default About;
