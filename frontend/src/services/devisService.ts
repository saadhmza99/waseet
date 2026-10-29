import { supabase } from "@/lib/supabase";
import { logActivity, withActivityLog } from "@/lib/activityLog";
import { submitLead } from "@/lib/submitLead";

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
  sourcePath?: string | null;
  sourceLabel?: string | null;
};

export const devisService = {
  async create(input: DevisRequestInput) {
    return withActivityLog(
      {
        action: "devis_submit",
        targetType: input.serviceId ? "service" : input.productId ? "product" : "devis",
        targetId: input.serviceId || input.productId || input.sellerId || null,
        targetLabel: input.sellerName || input.projectTypeLabel || null,
        actorLabel: input.name || input.email || input.phone || null,
        message: `Demande devis · ${input.projectTypeLabel || "type"} · ${input.city || ""}`.trim(),
        meta: {
          source: input.source || "open",
          sellerId: input.sellerId || null,
          serviceId: input.serviceId || null,
          productId: input.productId || null,
          sourcePath: input.sourcePath || null,
        },
      },
      async () => {
        const data = await submitLead<{ id: string }>("devis", {
          projectTypeId: input.projectTypeId,
          projectTypeLabel: input.projectTypeLabel,
          city: input.city.trim(),
          budget: input.budget?.trim() || null,
          description: input.description?.trim() || null,
          name: input.name.trim(),
          phone: input.phone.trim(),
          email: input.email?.trim() || null,
          whatsapp: input.whatsapp !== false,
          extras: input.extras || {},
          sellerId: input.sellerId || null,
          sellerName: input.sellerName?.trim() || null,
          serviceId: input.serviceId || null,
          productId: input.productId || null,
          source: input.source || "open",
          sourcePath: input.sourcePath?.trim() || null,
          sourceLabel: input.sourceLabel?.trim() || null,
        });
        if (!data?.id) throw new Error("Devis non enregistré");
        return data;
      },
      (row) => ({ targetId: row.id, message: `Devis envoyé (#${row.id.slice(0, 8)})` }),
    );
  },

  async listForSeller(sellerId: string) {
    const { data, error } = await supabase
      .from("devis_requests")
      .select("id, name, phone, email, city, project_type_label, description, reply, replied_at, created_at, source_path, source_label")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async listForAdmin(limit = 100) {
    const { data, error } = await supabase
      .from("devis_requests")
      .select(
        `id, name, phone, email, city, budget, project_type_label, description, source, source_path, source_label,
         seller_id, seller_name, service_id, product_id, requester_id, created_at, reply, replied_at,
         seller:profiles!devis_requests_seller_id_fkey(id, username, full_name)`,
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async reply(id: string, reply: string) {
    const { error } = await supabase.rpc("reply_devis_request", {
      p_id: id,
      p_reply: reply.trim(),
    });
    if (error) throw error;
  },
};

export const devisPath = (opts?: {
  sellerId?: string;
  sellerName?: string;
  serviceId?: string;
  productId?: string;
  projectType?: string;
  proType?: string;
  from?: string;
  fromLabel?: string;
}) => {
  const params = new URLSearchParams();
  if (opts?.sellerId) params.set("sellerId", opts.sellerId);
  if (opts?.sellerName) params.set("sellerName", opts.sellerName);
  if (opts?.serviceId) params.set("serviceId", opts.serviceId);
  if (opts?.productId) params.set("productId", opts.productId);
  if (opts?.projectType) params.set("type", opts.projectType);
  if (opts?.proType) params.set("proType", opts.proType);
  const from =
    opts?.from ||
    (typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "");
  if (from) params.set("from", from.slice(0, 500));
  if (opts?.fromLabel) params.set("fromLabel", opts.fromLabel.slice(0, 120));
  const q = params.toString();
  const path = q ? `/devis?${q}` : "/devis";
  void logActivity({
    action: "devis_click",
    status: "attempt",
    targetType: opts?.serviceId ? "service" : opts?.productId ? "product" : opts?.sellerId ? "profile" : "devis",
    targetId: opts?.serviceId || opts?.productId || opts?.sellerId || null,
    targetLabel: opts?.sellerName || opts?.fromLabel || null,
    message: opts?.fromLabel || "Ouverture formulaire devis",
    path: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : null,
    meta: {
      to: path,
      sellerId: opts?.sellerId || null,
      serviceId: opts?.serviceId || null,
      productId: opts?.productId || null,
    },
  });
  return path;
};
