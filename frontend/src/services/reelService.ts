import { supabase } from '@/lib/supabase';
import { streamService } from './streamService';

export interface ReelData {
  cloudflare_video_id: string;
  title?: string;
  description?: string;
  /** Whole seconds from Cloudflare (<= 30); optional until backfilled */
  duration_seconds?: number | null;
}

export const reelService = {
  // Create a new reel
  async createReel(userId: string, data: ReelData) {
    const { data: reel, error } = await supabase
      .from('reels')
      .insert({
        user_id: userId,
        cloudflare_video_id: data.cloudflare_video_id,
        title: data.title,
        description: data.description,
        duration_seconds: data.duration_seconds ?? null,
      })
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return reel;
  },

  // Get all reels (with pagination)
  async getReels(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('reels')
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

    if (error) throw error;
    return data;
  },

  // Get reel by ID
  async getReelById(reelId: string) {
    const { data, error } = await supabase
      .from('reels')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('id', reelId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get reels by user
  async getReelsByUser(userId: string) {
    const { data, error } = await supabase
      .from('reels')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async isReelLiked(userId: string, reelId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('reel_likes')
      .select('id')
      .eq('reel_id', reelId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
  },

  // Like a reel
  async likeReel(reelId: string, userId: string) {
    const { data, error } = await supabase
      .from('reel_likes')
      .insert({ reel_id: reelId, user_id: userId })
      .select()
      .single();

    if (error && error.code !== '23505') throw error; // Ignore duplicate like

    // Update likes count
    await supabase.rpc('increment', {
      table_name: 'reels',
      column_name: 'likes_count',
      row_id: reelId,
      increment_value: 1,
    });

    return data;
  },

  // Unlike a reel
  async unlikeReel(reelId: string, userId: string) {
    const { error } = await supabase
      .from('reel_likes')
      .delete()
      .eq('reel_id', reelId)
      .eq('user_id', userId);

    if (error) throw error;

    // Update likes count
    await supabase.rpc('decrement', {
      table_name: 'reels',
      column_name: 'likes_count',
      row_id: reelId,
      decrement_value: 1,
    });
  },

  // Get comments for a reel
  async getReelComments(reelId: string) {
    const { data, error } = await supabase
      .from('reel_comments')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('reel_id', reelId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Create a comment on a reel
  async createReelComment(reelId: string, userId: string, content: string) {
    const { data, error } = await supabase
      .from('reel_comments')
      .insert({
        reel_id: reelId,
        user_id: userId,
        content,
      })
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    // Update comments count
    await supabase.rpc('increment', {
      table_name: 'reels',
      column_name: 'comments_count',
      row_id: reelId,
      increment_value: 1,
    });

    return data;
  },

  // Delete a comment
  async deleteReelComment(commentId: string, userId: string) {
    // Get comment to get reel_id
    const { data: comment } = await supabase
      .from('reel_comments')
      .select('reel_id')
      .eq('id', commentId)
      .single();

    // Delete comment
    const { error } = await supabase
      .from('reel_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;

    // Update comments count
    if (comment?.reel_id) {
      await supabase.rpc('decrement', {
        table_name: 'reels',
        column_name: 'comments_count',
        row_id: comment.reel_id,
        decrement_value: 1,
      });
    }
  },

  // Share a reel
  async shareReel(reelId: string, userId: string) {
    const { data, error } = await supabase
      .from('reel_shares')
      .insert({ reel_id: reelId, user_id: userId })
      .select()
      .single();

    if (error && error.code !== '23505') throw error; // Ignore duplicate share

    // Update shares count
    await supabase.rpc('increment', {
      table_name: 'reels',
      column_name: 'shares_count',
      row_id: reelId,
      increment_value: 1,
    });

    return data;
  },

  // Unshare a reel (remove share)
  async unshareReel(reelId: string, userId: string) {
    const { error } = await supabase
      .from('reel_shares')
      .delete()
      .eq('reel_id', reelId)
      .eq('user_id', userId);

    if (error) throw error;

    // Update shares count
    await supabase.rpc('decrement', {
      table_name: 'reels',
      column_name: 'shares_count',
      row_id: reelId,
      decrement_value: 1,
    });
  },

  // Delete reel
  async deleteReel(reelId: string, userId: string) {
    // Get reel to delete Cloudflare video
    const { data: reel } = await supabase
      .from('reels')
      .select('cloudflare_video_id')
      .eq('id', reelId)
      .single();

    // Delete from database
    const { error } = await supabase
      .from('reels')
      .delete()
      .eq('id', reelId)
      .eq('user_id', userId);

    if (error) throw error;

    // Delete from Cloudflare Stream (optional, can be done async)
    if (reel?.cloudflare_video_id) {
      try {
        await streamService.deleteVideo(reel.cloudflare_video_id);
      } catch (err) {
        console.error('Failed to delete video from Cloudflare:', err);
      }
    }
  },
};

