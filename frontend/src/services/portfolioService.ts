import { supabase } from "@/lib/supabase";

export const portfolioService = {
  async getPortfolioItemsByUser(userId: string) {
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addPortfolioItems(userId: string, imageUrls: string[], label?: string) {
    if (!imageUrls.length) return [];

    const payload = imageUrls.map((url) => ({
      user_id: userId,
      image_url: url,
      label: label || "Portfolio",
    }));

    const { data, error } = await supabase
      .from("portfolio_items")
      .insert(payload)
      .select();

    if (error) throw error;
    return data || [];
  },
};

