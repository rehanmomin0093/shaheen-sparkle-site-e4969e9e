import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  label?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}

const SectionHeading = ({ label, title, description, className, align = "center" }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.5 }}
    className={cn(
      "mb-12",
      align === "center" && "text-center",
      className
    )}
  >
    {label && (
      <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
        {label}
      </span>
    )}
    <h2 className="font-serif text-3xl leading-tight md:text-4xl lg:text-5xl">{title}</h2>
    {description && (
      <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{description}</p>
    )}
  </motion.div>
);

export default SectionHeading;
