import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { FileDown } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = ["All", "Circulars", "Results", "Events", "General"];

const notices = [
  { date: "10 Mar 2026", title: "Annual Day Celebration — Schedule & Invitation", category: "Events", hasPdf: true },
  { date: "05 Mar 2026", title: "Mid-Term Exam Timetable 2025–26 (Class 1–10)", category: "Circulars", hasPdf: true },
  { date: "28 Feb 2026", title: "Admissions Open for 2026–27 Academic Year", category: "General", hasPdf: false },
  { date: "20 Feb 2026", title: "Sports Day Results — Winners List", category: "Results", hasPdf: true },
  { date: "15 Feb 2026", title: "Parent-Teacher Meeting — Date Change Notice", category: "Circulars", hasPdf: false },
  { date: "10 Feb 2026", title: "Half-Yearly Exam Results Published", category: "Results", hasPdf: true },
  { date: "01 Feb 2026", title: "Republic Day Celebration Photos & Report", category: "Events", hasPdf: false },
  { date: "25 Jan 2026", title: "Fee Payment Deadline Extended to Feb 10", category: "General", hasPdf: false },
  { date: "20 Jan 2026", title: "Science Exhibition — Registration Open", category: "Events", hasPdf: true },
  { date: "10 Jan 2026", title: "Winter Vacation Homework Submission Guidelines", category: "Circulars", hasPdf: true },
];

const NoticeBoard = () => {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? notices : notices.filter((n) => n.category === active);

  return (
    <>
      <section className="bg-primary py-24 text-primary-foreground">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Notices</span>
            <h1 className="font-serif text-4xl md:text-6xl">Notice Board & Downloads</h1>
            <p className="mt-4 max-w-2xl opacity-80">Stay updated with the latest announcements, circulars, and downloadable documents.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container">
          {/* Filter */}
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={cn(
                  "rounded px-4 py-2 text-sm font-medium transition-colors",
                  active === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Notices */}
          <div className="mx-auto max-w-3xl space-y-3">
            {filtered.map((n, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Card className="group transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{n.date}</span>
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{n.category}</span>
                      </div>
                      <p className="mt-1 font-medium">{n.title}</p>
                    </div>
                    {n.hasPdf && (
                      <button
                        className="shrink-0 rounded p-2 text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
                        title="Download PDF"
                      >
                        <FileDown className="h-5 w-5" />
                      </button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-10 text-center text-muted-foreground">No notices in this category.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default NoticeBoard;
