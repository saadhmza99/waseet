import { supabase } from "@/lib/supabase";

export type CatalogKind = "property" | "project";

export type CatalogItemData = {
  title?: string;
  description?: string;
  city?: string | null;
  region?: string | null;
  price?: string | null;
  surface?: string | null;
  beds?: number | null;
  baths?: number | null;
  images?: string[];
  details?: Record<string, unknown> | null;
};

const tableOf = (kind: CatalogKind) => (kind === "property" ? "properties" : "projects");

const insertRow = async (kind: CatalogKind, userId: string, data: CatalogItemData) => {
  const { data: row, error } = await supabase
    .from(tableOf(kind))
    .insert({
      user_id: userId,
      title: data.title?.trim() || (kind === "property" ? "Bien" : "Projet"),
      description: data.description || null,
      city: data.city?.trim() || null,
      region: data.region?.trim() || null,
      price: data.price || null,
      surface: data.surface || null,
      beds: data.beds ?? null,
      baths: data.baths ?? null,
      images: data.images || [],
      details: data.details || {},
    })
    .select()
    .single();

  if (error) throw error;
  return row;
};

const listByUser = async (kind: CatalogKind, userId: string, limit?: number, offset = 0) => {
  let query = supabase
    .from(tableOf(kind))
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (limit != null) query = query.range(offset, offset + limit);

  const { data, error, count } = await query;
  if (error) throw error;
  const rows = data || [];
  return Object.assign(rows, { totalCount: count ?? rows.length });
};

const countByUser = async (kind: CatalogKind, userId: string) => {
  const { count, error } = await supabase
    .from(tableOf(kind))
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw error;
  return count || 0;
};

export const catalogService = {
  createProperty(userId: string, data: CatalogItemData) {
    return insertRow("property", userId, data);
  },

  createProject(userId: string, data: CatalogItemData) {
    return insertRow("project", userId, data);
  },

  async getProject(id: string) {
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async updateProject(id: string, userId: string, data: CatalogItemData) {
    const { data: row, error } = await supabase
      .from("projects")
      .update({
        title: data.title?.trim() || "Projet",
        description: data.description || null,
        city: data.city?.trim() || null,
        region: data.region?.trim() || null,
        surface: data.surface || null,
        images: data.images || [],
        details: data.details || {},
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return row;
  },

  getPropertiesByUser(userId: string, limit?: number, offset = 0) {
    return listByUser("property", userId, limit, offset);
  },

  getProjectsByUser(userId: string, limit?: number, offset = 0) {
    return listByUser("project", userId, limit, offset);
  },

  countPropertiesByUser(userId: string) {
    return countByUser("property", userId);
  },

  countProjectsByUser(userId: string) {
    return countByUser("project", userId);
  },

  async countPortfolioByUser(userId: string) {
    const [properties, projects] = await Promise.all([
      countByUser("property", userId),
      countByUser("project", userId),
    ]);
    return properties + projects;
  },
};
