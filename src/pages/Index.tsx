import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeading from "@/components/shared/SectionHeading";
import { GraduationCap, Users, Award, BookOpen, Calendar, ArrowRight, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const statIcons = [Calendar, Users, GraduationCap, Award];
const statKeys = ["stat_years", "stat_students", "stat_faculty", "stat_pass_rate"];
const statLabels = ["Years of Excellence", "Students", "Faculty Members", "Pass Rate"];

const defaultHeroImages = [
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920&q=90",
  "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1920&q=90",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=90",
  "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1920&q=90",
];

const Index = () => {
  const { data: content, isLoading } = useSiteContent();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    content?.hero_image_1,
    content?.hero_image_2,
    content?.hero_image_3,
    content?.hero_image_4,
  ].map((url, i) => url || defaultHeroImages[i]);

  const [direction, setDirection] = useState(1);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const { data: notices } = useQuery({
    queryKey: ["public-notices"],
    queryFn: async () => {
      const { data } = await supabase.from("notices").select("*").order("date", { ascending: false }).limit(3);
      return data ?? [];
    },
  });

  const c = (key: string, fallback: string) => content?.[key] ?? fallback;

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${heroImages[currentSlide]}')` }}
            initial={{ x: direction > 0 ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: direction > 0 ? "-100%" : "100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/30 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-background/60"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/30 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-background/60"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${i === currentSlide ? "bg-secondary w-6" : "bg-background/50"}`}
            />
          ))}
        </div>

        <div className="container relative z-10 py-24" />
      </section>

      {/* Stats */}
      <section className="relative z-10 -mt-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {statKeys.map((key, i) => {
              const Icon = statIcons[i];
              return (
                <motion.div key={key} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <Card className="border-none bg-card shadow-lg">
                    <CardContent className="flex flex-col items-center p-6 text-center">
                      <Icon className="mb-2 h-6 w-6 text-secondary" />
                      <span className="font-serif text-3xl font-bold text-foreground">{c(key, "—")}</span>
                      <span className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{statLabels[i]}</span>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
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
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <h2 className="font-serif text-3xl leading-tight md:text-4xl">
                {c("vision_text", "To be a beacon of educational excellence, empowering every child to discover their potential and contribute meaningfully to society.")}
              </h2>
              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-serif text-xl">Our Mission</h3>
                  <p className="text-muted-foreground">
                    {c("mission_text", "Providing holistic education that blends academic rigour with moral values, creative thinking, and physical fitness.")}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-serif text-xl">Our Values</h3>
                  <p className="text-muted-foreground">
                    {c("values_text", "Integrity, discipline, inclusivity, and a relentless pursuit of knowledge guide everything we do at Shaheen.")}
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
              <motion.div key={p.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
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
            {(notices ?? []).map((n, i) => (
              <motion.div key={n.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <span className="text-xs text-muted-foreground">{n.date}</span>
                      <p className="mt-1 font-medium">{n.title}</p>
                    </div>
                    <span className="shrink-0 rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{n.category}</span>
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
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="font-serif text-3xl md:text-5xl">Admissions Open for 2026–27</h2>
            <p className="mx-auto mt-4 max-w-xl opacity-80">Join the Shaheen family. Give your child the education they deserve — apply now.</p>
            <Link to="/admissions">
              <Button size="lg" className="mt-8 bg-secondary text-secondary-foreground hover:bg-secondary/90">Start Application</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Index;
