import { useRef } from "react";
import { Volume2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NewsTicker = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const { data: notices } = useQuery({
    queryKey: ["ticker-notices"],
    queryFn: async () => {
      const { data } = await supabase.from("notices").select("id, title").order("date", { ascending: false }).limit(10);
      return data ?? [];
    },
  });

  if (!notices || notices.length === 0) return null;

  const renderItems = (keyPrefix: string) =>
    notices.map((n, i) => (
      <span key={`${keyPrefix}-${n.id}`}>
        <Link to={`/notices?id=${n.id}`} className="hover:underline hover:text-secondary transition-colors">
          {n.title}
        </Link>
        {i < notices.length - 1 && <span className="px-4">•</span>}
      </span>
    ));

  return (
    <div className="flex h-9 items-center overflow-hidden bg-destructive/90 text-white">
      <div className="flex shrink-0 items-center gap-2 bg-destructive px-4 py-1 font-bold text-xs uppercase tracking-wider z-10">
        <Volume2 className="h-3.5 w-3.5" />
        {t("ticker.news")}
      </div>
      <div className="relative flex-1 overflow-hidden group">
        <div className="animate-ticker group-hover:[animation-play-state:paused] flex whitespace-nowrap text-xs font-medium">
          <span className="px-8 flex items-center">{renderItems("a")}</span>
          <span className="px-8 flex items-center">{renderItems("b")}</span>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
