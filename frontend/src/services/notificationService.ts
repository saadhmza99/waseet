import { supabase } from "@/lib/supabase";

export type NotificationType =
  | "post_like"
  | "post_comment"
  | "post_share"
  | "post_save"
  | "follow"
  | "job_invite"
  | "listing_save";

export type NotificationEntityType = "post" | "listing" | "profile" | "job_invite";

export const notificationService = {
  async createNotification(params: {
    actorUserId: string;
    targetUserId: string;
    type: NotificationType;
    entityType: NotificationEntityType;
    entityId?: string;
    message: string;
  }) {
    if (params.actorUserId === params.targetUserId) return null;

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        actor_user_id: params.actorUserId,
        target_user_id: params.targetUserId,
        type: params.type,
        entity_type: params.entityType,
        entity_id: params.entityId ?? null,
        message: params.message,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getNotifications(userId: string, limit = 30) {
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *,
        actor:actor_user_id (
          id,
          username,
          avatar_url,
          profile_type
        )
      `)
      .eq("target_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("target_user_id", userId)
      .eq("is_read", false);

    if (error) throw error;
    return count || 0;
  },

  async markAsRead(notificationId: string, userId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("target_user_id", userId);

    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("target_user_id", userId)
      .eq("is_read", false);

    if (error) throw error;
  },
};

