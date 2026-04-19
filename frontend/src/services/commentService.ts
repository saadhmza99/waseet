import { supabase } from '@/lib/supabase';

export const commentService = {
  // Get comments for a post
  async getPostComments(postId: string) {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Create a comment on a post
  async createPostComment(postId: string, userId: string, content: string) {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
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
      table_name: 'posts',
      column_name: 'comments_count',
      row_id: postId,
      increment_value: 1,
    });

    return data;
  },

  // Delete a comment
  async deletePostComment(commentId: string, userId: string) {
    // Get comment to get post_id
    const { data: comment } = await supabase
      .from('post_comments')
      .select('post_id')
      .eq('id', commentId)
      .single();

    // Delete comment
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;

    // Update comments count
    if (comment?.post_id) {
      await supabase.rpc('decrement', {
        table_name: 'posts',
        column_name: 'comments_count',
        row_id: comment.post_id,
        decrement_value: 1,
      });
    }
  },
};

