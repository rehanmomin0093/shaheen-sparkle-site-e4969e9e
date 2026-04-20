import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MediaType = "video" | "achievement" | "press";

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  external_url: string | null;
  source: string | null;
  item_date: string | null;
  sort_order: number;
  is_active: boolean;
}

export const useMediaItems = (type: MediaType) => {
  return useQuery({
    queryKey: ["media-items", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_items")
        .select("*")
        .eq("type", type)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("item_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MediaItem[];
    },
  });
};

/** Convert a YouTube watch/share/embed URL to an embeddable URL. */
export const toYoutubeEmbed = (url: string): string | null => {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return url;
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return url;
  } catch {
    return null;
  }
};
