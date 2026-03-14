import { Volume2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const NewsTicker = () => {
  const { data: notices } = useQuery({
    queryKey: ["ticker-notices"],
    queryFn: async () => {
      const { data } = await supabase
        .from("notices")
        .select("title")
        .order("date", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  const items = notices?.map((n) => n.title) ?? [];
  const fallback = ["Welcome to Shaheen School & High School", "Admissions open for 2026-27"];
  const displayItems = items.length > 0 ? items : fallback;
  const tickerText = displayItems.join("     •     ");

  return (
    <div className="flex h-9 items-center overflow-hidden" style={{ background: "linear-gradient(90deg, hsl(0 70% 45%), hsl(20 80% 50%), hsl(0 70% 45%))" }}>
      <div className="flex shrink-0 items-center gap-2 px-4 py-1 font-bold text-xs uppercase tracking-wider z-10 text-white" style={{ background: "hsl(0 70% 40%)" }}>
        <Volume2 className="h-3.5 w-3.5" />
        NEWS
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="animate-ticker flex whitespace-nowrap text-xs font-semibold text-white">
          <span className="px-8">{tickerText}</span>
          <span className="px-8">{tickerText}</span>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
