import { Link } from "react-router-dom";
import { GraduationCap, Phone, Mail, MapPin, ArrowRight, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  const { data: latestNotices } = useQuery({
    queryKey: ["footer-notices"],
    queryFn: async () => {
      const { data } = await supabase.from("notices").select("id, title, date").order("date", { ascending: false }).limit(3);
      return data ?? [];
    },
  });

  return (
    <footer className="relative bg-primary text-primary-foreground">
      {/* Premium gradient top border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/60 to-transparent" />
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-warm shadow-soft">
                <GraduationCap className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div className="leading-tight">
                <span className="block font-serif text-lg font-bold">{t("common.schoolName")}</span>
                <span className="block text-[10px] uppercase tracking-widest opacity-70">{t("common.schoolSubtitle")}</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed opacity-80">{t("footer.tagline")}</p>
            <div className="mt-5 flex items-center gap-2.5">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" aria-label={Icon.displayName} className="rounded-full bg-primary-foreground/10 p-2.5 transition-all duration-200 hover:bg-secondary hover:text-secondary-foreground hover:-translate-y-0.5 hover:shadow-md">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-serif text-lg">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2 text-sm opacity-80">
              {[
                { label: t("footer.aboutUs"), to: "/about" },
                { label: t("footer.academics"), to: "/academics" },
                { label: t("footer.gallery"), to: "/gallery" },
                { label: t("footer.noticeBoard"), to: "/notices" },
                { label: t("footer.admissions"), to: "/admissions" },
                { label: t("footer.contact"), to: "/contact" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="group flex items-center gap-1 transition-all duration-200 hover:opacity-100 hover:translate-x-1 rtl:hover:-translate-x-1">
                    <ArrowRight className="h-3 w-3 opacity-0 -ms-4 transition-all duration-200 group-hover:opacity-100 group-hover:ms-0 rtl:rotate-180" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Latest Notices */}
          <div>
            <h4 className="mb-4 font-serif text-lg">{t("footer.latestNotices")}</h4>
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
                <li className="opacity-60">{t("footer.noNotices")}</li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-serif text-lg">{t("footer.contactTitle")}</h4>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="group flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 transition-colors duration-300 group-hover:text-secondary" />
                <span>{t("contact.addressValue")}</span>
              </li>
              <li className="group flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 transition-colors duration-300 group-hover:text-secondary" />
                <span>{t("contact.phoneValue")}</span>
              </li>
              <li className="group flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 transition-colors duration-300 group-hover:text-secondary" />
                <span>{t("contact.emailValue")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-6 text-center text-xs opacity-60 flex items-center justify-center gap-4">
        <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
        <Link to="/admin/login" className="opacity-50 hover:opacity-100 transition-opacity">{t("footer.admin")}</Link>
      </div>
    </footer>
  );
};

export default Footer;
