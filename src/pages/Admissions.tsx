import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import SectionHeading from "@/components/shared/SectionHeading";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  { step: "01", title: "Fill Inquiry Form", desc: "Submit the online inquiry form with student & parent details." },
  { step: "02", title: "Document Verification", desc: "Bring original documents to the school office for verification." },
  { step: "03", title: "Entrance Assessment", desc: "Student appears for an age-appropriate assessment." },
  { step: "04", title: "Admission Confirmation", desc: "Pay fees and complete enrollment to secure the seat." },
];

const Admissions = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);
  const [submitted, setSubmitted] = useState(false);
  const [classApplying, setClassApplying] = useState("");

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
      toast({ title: "Error", description: "Please select a class.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("admission_inquiries").insert({
      student_name: studentName,
      parent_name: parentName,
      phone,
      email,
      class_applying: classApplying,
      message,
    });

    setIsSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        const msg = error.message.includes("unique_phone")
          ? "This phone number has already been used for an admission inquiry."
          : error.message.includes("unique_email")
          ? "This email has already been used for an admission inquiry."
          : "An inquiry with this phone or email already exists.";
        toast({ title: "Duplicate Inquiry", description: msg, variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
      }
      return;
    }

    setSubmitted(true);
    toast({ title: "Inquiry Submitted!", description: "We'll contact you within 2 working days." });
  };

  return (
    <>
      <section className="bg-primary py-24 text-primary-foreground">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Admissions</span>
            <h1 className="font-serif text-4xl md:text-6xl">Join the Shaheen Family</h1>
            <p className="mt-4 max-w-2xl opacity-80">Admissions are open for the 2026–27 academic year. Follow the steps below and submit your inquiry.</p>
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-24">
        <div className="container">
          <SectionHeading label="Process" title="How to Apply" />
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
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

      {/* Inquiry Form */}
      <section id="apply" className="bg-muted py-24">
        <div className="container">
          <SectionHeading label="Inquiry" title="Admission Inquiry Form" description="Fill in the details below and our admissions team will get back to you." />
          <div className="mx-auto max-w-2xl">
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-primary" />
                <h3 className="font-serif text-2xl">Thank You!</h3>
                <p className="mt-2 text-muted-foreground">Your inquiry has been submitted. We'll contact you within 2 working days.</p>
                <Button className="mt-6" onClick={() => setSubmitted(false)}>Submit Another Inquiry</Button>
              </motion.div>
            ) : (
              <Card className="border-none shadow-lg">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="studentName">Student Name *</Label>
                        <Input id="studentName" required placeholder="Full name of the student" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                        <Input id="parentName" required placeholder="Full name" />
                      </div>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" type="tel" required placeholder="+91 98765 43210" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="parent@email.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Class Applying For *</Label>
                      <Select required value={classApplying} onValueChange={setClassApplying}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
                            "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"].map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Additional Message</Label>
                      <Textarea id="message" placeholder="Any specific questions or requirements..." rows={4} />
                    </div>
                    <Button type="submit" size="lg" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Inquiry"}
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
