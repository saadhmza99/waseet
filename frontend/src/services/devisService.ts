import { supabase } from "@/lib/supabase";

export type DevisRequestInput = {
  projectTypeId: string;
  projectTypeLabel: string;
  city: string;
  budget?: string;
  description?: string;
  name: string;
  phone: string;
  email?: string;
  whatsapp?: boolean;
  extras?: Record<string, string>;
  sellerId?: string | null;
  sellerName?: string | null;
  serviceId?: string | null;
  productId?: string | null;
  source?: "open" | "profile" | "service" | "product";
};

export const devisService = {
  async create(input: DevisRequestInput) {
    const { data, error } = await supabase
      .from("devis_requests")
      .insert({
        project_type_id: input.projectTypeId,
        project_type_label: input.projectTypeLabel,
        city: input.city.trim(),
        budget: input.budget?.trim() || null,
        description: input.description?.trim() || null,
        name: input.name.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim() || null,
        whatsapp: input.whatsapp !== false,
        extras: input.extras || {},
        seller_id: input.sellerId || null,
        seller_name: input.sellerName?.trim() || null,
        service_id: input.serviceId || null,
        product_id: input.productId || null,
        source: input.source || "open",
      })
      .select("id")
      .single();
    if (error) throw error;
    return data;
  },
};

export const devisPath = (opts?: {
  sellerId?: string;
  sellerName?: string;
  serviceId?: string;
  productId?: string;
  projectType?: string;
  proType?: string;
}) => {
  const params = new URLSearchParams();
  if (opts?.sellerId) params.set("sellerId", opts.sellerId);
  if (opts?.sellerName) params.set("sellerName", opts.sellerName);
  if (opts?.serviceId) params.set("serviceId", opts.serviceId);
  if (opts?.productId) params.set("productId", opts.productId);
  if (opts?.projectType) params.set("type", opts.projectType);
  if (opts?.proType) params.set("proType", opts.proType);
  const q = params.toString();
  return q ? `/devis?${q}` : "/devis";
};
