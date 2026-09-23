import { supabase } from "@/lib/supabase";

export const inquiryService = {
  async createInquiry(input: {
    sellerId: string;
    postId?: string;
    listingId?: string;
    name: string;
    email: string;
    phone: string;
    needs: string;
  }) {
    const { error } = await supabase.from("property_inquiries").insert({
      seller_id: input.sellerId,
      post_id: input.postId || null,
      listing_id: input.listingId || null,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      needs: input.needs.trim(),
    });
    if (error) throw error;
  },
};
