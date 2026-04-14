import { useTranslation } from "react-i18next";
import SectionHeading from "@/components/shared/SectionHeading";

const Videos = () => {
  const { t } = useTranslation();
  return (
    <section className="py-24">
      <div className="container">
        <SectionHeading label={t("videos.label")} title={t("videos.title")} description={t("videos.desc")} />
        <p className="text-center text-muted-foreground">{t("common.comingSoon")}</p>
      </div>
    </section>
  );
};

export default Videos;
