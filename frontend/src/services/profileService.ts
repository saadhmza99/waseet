import { isMissingAvatarUrl } from "@/lib/avatar";
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
  profile_type: 'individual' | 'enterprise';
}

/** Shared Discover filters for list + exact count queries. */
export type DiscoverListFilters = {
  city?: string | null;
  query?: string | null;
  feedCategory?: string | null;
  feedSubCategory?: string | null;
  promoteurOnly?: boolean;
  fournisseurOnly?: boolean;
};

const applyProfessionalsFilters = <T extends { eq: Function; like: Function; not: Function; ilike: Function; or: Function }>(
  query: T,
  filters?: DiscoverListFilters,
): T => {
  const city = (filters?.city || "").trim();
  const queryText = (filters?.query || "").trim().replace(/[%_,]/g, " ").replace(/\s+/g, " ");
  const feedCategory = (filters?.feedCategory || "").trim();
  const feedSubCategory = (filters?.feedSubCategory || "").trim();
  const promoteurOnly = Boolean(filters?.promoteurOnly);
  const fournisseurOnly = Boolean(filters?.fournisseurOnly);
  const categoryPrefix =
    !promoteurOnly && !fournisseurOnly && !feedSubCategory && feedCategory && feedCategory !== "tout"
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
    next = next.eq("profile_internal_categories.internal_categories.code", "1.2.1");
  } else if (fournisseurOnly) {
    next = next.like("profile_internal_categories.internal_categories.code", "8.5.%");
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
  const promoteurOnly = Boolean(filters?.promoteurOnly);
  const fournisseurOnly = Boolean(filters?.fournisseurOnly);
  const categoryPrefix =
    !promoteurOnly && !fournisseurOnly && !feedSubCategory && feedCategory && feedCategory !== "tout"
      ? feedCategoryCodePrefix(feedCategory)
      : null;
  const needsCodeFilter = promoteurOnly || fournisseurOnly || Boolean(categoryPrefix);
  const needsFeedFilter = Boolean(feedSubCategory) || (
    Boolean(feedCategory && feedCategory !== "tout") && !categoryPrefix
  );

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
 * Browse ranking (no text search): real avatars first, then specialty mix for "tout".
 * Text search keeps DB order so relevance isn't reshuffled.
 */
const rankDiscoverBrowse = <T extends { avatar_url?: string | null } & Record<string, unknown>>(
  rows: T[],
  { mixCategories }: { mixCategories: boolean },
) => {
  const withPhoto = rows.filter((row) => !isMissingAvatarUrl(row.avatar_url));
  const withoutPhoto = rows.filter((row) => isMissingAvatarUrl(row.avatar_url));
  if (!mixCategories) return [...withPhoto, ...withoutPhoto];
  return [...interleaveByMixKey(withPhoto), ...interleaveByMixKey(withoutPhoto)];
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
      .select(
        `*, internal_category:internal_categories!profiles_internal_category_id_fkey(code, detailed_sub_category),
        profile_internal_categories(is_primary, internal_categories(code, detailed_sub_category))`
      )
      .eq("id", userId)
      .single();

    if (error) throw error;
    return withClampedBio(data);
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
      .select(
        `*, internal_category:internal_categories!profiles_internal_category_id_fkey(code, detailed_sub_category),
        profile_internal_categories(is_primary, internal_categories(code, detailed_sub_category))`
      )
      .ilike("username", slug)
      .maybeSingle();

    if (error) throw error;
    return withClampedBio(data);
  },

  async listProfessionals(
    limit = 24,
    offset = 0,
    filters?: DiscoverListFilters,
  ): Promise<{ rows: any[]; nextOffset: number }> {
    const queryText = (filters?.query || "").trim().replace(/[%_,]/g, " ").replace(/\s+/g, " ");
    const feedCategory = (filters?.feedCategory || "").trim();
    const feedSubCategory = (filters?.feedSubCategory || "").trim();
    const promoteurOnly = Boolean(filters?.promoteurOnly);
    const fournisseurOnly = Boolean(filters?.fournisseurOnly);
    const categoryPrefix =
      !promoteurOnly && !fournisseurOnly && !feedSubCategory && feedCategory && feedCategory !== "tout"
        ? feedCategoryCodePrefix(feedCategory)
        : null;
    const needsTaxonomyFilter =
      promoteurOnly ||
      fournisseurOnly ||
      Boolean(categoryPrefix) ||
      Boolean(feedSubCategory) ||
      Boolean(feedCategory && feedCategory !== "tout");

    const browsing = !queryText;
    const mixCategories = browsing && !needsTaxonomyFilter;
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
      .order(mixCategories ? "id" : "created_at", { ascending: mixCategories ? true : false });

    query = applyProfessionalsFilters(query, filters);

    // Wider window: taxonomy !inner duplicates, and browse reorders for mix / real avatars.
    const window = browsing || needsTaxonomyFilter
      ? Math.min(Math.max(limit * (mixCategories ? 5 : 3), limit), mixCategories ? 120 : 48)
      : limit;
    const { data, error } = await query.range(offset, offset + Math.max(window - 1, 0));
    if (error) throw error;
    const raw = data || [];
    const seen = new Set<string>();
    const unique: typeof raw = [];
    for (const row of raw) {
      const id = String((row as { id?: string }).id || "");
      if (!id || seen.has(id)) continue;
      seen.add(id);
      unique.push(row);
    }
    const ranked = browsing
      ? rankDiscoverBrowse(unique as Array<{ avatar_url?: string | null } & Record<string, unknown>>, {
          mixCategories,
        })
      : unique;
    const rows = ranked.slice(0, limit);
    return { rows, nextOffset: offset + raw.length };
  },

  /** Exact Supabase row count for Discover Entreprises (same filters as listProfessionals). */
  async countProfessionals(filters?: DiscoverListFilters): Promise<number> {
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
      .select()
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

  /** Changes the Auth login email. Profile infos email is contact-only and does not use this. */
  async updateLoginEmail(email: string) {
    const next = email.trim();
    if (!next) throw new Error("Email requis");
    const { error } = await supabase.auth.updateUser({ email: next });
    if (error) throw error;
  },
};

