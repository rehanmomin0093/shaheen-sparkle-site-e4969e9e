import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li";
} & Omit<HTMLMotionProps<"div">, "children">;

const Reveal = ({ children, delay = 0, y = 24, className, as = "div", ...rest }: Props) => {
  const reduce = useReducedMotion();
  const Comp: any = (motion as any)[as] ?? motion.div;
  return (
    <Comp
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
};

export default Reveal;
