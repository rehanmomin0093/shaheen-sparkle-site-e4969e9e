import { useTranslation } from "react-i18next";
import SectionHeading from "@/components/shared/SectionHeading";
import { useMediaItems, toYoutubeEmbed } from "@/hooks/useMediaItems";
import { Loader2, Video as VideoIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Videos = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useMediaItems("video");

  return (
    <section className="py-24">
      <div className="container">
        <SectionHeading label={t("videos.label")} title={t("videos.title")} description={t("videos.desc")} />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-center text-muted-foreground">{t("common.comingSoon")}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => {
              const embed = toYoutubeEmbed(item.video_url ?? "");
              return (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted">
                    {embed ? (
                      <iframe
                        src={embed}
                        title={item.title}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <VideoIcon className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <CardContent className="space-y-2 pt-4">
                    <h3 className="font-serif text-lg leading-snug">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Videos;
