import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
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

const defaultHeroImages = [
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920&q=90",
  "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1920&q=90",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=90",
  "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1920&q=90",
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const statIcons = [Calendar, Users, GraduationCap, Award];
const statKeys = ["stat_years", "stat_students", "stat_faculty", "stat_pass_rate"];

const galleryFilters = ["All", "Events", "Sports", "Campus", "Cultural"];

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
  const { t } = useTranslation();

  const statLabels = [t("home.yearsOfExcellence"), t("home.students"), t("home.facultyMembers"), t("home.passRate")];

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

    if (!indexClassApplying) { setIndexSubmitting(false); return; }

    const { error } = await supabase.from("admission_inquiries").insert({
      student_name: studentName, phone, email, class_applying: indexClassApplying,
    });

    setIndexSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        const msg = error.message.includes("unique_phone")
          ? t("admissions.duplicatePhone")
          : error.message.includes("unique_email")
          ? t("admissions.duplicateEmail")
          : t("admissions.duplicateGeneral");
        alert(msg);
      }
      return;
    }
    setIndexAdmissionSubmitted(true);
  };

  const { data: heroImageRows } = useQuery({
    queryKey: ["public-hero-images"],
    queryFn: async () => {
      const { data } = await supabase
        .from("hero_images")
        .select("image_url, sort_order, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
  });

  const heroImages = (heroImageRows && heroImageRows.length > 0)
    ? heroImageRows.map((r) => r.image_url)
    : defaultHeroImages;

  const nextSlide = useCallback(() => { setDirection(1); setCurrentSlide((prev) => (prev + 1) % heroImages.length); }, [heroImages.length]);
  const prevSlide = useCallback(() => { setDirection(-1); setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length); }, [heroImages.length]);

  useEffect(() => { if (currentSlide >= heroImages.length) setCurrentSlide(0); }, [heroImages.length, currentSlide]);
  useEffect(() => { const timer = setInterval(nextSlide, 5000); return () => clearInterval(timer); }, [nextSlide]);

  const DESK_ROLES = [
    "Founder",
    "Secretary",
    "Joint Secretary",
    "Director",
    "School Principal",
    "High School Principal",
  ] as const;

  const { data: leadership } = useQuery({
    queryKey: ["public-leadership"],
    queryFn: async () => {
      const orFilter = DESK_ROLES.map((r) => `designation.ilike.%${r}%`).join(",");
      const { data } = await supabase
        .from("teachers")
        .select("id, name, designation, qualification, photo_url, subject")
        .or(orFilter);
      return data ?? [];
    },
  });

  const matchRole = (designation: string | null, role: string) => {
    if (!designation) return false;
    const d = designation.toLowerCase();
    const r = role.toLowerCase();
    if (r === "school principal") return d.includes("school principal") && !d.includes("high school");
    if (r === "secretary") return d.includes("secretary") && !d.includes("joint");
    return d.includes(r);
  };

  const leaders = DESK_ROLES.flatMap((role) => {
    const match = (leadership ?? []).find((t) => matchRole(t.designation, role));
    return match ? [{ ...match, role }] : [];
  }) as Array<{ id: string; name: string; designation: string | null; qualification: string | null; photo_url: string | null; subject: string; role: string }>;

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

  const programs = [
    { title: t("home.primarySchool"), grades: t("home.primaryGrades"), desc: t("home.primaryDesc"), icon: BookOpen },
    { title: t("home.secondarySchool"), grades: t("home.secondaryGrades"), desc: t("home.secondaryDesc"), icon: GraduationCap },
    { title: t("home.highSchool"), grades: t("home.highGrades"), desc: t("home.highDesc"), icon: Award },
  ];

  const academicHighlights = [
    { title: t("home.departments"), desc: t("home.departmentsDesc"), icon: Building2 },
    { title: t("home.smartClassrooms"), desc: t("home.smartClassroomsDesc"), icon: Monitor },
    { title: t("home.scienceLabs"), desc: t("home.scienceLabsDesc"), icon: FlaskConical },
    { title: t("home.library"), desc: t("home.libraryDesc"), icon: Library },
    { title: t("home.sportsComplex"), desc: t("home.sportsComplexDesc"), icon: Dumbbell },
  ];

  const galleryFilterLabels: Record<string, string> = {
    All: t("home.all"),
    Events: t("nav.events"),
    Sports: t("nav.sports"),
    Campus: t("nav.campusPhotos"),
    Cultural: t("home.cultural"),
  };

  return (
    <>
      <PopupBanner />

      {/* Hero */}
      <section className="relative flex aspect-[16/9] max-h-[85vh] w-full items-center overflow-hidden bg-foreground/5">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {/* Blurred backdrop fills the empty space */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-2xl opacity-60"
              style={{ backgroundImage: `url('${heroImages[currentSlide]}')` }}
            />
            {/* Full poster — no cropping */}
            <div
              className="absolute inset-0 bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${heroImages[currentSlide]}')` }}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent z-[1] pointer-events-none" />
        <button onClick={prevSlide} className="absolute start-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/30 p-2 text-primary-foreground backdrop-blur-sm transition-all duration-300 hover:bg-background/60 hover:scale-110">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button onClick={nextSlide} className="absolute end-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/30 p-2 text-primary-foreground backdrop-blur-sm transition-all duration-300 hover:bg-background/60 hover:scale-110">
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
              <h2 className="font-serif text-3xl md:text-4xl">{t("home.aboutShaheen")}</h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              <p className="mt-6 text-justify leading-relaxed text-muted-foreground">
                {c("about_text", t("home.aboutText"))}
              </p>
              <Link to="/about">
                <Button className="group mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
                  {t("home.learnMore")} <ArrowRight className="ms-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
                </Button>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="rounded-lg border-s-4 border-primary bg-muted p-8">
              <h2 className="font-serif text-3xl md:text-4xl">{t("home.ourVision")}</h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              <p className="mt-6 leading-relaxed text-muted-foreground">{c("vision_text", t("home.visionText"))}</p>
              <h2 className="mt-10 font-serif text-3xl md:text-4xl">{t("home.ourMission")}</h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              <p className="mt-6 leading-relaxed text-muted-foreground">{c("mission_text", t("home.missionText"))}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Desk */}
      {leaders.length > 0 && (
        <section id="leadership" className="bg-secondary/5 py-24">
          <div className="container">
            <SectionHeading label="Leadership" title="Our Desk" />
            <div
              className={cn(
                "grid gap-8 justify-center",
                leaders.length === 1 && "max-w-xs mx-auto",
                leaders.length === 2 && "sm:grid-cols-2 max-w-2xl mx-auto",
                leaders.length >= 3 && "sm:grid-cols-2 lg:grid-cols-4",
              )}
            >
              {leaders.map((leader, i) => (
                <motion.div
                  key={leader.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Card className="group h-full overflow-hidden border-none bg-card shadow-md hover-lift">
                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                      {leader.photo_url ? (
                        <img
                          src={leader.photo_url}
                          alt={leader.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Users className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 flex justify-center">
                        <span className="translate-y-1/2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg">
                          {leader.name}
                        </span>
                      </div>
                    </div>
                    <CardContent className="px-4 pb-5 pt-10 text-center">
                      <h3 className="font-serif text-lg text-foreground">{leader.role}</h3>
                      <div className="mt-2 h-px w-10 mx-auto bg-secondary" />
                      <Link
                        to={`/leader/${leader.role.toLowerCase().replace(/\s+/g, "-")}`}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-secondary hover:text-primary transition-colors"
                      >
                        Read More <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Academic Highlights */}
      <section id="academics" className="bg-muted py-24">
        <div className="container">
          <SectionHeading label={t("home.academics")} title={t("home.academicHighlights")} description={t("home.academicHighlightsDesc")} />
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
          <SectionHeading label={t("home.programs")} title={t("home.programsWeOffer")} description={t("home.programsDesc")} />
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

      {/* Notice Board */}
      <section id="notices" className="bg-muted py-24">
        <div className="container">
          <SectionHeading label={t("home.noticeBoardLabel")} title={t("home.latestAnnouncements")} />
          <div className="mx-auto max-w-3xl space-y-4">
            {(notices ?? []).map((n, i) => (
              <motion.div key={n.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className="group border-l-4 border-l-transparent transition-all duration-300 hover:shadow-md hover:border-l-secondary rtl:border-l-0 rtl:border-r-4 rtl:border-r-transparent rtl:hover:border-r-secondary">
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
            <Link to="/notices"><Button variant="outline" className="group">{t("home.allNotices")} <ArrowRight className="ms-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="bg-muted py-24">
        <div className="container">
          <SectionHeading label={t("home.galleryLabel")} title={t("home.campusLife")} description={t("home.campusLifeDesc")} />
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {galleryFilters.map((f) => (
              <button key={f} onClick={() => setGalleryFilter(f)} className={cn("rounded px-4 py-2 text-sm font-medium transition-colors", galleryFilter === f ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-card/80")}>
                {galleryFilterLabels[f] || f}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {filteredGallery.map((img, i) => (
              <motion.div key={img.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer" onClick={() => setLightboxImage(img.src)}>
                <img src={img.src} alt={img.alt || "Gallery image"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute bottom-3 start-3 text-sm font-medium text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 drop-shadow-md">{img.alt || img.category}</span>
              </motion.div>
            ))}
          </div>
          {filteredGallery.length === 0 && <p className="mt-8 text-center text-muted-foreground">{t("home.noImages")}</p>}
          <div className="mt-10 text-center">
            <Link to="/gallery"><Button variant="outline" className="group">{t("home.viewFullGallery")} <ArrowRight className="ms-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" /></Button></Link>
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
          <SectionHeading label={t("home.admissions")} title={t("home.applyForAdmission")} description={t("home.applyForAdmissionDesc")} />
          <div className="mx-auto max-w-xl">
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 space-y-4">
                {indexAdmissionSubmitted ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
                    <h3 className="font-serif text-xl">{t("home.thankYou")}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{t("home.inquirySubmittedShort")}</p>
                  </div>
                ) : (
                  <form onSubmit={handleIndexAdmission} className="space-y-4">
                    <Input placeholder={t("home.studentName")} name="studentName" required className="bg-background" />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input placeholder={t("home.emailAddress")} type="email" name="email" className="bg-background" />
                      <Input placeholder={t("home.phoneNumber")} type="tel" name="phone" required className="bg-background" />
                    </div>
                    <Select value={indexClassApplying} onValueChange={setIndexClassApplying}>
                      <SelectTrigger className="bg-background"><SelectValue placeholder={t("home.classApplyingFor")} /></SelectTrigger>
                      <SelectContent>
                        {["Nursery", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"].map((cls) => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="submit" variant="accent" className="w-full group" disabled={indexSubmitting}>
                      {indexSubmitting ? t("home.submitting") : t("home.submitApplication")} {!indexSubmitting && <Send className="ms-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
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
            <h2 className="font-serif text-3xl md:text-5xl">{t("home.admissionsOpen")}</h2>
            <p className="mx-auto mt-4 max-w-xl opacity-80">{t("home.admissionsOpenDesc")}</p>
            <Link to="/admissions"><Button size="xl" variant="accent" className="mt-8 animate-float">{t("home.startApplication")}</Button></Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Index;
