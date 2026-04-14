import { useTranslation } from "react-i18next";
import SectionHeading from "@/components/shared/SectionHeading";

const PressMedia = () => {
  const { t } = useTranslation();
  return (
    <section className="py-24">
      <div className="container">
        <SectionHeading label={t("pressMedia.label")} title={t("pressMedia.title")} description={t("pressMedia.desc")} />
        <p className="text-center text-muted-foreground">{t("common.comingSoon")}</p>
      </div>
    </section>
  );
};

export default PressMedia;
