import { supabase } from "@/lib/supabase";
import { productCategoryFr } from "@/lib/productTaxonomy";

export type ProductProfile = {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  location?: string | null;
  profession?: string | null;
  phone?: string | null;
  email?: string | null;
  website_url?: string | null;
};

export type ProductRow = {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  brand?: string | null;
  sku?: string | null;
  price?: number | string | null;
  currency?: string | null;
  unit?: string | null;
  min_quantity?: string | null;
  cover?: string | null;
  gallery?: string[] | null;
  delivery_cities?: string[] | null;
  attributes?: Record<string, unknown> | null;
  source_url?: string | null;
  created_at?: string;
  profiles?: ProductProfile | ProductProfile[] | null;
};

const PRODUCT_LIST_SELECT = `
  id,
  user_id,
  title,
  description,
  category,
  brand,
  sku,
  price,
  currency,
  unit,
  min_quantity,
  cover,
  gallery,
  delivery_cities,
  attributes,
  source_url,
  created_at,
  profiles:user_id (
    id,
    username,
    full_name,
    avatar_url,
    location,
    profession,
    phone,
    email,
    website_url
  )
`;

export const productPhotos = (row: ProductRow): string[] => {
  const urls: string[] = [];
  const push = (url?: string | null) => {
    const value = (url || "").trim();
    if (value && !urls.includes(value)) urls.push(value);
  };
  push(row.cover);
  if (Array.isArray(row.gallery)) row.gallery.forEach((url) => push(url));
  return urls;
};

export const productProfile = (row: ProductRow): ProductProfile | null => {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return profile || null;
};

export const productFirmName = (row: ProductRow) => {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return profile?.full_name || profile?.username || "Fournisseur";
};

export const productFirmUsername = (row: ProductRow) => {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return profile?.username || "";
};

const BAD_UNITS = new Set(["schema", "html", "undefined", "null", "json"]);

export const productPriceLabel = (row: ProductRow) => {
  const amount = Number(row.price);
  if (!Number.isFinite(amount) || amount <= 0) return "Prix sur demande";
  const currency = (row.currency || "MAD").trim() || "MAD";
  const formatted = new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(amount);
  const unit = (row.unit || "").trim();
  const unitOk = unit && !BAD_UNITS.has(unit.toLowerCase()) && !/[{}<>"]/.test(unit);
  return unitOk ? `${formatted} ${currency} / ${unit}` : `${formatted} ${currency}`;
};

export const productCategoryLabel = (row: ProductRow) => {
  const attrs = row.attributes && typeof row.attributes === "object" ? row.attributes : {};
  const fr = typeof attrs.category_fr === "string" ? attrs.category_fr : "";
  return fr || productCategoryFr(row.category) || (row.category || "");
};

export const productUnitLabel = (row: ProductRow) => {
  const unit = (row.unit || "").trim();
  if (!unit || BAD_UNITS.has(unit.toLowerCase()) || /[{}<>"]/.test(unit)) return "";
  return unit;
};

const isJunkSpec = (text: string) => {
  const low = text.toLowerCase().replace(/\s+/g, "");
  return (
    low.includes("availablesuppliers") ||
    low.includes("whatsappphone") ||
    low.includes("voirfiche") ||
    low.includes("dangerouslysetinnerhtml")
  );
};

export const productTechnicalSpecsPair = (row: ProductRow) => {
  const attrs = row.attributes && typeof row.attributes === "object" ? row.attributes : {};
  const detailedRaw =
    typeof attrs.technical_specifications_detailed === "string"
      ? attrs.technical_specifications_detailed.trim()
      : "";
  const originalRaw =
    typeof attrs.technical_specifications_original === "string"
      ? attrs.technical_specifications_original.trim()
      : "";
  const legacy = typeof attrs.specs === "string" ? attrs.specs.trim() : "";
  const detailed = detailedRaw && !isJunkSpec(detailedRaw) ? detailedRaw : "";
  const original = originalRaw && !isJunkSpec(originalRaw) ? originalRaw : "";
  const fallback = legacy && !isJunkSpec(legacy) ? legacy : "";
  return {
    detailed: detailed || (!original ? fallback : ""),
    original: original && original !== detailed ? original : "",
  };
};

/** Prefer detailed technical specs, then original, then legacy specs. */
export const productTechnicalSpecs = (row: ProductRow) => {
  const pair = productTechnicalSpecsPair(row);
  return pair.detailed || pair.original || "";
};

export const productFromPriceLabel = (rows: ProductRow[]) => {
  const amounts = rows
    .map((row) => Number(row.price))
    .filter((amount) => Number.isFinite(amount) && amount > 0);
  if (!amounts.length) return "Prix sur demande";
  const min = Math.min(...amounts);
  const currency = (rows[0]?.currency || "MAD").trim() || "MAD";
  const formatted = new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(min);
  const unit = productUnitLabel(rows[0] || ({} as ProductRow));
  const base = `À PARTIR DE ${formatted} ${currency}`;
  return unit ? `${base} / ${unit}` : base;
};

export type CreateProductInput = {
  title: string;
  description?: string | null;
  category?: string | null;
  brand?: string | null;
  sku?: string | null;
  price?: number | null;
  currency?: string | null;
  unit?: string | null;
  min_quantity?: string | null;
  cover?: string | null;
  gallery?: string[];
  delivery_cities?: string[];
  attributes?: Record<string, unknown> | null;
  source_url?: string | null;
};

export const productService = {
  async createProduct(userId: string, input: CreateProductInput): Promise<ProductRow> {
    const title = (input.title || "").trim();
    if (!title) throw new Error("Le titre est requis");
    const gallery = Array.isArray(input.gallery) ? input.gallery.filter(Boolean) : [];
    const cover = (input.cover || "").trim() || gallery[0] || null;
    const delivery_cities = Array.isArray(input.delivery_cities)
      ? input.delivery_cities.map((c) => c.trim()).filter(Boolean)
      : [];
    const priceRaw = input.price;
    const price =
      priceRaw == null || Number.isNaN(Number(priceRaw)) ? null : Number(priceRaw);

    const { data, error } = await supabase
      .from("products")
      .insert({
        user_id: userId,
        title,
        description: (input.description || "").trim() || null,
        category: (input.category || "").trim() || null,
        brand: (input.brand || "").trim() || null,
        sku: (input.sku || "").trim() || null,
        price,
        currency: (input.currency || "MAD").trim() || "MAD",
        unit: (input.unit || "").trim() || null,
        min_quantity: (input.min_quantity || "").trim() || null,
        cover,
        gallery,
        delivery_cities,
        attributes: input.attributes && typeof input.attributes === "object" ? input.attributes : {},
        source_url: (input.source_url || "").trim() || null,
      })
      .select(PRODUCT_LIST_SELECT)
      .single();
    if (error) throw error;
    return data as ProductRow;
  },

  async listProducts(limit = 300, offset = 0): Promise<ProductRow[]> {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_LIST_SELECT)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return (data || []) as ProductRow[];
  },

  async getProduct(id: string): Promise<ProductRow | null> {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_LIST_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as ProductRow) || null;
  },

  async listProductsByUser(userId: string, limit = 12, offset = 0) {
    const { data, error, count } = await supabase
      .from("products")
      .select(PRODUCT_LIST_SELECT, { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit);
    if (error) throw error;
    const rows = (data || []) as ProductRow[];
    return Object.assign(rows, { totalCount: count ?? rows.length });
  },

  /** Other listings of the same product (same title, or same sku when present). */
  async listSameProductOffers(row: ProductRow, limit = 40): Promise<ProductRow[]> {
    const title = (row.title || "").trim();
    const sku = (row.sku || "").trim();
    if (!title && !sku) return [];

    const byId = new Map<string, ProductRow>();
    if (title) {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_LIST_SELECT)
        .neq("id", row.id)
        .ilike("title", title)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      for (const item of (data || []) as ProductRow[]) byId.set(item.id, item);
    }
    if (sku) {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_LIST_SELECT)
        .neq("id", row.id)
        .eq("sku", sku)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      for (const item of (data || []) as ProductRow[]) byId.set(item.id, item);
    }
    return [...byId.values()].slice(0, limit);
  },
};
