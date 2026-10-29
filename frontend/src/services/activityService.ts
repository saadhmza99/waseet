import { supabase } from "@/lib/supabase";

export type ActivityEventRow = {
  id: string;
  action: string;
  status: "attempt" | "success" | "failure";
  actor_id: string | null;
  actor_kind: "anon" | "visitor" | "member";
  actor_label: string | null;
  target_type: string | null;
  target_id: string | null;
  target_label: string | null;
  path: string | null;
  message: string | null;
  error_message: string | null;
  meta: Record<string, unknown>;
  client_key: string | null;
  session_id: string | null;
  created_at: string;
};

export const activityService = {
  async listForAdmin(limit = 250): Promise<ActivityEventRow[]> {
    const { data, error } = await supabase
      .from("activity_events")
      .select(
        "id, action, status, actor_id, actor_kind, actor_label, target_type, target_id, target_label, path, message, error_message, meta, client_key, session_id, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []) as ActivityEventRow[];
  },
};
