import { supabase } from "@/lib/supabase";

export type RealisationRow = {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  images?: string[] | null;
  cover?: string | null;
  city?: string | null;
  internal_category_id?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type RealisationInput = {
  title: string;
  description?: string | null;
  images?: string[];
  cover?: string | null;
  city?: string | null;
  internalCategoryId?: number | null;
};

const asImageList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return [];
};

const coverOf = (images: string[], cover?: string | null) =>
  (cover || "").trim() || images[0] || null;

export const realisationService = {
  normalize(row: RealisationRow): RealisationRow {
    const images = asImageList(row.images);
    return {
      ...row,
      title: (row.title || "").trim() || "Réalisation",
      images,
      cover: coverOf(images, row.cover),
    };
  },

  async create(userId: string, input: RealisationInput) {
    const title = (input.title || "").trim();
    if (!title) throw new Error("Title required");
    const images = asImageList(input.images);
    const { data, error } = await supabase
      .from("realisations")
      .insert({
        user_id: userId,
        title,
        description: (input.description || "").trim() || null,
        images,
        cover: coverOf(images, input.cover),
        city: (input.city || "").trim() || null,
        internal_category_id: input.internalCategoryId ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return this.normalize(data as RealisationRow);
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("realisations").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? this.normalize(data as RealisationRow) : null;
  },

  async listByUser(userId: string, limit?: number, offset = 0) {
    let query = supabase
      .from("realisations")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (limit != null) query = query.range(offset, offset + limit);
    const { data, error, count } = await query;
    if (error) throw error;
    const rows = (data || []).map((row) => this.normalize(row as RealisationRow));
    return Object.assign(rows, { totalCount: count ?? rows.length });
  },

  async countByUser(userId: string) {
    const { count, error } = await supabase
      .from("realisations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (error) throw error;
    return count || 0;
  },

  async update(id: string, userId: string, input: Partial<RealisationInput>) {
    const patch: Record<string, unknown> = {};
    if (input.title !== undefined) patch.title = (input.title || "").trim();
    if (input.description !== undefined) patch.description = (input.description || "").trim() || null;
    if (input.images !== undefined) {
      const images = asImageList(input.images);
      patch.images = images;
      patch.cover = coverOf(images, input.cover);
    } else if (input.cover !== undefined) {
      patch.cover = (input.cover || "").trim() || null;
    }
    if (input.city !== undefined) patch.city = (input.city || "").trim() || null;
    if (input.internalCategoryId !== undefined) patch.internal_category_id = input.internalCategoryId;

    const { data, error } = await supabase
      .from("realisations")
      .update(patch)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw error;
    return this.normalize(data as RealisationRow);
  },

  async remove(id: string, userId: string) {
    const { error } = await supabase.from("realisations").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
  },
};
