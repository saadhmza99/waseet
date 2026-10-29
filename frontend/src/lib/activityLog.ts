import { supabase } from "@/lib/supabase";
import {
  getOrCreateSessionId,
  getOrCreateVisitorId,
  sanitizeAnalyticsPath,
  type AccountKind,
} from "@/lib/visitorTrack";

export type ActivityStatus = "attempt" | "success" | "failure";

export type ActivityInput = {
  action: string;
  status?: ActivityStatus;
  actorKind?: AccountKind;
  actorLabel?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  targetLabel?: string | null;
  path?: string | null;
  message?: string | null;
  error?: unknown;
  meta?: Record<string, unknown>;
};

let identity: { actorKind: AccountKind; actorLabel: string | null } = {
  actorKind: "anon",
  actorLabel: null,
};

export const setActivityActor = (next: { actorKind: AccountKind; actorLabel?: string | null }) => {
  identity = {
    actorKind: next.actorKind || "anon",
    actorLabel: next.actorLabel?.trim() || null,
  };
};

const errorText = (error: unknown) => {
  if (!error) return null;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message || "");
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
};

export const logActivity = async (input: ActivityInput) => {
  try {
    const path = sanitizeAnalyticsPath(
      input.path || (typeof window !== "undefined" ? window.location.pathname : "/"),
    );
    await supabase.rpc("track_activity_event", {
      p_action: input.action,
      p_status: input.status || "attempt",
      p_actor_kind: input.actorKind || identity.actorKind,
      p_actor_label: input.actorLabel ?? identity.actorLabel,
      p_target_type: input.targetType || null,
      p_target_id: input.targetId || null,
      p_target_label: input.targetLabel || null,
      p_path: path,
      p_message: input.message || null,
      p_error_message: errorText(input.error),
      p_meta: input.meta || {},
      p_client_key: getOrCreateVisitorId(),
      p_session_id: getOrCreateSessionId(),
    });
  } catch {
    /* never break product flows for logging */
  }
};

/** Log attempt, run work, then success or failure. */
export async function withActivityLog<T>(
  input: Omit<ActivityInput, "status" | "error">,
  work: () => Promise<T>,
  successMeta?: (result: T) => Partial<ActivityInput>,
): Promise<T> {
  await logActivity({ ...input, status: "attempt" });
  try {
    const result = await work();
    const extra = successMeta?.(result) || {};
    await logActivity({
      ...input,
      ...extra,
      status: "success",
      targetId: extra.targetId ?? input.targetId,
      targetLabel: extra.targetLabel ?? input.targetLabel,
      message: extra.message ?? input.message,
      meta: { ...(input.meta || {}), ...(extra.meta || {}) },
    });
    return result;
  } catch (error) {
    await logActivity({ ...input, status: "failure", error });
    throw error;
  }
}
