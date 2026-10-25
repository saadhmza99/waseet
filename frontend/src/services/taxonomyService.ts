import { supabase } from "@/lib/supabase";

export type InternalCategory = {
  id: number;
  category_id: number;
  code: string;
  sub_category: string;
  detailed_sub_category: string;
};

const byCode = (a: InternalCategory, b: InternalCategory) =>
  a.code.localeCompare(b.code, undefined, { numeric: true });

export const taxonomyService = {
  async listInternalCategories(): Promise<InternalCategory[]> {
    const { data, error } = await supabase
      .from("internal_categories")
      .select("id, category_id, code, sub_category, detailed_sub_category");
    if (error) throw error;
    return ((data || []) as InternalCategory[]).sort(byCode);
  },

  async getProfileInternalCategoryId(profileId: string): Promise<number | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("internal_category_id")
      .eq("id", profileId)
      .maybeSingle();
    if (error) throw error;
    return (data?.internal_category_id as number | null) ?? null;
  },

  async getProfileInternalCategoryIds(profileId: string): Promise<number[]> {
    const { data, error } = await supabase
      .from("profile_internal_categories")
      .select("internal_category_id, is_primary, created_at")
      .eq("profile_id", profileId)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true });
    if (error) throw error;
    const ids = (data || [])
      .map((row) => row.internal_category_id as number)
      .filter((id) => typeof id === "number");
    if (ids.length) return ids;
    const fallback = await this.getProfileInternalCategoryId(profileId);
    return fallback == null ? [] : [fallback];
  },

  async setProfileInternalCategoryId(profileId: string, internalCategoryId: number) {
    await this.setProfileInternalCategoryIds(profileId, [internalCategoryId]);
  },

  /** Replace all specialties; first id is primary (drives post/service history). */
  async setProfileInternalCategoryIds(profileId: string, internalCategoryIds: number[]) {
    const unique = Array.from(new Set(internalCategoryIds.filter((id) => Number.isFinite(id))));
    if (!unique.length) throw new Error("At least one internal category is required");

    const { error: deleteError } = await supabase
      .from("profile_internal_categories")
      .delete()
      .eq("profile_id", profileId);
    if (deleteError) throw deleteError;

    const rows = unique.map((id, index) => ({
      profile_id: profileId,
      internal_category_id: id,
      is_primary: index === 0,
    }));
    const { error: insertError } = await supabase.from("profile_internal_categories").insert(rows);
    if (insertError) throw insertError;

    // Trigger syncs primary → profiles.internal_category_id; set explicitly as well.
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ internal_category_id: unique[0] })
      .eq("id", profileId);
    if (updateError) throw updateError;
  },

  // null: the professional has not picked a category. undefined: the taxonomy is not available.
  async getProfileCategoryId(profileId: string): Promise<number | null | undefined> {
    const { data, error } = await supabase
      .from("profiles")
      .select("internal_category:internal_categories!profiles_internal_category_id_fkey(category_id)")
      .eq("id", profileId)
      .maybeSingle();
    if (error) return undefined;
    const internal = data?.internal_category as { category_id?: number } | null | undefined;
    return internal?.category_id ?? null;
  },

  // Same convention: null when no category is picked, undefined when the taxonomy is not available.
  async getProfileFeedSubCategory(profileId: string): Promise<string | null | undefined> {
    const { data, error } = await supabase
      .from("profiles")
      .select("internal_category:internal_categories!profiles_internal_category_id_fkey(feed_sub_category:feed_sub_categories(slug))")
      .eq("id", profileId)
      .maybeSingle();
    if (error) return undefined;
    const internal = data?.internal_category as { feed_sub_category?: { slug?: string } | null } | null | undefined;
    return internal?.feed_sub_category?.slug ?? null;
  },
};
