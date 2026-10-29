import { supabase } from "@/lib/supabase";

export type LeadAction = "devis" | "contact" | "partner";

export class LeadRateLimitError extends Error {
  retryAfterSeconds: number;
  constructor(message: string, retryAfterSeconds = 3600) {
    super(message);
    this.name = "LeadRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/** Submit devis / contact / partner through IP+geo rate-limited Edge Function. */
export async function submitLead<T extends { id?: string } = { id: string }>(
  action: LeadAction,
  payload: Record<string, unknown>,
): Promise<T> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token || supabaseAnonKey;

  const res = await fetch(`${supabaseUrl.replace(/\/$/, "")}/functions/v1/submit-lead`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify({ action, payload }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
    retryAfterSeconds?: number;
    id?: string;
    success?: boolean;
  };

  if (res.status === 429) {
    throw new LeadRateLimitError(
      json.message || "Trop de demandes. Réessayez plus tard.",
      Number(json.retryAfterSeconds) || 3600,
    );
  }

  if (!res.ok) {
    throw new Error(typeof json.error === "string" ? json.error : `submit-lead failed (${res.status})`);
  }

  return { id: json.id, ...json } as T;
}
