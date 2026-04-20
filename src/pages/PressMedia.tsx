import { useTranslation } from "react-i18next";
import SectionHeading from "@/components/shared/SectionHeading";
import { useMediaItems } from "@/hooks/useMediaItems";
import { Loader2, Newspaper, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const PressMedia = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useMediaItems("press");

  return (
    <section className="py-24">
      <div className="container">
        <SectionHeading
          label={t("pressMedia.label")}
          title={t("pressMedia.title")}
          description={t("pressMedia.desc")}
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-center text-muted-foreground">{t("common.comingSoon")}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => {
              const Wrapper: any = item.external_url ? "a" : "div";
              const wrapperProps = item.external_url
                ? { href: item.external_url, target: "_blank", rel: "noopener noreferrer" }
                : {};
              return (
                <Wrapper key={item.id} {...wrapperProps} className="block">
                  <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="aspect-video bg-muted">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
                          <Newspaper className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <CardContent className="space-y-2 pt-4">
                      <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                        {item.source && <span className="text-secondary">{item.source}</span>}
                        {item.item_date && (
                          <span>
                            {new Date(item.item_date).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-lg leading-snug">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                      {item.external_url && (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                          Read article <ExternalLink className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </Wrapper>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PressMedia;
