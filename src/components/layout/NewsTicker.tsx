import { useEffect, useRef } from "react";
import { Volume2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const NewsTicker = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

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

  if (items.length === 0) return null;

  const tickerText = items.join("     •     ");

  return (
    <div className="flex h-9 items-center overflow-hidden bg-destructive/90 text-white">
      <div className="flex shrink-0 items-center gap-2 bg-destructive px-4 py-1 font-bold text-xs uppercase tracking-wider z-10">
        <Volume2 className="h-3.5 w-3.5" />
        NEWS
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="animate-ticker flex whitespace-nowrap text-xs font-medium">
          <span className="px-8">{tickerText}</span>
          <span className="px-8">{tickerText}</span>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
