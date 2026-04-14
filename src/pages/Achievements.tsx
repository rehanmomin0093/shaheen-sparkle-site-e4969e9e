import { useTranslation } from "react-i18next";
import SectionHeading from "@/components/shared/SectionHeading";

const Achievements = () => {
  const { t } = useTranslation();
  return (
    <section className="py-24">
      <div className="container">
        <SectionHeading label={t("achievements.label")} title={t("achievements.title")} description={t("achievements.desc")} />
        <p className="text-center text-muted-foreground">{t("common.comingSoon")}</p>
      </div>
    </section>
  );
};

export default Achievements;
