import { hasRealLogoUrl, isMonogramAvatarUrl, NON_REAL_LOGO_FRAGMENTS } from "@/lib/avatar";
import { clampBio } from "@/lib/bio";
import { feedCategoryCodeExcludePrefix, feedCategoryCodePrefix } from "@/lib/taxonomy";
import { supabase } from '@/lib/supabase';

export interface ProfileData {
  username: string;
  full_name?: string;
  profession?: string | null;
  location?: string | null;
  bio?: string;
  about_text?: string | null;
  phone?: string | null;
  email?: string | null;
  website_url?: string | null;
  ice?: string | null;
  avatar_url?: string | null;
  cover_photo_url?: string | null;
  profile_type: 'individual' | 'enterprise' | 'institution';
  institution_kind?: 'federation' | 'order' | 'chamber' | 'public' | 'media' | 'observatory' | null;
}

/** Shared Discover filters for list + exact count queries. */
export type DiscoverListFilters = {
  city?: string | null;
  query?: string | null;
  feedCategory?: string | null;
  feedSubCategory?: string | null;
  /** Exact internal_categories.code values (e.g. BET D14–D21 multi-select). */
  internalCodes?: string[] | null;
  promoteurOnly?: boolean;
  fournisseurOnly?: boolean;
};

const normalizeInternalCodes = (filters?: DiscoverListFilters) =>
  (filters?.internalCodes || []).map((c) => String(c || "").trim()).filter(Boolean);

const applyProfessionalsFilters = <
  T extends { eq: Function; like: Function; not: Function; ilike: Function; or: Function; in: Function },
>(
  query: T,
  filters?: DiscoverListFilters,
): T => {
  const city = (filters?.city || "").trim();
  const queryText = (filters?.query || "").trim().replace(/[%_,]/g, " ").replace(/\s+/g, " ");
  const feedCategory = (filters?.feedCategory || "").trim();
  const feedSubCategory = (filters?.feedSubCategory || "").trim();
  const internalCodes = normalizeInternalCodes(filters);
  const promoteurOnly = Boolean(filters?.promoteurOnly);
  const fournisseurOnly = Boolean(filters?.fournisseurOnly);
  const categoryPrefix =
    !promoteurOnly &&
    !fournisseurOnly &&
    !feedSubCategory &&
    !internalCodes.length &&
    feedCategory &&
    feedCategory !== "tout"
      ? feedCategoryCodePrefix(feedCategory)
      : null;

  let next = query;
  if (city) next = next.ilike("location", `%${city}%`);
  if (queryText) {
    const needle = `"%${queryText}%"`;
    next = next.or(
      `full_name.ilike.${needle},username.ilike.${needle},profession.ilike.${needle},location.ilike.${needle}`,
    );
  }
  if (promoteurOnly) {
    // Public batch only. The flag is set in the database; this query never scans the rest.
    next = next.eq("featured_promoter", true);
  } else {
    next = next.eq("directory_visible", true);
  }
  if (fournisseurOnly) {
    next = next.like("profile_internal_categories.internal_categories.code", "8.5.%");
  } else if (internalCodes.length) {
    next = next.in("profile_internal_categories.internal_categories.code", internalCodes);
  } else if (feedSubCategory) {
    next = next.eq(
      "profile_internal_categories.internal_categories.feed_sub_categories.slug",
      feedSubCategory,
    );
  } else if (categoryPrefix) {
    next = next.like("profile_internal_categories.internal_categories.code", `${categoryPrefix}%`);
    const exclude = feedCategoryCodeExcludePrefix(feedCategory);
    if (exclude) {
      next = next.not("profile_internal_categories.internal_categories.code", "like", `${exclude}%`);
    }
  } else if (feedCategory && feedCategory !== "tout") {
    next = next.eq(
      "profile_internal_categories.internal_categories.feed_sub_categories.categories.slug",
      feedCategory,
    );
  }
  return next;
};

const professionalsTaxonomyEmbed = (filters?: DiscoverListFilters) => {
  const feedCategory = (filters?.feedCategory || "").trim();
  const feedSubCategory = (filters?.feedSubCategory || "").trim();
  const internalCodes = normalizeInternalCodes(filters);
  const promoteurOnly = Boolean(filters?.promoteurOnly);
  const fournisseurOnly = Boolean(filters?.fournisseurOnly);
  const categoryPrefix =
    !promoteurOnly &&
    !fournisseurOnly &&
    !feedSubCategory &&
    !internalCodes.length &&
    feedCategory &&
    feedCategory !== "tout"
      ? feedCategoryCodePrefix(feedCategory)
      : null;
  const needsCodeFilter = fournisseurOnly || Boolean(categoryPrefix) || internalCodes.length > 0;
  const needsFeedFilter =
    !internalCodes.length &&
    (Boolean(feedSubCategory) ||
      (Boolean(feedCategory && feedCategory !== "tout") && !categoryPrefix));

  const picEmbed = needsFeedFilter
    ? `profile_internal_categories!inner (
        is_primary,
        internal_categories!inner (
          code,
          detailed_sub_category,
          feed_sub_categories!inner (
            slug,
            categories!inner ( slug )
          )
        )
      )`
    : needsCodeFilter
      ? `profile_internal_categories!inner (
          is_primary,
          internal_categories!inner (
            code,
            detailed_sub_category,
            feed_sub_categories ( slug, categories ( slug ) )
          )
        )`
      : `profile_internal_categories (
          is_primary,
          internal_categories (
            code,
            detailed_sub_category,
            feed_sub_categories ( slug, categories ( slug ) )
          )
        )`;

  return `
    internal_categories!profiles_internal_category_id_fkey (
      code,
      detailed_sub_category,
      feed_sub_categories ( slug, categories ( slug ) )
    ),
    ${picEmbed}
  `;
};

const withClampedBio = <T extends { bio?: string | null } | null>(row: T): T => {
  if (!row || row.bio == null) return row;
  const next = clampBio(row.bio);
  return next === row.bio ? row : { ...row, bio: next };
};

/** Specialty / category key used to interleave Discover "tout" results. */
const discoverMixKey = (row: Record<string, unknown>) => {
  const pics = row.profile_internal_categories;
  const list = Array.isArray(pics) ? pics : pics ? [pics] : [];
  const primary =
    list.find((item) => Boolean((item as { is_primary?: boolean })?.is_primary)) || list[0];
  const nested = (primary as { internal_categories?: Record<string, unknown> } | undefined)
    ?.internal_categories;
  const code = String(nested?.code || "").trim();
  if (code) return code;
  const feed = nested?.feed_sub_categories as
    | { slug?: string; categories?: { slug?: string } }
    | { slug?: string; categories?: { slug?: string } }[]
    | undefined;
  const feedOne = Array.isArray(feed) ? feed[0] : feed;
  const sub = String(feedOne?.slug || "").trim();
  if (sub) return sub;
  const cat = String(feedOne?.categories?.slug || "").trim();
  if (cat) return cat;
  const legacy = row.internal_categories as { code?: string } | null | undefined;
  return String(legacy?.code || row.profession || "_").trim() || "_";
};

/** Round-robin rows across specialty buckets so "tout" isn't one field then the next. */
const interleaveByMixKey = <T extends Record<string, unknown>>(rows: T[]) => {
  const buckets = new Map<string, T[]>();
  for (const row of rows) {
    const key = discoverMixKey(row);
    const list = buckets.get(key);
    if (list) list.push(row);
    else buckets.set(key, [row]);
  }
  const queues = [...buckets.values()];
  const out: T[] = [];
  let guard = 0;
  while (out.length < rows.length && guard < rows.length * 4) {
    for (const queue of queues) {
      if (!queue.length) continue;
      out.push(queue.shift()!);
      if (out.length >= rows.length) break;
    }
    guard += 1;
  }
  return out;
};

/**
 * Browse ranking (no text search): real logos first, then monogram SVGs, then missing.
 * Specialty mix for "tout" applies within each tier.
 * Text search keeps DB order so relevance isn't reshuffled.
 */
const rankDiscoverBrowse = <T extends { avatar_url?: string | null } & Record<string, unknown>>(
  rows: T[],
  { mixCategories }: { mixCategories: boolean },
) => {
  const withLogo = rows.filter((row) => hasRealLogoUrl(row.avatar_url));
  const withMonogram = rows.filter((row) => isMonogramAvatarUrl(row.avatar_url));
  const withoutPhoto = rows.filter(
    (row) => !hasRealLogoUrl(row.avatar_url) && !isMonogramAvatarUrl(row.avatar_url),
  );
  if (!mixCategories) return [...withLogo, ...withMonogram, ...withoutPhoto];
  return [
    ...interleaveByMixKey(withLogo),
    ...interleaveByMixKey(withMonogram),
    ...interleaveByMixKey(withoutPhoto),
  ];
};

const PROFILE_ROW_SELECT = `*, internal_category:internal_categories!profiles_internal_category_id_fkey(code, detailed_sub_category),
        profile_internal_categories(is_primary, internal_categories(code, detailed_sub_category))`;

const discoverProfileSelect = (taxonomyEmbed: string) => `
  id,
  username,
  full_name,
  avatar_url,
  location,
  profession,
  profile_type,
  is_verified,
  created_at,
  ${taxonomyEmbed}
`;

const dedupeProfileRows = <T extends { id?: string }>(rows: T[]) => {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    const id = String(row.id || "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(row);
  }
  return out;
};

/** Every directory enterprise whose avatar is a real logo, not an initials SVG. */
const listRealLogoEnterprises = async (filters: DiscoverListFilters | undefined, taxonomyEmbed: string) => {
  let query = supabase
    .from("profiles")
    .select(discoverProfileSelect(taxonomyEmbed))
    .not("username", "is", null)
    .eq("profile_type", "enterprise")
    .not("avatar_url", "is", null)
    .neq("avatar_url", "")
    .order("full_name", { ascending: true })
    .limit(500);
  for (const fragment of NON_REAL_LOGO_FRAGMENTS) {
    query = query.not("avatar_url", "ilike", `%${fragment}%`);
  }
  query = applyProfessionalsFilters(query, filters);
  const { data, error } = await query;
  if (error) throw error;
  return dedupeProfileRows((data || []) as Array<{ id?: string; avatar_url?: string | null }>).filter((row) =>
    hasRealLogoUrl(row.avatar_url),
  );
};

/** Profiles that are not real-logo enterprises, continuing after `restSkip` raw rows. */
const listDiscoverRest = async (
  filters: DiscoverListFilters | undefined,
  taxonomyEmbed: string,
  logoIds: string[],
  restSkip: number,
  restNeed: number,
  mixCategories: boolean,
) => {
  if (restNeed <= 0) return { rows: [] as Array<{ id?: string; avatar_url?: string | null }>, rawUsed: 0 };
  const excluded = NON_REAL_LOGO_FRAGMENTS.map((fragment) => `avatar_url.ilike.%${fragment}%`).join(",");
  const notLogo = `profile_type.neq.enterprise,avatar_url.is.null,avatar_url.eq."",${excluded}`;
  const logoIdSet = new Set(logoIds);
  const collected: Array<{ id?: string; avatar_url?: string | null } & Record<string, unknown>> = [];
  const seen = new Set<string>();
  let rawUsed = 0;
  let cursor = restSkip;

  while (collected.length < restNeed) {
    let query = supabase
      .from("profiles")
      .select(discoverProfileSelect(taxonomyEmbed))
      .not("username", "is", null)
      .or(notLogo)
      .order(mixCategories ? "id" : "created_at", { ascending: mixCategories });
    if (logoIds.length) query = query.not("id", "in", `(${logoIds.join(",")})`);
    query = applyProfessionalsFilters(query, filters);
    const window = Math.max(restNeed * 3, 36);
    const { data, error } = await query.range(cursor, cursor + window - 1);
    if (error) throw error;
    const page = data || [];
    if (!page.length) break;
    for (const row of page) {
      rawUsed += 1;
      cursor += 1;
      const id = String((row as { id?: string }).id || "");
      if (!id || seen.has(id) || logoIdSet.has(id)) continue;
      seen.add(id);
      collected.push(row as { id?: string; avatar_url?: string | null } & Record<string, unknown>);
      if (collected.length >= restNeed) break;
    }
    if (page.length < window) break;
  }

  const ranked = rankDiscoverBrowse(collected, { mixCategories });
  return { rows: ranked.slice(0, restNeed), rawUsed };
};

/** Hide email always for non-owners; phone only when show_phone (or own profile). */
const maskProfilePii = async <T extends { id?: string; email?: string | null; phone?: string | null }>(
  profile: T | null,
): Promise<T | null> => {
  if (!profile?.id) return profile;
  const { data: auth } = await supabase.auth.getUser();
  const viewerId = auth.user?.id || null;
  if (viewerId && viewerId === profile.id) return profile;

  let showPhone = false;
  try {
    const { data: settings } = await supabase
      .from("user_settings")
      .select("show_phone")
      .eq("user_id", profile.id)
      .maybeSingle();
    showPhone = Boolean(settings?.show_phone);
  } catch {
    showPhone = false;
  }

  return {
    ...profile,
    email: null,
    phone: showPhone ? profile.phone : null,
  };
};

export const profileService = {
  // Create profile after signup
  async createProfile(userId: string, data: ProfileData) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...data,
        bio: data.bio != null ? clampBio(data.bio) : data.bio,
      })
      .select()
      .single();

    if (error) throw error;
    return withClampedBio(profile);
  },

  // Get profile by ID
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_ROW_SELECT)
      .eq("id", userId)
      .single();

    if (error) throw error;
    return withClampedBio(await maskProfilePii(data));
  },

  // Get profile by username
  async getProfileByUsername(username: string) {
    const slug = decodeURIComponent(username).replace(/^@/, "").trim();
    if (!slug) {
      const error = new Error("Missing username");
      throw error;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_ROW_SELECT)
      .ilike("username", slug)
      .maybeSingle();

    if (error) throw error;
    return withClampedBio(await maskProfilePii(data));
  },

  async listProfessionals(
    limit = 24,
    offset = 0,
    filters?: DiscoverListFilters,
  ): Promise<{ rows: any[]; nextOffset: number }> {
    const queryText = (filters?.query || "").trim().replace(/[%_,]/g, " ").replace(/\s+/g, " ");
    const feedCategory = (filters?.feedCategory || "").trim();
    const feedSubCategory = (filters?.feedSubCategory || "").trim();
    const internalCodes = normalizeInternalCodes(filters);
    const promoteurOnly = Boolean(filters?.promoteurOnly);
    const fournisseurOnly = Boolean(filters?.fournisseurOnly);
    const categoryPrefix =
      !promoteurOnly &&
      !fournisseurOnly &&
      !feedSubCategory &&
      !internalCodes.length &&
      feedCategory &&
      feedCategory !== "tout"
        ? feedCategoryCodePrefix(feedCategory)
        : null;
    const needsTaxonomyFilter =
      fournisseurOnly ||
      Boolean(categoryPrefix) ||
      Boolean(feedSubCategory) ||
      internalCodes.length > 0 ||
      Boolean(feedCategory && feedCategory !== "tout");

    const browsing = !queryText;
    const mixCategories = browsing && !needsTaxonomyFilter && !promoteurOnly;
    const taxonomyEmbed = professionalsTaxonomyEmbed(filters);

    let query = supabase
      .from("profiles")
      .select(
        `
        id,
        username,
        full_name,
        avatar_url,
        location,
        profession,
        profile_type,
        is_verified,
        created_at,
        ${taxonomyEmbed}
      `,
      )
      .not("username", "is", null)
      // UUID order mixes seed batches better than created_at for "tout" browse.
      // The public promoteur batch is a single alphabetical page of 50.
      .order(promoteurOnly ? "full_name" : mixCategories ? "id" : "created_at", {
        ascending: promoteurOnly || mixCategories,
      });

    query = applyProfessionalsFilters(query, filters);

    if (promoteurOnly) {
      const { data, error } = await query.range(offset, offset + Math.max(limit - 1, 0));
      if (error) throw error;
      const rows = dedupeProfileRows(data || []).slice(0, limit);
      return { rows, nextOffset: offset + (data || []).length };
    }

    // Enterprises with a real logo lead every Discover page. Monogram SVGs and
    // missing photos stay behind them, including past the first page.
    const logos = await listRealLogoEnterprises(filters, taxonomyEmbed);
    const rankedLogos = mixCategories ? interleaveByMixKey(logos) : logos;
    const fromLogos = rankedLogos.slice(offset, offset + limit);
    if (fromLogos.length >= limit) {
      return { rows: fromLogos, nextOffset: offset + fromLogos.length };
    }

    const restNeed = limit - fromLogos.length;
    const restSkip = Math.max(0, offset - rankedLogos.length);
    const logoIds = rankedLogos.map((row) => String(row.id || "")).filter(Boolean);
    const { rows: restRows, rawUsed } = await listDiscoverRest(
      filters,
      taxonomyEmbed,
      logoIds,
      restSkip,
      restNeed,
      mixCategories,
    );
    const rows = [...fromLogos, ...restRows];
    const nextOffset =
      restRows.length > 0 || restNeed > 0
        ? rankedLogos.length + restSkip + rawUsed
        : offset + fromLogos.length;
    return { rows, nextOffset: rows.length ? nextOffset : offset };
  },

  /**
   * Exact Supabase row count for Discover Entreprises (views, not list queries).
   * - Promoteurs chip → discover_comptes_promoteurs (featured / allowed visibility)
   * - Tout / other → discover_comptes_all when unfiltered by taxonomy
   *   (directory_visible + full 1.2.1 roster); taxonomy chips keep profiles filters.
   * Lists stay on listProfessionals (featured_promoter / directory_visible).
   */
  async countProfessionals(filters?: DiscoverListFilters): Promise<number> {
    const city = (filters?.city || "").trim();
    const queryText = (filters?.query || "").trim().replace(/[%_,]/g, " ").replace(/\s+/g, " ");
    const feedCategory = (filters?.feedCategory || "").trim();
    const feedSubCategory = (filters?.feedSubCategory || "").trim();
    const internalCodes = normalizeInternalCodes(filters);
    const promoteurOnly = Boolean(filters?.promoteurOnly);
    const fournisseurOnly = Boolean(filters?.fournisseurOnly);
    const taxonomyScoped =
      fournisseurOnly ||
      Boolean(feedSubCategory) ||
      internalCodes.length > 0 ||
      Boolean(feedCategory && feedCategory !== "tout");

    const applyCityQuery = <T extends { ilike: Function; or: Function }>(q: T): T => {
      let next = q;
      if (city) next = next.ilike("location", `%${city}%`);
      if (queryText) {
        const needle = `"%${queryText}%"`;
        next = next.or(
          `full_name.ilike.${needle},username.ilike.${needle},profession.ilike.${needle},location.ilike.${needle}`,
        );
      }
      return next;
    };

    if (promoteurOnly) {
      let query = supabase
        .from("discover_comptes_promoteurs")
        .select("id", { count: "exact", head: true });
      query = applyCityQuery(query);
      const { count, error } = await query;
      if (error) throw error;
      return count ?? 0;
    }

    if (!taxonomyScoped) {
      let query = supabase
        .from("discover_comptes_all")
        .select("id", { count: "exact", head: true });
      query = applyCityQuery(query);
      const { count, error } = await query;
      if (error) throw error;
      return count ?? 0;
    }

    const taxonomyEmbed = professionalsTaxonomyEmbed(filters);
    let query = supabase
      .from("profiles")
      .select(`id, ${taxonomyEmbed}`, { count: "exact", head: true })
      .not("username", "is", null);
    query = applyProfessionalsFilters(query, filters);
    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  },

  // Update profile and keep auth.users user_metadata in step (no full_name column there).
  async updateProfile(userId: string, updates: Partial<ProfileData>) {
    const payload =
      updates.bio !== undefined ? { ...updates, bio: clampBio(updates.bio) } : updates;
    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select(PROFILE_ROW_SELECT)
      .single();

    if (error) throw error;

    const { data: sessionData } = await supabase.auth.getUser();
    if (sessionData.user?.id === userId) {
      const metadata: Record<string, string | null> = {};
      if (payload.full_name !== undefined) metadata.full_name = payload.full_name ?? "";
      if (payload.username !== undefined) metadata.username = payload.username;
      if (payload.phone !== undefined) metadata.phone = payload.phone ?? "";
      if (payload.email !== undefined) metadata.email = payload.email ?? "";
      if (payload.profession !== undefined) metadata.profession = payload.profession ?? "";
      if (payload.location !== undefined) metadata.location = payload.location ?? "";
      if (payload.bio !== undefined) metadata.bio = payload.bio ?? "";
      if (payload.profile_type !== undefined) metadata.profile_type = payload.profile_type;
      if (payload.avatar_url !== undefined) metadata.avatar_url = payload.avatar_url ?? "";
      if (Object.keys(metadata).length) {
        const { error: authError } = await supabase.auth.updateUser({ data: metadata });
        if (authError) throw authError;
      }
    }

    return withClampedBio(data);
  },

  async listInstitutions(): Promise<
    Array<{
      id: string;
      username: string | null;
      full_name: string | null;
      avatar_url: string | null;
      location: string | null;
      bio: string | null;
      is_verified: boolean | null;
      institution_kind: string | null;
    }>
  > {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, location, bio, is_verified, institution_kind")
      .eq("profile_type", "institution")
      .eq("directory_visible", true)
      .order("full_name", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  /** Changes the Auth login email. Profile infos email is contact-only and does not use this. */
  async updateLoginEmail(email: string) {
    const next = email.trim();
    if (!next) throw new Error("Email requis");
    const { error } = await supabase.auth.updateUser({ email: next });
    if (error) throw error;
  },
};

