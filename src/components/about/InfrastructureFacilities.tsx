import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Building2,
  GraduationCap,
  Droplets,
  BookOpen,
  ShieldCheck,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";

type FieldValue = string | number | boolean | null | undefined;

interface InfraSection {
  id: string;
  title: string;
  icon: LucideIcon;
  data: Record<string, FieldValue>;
}

// Default static data — easy to swap with dynamic data later.
const defaultData: InfraSection[] = [
  {
    id: "basic",
    title: "Basic Information",
    icon: Building2,
    data: {
      villageTown: "Shahapur",
      cluster: "Shahapur Cluster",
      blockMunicipality: "Shahapur Block",
      district: "Belagavi",
      state: "Karnataka",
      udiseCode: "29010300000",
      buildingType: "Pucca (Owned)",
    },
  },
  {
    id: "academic",
    title: "Academic Infrastructure",
    icon: GraduationCap,
    data: {
      totalClassrooms: 24,
      scienceLabs: 3,
      computerLabs: 2,
      totalComputers: 40,
      smartClassesAvailable: true,
    },
  },
  {
    id: "sanitation",
    title: "Sanitation Facilities",
    icon: Droplets,
    data: {
      boysToilets: 8,
      girlsToilets: 8,
      accessibleToilets: true,
      rampsAvailable: true,
    },
  },
  {
    id: "library",
    title: "Library & Learning Resources",
    icon: BookOpen,
    data: {
      libraryAvailable: true,
      totalBooks: 5200,
      journalsAvailable: true,
    },
  },
  {
    id: "utilities",
    title: "Utilities & Safety",
    icon: ShieldCheck,
    data: {
      electricityAvailable: true,
      drinkingWaterSource: "RO Filtered & Tap Water",
      boundaryWallType: "Pucca Boundary Wall",
      safetyMeasures: "CCTV, Fire Extinguishers, First Aid",
    },
  },
  {
    id: "sports",
    title: "Sports & Additional Facilities",
    icon: Trophy,
    data: {
      playgroundAvailable: true,
      sportsFacilities: "Cricket, Football, Basketball, Athletics",
      activityRooms: "Music Room, Art Room",
      culturalFacilities: "Auditorium, Stage, Sound System",
    },
  },
];

// Convert camelCase keys to readable labels
const formatLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

const formatValue = (value: FieldValue) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

interface Props {
  sections?: InfraSection[];
  singleOpen?: boolean;
}

const InfrastructureFacilities = ({
  sections = defaultData,
  singleOpen = true,
}: Props) => {
  return (
    <section id="infrastructure" className="bg-paper py-24">
      <div className="container">
        <SectionHeading
          label="Campus & Facilities"
          title="Infrastructure & Facilities"
          description="A purpose-built campus designed to nurture academic excellence, well-being, and holistic growth."
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl"
        >
          {singleOpen ? (
            <Accordion
              type="single"
              collapsible
              defaultValue={sections[0]?.id}
              className="space-y-4"
            >
              {renderItems(sections)}
            </Accordion>
          ) : (
            <Accordion type="multiple" className="space-y-4">
              {renderItems(sections)}
            </Accordion>
          )}
        </motion.div>
      </div>
    </section>
  );
};

const renderItems = (sections: InfraSection[]) => (
  <>
            {sections.map((section) => {
              const Icon = section.icon;
              const entries = Object.entries(section.data);
              return (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="overflow-hidden rounded-md border border-border/60 bg-card shadow-sm transition-all hover:border-secondary/60 hover:shadow-md data-[state=open]:border-secondary/70 data-[state=open]:shadow-md"
                >
                  <AccordionTrigger className="group px-5 py-5 text-left hover:no-underline sm:px-6">
                    <span className="flex w-full items-center gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm transition-transform group-hover:scale-105 group-data-[state=open]:from-primary group-data-[state=open]:to-secondary">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="flex flex-col">
                        <span className="font-serif text-lg leading-snug text-foreground sm:text-xl">
                          {section.title}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          {entries.length} details
                        </span>
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-6 sm:px-6">
                    <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                      {entries.map(([key, value]) => (
                        <div
                          key={key}
                          className="flex flex-col gap-1 border-b border-dashed border-border/60 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                        >
                          <dt className="text-sm font-medium text-muted-foreground">
                            {formatLabel(key)}
                          </dt>
                          <dd className="text-sm font-semibold text-foreground sm:text-right">
                            {typeof value === "boolean" ? (
                              <span
                                className={
                                  value
                                    ? "inline-flex items-center rounded-sm bg-primary/10 px-2 py-0.5 text-primary"
                                    : "inline-flex items-center rounded-sm bg-destructive/10 px-2 py-0.5 text-destructive"
                                }
                              >
                                {formatValue(value)}
                              </span>
                            ) : (
                              formatValue(value)
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
  </>
);

export default InfrastructureFacilities;

