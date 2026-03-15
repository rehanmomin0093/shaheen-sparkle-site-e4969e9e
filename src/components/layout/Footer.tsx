import { Link } from "react-router-dom";
import { GraduationCap, Phone, Mail, MapPin, ArrowRight } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-primary text-primary-foreground">
    <div className="container py-16">
      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
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

        {/* Portal Links */}
        <div>
          <h4 className="mb-4 font-serif text-lg">Portals</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>
              <Link to="/student-portal" className="group flex items-center gap-1 transition-all duration-200 hover:opacity-100 hover:translate-x-1">
                <ArrowRight className="h-3 w-3 opacity-0 -ml-4 transition-all duration-200 group-hover:opacity-100 group-hover:ml-0" />
                Student Portal
              </Link>
            </li>
            <li>
              <Link to="/contact" className="group flex items-center gap-1 transition-all duration-200 hover:opacity-100 hover:translate-x-1">
                <ArrowRight className="h-3 w-3 opacity-0 -ml-4 transition-all duration-200 group-hover:opacity-100 group-hover:ml-0" />
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-4 font-serif text-lg">Contact</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li className="group flex items-start gap-2 transition-colors duration-200">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 transition-colors duration-300 group-hover:text-secondary" />
              <span>Shaheen Campus, Main Road, City — 000000</span>
            </li>
            <li className="group flex items-center gap-2 transition-colors duration-200">
              <Phone className="h-4 w-4 shrink-0 transition-colors duration-300 group-hover:text-secondary" />
              <span>+91 98765 43210</span>
            </li>
            <li className="group flex items-center gap-2 transition-colors duration-200">
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

export default Footer;
