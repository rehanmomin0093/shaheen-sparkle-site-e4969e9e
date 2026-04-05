import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, GraduationCap, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NewsTicker from "./NewsTicker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const topBarLinks = [
  { label: "Videos", to: "/videos" },
  { label: "Achievements", to: "/achievements" },
  { label: "Press Media", to: "/press-media" },
];

interface NavItem {
  label: string;
  to: string;
  dropdown?: { label: string; to: string }[];
}

const navLinks: NavItem[] = [
  { label: "Home", to: "/" },
  {
    label: "About",
    to: "/about",
    dropdown: [
      { label: "School History", to: "/about#history" },
      { label: "Vision & Mission", to: "/about#vision" },
      { label: "Principal Message", to: "/about#principal" },
      { label: "Staff", to: "/about#staff" },
    ],
  },
  {
    label: "Academics",
    to: "/academics",
    dropdown: [
      { label: "Curriculum", to: "/academics#curriculum" },
      { label: "Departments", to: "/academics#departments" },
      { label: "Faculty", to: "/academics#faculty" },
      { label: "Time Table", to: "/academics#timetable" },
    ],
  },
  {
    label: "Gallery",
    to: "/gallery",
    dropdown: [
      { label: "Events", to: "/gallery?cat=events" },
      { label: "Sports", to: "/gallery?cat=sports" },
      { label: "Cultural Programs", to: "/gallery?cat=cultural" },
      { label: "Campus Photos", to: "/gallery?cat=campus" },
    ],
  },
  {
    label: "Notice Board",
    to: "/notices",
    dropdown: [
      { label: "Latest Notices", to: "/notices#latest" },
      { label: "Events", to: "/notices#events" },
      { label: "Announcements", to: "/notices#announcements" },
    ],
  },
  {
    label: "Admissions",
    to: "/admissions",
    dropdown: [
      { label: "Admission Process", to: "/admissions#process" },
      { label: "Eligibility", to: "/admissions#eligibility" },
      { label: "Fees Structure", to: "/admissions#fees" },
      { label: "Apply Online", to: "/admissions#apply" },
    ],
  },
  {
    label: "Contact",
    to: "/contact",
    dropdown: [
      { label: "Address", to: "/contact#address" },
      { label: "Phone", to: "/contact#phone" },
      { label: "Email", to: "/contact#email" },
      { label: "Google Map", to: "/contact#map" },
    ],
  },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const location = useLocation();

  const toggleMobileDropdown = (label: string) => {
    setExpandedMobile((prev) => (prev === label ? null : label));
  };

  return (
    <div className="sticky top-0 z-50">
      {/* Top utility bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container flex h-9 items-center justify-end gap-0">
          {topBarLinks.map((l, i) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center px-3 py-1 text-xs font-medium tracking-wide text-primary-foreground/90 transition-colors duration-200 hover:text-primary-foreground"
            >
              {i > 0 && <span className="mr-3 text-primary-foreground/40">|</span>}
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main navbar */}
      <header className="border-b border-border/50 bg-[hsl(142_40%_85%/0.95)] backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <span className="block font-serif text-lg font-bold text-foreground">Shaheen</span>
              <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">School & High School</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((l) => (
              <div key={l.to} className="group relative">
                <Link
                  to={l.to}
                  className={cn(
                    "animated-underline flex items-center gap-1 rounded px-3 py-2 text-sm font-medium transition-colors duration-200 hover:text-primary",
                    location.pathname === l.to
                      ? "text-primary after:!scale-x-100 after:!origin-bottom-left"
                      : "text-foreground/70"
                  )}
                >
                  {l.label}
                  {l.dropdown && (
                    <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
                  )}
                </Link>

                {/* Desktop dropdown */}
                {l.dropdown && (
                  <div className="invisible absolute left-0 top-full z-50 min-w-[200px] pt-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="rounded-md border border-border bg-card shadow-xl">
                      <div className="py-1">
                        {l.dropdown.map((sub) => (
                          <Link
                            key={sub.to}
                            to={sub.to}
                            className="block px-4 py-2.5 text-sm text-foreground/80 transition-colors duration-150 hover:bg-primary/10 hover:text-primary"
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
              <Button size="sm" className="ml-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-transform duration-200 hover:scale-105">
                Student Portal
              </Button>
            </Link>
            <Link to="/staff-portal">
              <Button size="sm" className="ml-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-200 hover:scale-105">
                Teacher Portal
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
                      location.pathname === l.to
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/60 hover:bg-primary/5"
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
                            location.pathname === l.to
                              ? "bg-primary/10 text-primary"
                              : "text-foreground/70 hover:bg-primary/10"
                          )}
                        >
                          {l.label}
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              expandedMobile === l.label && "rotate-180"
                            )}
                          />
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
                              <div className="ml-4 flex flex-col gap-0.5 border-l-2 border-primary/20 pl-3 py-1">
                                <Link
                                  to={l.to}
                                  onClick={() => setOpen(false)}
                                  className="rounded px-2 py-1.5 text-sm font-medium text-primary hover:bg-primary/10"
                                >
                                  View All {l.label}
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
                          location.pathname === l.to
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/70 hover:bg-primary/10"
                        )}
                      >
                        {l.label}
                      </Link>
                    )}
                  </div>
                ))}
                <Link to="/student-portal" onClick={() => setOpen(false)}>
                  <Button size="sm" className="mt-2 w-full bg-secondary text-secondary-foreground">
                    Student Portal
                  </Button>
                </Link>
                <Link to="/staff-portal" onClick={() => setOpen(false)}>
                  <Button size="sm" className="mt-1 w-full bg-primary text-primary-foreground">
                    Teacher Portal
                  </Button>
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* News ticker */}
      <NewsTicker />
    </div>
  );
};

export default Navbar;
