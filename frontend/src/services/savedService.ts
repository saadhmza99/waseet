import { supabase } from '@/lib/supabase';

export const savedService = {
  // Save a post
  async savePost(userId: string, postId: string) {
    const { data, error } = await supabase
      .from('saved_posts')
      .insert({ user_id: userId, post_id: postId })
      .select()
      .single();

    if (error && error.code !== '23505') throw error; // Ignore duplicate
    return data;
  },

  // Unsave a post
  async unsavePost(userId: string, postId: string) {
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) throw error;
  },

  // Save a listing
  async saveListing(userId: string, listingId: string) {
    const { data, error } = await supabase
      .from('saved_listings')
      .insert({ user_id: userId, listing_id: listingId })
      .select()
      .single();

    if (error && error.code !== '23505') throw error; // Ignore duplicate
    return data;
  },

  // Unsave a listing
  async unsaveListing(userId: string, listingId: string) {
    const { error } = await supabase
      .from('saved_listings')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', listingId);

    if (error) throw error;
  },

  // Save a reel
  async saveReel(userId: string, reelId: string) {
    const { data, error } = await supabase
      .from('saved_reels')
      .insert({ user_id: userId, reel_id: reelId })
      .select()
      .single();

    if (error && error.code !== '23505') throw error; // Ignore duplicate
    return data;
  },

  // Unsave a reel
  async unsaveReel(userId: string, reelId: string) {
    const { error } = await supabase
      .from('saved_reels')
      .delete()
      .eq('user_id', userId)
      .eq('reel_id', reelId);

    if (error) throw error;
  },

  // Get all saved items for a user
  async getSavedItems(userId: string) {
    const [savedPosts, savedListings, savedReels] = await Promise.all([
      supabase
        .from('saved_posts')
        .select(`
          *,
          posts:post_id (
            *,
            profiles:user_id (
              id,
              username,
              avatar_url,
              location
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('saved_listings')
        .select(`
          *,
          listings:listing_id (
            *,
            profiles:user_id (
              id,
              username,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('saved_reels')
        .select(`
          *,
          reels:reel_id (
            *,
            profiles:user_id (
              id,
              username,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ]);

    return {
      posts: savedPosts.data || [],
      listings: savedListings.data || [],
      reels: savedReels.data || [],
    };
  },

  // Check if item is saved
  async isPostSaved(userId: string, postId: string): Promise<boolean> {
    const { data } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    return !!data;
  },

  async isListingSaved(userId: string, listingId: string): Promise<boolean> {
    const { data } = await supabase
      .from('saved_listings')
      .select('id')
      .eq('user_id', userId)
      .eq('listing_id', listingId)
      .single();

    return !!data;
  },

  async isReelSaved(userId: string, reelId: string): Promise<boolean> {
    const { data } = await supabase
      .from('saved_reels')
      .select('id')
      .eq('user_id', userId)
      .eq('reel_id', reelId)
      .single();

    return !!data;
  },

  // Get saved posts
  async getSavedPosts(userId: string) {
    const { data, error } = await supabase
      .from('saved_posts')
      .select(`
        *,
        posts:post_id (
          *,
          profiles:user_id (
            id,
            username,
            avatar_url,
            location
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get saved listings
  async getSavedListings(userId: string) {
    const { data, error } = await supabase
      .from('saved_listings')
      .select(`
        *,
        listings:listing_id (
          *,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get saved reels
  async getSavedReels(userId: string) {
    const { data, error } = await supabase
      .from('saved_reels')
      .select(`
        *,
        reels:reel_id (
          *,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

