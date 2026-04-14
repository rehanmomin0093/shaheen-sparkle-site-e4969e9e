import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeading from "@/components/shared/SectionHeading";
import { GraduationCap, Users, Award, BookOpen, Calendar, ArrowRight, ChevronLeft, ChevronRight, MapPin, Phone, Mail, Send, Monitor, FlaskConical, Library, Dumbbell, Building2, CheckCircle2 } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import PopupBanner from "@/components/shared/PopupBanner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const programs = [
  { title: "Primary School", grades: "Nursery — Class 5", desc: "A nurturing foundation with focus on literacy, numeracy, and creative exploration.", icon: BookOpen },
  { title: "Secondary School", grades: "Class 6 — Class 10", desc: "Rigorous academics combined with sports, arts, and leadership development.", icon: GraduationCap },
  { title: "High School", grades: "Class 11 — Class 12 / PUC", desc: "Advanced streams in Science, Commerce, and Arts with dedicated labs and career guidance.", icon: Award },
];

const academicHighlights = [
  { title: "Departments", desc: "Science, Commerce, Arts, and specialized vocational streams.", icon: Building2 },
  { title: "Smart Classrooms", desc: "Interactive whiteboards and projectors in every classroom.", icon: Monitor },
  { title: "Science Labs", desc: "Fully equipped Physics, Chemistry, and Biology laboratories.", icon: FlaskConical },
  { title: "Library", desc: "10,000+ books with a quiet, air-conditioned reading area.", icon: Library },
  { title: "Sports Complex", desc: "Cricket ground, basketball court, indoor games, and gym.", icon: Dumbbell },
];

const galleryFilters = ["All", "Events", "Sports", "Campus", "Cultural"];


const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
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

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || !target) return;
    let frame: number;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [started, target, duration]);

  return { count, ref };
}

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => {
  const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
  const suffix = value.replace(/[0-9]/g, "");
  const { count, ref } = useCountUp(numericValue);

  return (
    <div ref={ref}>
      <Card className="group border-none bg-card shadow-lg hover-lift cursor-default">
        <CardContent className="flex flex-col items-center p-6 text-center">
          <Icon className="mb-2 h-6 w-6 text-secondary transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
          <span className="font-serif text-3xl font-bold text-foreground">{count}{suffix || ""}</span>
          <span className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        </CardContent>
      </Card>
    </div>
  );
};

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);
  const { data: content } = useSiteContent();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [galleryFilter, setGalleryFilter] = useState("All");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [indexClassApplying, setIndexClassApplying] = useState("");
  const [indexSubmitting, setIndexSubmitting] = useState(false);
  const [indexAdmissionSubmitted, setIndexAdmissionSubmitted] = useState(false);

  const handleIndexAdmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIndexSubmitting(true);
    const form = e.currentTarget;
    const studentName = (form.elements.namedItem("studentName") as HTMLInputElement).value.trim();
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim() || null;

    if (!indexClassApplying) {
      setIndexSubmitting(false);
      return;
    }

    const { error } = await supabase.from("admission_inquiries").insert({
      student_name: studentName,
      phone,
      email,
      class_applying: indexClassApplying,
    });

    setIndexSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        const msg = error.message.includes("unique_phone")
          ? "This phone number has already been used for an admission inquiry."
          : error.message.includes("unique_email")
          ? "This email has already been used for an admission inquiry."
          : "An inquiry with this phone or email already exists.";
        alert(msg);
      }
      return;
    }

    setIndexAdmissionSubmitted(true);
  };

  const heroImages = [
    content?.hero_image_1, content?.hero_image_2, content?.hero_image_3, content?.hero_image_4,
  ].map((url, i) => url || defaultHeroImages[i]);

  const nextSlide = useCallback(() => { setDirection(1); setCurrentSlide((prev) => (prev + 1) % heroImages.length); }, []);
  const prevSlide = useCallback(() => { setDirection(-1); setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length); }, []);

  useEffect(() => { const timer = setInterval(nextSlide, 5000); return () => clearInterval(timer); }, [nextSlide]);

  const { data: notices } = useQuery({
    queryKey: ["public-notices"],
    queryFn: async () => { const { data } = await supabase.from("notices").select("*").order("date", { ascending: false }).limit(5); return data ?? []; },
  });

  const { data: galleryImages } = useQuery({
    queryKey: ["public-gallery-preview"],
    queryFn: async () => { const { data } = await supabase.from("gallery_images").select("*").order("sort_order", { ascending: true }).limit(12); return data ?? []; },
  });

  const filteredGallery = galleryFilter === "All"
    ? (galleryImages ?? []).slice(0, 6)
    : (galleryImages ?? []).filter((img) => img.category.toLowerCase() === galleryFilter.toLowerCase()).slice(0, 6);

  const c = (key: string, fallback: string) => content?.[key] ?? fallback;

  return (
    <>
      <PopupBanner />

      {/* Hero with parallax */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat parallax-bg"
            style={{ backgroundImage: `url('${heroImages[currentSlide]}')` }}
            initial={{ x: direction > 0 ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: direction > 0 ? "-100%" : "100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/40 to-foreground/10 z-[1]" />


        <button onClick={prevSlide} className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/30 p-2 text-primary-foreground backdrop-blur-sm transition-all duration-300 hover:bg-background/60 hover:scale-110">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/30 p-2 text-primary-foreground backdrop-blur-sm transition-all duration-300 hover:bg-background/60 hover:scale-110">
          <ChevronRight className="h-6 w-6" />
        </button>

        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {heroImages.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2.5 rounded-full transition-all duration-500 ${i === currentSlide ? "bg-secondary w-8" : "bg-background/50 w-2.5 hover:bg-background/80"}`} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 -mt-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {statKeys.map((key, i) => (
              <motion.div key={key} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <StatCard icon={statIcons[i]} label={statLabels[i]} value={c(key, "0")} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About & Vision */}
      <section id="about" className="py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <h2 className="font-serif text-3xl md:text-4xl">About Shaheen</h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              <p className="mt-6 text-justify leading-relaxed text-muted-foreground">
                {c("about_text", "Shaheen School is one of the iconic institutions of higher education, distinguished by its compassion to produce well-rounded individuals with competence for improving the human condition and building the nation.")}
              </p>
              <Link to="/about">
                <Button className="group mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
                  Learn More <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="rounded-lg border-l-4 border-primary bg-muted p-8">
              <h2 className="font-serif text-3xl md:text-4xl">Our Vision</h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              <p className="mt-6 leading-relaxed text-muted-foreground">{c("vision_text", "To be a beacon of educational excellence, empowering every child to discover their potential and contribute meaningfully to society.")}</p>
              <h2 className="mt-10 font-serif text-3xl md:text-4xl">Our Mission</h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              <p className="mt-6 leading-relaxed text-muted-foreground">{c("mission_text", "Providing holistic education that blends academic rigour with moral values, creative thinking, and physical fitness.")}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Academic Highlights — 5 cards */}
      <section id="academics" className="bg-muted py-24">
        <div className="container">
          <SectionHeading label="Academics" title="Academic Highlights" description="World-class facilities designed for modern education." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {academicHighlights.map((h, i) => (
              <motion.div key={h.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className="group h-full border-none shadow-md hover-lift">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <h.icon className="mb-3 h-8 w-8 text-secondary transition-transform duration-300 group-hover:scale-110" />
                    <h3 className="font-serif text-lg">{h.title}</h3>
                    <p className="mt-2 text-xs text-muted-foreground">{h.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-24">
        <div className="container">
          <SectionHeading label="Programs" title="Programs We Offer" description="A comprehensive curriculum designed for every stage of a student's journey." />
          <div className="grid gap-6 md:grid-cols-3">
            {programs.map((p, i) => (
              <motion.div key={p.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className="group h-full border-none border-t-4 border-t-transparent shadow-md transition-all duration-300 hover:shadow-xl hover:border-t-secondary hover:-translate-y-1">
                  <CardContent className="relative overflow-hidden p-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/0 to-secondary/0 transition-all duration-500 group-hover:from-secondary/5 group-hover:to-primary/5" />
                    <div className="relative">
                      <p.icon className="mb-4 h-8 w-8 text-secondary transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                      <h3 className="font-serif text-xl">{p.title}</h3>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-secondary">{p.grades}</p>
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Notice Board — Vertical scrolling */}
      <section id="notices" className="bg-muted py-24">
        <div className="container">
          <SectionHeading label="Notice Board" title="Latest Announcements" />
          <div className="mx-auto max-w-3xl space-y-4">
            {(notices ?? []).map((n, i) => (
              <motion.div key={n.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className="group border-l-4 border-l-transparent transition-all duration-300 hover:shadow-md hover:border-l-secondary">
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
            <Link to="/notices"><Button variant="outline" className="group">All Notices <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Gallery with filters and lightbox */}
      <section id="gallery" className="bg-muted py-24">
        <div className="container">
          <SectionHeading label="Gallery" title="Campus Life" description="Glimpses of activities, events, and everyday life at Shaheen." />
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {galleryFilters.map((f) => (
              <button key={f} onClick={() => setGalleryFilter(f)} className={cn("rounded px-4 py-2 text-sm font-medium transition-colors", galleryFilter === f ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-card/80")}>
                {f}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {filteredGallery.map((img, i) => (
              <motion.div key={img.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer" onClick={() => setLightboxImage(img.src)}>
                <img src={img.src} alt={img.alt || "Gallery image"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute bottom-3 left-3 text-sm font-medium text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 drop-shadow-md">{img.alt || img.category}</span>
              </motion.div>
            ))}
          </div>
          {filteredGallery.length === 0 && <p className="mt-8 text-center text-muted-foreground">No images in this category yet.</p>}
          <div className="mt-10 text-center">
            <Link to="/gallery"><Button variant="outline" className="group">View Full Gallery <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          {lightboxImage && <img src={lightboxImage} alt="Gallery" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>

      {/* Admission Form */}
      <section id="admissions" className="py-24">
        <div className="container">
          <SectionHeading label="Admissions" title="Apply for Admission" description="Fill out the form below to start your application." />
          <div className="mx-auto max-w-xl">
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 space-y-4">
                {indexAdmissionSubmitted ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
                    <h3 className="font-serif text-xl">Thank You!</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Your inquiry has been submitted. We'll contact you soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleIndexAdmission} className="space-y-4">
                    <Input placeholder="Student Name" name="studentName" required className="bg-background" />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input placeholder="Email Address" type="email" name="email" className="bg-background" />
                      <Input placeholder="Phone Number" type="tel" name="phone" required className="bg-background" />
                    </div>
                    <Select value={indexClassApplying} onValueChange={setIndexClassApplying}>
                      <SelectTrigger className="bg-background"><SelectValue placeholder="Class Applying For" /></SelectTrigger>
                      <SelectContent>
                        {["Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"].map((cls) => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 group" disabled={indexSubmitting}>
                      {indexSubmitting ? "Submitting..." : "Submit Application"} {!indexSubmitting && <Send className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-primary py-24 text-primary-foreground overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-secondary/20" style={{ width: `${6 + i * 4}px`, height: `${6 + i * 4}px`, top: `${15 + i * 12}%`, left: `${10 + i * 15}%`, animation: `sparkle ${2 + i * 0.5}s ease-in-out ${i * 0.3}s infinite` }} />
        ))}
        <div className="container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="font-serif text-3xl md:text-5xl">Admissions Open for 2026–27</h2>
            <p className="mx-auto mt-4 max-w-xl opacity-80">Join the Shaheen family. Give your child the education they deserve — apply now.</p>
            <Link to="/admissions"><Button size="lg" className="mt-8 animate-float bg-secondary text-secondary-foreground hover:bg-secondary/90 glow-on-hover">Start Application</Button></Link>
          </motion.div>
        </div>
      </section>

      {/* Contact Preview */}
      <section className="py-24">
        <div className="container">
          <SectionHeading label="Contact" title="Get In Touch" description="Have questions? Reach out to us anytime." />
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-6">
              {[
                { icon: MapPin, title: "Address", text: "Shaheen Campus, Main Road, City — 000000" },
                { icon: Phone, title: "Phone", text: "+91 98765 43210" },
                { icon: Mail, title: "Email", text: "info@shaheenschool.edu" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-semibold">{item.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <Card className="border-none shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input placeholder="Your Name" className="bg-background" />
                    <Input placeholder="Your Email" type="email" className="bg-background" />
                  </div>
                  <Input placeholder="Subject" className="bg-background" />
                  <Textarea placeholder="Your Message" rows={4} className="bg-background" />
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 group">
                    Send Message <Send className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
