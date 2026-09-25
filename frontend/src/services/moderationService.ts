import { supabase } from '@/lib/supabase';

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export const BLOCK_COOLDOWN_HOURS = 48;

export function isBlockCooldownError(error: unknown) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message?: string }).message)
      : String(error || "");
  return message.includes("BLOCK_COOLDOWN");
}

export const moderationService = {
  storedReason(reason: string, details?: string) {
    const extra = (details || "").trim();
    return extra ? `${reason}\n${extra}` : reason;
  },

  async reportPost(postId: string, reporterId: string, reason: string = 'user_report', details: string = '') {
    const { data, error } = await supabase
      .from('post_reports')
      .insert({
        post_id: postId,
        reporter_id: reporterId,
        reason: this.storedReason(reason, details),
      })
      .select()
      .single();

    if (error && error.code !== '23505') throw error;
    return data;
  },

  async reportProfile(profileId: string, reporterId: string, reason: string = 'user_report', details: string = '') {
    const { data, error } = await supabase
      .from('profile_reports')
      .insert({
        profile_id: profileId,
        reporter_id: reporterId,
        reason: this.storedReason(reason, details),
      })
      .select()
      .single();

    if (error && error.code !== '23505') throw error;
    return data;
  },

  async reportReel(reelId: string, reporterId: string, reason: string = 'user_report', details: string = '') {
    const { data, error } = await supabase
      .from('reel_reports')
      .insert({
        reel_id: reelId,
        reporter_id: reporterId,
        reason: this.storedReason(reason, details),
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

  async getReblockBlockedUntil(blockerId: string, blockedId: string): Promise<Date | null> {
    const { data, error } = await supabase
      .from('block_cooldowns')
      .select('unblocked_at')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .maybeSingle();

    if (error) {
      const missing =
        error.code === 'PGRST205' ||
        error.code === '42P01' ||
        /Could not find the table/i.test(error.message || '');
      if (missing) return null;
      throw error;
    }
    if (!data?.unblocked_at) return null;

    const until = new Date(new Date(data.unblocked_at).getTime() + BLOCK_COOLDOWN_HOURS * 60 * 60 * 1000);
    return until.getTime() > Date.now() ? until : null;
  },

  async unblockUser(blockerId: string, blockedId: string) {
    const { error } = await supabase.rpc('unblock_account', { target_id: blockedId });
    if (!error) return;

    const rpcMissing =
      error.code === 'PGRST202' ||
      error.code === 'PGRST205' ||
      /Could not find the function/i.test(error.message || '');
    if (!rpcMissing) throw error;

    const { error: deleteError } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);
    if (deleteError) throw deleteError;
  },

  async getBlockedAccounts(userId: string): Promise<
    {
      blockedId: string;
      blockedAt: string;
      username: string;
      fullName: string;
      avatarUrl: string | null;
      profileType?: string | null;
    }[]
  > {
    const { data, error } = await supabase
      .from('blocked_users')
      .select(`
        blocked_id,
        created_at,
        profiles:blocked_id (
          username,
          full_name,
          avatar_url,
          profile_type
        )
      `)
      .eq('blocker_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return {
        blockedId: row.blocked_id,
        blockedAt: row.created_at,
        username: profile?.username || "",
        fullName: profile?.full_name || profile?.username || "Utilisateur",
        avatarUrl: profile?.avatar_url || null,
        profileType: profile?.profile_type || null,
      };
    });
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

  async getReelReports() {
    const { data, error } = await supabase
      .from('reel_reports')
      .select(`
        *,
        reels:reel_id (
          id,
          title,
          description,
          user_id,
          cloudflare_video_id
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

  async updateReelReportStatus(
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
      .from('reel_reports')
      .update(payload)
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
