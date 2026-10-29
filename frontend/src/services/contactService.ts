import { supabase } from "@/lib/supabase";
import { submitLead } from "@/lib/submitLead";

export type ContactTopic = "partnership" | "sponsorship" | "visibility" | "problem";

export type ContactMessageInput = {
  topic: ContactTopic;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  message: string;
  pageUrl?: string;
  userId?: string | null;
};

export const CONTACT_TOPIC_LABELS: Record<ContactTopic, string> = {
  partnership: "Partenariat",
  sponsorship: "Sponsoring",
  visibility: "Plan de visibilité",
  problem: "Problème sur le site",
};

export const contactService = {
  async create(input: ContactMessageInput) {
    await submitLead("contact", {
      topic: input.topic,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || null,
      organization: input.organization?.trim() || null,
      message: input.message.trim(),
      pageUrl: input.pageUrl?.trim() || null,
    });
  },

  async listForAdmin(topic?: ContactTopic | "all", limit = 100) {
    let query = supabase
      .from("contact_messages")
      .select("id, topic, name, email, phone, organization, message, page_url, user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (topic && topic !== "all") query = query.eq("topic", topic);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
};
