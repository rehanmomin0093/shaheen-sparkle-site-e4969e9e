import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import SectionHeading from "@/components/shared/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";

const leaders = [
  { name: "Dr. Ahmed Khan", role: "Founder & Chairman", desc: "Visionary educationist with 30+ years in academic leadership." },
  { name: "Mrs. Fatima Begum", role: "Principal — Shaheen School", desc: "Dedicated to nurturing young minds with innovative pedagogy." },
  { name: "Mr. Irfan Patel", role: "Principal — Shaheen High School", desc: "Focused on academic excellence and competitive exam readiness." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const About = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  return (
  <>
    {/* Hero */}
    <section className="bg-primary py-24 text-primary-foreground">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-secondary">About Us</span>
          <h1 className="font-serif text-4xl md:text-6xl">Our Story & Vision</h1>
          <p className="mt-4 max-w-2xl opacity-80">
            From a humble beginning to a premier institution — Shaheen has been shaping futures for over two decades.
          </p>
        </motion.div>
      </div>
    </section>

    {/* History */}
    <section id="history" className="py-24">
      <div className="container grid items-start gap-16 lg:grid-cols-[200px_1fr]">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Our History</span>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-serif text-3xl md:text-4xl">A Legacy of Learning</h2>
          <p className="mt-6 max-w-3xl leading-relaxed text-muted-foreground">
            Founded with the vision of providing quality education accessible to all, Shaheen School began as a small institution
            with just a handful of students. Today, it has grown into a campus that houses both Shaheen School (Nursery to Class 10)
            and Shaheen High School (Class 11–12 / PUC), serving over 3,000 students with state-of-the-art facilities, dedicated
            faculty, and a track record of academic excellence.
          </p>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
            Our journey has been defined by an unwavering commitment to holistic development — where academic achievement goes
            hand in hand with character building, sports, arts, and community service.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Vision & Mission */}
    <section id="vision" className="bg-muted py-24">
      <div className="container">
        <SectionHeading label="Purpose" title="Vision & Mission" />
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          <Card className="border-none shadow-md">
            <CardContent className="p-8">
              <h3 className="mb-3 font-serif text-2xl">Vision</h3>
              <p className="leading-relaxed text-muted-foreground">
                To be a beacon of educational excellence, empowering every child to discover their potential,
                embrace lifelong learning, and contribute meaningfully to society.
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-8">
              <h3 className="mb-3 font-serif text-2xl">Mission</h3>
              <p className="leading-relaxed text-muted-foreground">
                Providing holistic education that blends academic rigour with moral values, creative thinking,
                and physical fitness — fostering confident, compassionate leaders of tomorrow.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    {/* Principal's Message */}
    <section className="py-24">
      <div className="container grid items-start gap-16 lg:grid-cols-[200px_1fr]">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Message</span>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-serif text-3xl md:text-4xl">From the Principal's Desk</h2>
          <blockquote className="mt-6 border-l-4 border-secondary pl-6 text-lg italic leading-relaxed text-muted-foreground">
            "Education is not merely about examinations and marks. It is about building character, instilling curiosity,
            and preparing our children to face the world with confidence and compassion. At Shaheen, every child matters."
          </blockquote>
          <p className="mt-4 font-medium">— Mrs. Fatima Begum, Principal</p>
        </motion.div>
      </div>
    </section>

    {/* Leadership */}
    <section id="management" className="bg-muted py-24">
      <div className="container">
        <SectionHeading label="Leadership" title="Our Management" description="Guided by experienced educators and visionary leaders." />
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
  </>
  );
};

export default About;
