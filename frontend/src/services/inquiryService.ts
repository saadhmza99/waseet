import { supabase } from "@/lib/supabase";

export type InquiryType = "property" | "project" | "service" | "post";

export type InquiryRateStatus = {
  allowed: boolean;
  remaining: number;
  retryAt: string | null;
};

export const inquiryTypeFromPostType = (postType?: string | null): InquiryType =>
  postType === "property" || postType === "project" ? postType : "post";

export const isInquiryRateLimitError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return message.includes("INQUIRY_RATE_LIMIT");
};

export const formatInquiryCooldown = (retryAt?: string | null) => {
  if (!retryAt) return "24 heures";
  const ms = new Date(retryAt).getTime() - Date.now();
  if (ms <= 0) return "quelques minutes";
  const minutes = Math.max(1, Math.ceil(ms / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.ceil(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.ceil(hours / 24)} j`;
};

export const inquiryCooldownMessage = (retryAt?: string | null) =>
  `Vous avez déjà envoyé 3 messages sur cette annonce. Vous pourrez réécrire dans ${formatInquiryCooldown(retryAt)}.`;

export const inquiryService = {
  async getRateStatus(input: {
    postId?: string;
    listingId?: string;
    propertyId?: string;
    projectId?: string;
    phone?: string;
  }): Promise<InquiryRateStatus> {
    const { data, error } = await supabase.rpc("inquiry_rate_status", {
      p_post_id: input.postId || null,
      p_listing_id: input.listingId || null,
      p_phone: input.phone?.trim() || null,
      p_property_id: input.propertyId || null,
      p_project_id: input.projectId || null,
    });
    if (error) throw error;
    const row = (data || {}) as { allowed?: boolean; remaining?: number; retry_at?: string | null };
    return {
      allowed: row.allowed !== false,
      remaining: typeof row.remaining === "number" ? row.remaining : 3,
      retryAt: row.retry_at || null,
    };
  },

  async createInquiry(input: {
    type: InquiryType;
    sellerId: string;
    postId?: string;
    listingId?: string;
    propertyId?: string;
    projectId?: string;
    name: string;
    email?: string;
    phone: string;
    needs: string;
  }) {
    const { error } = await supabase.from("inquiries").insert({
      type: input.type,
      seller_id: input.sellerId,
      post_id: input.postId || null,
      listing_id: input.listingId || null,
      property_id: input.propertyId || null,
      project_id: input.projectId || null,
      name: input.name.trim(),
      email: input.email?.trim() || null,
      phone: input.phone.trim(),
      needs: input.needs.trim(),
    });
    if (error) throw error;
  },
};
