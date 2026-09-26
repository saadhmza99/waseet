import { supabase } from '@/lib/supabase';
import { tagService } from '@/services/tagService';
import { userSettingsService } from '@/services/userSettingsService';

export type PostType = 'standard' | 'property' | 'project';

export interface PostData {
  title?: string;
  description?: string;
  before_image_url?: string;
  after_image_url?: string;
  single_image_url?: string;
  images?: string[];
  is_sponsored?: boolean;
  post_type?: PostType;
  price?: string | null;
  surface?: string | null;
  beds?: number | null;
  baths?: number | null;
  property_details?: Record<string, unknown> | null;
}

export type PostCommentPermission = 'anyone' | 'followers' | 'follow_back' | 'off';

export const postService = {
  // Create a new post
  async createPost(userId: string, data: PostData) {
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        title: data.title || "",
        description: data.description,
        before_image_url: data.before_image_url,
        after_image_url: data.after_image_url,
        single_image_url: data.single_image_url,
        images: data.images,
        is_sponsored: data.is_sponsored,
        post_type: data.post_type,
        price: data.price,
        surface: data.surface,
        beds: data.beds,
        baths: data.baths,
        property_details: data.property_details,
      })
      .select()
      .single();

    if (error) throw error;
    void tagService.tagFromText("post", post.id, userId, `${data.title || ""} ${data.description || ""}`);
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
          location,
          profession,
          is_verified
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
          location,
          profession,
          is_verified
        )
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get posts by user
  async getPostsByUser(userId: string, limit?: number, offset = 0) {
    let query = supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (limit != null) query = query.range(offset, offset + limit);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getPortfolioPostsByUser(
    userId: string,
    options?: { types?: string[]; limit?: number; offset?: number }
  ) {
    const types = options?.types?.length
      ? options.types
      : ['property', 'project', 'bien', 'propriete', 'propriété'];
    let query = supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .in('post_type', types)
      .order('created_at', { ascending: false });
    if (options?.limit != null) {
      const offset = options.offset ?? 0;
      query = query.range(offset, offset + options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async countPostsByUser(userId: string, types?: string[]) {
    let query = supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (types?.length) query = query.in('post_type', types);
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  },

  async countPortfolioPostsByUser(userId: string) {
    const propertyTypes = ['property', 'bien', 'propriete', 'propriété'];
    const projectTypes = ['project'];
    const [properties, projects] = await Promise.all([
      this.countPostsByUser(userId, propertyTypes),
      this.countPostsByUser(userId, projectTypes),
    ]);
    return properties + projects;
  },

  // Like a post
  async likePost(postId: string, userId: string) {
    const { data, error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: userId })
      .select()
      .single();

    if (error && error.code !== '23505') throw error;
    if (!data) return null; // Already liked, do not increment

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

    if (error && error.code !== '23505') throw error;
    if (!data) return null; // Already shared, do not increment

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

  // Update a post (owner only)
  async updatePost(postId: string, userId: string, updates: Partial<PostData>) {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Set who can comment on a post
  async setCommentPermission(
    postId: string,
    userId: string,
    permission: PostCommentPermission
  ) {
    const { data, error } = await supabase
      .from('post_comment_settings')
      .upsert(
        {
          post_id: postId,
          user_id: userId,
          permission,
        },
        { onConflict: 'post_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get who can comment setting for a post
  async getCommentPermission(postId: string, authorId?: string): Promise<PostCommentPermission> {
    const { data: rpcPermission, error: rpcError } = await supabase.rpc(
      "get_effective_comment_permission",
      { p_post_id: postId }
    );
    if (!rpcError && typeof rpcPermission === "string" && rpcPermission) {
      return rpcPermission as PostCommentPermission;
    }

    const override = await this.getPostCommentOverride(postId);
    if (override) return override;

    if (authorId) {
      try {
        const settings = await userSettingsService.getSettings(authorId);
        return settings.comment_permission;
      } catch {
        return "followers";
      }
    }
    return "followers";
  },

  async getPostCommentOverride(postId: string): Promise<PostCommentPermission | null> {
    const { data, error } = await supabase
      .from("post_comment_settings")
      .select("permission")
      .eq("post_id", postId)
      .maybeSingle();
    if (error) throw error;
    return (data?.permission as PostCommentPermission) || null;
  },

  async clearCommentPermission(postId: string, userId: string) {
    const { error } = await supabase
      .from("post_comment_settings")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (error) throw error;
  },

  async isPostLiked(postId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    return !!data;
  },

  // Note: Use followService.getPostsFromFollowing instead
  // This method is kept for backward compatibility but followService has the correct implementation
};

