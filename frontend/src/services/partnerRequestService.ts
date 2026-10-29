import { supabase } from "@/lib/supabase";
import { submitLead } from "@/lib/submitLead";

export type PartnerRequestInput = {
  enterpriseName: string;
  professionalName: string;
  phone: string;
  email: string;
  website?: string;
  location: string;
};

export const partnerRequestService = {
  async create(input: PartnerRequestInput) {
    return submitLead<{ id: string }>("partner", {
      enterpriseName: input.enterpriseName.trim(),
      professionalName: input.professionalName.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      website: input.website?.trim() || null,
      location: input.location.trim(),
    });
  },

  async listForAdmin(limit = 100) {
    const { data, error } = await supabase
      .from("partner_requests")
      .select("id, enterprise_name, professional_name, phone, email, website, location, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },
};
