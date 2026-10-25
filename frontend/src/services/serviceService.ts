import { supabase } from "@/lib/supabase";
import { offerFromRow, priceLabel, rowFromOffer, serviceMainImage, zoneLabel, type ServiceOffer } from "@/lib/serviceOffer";
import { isFournisseurInternalCode, isPromoteurInternalCode } from "@/lib/taxonomy";

export type ServiceProfile = {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  location?: string | null;
  profession?: string | null;
  website_url?: string | null;
  phone?: string | null;
  email?: string | null;
  internal_category_id?: number | null;
  internal_categories?: {
    code?: string | null;
    detailed_sub_category?: string | null;
    feed_sub_categories?: {
      slug?: string | null;
      categories?: { slug?: string | null } | null;
    } | null;
  } | null;
};

export type ServiceRow = Record<string, unknown> & {
  id: string;
  user_id: string;
  title: string;
  created_at?: string;
  internal_category_id?: number | null;
  internal_categories?: {
    code?: string | null;
    detailed_sub_category?: string | null;
    feed_sub_categories?: {
      slug?: string | null;
      categories?: { slug?: string | null } | null;
    } | null;
  } | null;
  profiles?: ServiceProfile | ServiceProfile[] | null;
};

const SERVICE_INTERNAL_CATEGORY_EMBED = `
  internal_categories:internal_category_id (
    code,
    detailed_sub_category,
    feed_sub_categories (
      slug,
      categories ( slug )
    )
  )
`;

/** Full row + profile for detail pages. */
const SERVICE_SELECT = `
  *,
  ${SERVICE_INTERNAL_CATEGORY_EMBED},
  profiles:user_id (
    id,
    username,
    full_name,
    avatar_url,
    location,
    profession,
    website_url,
    phone,
    email,
    internal_category_id,
    internal_categories!profiles_internal_category_id_fkey (
      code,
      detailed_sub_category,
      feed_sub_categories (
        slug,
        categories ( slug )
      )
    )
  )
`;

/** Lean list select for Discover / feed cards — avoids `*` and unused profile fields. */
const SERVICE_LIST_SELECT = `
  id,
  user_id,
  title,
  description,
  category,
  internal_category_id,
  cover,
  gallery,
  kinds,
  included,
  options,
  price_mode,
  amount,
  duration,
  zone_mode,
  cities,
  region,
  travel,
  remote,
  audiences,
  audience_other,
  missions,
  created_at,
  ${SERVICE_INTERNAL_CATEGORY_EMBED},
  profiles:user_id (
    id,
    username,
    full_name,
    avatar_url,
    location,
    internal_categories!profiles_internal_category_id_fkey (
      code,
      feed_sub_categories (
        slug,
        categories ( slug )
      )
    )
  )
`;

const asProfile = (row: ServiceRow): ServiceProfile | null => {
  const raw = row.profiles;
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] || null : raw;
};

export const serviceFirmName = (row: ServiceRow) => {
  const profile = asProfile(row);
  return profile?.full_name || profile?.username || "Professionnel";
};

export const serviceFeedTags = (row: ServiceRow) => {
  const serviceInternal = row.internal_categories;
  const profileInternal = asProfile(row)?.internal_categories;
  const internal = serviceInternal?.feed_sub_categories ? serviceInternal : profileInternal;
  const feed = internal?.feed_sub_categories;
  const code = internal?.code || null;
  return {
    feed_category: feed?.categories?.slug || "",
    feed_sub_category: feed?.slug || "",
    is_promoteur: isPromoteurInternalCode(code),
    is_fournisseur: isFournisseurInternalCode(code) || feed?.slug === "fournisseurs",
  };
};

export const serviceService = {
  async createService(userId: string, offer: ServiceOffer) {
    const { data, error } = await supabase
      .from("services")
      .insert({
        user_id: userId,
        ...rowFromOffer(offer),
      })
      .select()
      .single();
    if (error) throw error;
    return data as ServiceRow;
  },

  async getService(id: string) {
    const { data, error } = await supabase.from("services").select(SERVICE_SELECT).eq("id", id).maybeSingle();
    if (error) throw error;
    return data as ServiceRow | null;
  },

  async listServices(limit = 80, offset = 0, filters?: { city?: string | null }) {
    const city = (filters?.city || "").trim();
    let query = supabase
      .from("services")
      .select(SERVICE_LIST_SELECT)
      .order("created_at", { ascending: false });
    if (city) {
      const safe = city.replace(/[,()]/g, " ").trim();
      // Maroc = nationwide; otherwise match city in the cities array.
      query = query.or(`zone_mode.eq.maroc,cities.cs.{"${safe}"}`);
    }
    const { data, error } = await query.range(offset, offset + Math.max(limit - 1, 0));
    if (error) throw error;
    return (data || []) as ServiceRow[];
  },

  async getServicesByUser(userId: string, limit?: number, offset = 0) {
    let query = supabase
      .from("services")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (limit != null) query = query.range(offset, offset + limit);

    const { data, error, count } = await query;
    if (error) throw error;
    const rows = (data || []) as ServiceRow[];
    return Object.assign(rows, { totalCount: count ?? rows.length });
  },

  async countByUser(userId: string) {
    const { count, error } = await supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (error) throw error;
    return count || 0;
  },

  async updateService(id: string, userId: string, offer: ServiceOffer) {
    const { data, error } = await supabase
      .from("services")
      .update(rowFromOffer(offer))
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return data as ServiceRow;
  },

  /** Shape used by profile ListingCard-style service cards. */
  toCardProps(row: ServiceRow) {
    const offer = offerFromRow(row);
    return {
      id: row.id,
      user_id: row.user_id,
      title: offer.title || "Service",
      description: offer.description,
      profession: offer.category,
      location: zoneLabel(offer),
      price_range: priceLabel(offer),
      image_url: serviceMainImage(offer),
      image_count: Math.max(1, (offer.gallery.length || (offer.cover ? 1 : 0))),
      created_at: row.created_at,
      offer,
    };
  },
};
