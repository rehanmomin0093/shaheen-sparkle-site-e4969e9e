import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, GraduationCap } from "lucide-react";
import NewsTicker from "./NewsTicker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const topBarLinks = [
  { label: "Videos", to: "/videos" },
  { label: "Achievements", to: "/achievements" },
  { label: "Press Media", to: "/press-media" },
];

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Academics", to: "/academics" },
  { label: "Gallery", to: "/gallery" },
  { label: "Notice Board", to: "/notices" },
  { label: "Admissions", to: "/admissions" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="sticky top-0 z-50">
      {/* Top utility bar — dark green like reference */}
      <div className="bg-primary text-primary-foreground">
        <div className="container flex h-9 items-center justify-end gap-0">
          {topBarLinks.map((l, i) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center px-3 py-1 text-xs font-medium tracking-wide text-primary-foreground/90 transition-colors hover:text-primary-foreground"
            >
              {i > 0 && <span className="mr-3 text-primary-foreground/40">|</span>}
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main navbar — light green */}
      <header className="border-b border-border/50 bg-[hsl(142_40%_85%/0.95)] backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <span className="block font-serif text-lg font-bold text-foreground">Shaheen</span>
              <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">School & High School</span>
            </div>
          </Link>

          {/* Desktop */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "rounded px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10",
                  location.pathname === l.to
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70"
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link to="/student-portal">
              <Button size="sm" className="ml-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                Student Portal
              </Button>
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav className="border-t border-border bg-[hsl(142_40%_85%)] p-4 lg:hidden">
            <div className="flex flex-col gap-1">
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
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded px-3 py-2 text-sm font-medium transition-colors",
                    location.pathname === l.to
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-primary/10"
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <Link to="/student-portal" onClick={() => setOpen(false)}>
                <Button size="sm" className="mt-2 w-full bg-secondary text-secondary-foreground">
                  Student Portal
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* News ticker */}
      <NewsTicker />
    </div>
  );
};

export default Navbar;
