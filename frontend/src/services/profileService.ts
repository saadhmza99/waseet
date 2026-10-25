import { clampBio } from "@/lib/bio";
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

const withClampedBio = <T extends { bio?: string | null } | null>(row: T): T => {
  if (!row || row.bio == null) return row;
  const next = clampBio(row.bio);
  return next === row.bio ? row : { ...row, bio: next };
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

  async listProfessionals(limit = 120, offset = 0, filters?: { city?: string | null }) {
    const city = (filters?.city || "").trim();
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
        internal_categories!profiles_internal_category_id_fkey (
          code,
          feed_sub_categories (
            slug,
            categories ( slug )
          )
        ),
        profile_internal_categories (
          is_primary,
          internal_categories (
            code,
            feed_sub_categories (
              slug,
              categories ( slug )
            )
          )
        )
      `,
      )
      .not("username", "is", null)
      .order("created_at", { ascending: false });
    if (city) query = query.ilike("location", `%${city}%`);
    const { data, error } = await query.range(offset, offset + Math.max(limit - 1, 0));
    if (error) throw error;
    return data || [];
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

