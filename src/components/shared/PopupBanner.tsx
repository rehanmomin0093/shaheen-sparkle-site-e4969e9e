import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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

  if (!banner) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg border-none bg-transparent p-0 shadow-none [&>button]:hidden" aria-describedby={undefined}>
        <VisuallyHidden><DialogTitle>Announcement Banner</DialogTitle></VisuallyHidden>
        <div className="relative overflow-hidden rounded-lg">
          <button
            onClick={() => setOpen(false)}
            className="absolute right-2 top-2 z-10 rounded-full bg-background/80 p-1.5 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
          >
            <X className="h-4 w-4" />
          </button>
          {banner.link_url ? (
            <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
              <img
                src={banner.image_url}
                alt={banner.title || "Announcement"}
                className="w-full rounded-lg object-contain"
              />
            </a>
          ) : (
            <img
              src={banner.image_url}
              alt={banner.title || "Announcement"}
              className="w-full rounded-lg object-contain"
            />
          )}
          {banner.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-8">
              <p className="text-center font-serif text-lg font-semibold text-white">{banner.title}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PopupBanner;
