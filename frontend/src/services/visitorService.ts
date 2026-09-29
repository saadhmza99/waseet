import { supabase } from "@/lib/supabase";

export interface VisitorProfile {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export const visitorService = {
  async getMine(userId: string): Promise<VisitorProfile | null> {
    const { data, error } = await supabase
      .from("visitors")
      .select("id, user_id, name, phone, email, bio, avatar_url, created_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async updateMine(input: { name: string; phone: string; email?: string; bio?: string; avatarUrl?: string | null }) {
    const { error } = await supabase.rpc("update_visitor_profile", {
      p_name: input.name,
      p_phone: input.phone,
      p_email: input.email || null,
      p_bio: input.bio || null,
      p_avatar_url: input.avatarUrl || null,
    });
    if (error) throw error;
  },
};
