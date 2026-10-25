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

/** Flat English columns for public.projects (no details JSONB). */
export type ProjectCatalogData = Record<string, unknown>;

const tableOf = (kind: CatalogKind) => (kind === "property" ? "properties" : "projects");

const insertProperty = async (userId: string, data: CatalogItemData) => {
  const { data: row, error } = await supabase
    .from("properties")
    .insert({
      user_id: userId,
      title: data.title?.trim() || "Bien",
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

/* ------------------------------------------------------------------ */
/* Project documents live in public.projects_documents (not JSONB).    */
/* Reads go through RLS: private documents only come back for the      */
/* owner of the parent project.                                        */
/* ------------------------------------------------------------------ */

type ProjectDocumentInput = {
  id?: string;
  title?: string;
  type?: string;
  url?: string;
  privacy?: string;
};

export type ProjectDocumentRow = {
  id: string;
  title: string;
  type: string;
  url: string;
  privacy: "public" | "private";
};

const documentFromRow = (row: Record<string, unknown>): ProjectDocumentRow => ({
  id: String(row.id || ""),
  title: String(row.title || ""),
  type: String(row.type || "Brochure commerciale"),
  url: String(row.url || ""),
  privacy: row.privacy === "private" ? "private" : "public",
});

const listProjectDocuments = async (projectId: string): Promise<ProjectDocumentRow[]> => {
  const { data, error } = await supabase
    .from("projects_documents")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => documentFromRow(row as Record<string, unknown>));
};

/** Replace a project's documents with the edited list, preserving order. */
const syncProjectDocuments = async (projectId: string, documents: ProjectDocumentInput[]) => {
  const { error: deleteError } = await supabase
    .from("projects_documents")
    .delete()
    .eq("project_id", projectId);
  if (deleteError) throw deleteError;

  const rows = (documents || [])
    .slice(0, 40)
    .map((doc, index) => ({
      project_id: projectId,
      title: String(doc.title || "").trim().slice(0, 120),
      type: String(doc.type || "Brochure commerciale").trim().slice(0, 80) || "Brochure commerciale",
      url: String(doc.url || "").trim().slice(0, 2000),
      privacy: doc.privacy === "private" ? "private" : "public",
      position: index,
    }))
    .filter((doc) => doc.title || doc.url);

  if (rows.length) {
    const { error } = await supabase.from("projects_documents").insert(rows);
    if (error) throw error;
  }
  return listProjectDocuments(projectId);
};

const insertProject = async (userId: string, data: ProjectCatalogData) => {
  const { documents, ...projectData } = data;
  const { data: row, error } = await supabase
    .from("projects")
    .insert({
      ...projectData,
      user_id: userId,
      title: String(data.title || "").trim() || "Projet",
    })
    .select()
    .single();

  if (error) throw error;
  if (Array.isArray(documents)) {
    const synced = await syncProjectDocuments(row.id, documents as ProjectDocumentInput[]);
    return { ...row, documents: synced };
  }
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
    return insertProperty(userId, data);
  },

  createProject(userId: string, data: ProjectCatalogData) {
    return insertProject(userId, data);
  },

  async getProject(id: string) {
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) return data;
    const documents = await listProjectDocuments(id);
    return { ...data, documents };
  },

  async updateProject(id: string, userId: string, data: ProjectCatalogData) {
    const { documents, ...projectData } = data;
    const { data: row, error } = await supabase
      .from("projects")
      .update({
        ...projectData,
        title: String(data.title || "").trim() || "Projet",
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    if (Array.isArray(documents)) {
      const synced = await syncProjectDocuments(id, documents as ProjectDocumentInput[]);
      return { ...row, documents: synced };
    }
    return row;
  },

  getPropertiesByUser(userId: string, limit?: number, offset = 0) {
    return listByUser("property", userId, limit, offset);
  },

  getProjectsByUser(userId: string, limit?: number, offset = 0) {
    return listByUser("project", userId, limit, offset);
  },

  async listProjects(limit = 80, offset = 0, filters?: { city?: string | null }) {
    // Seeded rows may repeat the same Kerix project for each linked pro.
    // Fetch a wider window, then dedupe by attributes.source_project_id (or id).
    const city = (filters?.city || "").trim();
    const fetchLimit = Math.max(limit * 4, limit);
    let query = supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (city) query = query.ilike("city", `%${city}%`);
    const { data, error } = await query.range(offset, offset + Math.max(fetchLimit - 1, 0));
    if (error) throw error;
    const seen = new Set<string>();
    const unique: typeof data = [];
    for (const row of data || []) {
      const attrs = row?.attributes && typeof row.attributes === "object" ? row.attributes : {};
      const key = String((attrs as { source_project_id?: string }).source_project_id || row.id);
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(row);
      if (unique.length >= limit) break;
    }
    return unique;
  },

  async listProperties(limit = 80, offset = 0, filters?: { city?: string | null }) {
    const city = (filters?.city || "").trim();
    let query = supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    if (city) query = query.or(`city.ilike.%${city}%,details->>city.ilike.%${city}%`);
    const { data, error } = await query.range(offset, offset + Math.max(limit - 1, 0));
    if (error) throw error;
    return data || [];
  },

  async getProperty(id: string) {
    const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
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
