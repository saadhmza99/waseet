import { supabase } from '@/lib/supabase';

export interface ProfileData {
  username: string;
  full_name?: string;
  profession?: string;
  location?: string;
  bio?: string;
  phone?: string;
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

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

