import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

const PopupBanner = () => {
  const [open, setOpen] = useState(true);

  const { data: banner } = useQuery({
    queryKey: ["active-popup-banner"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("popup_banners")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (!open || !banner) return null;

  const sizeClass: Record<string, string> = {
    small: "max-w-[90vw] sm:max-w-md",
    medium: "max-w-[92vw] sm:max-w-xl",
    large: "max-w-[95vw] sm:max-w-3xl lg:max-w-4xl",
    xlarge: "max-w-[95vw] sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl",
    full: "max-w-[98vw] sm:max-w-[95vw] lg:max-w-[90vw]",
  };
  const widthClass = sizeClass[(banner as any).size || "large"] || sizeClass.large;

  const image = (
    <img
      src={banner.image_url}
      alt={banner.title || "Announcement"}
      className="max-h-[70vh] w-full rounded-lg object-contain"
    />
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[10.5rem] z-30 flex justify-center px-3 sm:top-[11.5rem] sm:px-4 lg:top-[12.5rem]">
      <div className={`pointer-events-auto relative ${widthClass} overflow-hidden rounded-lg bg-transparent shadow-none`}>
        <button
          onClick={() => setOpen(false)}
          className="absolute right-2 top-2 z-10 rounded-full bg-background/80 p-1.5 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
          aria-label="Close announcement banner"
        >
          <X className="h-4 w-4" />
        </button>

        {banner.link_url ? (
          <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="block">
            {image}
          </a>
        ) : (
          image
        )}

        {banner.title && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-8">
            <p className="text-center font-serif text-lg font-semibold text-white">{banner.title}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupBanner;
