import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === "ur";

  const toggle = () => {
    const newLang = isUrdu ? "en" : "ur";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ur" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="gap-1.5 text-xs font-semibold tracking-wide border border-primary-foreground/50 hover:border-primary-foreground"
      title={isUrdu ? "Switch to English" : "اردو میں تبدیل کریں"}
    >
      <Languages className="h-4 w-4" />
      {isUrdu ? "EN" : "اردو"}
    </Button>
  );
};

export default LanguageToggle;
