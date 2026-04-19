import { supabase } from '@/lib/supabase';

export interface ListingData {
  title: string;
  description?: string;
  profession: string;
  location: string;
  price_range?: string;
  image_url?: string;
  image_count?: number;
  is_sponsored?: boolean;
}

export const listingService = {
  // Create a new listing
  async createListing(userId: string, data: ListingData) {
    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        user_id: userId,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return listing;
  },

  // Get all listings
  async getListings(limit = 20, offset = 0, isSponsored?: boolean) {
    let query = supabase
      .from('listings')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (isSponsored !== undefined) {
      query = query.eq('is_sponsored', isSponsored);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // Get listing by ID
  async getListingById(listingId: string) {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url,
          location,
          profession
        )
      `)
      .eq('id', listingId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get listings by user
  async getListingsByUser(userId: string) {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Delete listing
  async deleteListing(listingId: string, userId: string) {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId)
      .eq('user_id', userId);

    if (error) throw error;
  },
};

