import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionHeading from "@/components/shared/SectionHeading";

const Contact = () => {
  const { t } = useTranslation();

  const contactInfo = [
    { icon: MapPin, label: t("contact.address"), value: t("contact.addressValue") },
    { icon: Phone, label: t("contact.phone"), value: t("contact.phoneValue") },
    { icon: Mail, label: t("contact.email"), value: t("contact.emailValue") },
    { icon: Clock, label: t("contact.officeHours"), value: t("contact.officeHoursValue") },
  ];
  return (
    <>
      <section className="bg-primary py-24 text-primary-foreground">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-secondary">{t("contact.label")}</span>
            <h1 className="font-serif text-4xl md:text-6xl">{t("contact.title")}</h1>
            <p className="mt-4 max-w-2xl opacity-80">{t("contact.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading label={t("contact.reachUs")} title={t("contact.contactInfo")} align="left" />
              <div className="space-y-6">
                {contactInfo.map((c) => (
                  <div key={c.label} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary/10">
                      <c.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</p>
                      <p className="mt-0.5 font-medium">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 overflow-hidden rounded border border-border">
                <iframe
                  title="School Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d956.8!2d74.1811811!3d17.2881865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc18248f6eab781%3A0xa269e8a344181df1!2sShaheen%20School%20And%20High%20School!5e1!3m2!1sen!2sin!4v1"
                  className="h-64 w-full"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Shaheen+School+And+High+School&query_place_id=ChIJgbfq9kgCGDsR8R0YRKPoaaI"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                {t("contact.openInMaps", "Open in Google Maps")}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
