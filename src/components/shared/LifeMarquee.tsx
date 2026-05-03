import { motion } from "framer-motion";

interface LifeMarqueeProps {
  images: { id: string; src: string; alt: string }[];
  reverse?: boolean;
  speed?: number; // seconds per loop
}

const LifeMarquee = ({ images, reverse = false, speed = 40 }: LifeMarqueeProps) => {
  if (!images?.length) return null;
  // duplicate for seamless loop
  const loop = [...images, ...images];

  return (
    <div className="group relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <motion.div
        className="flex w-max gap-4"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        {loop.map((img, idx) => (
          <div
            key={`${img.id}-${idx}`}
            className="relative h-56 w-80 shrink-0 overflow-hidden rounded-lg shadow-md sm:h-64 sm:w-96"
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4 text-center font-serif text-lg font-semibold capitalize text-primary-foreground drop-shadow-md">
              {img.alt}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default LifeMarquee;
