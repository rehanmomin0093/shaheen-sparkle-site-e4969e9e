import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SectionHeading from "@/components/shared/SectionHeading";

const contactInfo = [
  { icon: MapPin, label: "Address", value: "Shaheen Campus, Main Road, City — 000000" },
  { icon: Phone, label: "Phone", value: "+91 98765 43210" },
  { icon: Mail, label: "Email", value: "info@shaheenschool.edu" },
  { icon: Clock, label: "Office Hours", value: "Mon–Sat: 8:00 AM – 4:00 PM" },
];

const Contact = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({ title: "Message Sent!", description: "We'll get back to you soon." });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <>
      <section className="bg-primary py-24 text-primary-foreground">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Contact</span>
            <h1 className="font-serif text-4xl md:text-6xl">Get in Touch</h1>
            <p className="mt-4 max-w-2xl opacity-80">Have questions? Reach out to us — we'd love to hear from you.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Info + Map */}
            <div>
              <SectionHeading label="Reach Us" title="Contact Information" align="left" />
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

              {/* Map placeholder */}
              <div className="mt-8 overflow-hidden rounded border border-border">
                <iframe
                  title="School Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.5!2d77.5!3d12.97!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzEyLjAiTiA3N8KwMzAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1"
                  className="h-64 w-full"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Form */}
            <div>
              <SectionHeading label="Write to Us" title="Send a Message" align="left" />
              <Card className="border-none shadow-lg">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name *</Label>
                        <Input id="name" required placeholder="Full name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" required placeholder="your@email.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="What is this regarding?" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea id="message" required placeholder="Your message..." rows={5} />
                    </div>
                    <Button type="submit" size="lg" className="w-full">Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
