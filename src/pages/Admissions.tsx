import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SectionHeading from "@/components/shared/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import PageHero from "@/components/shared/PageHero";

const Admissions = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [classApplying, setClassApplying] = useState("");

  const steps = [
    { step: "01", title: t("admissions.step01"), desc: t("admissions.step01Desc") },
    { step: "02", title: t("admissions.step02"), desc: t("admissions.step02Desc") },
    { step: "03", title: t("admissions.step03"), desc: t("admissions.step03Desc") },
    { step: "04", title: t("admissions.step04"), desc: t("admissions.step04Desc") },
  ];

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const studentName = (form.querySelector("#studentName") as HTMLInputElement).value.trim();
    const parentName = (form.querySelector("#parentName") as HTMLInputElement).value.trim();
    const phone = (form.querySelector("#phone") as HTMLInputElement).value.trim();
    const email = (form.querySelector("#email") as HTMLInputElement).value.trim() || null;
    const message = (form.querySelector("#message") as HTMLTextAreaElement).value.trim() || null;

    if (!classApplying) {
      toast({ title: t("admissions.errorTitle"), description: t("admissions.selectClassError"), variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("admission_inquiries").insert({
      student_name: studentName, parent_name: parentName, phone, email, class_applying: classApplying, message,
    });

    setIsSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        const msg = error.message.includes("unique_phone")
          ? t("admissions.duplicatePhone")
          : error.message.includes("unique_email")
          ? t("admissions.duplicateEmail")
          : t("admissions.duplicateGeneral");
        toast({ title: t("admissions.duplicateInquiry"), description: msg, variant: "destructive" });
      } else {
        toast({ title: t("admissions.errorTitle"), description: t("admissions.genericError"), variant: "destructive" });
      }
      return;
    }

    setSubmitted(true);
    toast({ title: t("admissions.inquirySubmittedTitle"), description: t("admissions.inquirySubmittedDesc") });
  };

  return (
    <>
      <PageHero label={t("admissions.label")} title={t("admissions.title")} subtitle={t("admissions.subtitle")} />

      <section id="process" className="py-24">
        <div className="container">
          <SectionHeading label={t("admissions.processLabel")} title={t("admissions.howToApply")} />
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}>
                <Card className="h-full border-none shadow-md">
                  <CardContent className="p-6">
                    <span className="font-serif text-3xl text-secondary">{s.step}</span>
                    <h3 className="mt-2 font-serif text-lg">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="bg-muted py-24">
        <div className="container">
          <SectionHeading label={t("admissions.inquiryLabel")} title={t("admissions.formTitle")} description={t("admissions.formDesc")} />
          <div className="mx-auto max-w-2xl">
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-primary" />
                <h3 className="font-serif text-2xl">{t("admissions.thankYou")}</h3>
                <p className="mt-2 text-muted-foreground">{t("admissions.inquirySubmitted")}</p>
                <Button className="mt-6" onClick={() => setSubmitted(false)}>{t("admissions.submitAnother")}</Button>
              </motion.div>
            ) : (
              <Card className="border-none shadow-lg">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="studentName">{t("admissions.studentName")}</Label>
                        <Input id="studentName" required placeholder={t("admissions.studentNamePlaceholder")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parentName">{t("admissions.parentName")}</Label>
                        <Input id="parentName" required placeholder={t("admissions.parentNamePlaceholder")} />
                      </div>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t("admissions.phoneNumber")}</Label>
                        <Input id="phone" type="tel" required placeholder="+91 98765 43210" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("admissions.emailLabel")}</Label>
                        <Input id="email" type="email" placeholder="parent@email.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admissions.classLabel")}</Label>
                      <Select required value={classApplying} onValueChange={setClassApplying}>
                        <SelectTrigger><SelectValue placeholder={t("admissions.selectClass")} /></SelectTrigger>
                        <SelectContent>
                          {["Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"].map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">{t("admissions.additionalMessage")}</Label>
                      <Textarea id="message" placeholder={t("admissions.additionalMessagePlaceholder")} rows={4} />
                    </div>
                    <Button type="submit" size="lg" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" disabled={isSubmitting}>
                      {isSubmitting ? t("admissions.submitting") : t("admissions.submitInquiry")}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Admissions;
