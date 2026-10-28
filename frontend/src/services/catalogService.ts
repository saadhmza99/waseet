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
  // Projects: read through projects_directory so équipe/docs stay server-redacted
  // for non-partners (open_dossier projects keep full fields).
  const table = kind === "project" ? "projects_directory" : tableOf(kind);
  let query = supabase
    .from(table)
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
    const { data, error } = await supabase.rpc("project_public", { p_id: id });
    if (error) throw error;
    return data;
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

  async listProjects(
    limit = 80,
    offset = 0,
    filters?: { city?: string | null; projectType?: string | null; featuredPromoters?: boolean },
  ) {
    // Seeded rows may repeat the same Kerix project for each linked pro.
    // Fetch a wider window, then dedupe by attributes.source_project_id (or id).
    // Reads go through projects_directory so équipe/partners are redacted server-side
    // unless open_dossier (or the viewer owns the project / is a partner).
    const city = (filters?.city || "").trim();
    const projectType = (filters?.projectType || "").trim();
    const featured = Boolean(filters?.featuredPromoters);
    // Over-fetch: many seeded rows have empty covers and are dropped below.
    const fetchLimit = Math.max(limit * 10, 120);
    let query = supabase.from("projects_directory").select("*");
    // Always surface open dossiers first; redaction is enforced in projects_directory.
    query = query.order("open_dossier", { ascending: false }).order("created_at", { ascending: false });
    if (featured) query = query.eq("featured_promoter", true);
    if (city) query = query.ilike("city", `%${city}%`);
    if (projectType) query = query.eq("project_type", projectType);
    const { data, error } = await query.range(offset, offset + Math.max(fetchLimit - 1, 0));
    if (error) throw error;

    const imageUrls = (row: (typeof data)[number]): string[] => {
      const out: string[] = [];
      const cover = String(row?.cover_image || "").trim();
      if (cover) out.push(cover);
      if (Array.isArray(row?.images)) {
        for (const item of row.images) {
          const url = String(item || "").trim();
          if (url) out.push(url);
        }
      }
      return out.filter((url) => /^https?:\/\//i.test(url));
    };
    const hasRealImage = (row: (typeof data)[number]) => imageUrls(row).length > 0;
    const isChridariCover = (row: (typeof data)[number]) =>
      imageUrls(row).some((url) => /chridari/i.test(url));

    const seen = new Set<string>();
    const unique: NonNullable<typeof data> = [];
    for (const row of data || []) {
      if (!hasRealImage(row)) continue;
      const attrs = row?.attributes && typeof row.attributes === "object" ? row.attributes : {};
      const key = String((attrs as { source_project_id?: string }).source_project_id || row.id);
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(row);
    }
    // Prefer open dossiers, then covers without a Chridari watermark URL.
    unique.sort((a, b) => {
      const openA = a?.open_dossier ? 1 : 0;
      const openB = b?.open_dossier ? 1 : 0;
      if (openA !== openB) return openB - openA;
      const dirtyA = isChridariCover(a) ? 1 : 0;
      const dirtyB = isChridariCover(b) ? 1 : 0;
      if (dirtyA !== dirtyB) return dirtyA - dirtyB;
      return 0;
    });
    return unique.slice(0, limit);
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

  /** Exact Supabase row count for Discover Projets. */
  async countProjects(filters?: { city?: string | null; projectType?: string | null; featuredPromoters?: boolean }): Promise<number> {
    const city = (filters?.city || "").trim();
    const projectType = (filters?.projectType || "").trim();
    const featured = Boolean(filters?.featuredPromoters);
    let query = supabase.from("projects_directory").select("id", { count: "exact", head: true });
    if (featured) query = query.eq("featured_promoter", true);
    if (city) query = query.ilike("city", `%${city}%`);
    if (projectType) query = query.eq("project_type", projectType);
    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  },

  /** Exact Supabase row count for Discover Biens. */
  async countProperties(filters?: { city?: string | null }): Promise<number> {
    const city = (filters?.city || "").trim();
    let query = supabase.from("properties").select("id", { count: "exact", head: true });
    if (city) query = query.or(`city.ilike.%${city}%,details->>city.ilike.%${city}%`);
    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
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
