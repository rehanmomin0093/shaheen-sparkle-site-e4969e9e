import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeading from "@/components/shared/SectionHeading";
import { GraduationCap, Users, Award, BookOpen, Calendar, ArrowRight } from "lucide-react";

const stats = [
  { icon: Calendar, value: "25+", label: "Years of Excellence" },
  { icon: Users, value: "3,000+", label: "Students" },
  { icon: GraduationCap, value: "150+", label: "Faculty Members" },
  { icon: Award, value: "98%", label: "Pass Rate" },
];

const programs = [
  {
    title: "Primary School",
    grades: "Nursery — Class 5",
    desc: "A nurturing foundation with focus on literacy, numeracy, and creative exploration in a safe environment.",
    icon: BookOpen,
  },
  {
    title: "Secondary School",
    grades: "Class 6 — Class 10",
    desc: "Rigorous academics combined with sports, arts, and leadership development to shape well-rounded individuals.",
    icon: GraduationCap,
  },
  {
    title: "High School",
    grades: "Class 11 — Class 12 / PUC",
    desc: "Advanced streams in Science, Commerce, and Arts with dedicated labs, career guidance, and competitive exam coaching.",
    icon: Award,
  },
];

const notices = [
  { date: "10 Mar 2026", title: "Annual Day Celebration — Schedule Released", category: "Events" },
  { date: "05 Mar 2026", title: "Mid-Term Exam Timetable 2025–26", category: "Circulars" },
  { date: "28 Feb 2026", title: "Admissions Open for 2026–27 Academic Year", category: "General" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const Index = () => (
  <>
    {/* Hero */}
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-primary">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80')] bg-cover bg-center opacity-20" />
      <div className="container relative z-10 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <span className="mb-4 inline-block rounded bg-secondary/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
            Shaheen School & Shaheen High School
          </span>
          <h1 className="font-serif text-4xl leading-[1.1] text-primary-foreground md:text-6xl lg:text-7xl">
            Nurturing the Falcons of Tomorrow
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
            Building character, knowledge, and excellence from nursery through higher secondary — where every student soars.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/admissions">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                Apply for Admission
              </Button>
            </Link>
            <Link to="/student-portal">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Student Portal
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Stats */}
    <section className="relative z-10 -mt-12">
      <div className="container">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Card className="border-none bg-card shadow-lg">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <s.icon className="mb-2 h-6 w-6 text-secondary" />
                  <span className="font-serif text-3xl font-bold text-foreground">{s.value}</span>
                  <span className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* About Snippet */}
    <section className="py-24">
      <div className="container">
        <div className="grid items-start gap-16 lg:grid-cols-[200px_1fr]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Our Vision</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl leading-tight md:text-4xl">
              To be a beacon of educational excellence, empowering every child to discover their potential and contribute meaningfully to society.
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-serif text-xl">Our Mission</h3>
                <p className="text-muted-foreground">
                  Providing holistic education that blends academic rigour with moral values, creative thinking, and physical fitness — fostering confident, compassionate leaders.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-serif text-xl">Our Values</h3>
                <p className="text-muted-foreground">
                  Integrity, discipline, inclusivity, and a relentless pursuit of knowledge guide everything we do at Shaheen.
                </p>
              </div>
            </div>
            <Link to="/about" className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline">
              Learn more about us <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Academics Preview */}
    <section className="bg-muted py-24">
      <div className="container">
        <SectionHeading label="Academics" title="Programs We Offer" description="A comprehensive curriculum designed for every stage of a student's journey." />
        <div className="grid gap-6 md:grid-cols-3">
          {programs.map((p, i) => (
            <motion.div
              key={p.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Card className="h-full border-none shadow-md transition-shadow hover:shadow-lg">
                <CardContent className="p-8">
                  <p.icon className="mb-4 h-8 w-8 text-secondary" />
                  <h3 className="font-serif text-xl">{p.title}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-secondary">{p.grades}</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/academics">
            <Button variant="outline">View All Programs <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </Link>
        </div>
      </div>
    </section>

    {/* Latest Notices */}
    <section className="py-24">
      <div className="container">
        <SectionHeading label="Notice Board" title="Latest Announcements" />
        <div className="mx-auto max-w-3xl space-y-4">
          {notices.map((n, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <span className="text-xs text-muted-foreground">{n.date}</span>
                    <p className="mt-1 font-medium">{n.title}</p>
                  </div>
                  <span className="shrink-0 rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {n.category}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/notices">
            <Button variant="outline">All Notices <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </Link>
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="bg-primary py-24 text-primary-foreground">
      <div className="container text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-3xl md:text-5xl">Admissions Open for 2026–27</h2>
          <p className="mx-auto mt-4 max-w-xl opacity-80">
            Join the Shaheen family. Give your child the education they deserve — apply now.
          </p>
          <Link to="/admissions">
            <Button size="lg" className="mt-8 bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Start Application
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  </>
);

export default Index;
