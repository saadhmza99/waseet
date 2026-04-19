import { supabase } from '@/lib/supabase';

export interface PostData {
  title: string;
  description?: string;
  before_image_url?: string;
  after_image_url?: string;
  single_image_url?: string;
  images?: string[];
  is_sponsored?: boolean;
}

export const postService = {
  // Create a new post
  async createPost(userId: string, data: PostData) {
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return post;
  },

  // Get all posts (with pagination)
  async getPosts(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url,
          location
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  // Get post by ID
  async getPostById(postId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url,
          location
        )
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get posts by user
  async getPostsByUser(userId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Like a post
  async likePost(postId: string, userId: string) {
    const { data, error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: userId })
      .select()
      .single();

    if (error && error.code !== '23505') throw error; // Ignore duplicate like

    // Update likes count
    await supabase.rpc('increment', {
      table_name: 'posts',
      column_name: 'likes_count',
      row_id: postId,
      increment_value: 1,
    });

    return data;
  },

  // Unlike a post
  async unlikePost(postId: string, userId: string) {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;

    // Update likes count
    await supabase.rpc('decrement', {
      table_name: 'posts',
      column_name: 'likes_count',
      row_id: postId,
      decrement_value: 1,
    });
  },

  // Share a post
  async sharePost(postId: string, userId: string) {
    const { data, error } = await supabase
      .from('post_shares')
      .insert({ post_id: postId, user_id: userId })
      .select()
      .single();

    if (error && error.code !== '23505') throw error; // Ignore duplicate share

    // Update shares count
    await supabase.rpc('increment', {
      table_name: 'posts',
      column_name: 'shares_count',
      row_id: postId,
      increment_value: 1,
    });

    return data;
  },

  // Unshare a post
  async unsharePost(postId: string, userId: string) {
    const { error } = await supabase
      .from('post_shares')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;

    // Update shares count
    await supabase.rpc('decrement', {
      table_name: 'posts',
      column_name: 'shares_count',
      row_id: postId,
      decrement_value: 1,
    });
  },

  // Delete post
  async deletePost(postId: string, userId: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Note: Use followService.getPostsFromFollowing instead
  // This method is kept for backward compatibility but followService has the correct implementation
};

