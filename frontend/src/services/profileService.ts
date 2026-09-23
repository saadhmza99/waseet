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
  profile_type: 'craftsman' | 'hunter';
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

  // Update profile
  async updateProfile(userId: string, updates: Partial<ProfileData>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

