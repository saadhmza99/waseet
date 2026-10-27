import { supabase } from "@/lib/supabase";

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
    const { data, error } = await supabase
      .from("partner_requests")
      .insert({
        enterprise_name: input.enterpriseName.trim(),
        professional_name: input.professionalName.trim(),
        phone: input.phone.trim(),
        email: input.email.trim(),
        website: input.website?.trim() || null,
        location: input.location.trim(),
      })
      .select("id")
      .single();
    if (error) throw error;
    return data;
  },
};
