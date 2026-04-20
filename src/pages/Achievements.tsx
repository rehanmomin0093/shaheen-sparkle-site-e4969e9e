import { useTranslation } from "react-i18next";
import SectionHeading from "@/components/shared/SectionHeading";
import { useMediaItems } from "@/hooks/useMediaItems";
import { Loader2, Trophy, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Achievements = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useMediaItems("achievement");

  return (
    <section className="py-24">
      <div className="container">
        <SectionHeading
          label={t("achievements.label")}
          title={t("achievements.title")}
          description={t("achievements.desc")}
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-center text-muted-foreground">{t("common.comingSoon")}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => (
              <Card key={item.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
                <div className="aspect-video bg-muted">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary/10 text-secondary">
                      <Trophy className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <CardContent className="space-y-2 pt-4">
                  {item.item_date && (
                    <p className="text-xs uppercase tracking-wider text-secondary">
                      {new Date(item.item_date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                  <h3 className="font-serif text-lg leading-snug">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  {item.external_url && (
                    <a
                      href={item.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Learn more <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Achievements;
