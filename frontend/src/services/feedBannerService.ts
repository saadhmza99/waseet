import { supabase } from "@/lib/supabase";

export type FeedBannerImage = {
  id: string;
  image_url: string;
  alt: string | null;
};

export const FEED_BANNER_ROTATION_MS = 15 * 60 * 1000;

export const feedBannerService = {
  async getActiveImages(): Promise<FeedBannerImage[]> {
    const { data, error } = await supabase
      .from("feed_banner_images")
      .select("id, image_url, alt")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      if (error.code === "PGRST205") return [];
      throw error;
    }
    return data || [];
  },

  pickForNow<T>(images: T[], now = Date.now()): T | null {
    if (!images.length) return null;
    return images[Math.floor(now / FEED_BANNER_ROTATION_MS) % images.length];
  },
};
