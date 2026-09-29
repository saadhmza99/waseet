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
  avatar_url?: string | null;
  cover_photo_url?: string | null;
  profile_type: 'individual' | 'enterprise';
}

export const profileService = {
  // Create profile after signup
  async createProfile(userId: string, data: ProfileData) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return profile;
  },

  // Get profile by ID
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
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
      .select("*")
      .ilike("username", slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Update profile and keep auth.users user_metadata in step (no full_name column there).
  async updateProfile(userId: string, updates: Partial<ProfileData>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    const { data: sessionData } = await supabase.auth.getUser();
    if (sessionData.user?.id === userId) {
      const metadata: Record<string, string | null> = {};
      if (updates.full_name !== undefined) metadata.full_name = updates.full_name ?? "";
      if (updates.username !== undefined) metadata.username = updates.username;
      if (updates.phone !== undefined) metadata.phone = updates.phone ?? "";
      if (updates.email !== undefined) metadata.email = updates.email ?? "";
      if (updates.profession !== undefined) metadata.profession = updates.profession ?? "";
      if (updates.location !== undefined) metadata.location = updates.location ?? "";
      if (updates.bio !== undefined) metadata.bio = updates.bio ?? "";
      if (updates.profile_type !== undefined) metadata.profile_type = updates.profile_type;
      if (updates.avatar_url !== undefined) metadata.avatar_url = updates.avatar_url ?? "";
      if (Object.keys(metadata).length) {
        const { error: authError } = await supabase.auth.updateUser({ data: metadata });
        if (authError) throw authError;
      }
    }

    return data;
  },

  /** Changes the Auth login email. Profile infos email is contact-only and does not use this. */
  async updateLoginEmail(email: string) {
    const next = email.trim();
    if (!next) throw new Error("Email requis");
    const { error } = await supabase.auth.updateUser({ email: next });
    if (error) throw error;
  },
};

