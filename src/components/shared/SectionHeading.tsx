import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  label?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}

const SectionHeading = ({ label, title, description, className, align = "center" }: Props) => {
  const isCenter = align === "center";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn("mb-14", isCenter && "text-center", className)}
    >
      {label && (
        <motion.span
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          whileInView={{ opacity: 1, letterSpacing: "0.32em" }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="kicker"
        >
          {label}
        </motion.span>
      )}
      <h2 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
        {title}
      </h2>
      <div className={cn("mt-5", isCenter ? "flex justify-center" : "flex")}>
        <span className="gold-rule" aria-hidden>
          <span className="diamond" />
        </span>
      </div>
      {description && (
        <p
          className={cn(
            "mt-5 text-base leading-relaxed text-muted-foreground md:text-lg",
            isCenter ? "mx-auto max-w-2xl" : "max-w-2xl",
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
};

export default SectionHeading;
