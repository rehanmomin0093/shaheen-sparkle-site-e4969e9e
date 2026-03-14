import { motion } from "framer-motion";
import SectionHeading from "@/components/shared/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FlaskConical, Palette, Trophy, Monitor, Globe } from "lucide-react";

const streams = [
  {
    title: "Primary (Nursery – Class 5)",
    subjects: ["English", "Hindi/Urdu", "Mathematics", "EVS", "General Knowledge", "Art & Craft", "Physical Education"],
    highlight: "Activity-based learning with smart classrooms",
  },
  {
    title: "Secondary (Class 6 – 10)",
    subjects: ["English", "Hindi/Urdu", "Mathematics", "Science", "Social Studies", "Computer Science", "Sanskrit/Arabic"],
    highlight: "CBSE / State Board curriculum with lab practicals",
  },
  {
    title: "High School (Class 11 – 12 / PUC)",
    subjects: ["Science (PCM/PCB)", "Commerce (with Maths/without)", "Arts / Humanities"],
    highlight: "Competitive exam coaching (NEET, JEE, CET) integrated",
  },
];

const extras = [
  { icon: Trophy, title: "Sports Academy", desc: "Cricket, football, athletics, kabaddi with professional coaches." },
  { icon: Palette, title: "Arts & Culture", desc: "Music, dance, drama, and annual cultural festivals." },
  { icon: Monitor, title: "Computer Labs", desc: "Modern labs with coding & robotics programs." },
  { icon: FlaskConical, title: "Science Labs", desc: "Physics, Chemistry, and Biology labs with latest equipment." },
  { icon: Globe, title: "Language Programs", desc: "English communication skills, Urdu, Hindi, and Arabic." },
  { icon: BookOpen, title: "Library", desc: "10,000+ books, periodicals, and digital reading resources." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Academics = () => (
  <>
    <section className="bg-primary py-24 text-primary-foreground">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Academics</span>
          <h1 className="font-serif text-4xl md:text-6xl">Programs & Curriculum</h1>
          <p className="mt-4 max-w-2xl opacity-80">Comprehensive education from nursery to higher secondary under one roof.</p>
        </motion.div>
      </div>
    </section>

    {/* Streams */}
    <section className="py-24">
      <div className="container">
        <SectionHeading label="Streams" title="Academic Programs" />
        <div className="space-y-8">
          {streams.map((s, i) => (
            <motion.div key={s.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Card className="border-none shadow-md">
                <CardContent className="p-8">
                  <h3 className="font-serif text-2xl">{s.title}</h3>
                  <p className="mt-1 text-sm font-medium text-secondary">{s.highlight}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {s.subjects.map((sub) => (
                      <span key={sub} className="rounded bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        {sub}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Extracurricular */}
    <section className="bg-muted py-24">
      <div className="container">
        <SectionHeading label="Beyond Academics" title="Extracurricular & Facilities" description="Developing well-rounded individuals through diverse activities." />
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

export default Academics;
