import { supabase } from '@/lib/supabase';

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export const moderationService = {
  async reportPost(postId: string, reporterId: string, reason: string = 'user_report') {
    const { data, error } = await supabase
      .from('post_reports')
      .insert({
        post_id: postId,
        reporter_id: reporterId,
        reason,
      })
      .select()
      .single();

    if (error && error.code !== '23505') throw error;
    return data;
  },

  async blockUser(blockerId: string, blockedId: string) {
    const { data, error } = await supabase
      .from('blocked_users')
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
      })
      .select()
      .single();

    if (error && error.code !== '23505') throw error;
    return data;
  },

  async getBlockedUserIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('blocked_id')
      .eq('blocker_id', userId);

    if (error) throw error;
    return (data || []).map((row) => row.blocked_id);
  },

  async isModerator(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('moderation_admins')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
  },

  async getPostReports() {
    const { data, error } = await supabase
      .from('post_reports')
      .select(`
        *,
        posts:post_id (
          id,
          title,
          description,
          user_id
        ),
        reporter:reporter_id (
          id,
          username,
          avatar_url
        ),
        reviewed_by_profile:reviewed_by (
          id,
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updatePostReportStatus(
    reportId: string,
    moderatorId: string,
    status: ReportStatus,
    resolutionNote?: string
  ) {
    const payload: {
      status: ReportStatus;
      reviewed_by: string;
      reviewed_at: string;
      resolution_note?: string | null;
    } = {
      status,
      reviewed_by: moderatorId,
      reviewed_at: new Date().toISOString(),
    };

    if (resolutionNote !== undefined) {
      payload.resolution_note = resolutionNote || null;
    }

    const { data, error } = await supabase
      .from('post_reports')
      .update(payload)
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
