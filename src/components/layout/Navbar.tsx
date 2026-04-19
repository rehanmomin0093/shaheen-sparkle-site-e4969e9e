import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, GraduationCap, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import NewsTicker from "./NewsTicker";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import schoolLogo from "@/assets/shaheen-society-logo.jpeg";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();

  const topBarLinks = [
    { label: t("nav.videos"), to: "/videos" },
    { label: t("nav.achievements"), to: "/achievements" },
    { label: t("nav.pressMedia"), to: "/press-media" },
  ];

  interface NavItem {
    label: string;
    to: string;
    dropdown?: { label: string; to: string }[];
  }

  const navLinks: NavItem[] = [
    { label: t("nav.home"), to: "/" },
    {
      label: t("nav.about"),
      to: "/about",
      dropdown: [
        { label: t("nav.schoolHistory"), to: "/about#history" },
        { label: t("nav.visionMission"), to: "/about#vision" },
        { label: t("nav.management"), to: "/about#management" },
        { label: t("nav.staff"), to: "/about#staff" },
      ],
    },
    {
      label: t("nav.academic"),
      to: "/academics",
      dropdown: [
        { label: t("nav.curriculum"), to: "/academics#curriculum" },
        { label: t("nav.departments"), to: "/academics#departments" },
        { label: t("nav.timeTable"), to: "/academics#timetable" },
        { label: t("nav.faculty"), to: "/faculty" },
      ],
    },
    {
      label: t("nav.gallery"),
      to: "/gallery",
      dropdown: [
        { label: t("nav.events"), to: "/gallery?cat=events" },
        { label: t("nav.sports"), to: "/gallery?cat=sports" },
        { label: t("nav.culturalPrograms"), to: "/gallery?cat=cultural" },
        { label: t("nav.campusPhotos"), to: "/gallery?cat=campus" },
      ],
    },
    {
      label: t("nav.noticeBoard"),
      to: "/notices",
      dropdown: [
        { label: t("nav.latestNotices"), to: "/notices#latest" },
        { label: t("nav.announcements"), to: "/notices#announcements" },
        { label: t("nav.upcomingEvents"), to: "/notices#events" },
      ],
    },
    {
      label: t("nav.admission"),
      to: "/admissions",
      dropdown: [
        { label: t("nav.admissionProcess"), to: "/admissions#process" },
        { label: t("nav.eligibility"), to: "/admissions#eligibility" },
        { label: t("nav.feesStructure"), to: "/admissions#fees" },
        { label: t("nav.applyOnline"), to: "/admissions#apply" },
      ],
    },
    { label: t("nav.contact"), to: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileDropdown = (label: string) => {
    setExpandedMobile((prev) => (prev === label ? null : label));
  };

  return (
    <div className="sticky top-0 z-50">
      {/* Top utility bar */}
      <div className="relative z-40 bg-primary text-primary-foreground">
        <div className="container flex h-9 items-center justify-end gap-0">
          <div className="flex items-center">
            {topBarLinks.map((l, i) => (
              <Link
                key={l.to}
                to={l.to}
                className="flex items-center px-3 py-1 text-xs font-medium tracking-wide text-primary-foreground/90 transition-colors duration-200 hover:text-primary-foreground"
              >
                {i > 0 && <span className="mx-3 text-primary-foreground/40">|</span>}
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* School identity bar */}
      <div className="relative z-40 border-b border-border/40 bg-background">
        <div className="container flex items-center gap-2 py-2 sm:gap-4 sm:py-3">
          <img
            src={schoolLogo}
            alt="Shaheen Education Society Logo"
            className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-primary/20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32"
          />
          <div className="flex-1 leading-tight text-center px-1">
            <p className="font-serif text-sm font-semibold text-primary sm:text-lg md:text-xl lg:text-2xl">
              Shaheen Education Society's
            </p>
            <h1 className="font-serif text-[13px] font-bold text-primary sm:text-lg md:text-2xl lg:text-3xl leading-snug">
              Shaheen Montessori, Shaheen School &amp; Shaheen High School Karad.
            </h1>
            <p className="font-sans text-[10px] font-semibold text-foreground sm:text-xs md:text-sm">
              Affiliated to Maharashtra State Board · Recognized &amp; 100% Aided by Govt. of Maharashtra
            </p>
            <p className="font-sans text-[10px] font-semibold text-foreground sm:text-xs md:text-sm">
              Shaheen High School, Karad — Nurturing Excellence Since Inception
            </p>
          </div>
          <img
            src={schoolLogo}
            alt="Shaheen Education Society Logo"
            className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-primary/20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32"
          />
        </div>
      </div>


      {/* Main navbar */}
      <header
        className={cn(
          "relative z-40 border-b transition-all duration-300",
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-border/60 shadow-soft"
            : "bg-[hsl(142_40%_85%/0.92)] backdrop-blur-md border-border/40"
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((l) => (
              <div key={l.to} className="group relative">
                <Link
                  to={l.to}
                  className={cn(
                    "animated-underline flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-primary hover:bg-foreground/[0.03]",
                    location.pathname === l.to ? "text-primary after:!scale-x-100 after:!origin-bottom-left" : "text-foreground/70"
                  )}
                >
                  {l.label}
                  {l.dropdown && <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />}
                </Link>

                {l.dropdown && (
                  <div className="invisible absolute start-0 top-full z-[60] min-w-[220px] pt-2 opacity-0 translate-y-1 transition-all duration-200 ease-out group-hover:visible group-hover:opacity-100 group-hover:translate-y-0">
                    <div className="overflow-hidden rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-elevated">
                      <div className="py-1.5">
                        {l.dropdown.map((sub) => (
                          <Link
                            key={sub.to}
                            to={sub.to}
                            className="block px-4 py-2.5 text-sm text-foreground/80 transition-all duration-150 hover:bg-primary/[0.06] hover:text-primary hover:translate-x-0.5 rtl:hover:-translate-x-0.5"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Link to="/student-portal">
              <Button size="sm" variant="accent" className="ms-2 hover:scale-105">
                {t("nav.studentPortal")}
              </Button>
            </Link>
            <Link to="/staff-portal">
              <Button size="sm" variant="premium" className="ms-1 hover:scale-105">
                {t("nav.teacherPortal")}
              </Button>
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden border-t border-border bg-[hsl(142_40%_85%)] lg:hidden"
            >
              <div className="flex flex-col gap-1 p-4">
                {topBarLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
                      location.pathname === l.to ? "bg-primary/10 text-primary" : "text-foreground/60 hover:bg-primary/5"
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="my-2 border-t border-border/50" />
                {navLinks.map((l) => (
                  <div key={l.to}>
                    {l.dropdown ? (
                      <>
                        <button
                          onClick={() => toggleMobileDropdown(l.label)}
                          className={cn(
                            "flex w-full items-center justify-between rounded px-3 py-2 text-sm font-medium transition-colors",
                            location.pathname === l.to ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-primary/10"
                          )}
                        >
                          {l.label}
                          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", expandedMobile === l.label && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                          {expandedMobile === l.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ms-4 flex flex-col gap-0.5 border-s-2 border-primary/20 ps-3 py-1">
                                <Link
                                  to={l.to}
                                  onClick={() => setOpen(false)}
                                  className="rounded px-2 py-1.5 text-sm font-medium text-primary hover:bg-primary/10"
                                >
                                  {t("nav.viewAll")} {l.label}
                                </Link>
                                {l.dropdown.map((sub) => (
                                  <Link
                                    key={sub.to}
                                    to={sub.to}
                                    onClick={() => setOpen(false)}
                                    className="rounded px-2 py-1.5 text-sm text-foreground/60 hover:bg-primary/10 hover:text-primary"
                                  >
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={l.to}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "block rounded px-3 py-2 text-sm font-medium transition-colors",
                          location.pathname === l.to ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-primary/10"
                        )}
                      >
                        {l.label}
                      </Link>
                    )}
                  </div>
                ))}
                <Link to="/student-portal" onClick={() => setOpen(false)}>
                  <Button size="sm" className="mt-2 w-full bg-secondary text-secondary-foreground">
                    {t("nav.studentPortal")}
                  </Button>
                </Link>
                <Link to="/staff-portal" onClick={() => setOpen(false)}>
                  <Button size="sm" className="mt-1 w-full bg-primary text-primary-foreground">
                    {t("nav.teacherPortal")}
                  </Button>
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <div className="relative z-10">
        <NewsTicker />
      </div>
    </div>
  );
};

export default Navbar;
