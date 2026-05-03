import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef, ReactNode } from "react";

type Props = {
  label?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  image?: string;
  align?: "left" | "center";
  children?: ReactNode;
};

const PageHero = ({ label, title, subtitle, image, align = "left", children }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.05, 1.18]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-primary text-primary-foreground"
    >
      {/* Background image / gradient */}
      <motion.div
        aria-hidden
        style={{ scale }}
        className="absolute inset-0 -z-10"
      >
        {image ? (
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover opacity-40"
            loading="eager"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(1200px_500px_at_20%_-10%,hsl(var(--secondary)/0.25),transparent_60%),radial-gradient(900px_500px_at_110%_110%,hsl(var(--emerald-glow)/0.5),transparent_60%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/60 to-primary" />
      </motion.div>

      {/* Floating gold orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-12 -left-10 h-56 w-56 rounded-full bg-secondary/15 blur-3xl floating-shape" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-secondary/10 blur-3xl floating-shape" style={{ animationDelay: "2.5s" }} />
      </div>

      <motion.div
        style={{ y, opacity }}
        className={`container relative py-28 md:py-32 ${align === "center" ? "text-center" : ""}`}
      >
        {label && (
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="kicker text-secondary"
          >
            {label}
          </motion.span>
        )}
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.05 }}
          className="mt-3 font-serif text-4xl leading-[1.05] md:text-6xl lg:text-7xl"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className={`mt-5 max-w-2xl text-base opacity-80 md:text-lg ${align === "center" ? "mx-auto" : ""}`}
          >
            {subtitle}
          </motion.p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </motion.div>

      {/* Bottom curve / cut */}
      <svg
        aria-hidden
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-10 w-full text-background"
      >
        <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="currentColor" />
      </svg>
    </section>
  );
};

export default PageHero;
