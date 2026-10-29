import { supabase } from "@/lib/supabase";

export type ArticleRow = {
  id: string;
  user_id: string;
  cover_url?: string | null;
  rubrique?: string | null;
  title: string;
  excerpt?: string | null;
  published_on?: string | null;
  url?: string | null;
  profiles?:
    | {
        full_name?: string | null;
        username?: string | null;
        avatar_url?: string | null;
        profile_type?: string | null;
        is_verified?: boolean | null;
      }
    | {
        full_name?: string | null;
        username?: string | null;
        avatar_url?: string | null;
        profile_type?: string | null;
        is_verified?: boolean | null;
      }[]
    | null;
};

export type FormationRow = {
  id: string;
  user_id: string;
  cover_url?: string | null;
  title: string;
  excerpt?: string | null;
  starts_on?: string | null;
  place?: string | null;
  url?: string | null;
};

export type ArticleInput = {
  cover_url?: string | null;
  rubrique?: string | null;
  title: string;
  excerpt?: string | null;
  published_on?: string | null;
  url?: string | null;
};

export type FormationInput = {
  cover_url?: string | null;
  title: string;
  excerpt?: string | null;
  starts_on?: string | null;
  place?: string | null;
  url?: string | null;
};

export const institutionService = {
  async listPublicArticles(): Promise<ArticleRow[]> {
    const { data, error } = await supabase
      .from("articles")
      .select(
        "id, user_id, cover_url, rubrique, title, excerpt, published_on, url, profiles!user_id(full_name, username, avatar_url, profile_type, is_verified)",
      )
      .order("published_on", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw error;
    return (data || []) as ArticleRow[];
  },

  async listArticles(userId: string): Promise<ArticleRow[]> {
    const { data, error } = await supabase
      .from("articles")
      .select("id, user_id, cover_url, rubrique, title, excerpt, published_on, url")
      .eq("user_id", userId)
      .order("published_on", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as ArticleRow[];
  },

  async createArticle(userId: string, input: ArticleInput) {
    const { data, error } = await supabase
      .from("articles")
      .insert({
        user_id: userId,
        cover_url: input.cover_url || null,
        rubrique: (input.rubrique || "").trim(),
        title: input.title.trim(),
        excerpt: input.excerpt?.trim() || null,
        published_on: input.published_on || null,
        url: input.url?.trim() || null,
      })
      .select("id, user_id, cover_url, rubrique, title, excerpt, published_on, url")
      .single();
    if (error) throw error;
    return data as ArticleRow;
  },

  async deleteArticle(id: string) {
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) throw error;
  },

  async listFormations(userId: string): Promise<FormationRow[]> {
    const { data, error } = await supabase
      .from("formations")
      .select("id, user_id, cover_url, title, excerpt, starts_on, place, url")
      .eq("user_id", userId)
      .order("starts_on", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as FormationRow[];
  },

  async createFormation(userId: string, input: FormationInput) {
    const { data, error } = await supabase
      .from("formations")
      .insert({
        user_id: userId,
        cover_url: input.cover_url || null,
        title: input.title.trim(),
        excerpt: input.excerpt?.trim() || null,
        starts_on: input.starts_on || null,
        place: input.place?.trim() || null,
        url: input.url?.trim() || null,
      })
      .select("id, user_id, cover_url, title, excerpt, starts_on, place, url")
      .single();
    if (error) throw error;
    return data as FormationRow;
  },

  async deleteFormation(id: string) {
    const { error } = await supabase.from("formations").delete().eq("id", id);
    if (error) throw error;
  },
};
