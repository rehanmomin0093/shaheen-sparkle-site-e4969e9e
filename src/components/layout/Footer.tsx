import { Link } from "react-router-dom";
import { GraduationCap, Phone, Mail, MapPin, ArrowRight, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const { data: latestNotices } = useQuery({
    queryKey: ["footer-notices"],
    queryFn: async () => {
      const { data } = await supabase.from("notices").select("id, title, date").order("date", { ascending: false }).limit(3);
      return data ?? [];
    },
  });

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-secondary">
                <GraduationCap className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div className="leading-tight">
                <span className="block font-serif text-lg font-bold">Shaheen</span>
                <span className="block text-[10px] uppercase tracking-widest opacity-70">School & High School</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed opacity-80">
              Nurturing the Falcons of Tomorrow — building character, knowledge, and excellence since establishment.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="rounded-full bg-primary-foreground/10 p-2 transition-colors duration-200 hover:bg-secondary hover:text-secondary-foreground">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="rounded-full bg-primary-foreground/10 p-2 transition-colors duration-200 hover:bg-secondary hover:text-secondary-foreground">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Twitter" className="rounded-full bg-primary-foreground/10 p-2 transition-colors duration-200 hover:bg-secondary hover:text-secondary-foreground">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="YouTube" className="rounded-full bg-primary-foreground/10 p-2 transition-colors duration-200 hover:bg-secondary hover:text-secondary-foreground">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-serif text-lg">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-80">
              {[
                { label: "About Us", to: "/about" },
                { label: "Academics", to: "/academics" },
                { label: "Gallery", to: "/gallery" },
                { label: "Notice Board", to: "/notices" },
                { label: "Admissions", to: "/admissions" },
                { label: "Contact", to: "/contact" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="group flex items-center gap-1 transition-all duration-200 hover:opacity-100 hover:translate-x-1">
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-4 transition-all duration-200 group-hover:opacity-100 group-hover:ml-0" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Latest Notices */}
          <div>
            <h4 className="mb-4 font-serif text-lg">Latest Notices</h4>
            <ul className="space-y-3 text-sm opacity-80">
              {(latestNotices ?? []).map((n) => (
                <li key={n.id}>
                  <Link to={`/notices?id=${n.id}`} className="group block transition-all duration-200 hover:opacity-100">
                    <p className="font-medium group-hover:text-secondary transition-colors">{n.title}</p>
                    <span className="text-xs opacity-60">{n.date}</span>
                  </Link>
                </li>
              ))}
              {(!latestNotices || latestNotices.length === 0) && (
                <li className="opacity-60">No notices yet.</li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-serif text-lg">Contact</h4>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="group flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 transition-colors duration-300 group-hover:text-secondary" />
                <span>Shaheen Campus, Main Road, City — 000000</span>
              </li>
              <li className="group flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 transition-colors duration-300 group-hover:text-secondary" />
                <span>+91 98765 43210</span>
              </li>
              <li className="group flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 transition-colors duration-300 group-hover:text-secondary" />
                <span>info@shaheenschool.edu</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-6 text-center text-xs opacity-60 flex items-center justify-center gap-4">
        <span>© {new Date().getFullYear()} Shaheen School & Shaheen High School. All rights reserved.</span>
        <Link to="/admin/login" className="opacity-50 hover:opacity-100 transition-opacity">Admin</Link>
      </div>
    </footer>
  );
};

export default Footer;
