import { supabase } from "@/lib/supabase";

export type MuteScope = "posts" | "services" | "both";

export type MutedAccount = {
  mutedId: string;
  username: string;
  avatarUrl: string | null;
  profileType?: string | null;
  mutePosts: boolean;
  muteServices: boolean;
  mutedAt: string;
};

export const muteService = {
  async muteAccount(muterId: string, mutedId: string, scope: MuteScope) {
    const mute_posts = scope === "posts" || scope === "both";
    const mute_services = scope === "services" || scope === "both";
    const { data, error } = await supabase
      .from("muted_accounts")
      .upsert(
        { muter_id: muterId, muted_id: mutedId, mute_posts, mute_services },
        { onConflict: "muter_id,muted_id" }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async unmuteAccount(muterId: string, mutedId: string) {
    const { error } = await supabase
      .from("muted_accounts")
      .delete()
      .eq("muter_id", muterId)
      .eq("muted_id", mutedId);
    if (error) throw error;
  },

  async getMutedAccounts(muterId: string): Promise<MutedAccount[]> {
    const { data, error } = await supabase
      .from("muted_accounts")
      .select(`
        muted_id,
        mute_posts,
        mute_services,
        created_at,
        profiles:muted_id (
          username,
          avatar_url,
          profile_type
        )
      `)
      .eq("muter_id", muterId)
      .order("created_at", { ascending: false });
    if (error) {
      if (error.code === "PGRST205") return [];
      throw error;
    }
    return (data || []).map((row: any) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return {
        mutedId: row.muted_id,
        username: profile?.username || "",
        avatarUrl: profile?.avatar_url || null,
        profileType: profile?.profile_type || null,
        mutePosts: Boolean(row.mute_posts),
        muteServices: Boolean(row.mute_services),
        mutedAt: row.created_at,
      };
    });
  },

  async getMutedIds(muterId: string): Promise<{ posts: Set<string>; services: Set<string> }> {
    const rows = await this.getMutedAccounts(muterId);
    const posts = new Set<string>();
    const services = new Set<string>();
    rows.forEach((row) => {
      if (row.mutePosts) posts.add(row.mutedId);
      if (row.muteServices) services.add(row.mutedId);
    });
    return { posts, services };
  },
};
