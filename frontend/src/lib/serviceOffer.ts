import { plainText } from "@/lib/safeText";

export const SERVICE_KINDS = [
  "Conseil",
  "Réalisation",
  "Accompagnement",
  "Gestion",
  "Installation",
  "Étude",
  "Fourniture",
] as const;

export const SERVICE_AUDIENCES = [
  "Particuliers",
  "Propriétaires",
  "Agences immobilières",
  "Promoteurs",
  "Entreprises",
  "Collectivités",
  "Investisseurs",
  "Architectes / Bureaux d'études",
  "Autres",
] as const;

export const SERVICE_MISSIONS = ["National", "International"] as const;

export type PriceMode = "devis" | "from" | "fixed";
export type ZoneMode = "villes" | "region" | "maroc";

export type ServiceOffer = {
  title: string;
  category: string;
  /** Author specialty from Paramètres (`internal_categories.id`). */
  internalCategoryId: number | null;
  description: string;
  cover: string;
  gallery: string[];
  kinds: string[];
  included: string[];
  options: string[];
  priceMode: PriceMode;
  amount: string;
  duration: string;
  zoneMode: ZoneMode;
  cities: string[];
  region: string;
  travel: boolean;
  remote: boolean;
  audiences: string[];
  audienceOther: string;
  missions: string[];
};

export const emptyOffer = (): ServiceOffer => ({
  title: "",
  category: "",
  internalCategoryId: null,
  description: "",
  cover: "",
  gallery: [],
  kinds: [],
  included: [],
  options: [],
  priceMode: "devis",
  amount: "",
  duration: "",
  zoneMode: "villes",
  cities: [],
  region: "",
  travel: false,
  remote: false,
  audiences: [],
  audienceOther: "",
  missions: [],
});

const lines = (items: string[], maxItems: number, maxLen: number) =>
  items.map((item) => plainText(item, maxLen)).filter(Boolean).slice(0, maxItems);

/** Scraped CSV put "Mission nationale" / "Mission à l'international" into options — those belong in missions. */
const isMissionOptionLine = (value: string) => {
  const text = value.trim().toLowerCase();
  if (!text) return false;
  if (/^mission(s)?\s+(nationale?|internationales?|à l'international|a l'international)\b/.test(text)) return true;
  if (/^missions?\s+internationales?\b/.test(text)) return true;
  return (SERVICE_MISSIONS as readonly string[]).some((item) => item.toLowerCase() === text);
};

const missionFromOptionLine = (value: string): (typeof SERVICE_MISSIONS)[number] | null => {
  const text = value.trim().toLowerCase();
  if (/international/.test(text)) return "International";
  if (/national/.test(text)) return "National";
  if (text === "international") return "International";
  if (text === "national") return "National";
  return null;
};

export const sanitizeOffer = (offer: ServiceOffer): ServiceOffer => {
  const amount = plainText(offer.amount, 16).replace(/[^\d\s]/g, "").trim();
  const priceMode: PriceMode = offer.priceMode === "from" || offer.priceMode === "fixed" ? offer.priceMode : "devis";
  const zoneMode: ZoneMode = offer.zoneMode === "region" || offer.zoneMode === "maroc" ? offer.zoneMode : "villes";
  const rawOptions = lines(offer.options || [], 16, 120);
  const missionsFromOptions = rawOptions
    .filter(isMissionOptionLine)
    .map(missionFromOptionLine)
    .filter(Boolean) as string[];
  const missions = [
    ...new Set([
      ...lines(offer.missions || [], 2, 40).filter((item) => (SERVICE_MISSIONS as readonly string[]).includes(item)),
      ...missionsFromOptions.filter((item) => (SERVICE_MISSIONS as readonly string[]).includes(item)),
    ]),
  ].slice(0, 2);
  return {
    title: plainText(offer.title, 120),
    category: plainText(offer.category, 120),
    internalCategoryId:
      typeof offer.internalCategoryId === "number" && Number.isFinite(offer.internalCategoryId)
        ? offer.internalCategoryId
        : null,
    description: plainText(offer.description, 4000),
    cover: plainText(offer.cover, 2000),
    gallery: lines(offer.gallery || [], 12, 2000),
    kinds: lines(offer.kinds || [], 6, 40).filter((item) => (SERVICE_KINDS as readonly string[]).includes(item)),
    included: lines(offer.included || [], 16, 120),
    options: rawOptions.filter((item) => !isMissionOptionLine(item)),
    priceMode,
    amount: priceMode === "devis" ? "" : amount,
    duration: plainText(offer.duration, 60),
    zoneMode,
    cities: zoneMode === "villes" ? lines(offer.cities || [], 12, 80) : [],
    region: zoneMode === "region" ? plainText(offer.region, 80) : "",
    travel: Boolean(offer.travel),
    remote: Boolean(offer.remote),
    audiences: lines(offer.audiences || [], 9, 80).filter((item) => (SERVICE_AUDIENCES as readonly string[]).includes(item)),
    audienceOther: (offer.audiences || []).includes("Autres") ? plainText(offer.audienceOther, 80) : "",
    missions,
  };
};

/** Gallery URLs are real photos. Cover alone (empty gallery) is treated as a logo. */
export const servicePhotos = (offer: Pick<ServiceOffer, "gallery">): string[] =>
  (offer.gallery || []).map((url) => String(url || "").trim()).filter(Boolean);

/** Logo-only covers (no gallery photos) stay contained; photo services use gallery. */
export const serviceCoverIsLogo = (offer: Pick<ServiceOffer, "cover" | "gallery">) =>
  Boolean(String(offer.cover || "").trim() && !servicePhotos(offer).length);

/** Card / hero: first photo when gallery exists, otherwise cover (logo or empty). */
export const serviceMainImage = (offer: Pick<ServiceOffer, "cover" | "gallery">, fallback = "") => {
  const photos = servicePhotos(offer);
  if (photos.length) return photos[0];
  return String(offer.cover || "").trim() || fallback;
};

export const zoneLabel = (offer: ServiceOffer) => {
  if (offer.zoneMode === "maroc") return "Maroc";
  if (offer.zoneMode === "region") return offer.region;
  return offer.cities.join(" · ");
};

export const priceLabel = (offer: ServiceOffer) => {
  const amount = Number(String(offer.amount).replace(/\s/g, ""));
  const formatted = amount ? `${amount.toLocaleString("fr-FR")} MAD` : "";
  if (offer.priceMode === "from") return formatted ? `À partir de ${formatted}` : "À partir de";
  if (offer.priceMode === "fixed") return formatted || "Tarif fixe";
  return "Sur devis";
};

export const offerIsReady = (offer: ServiceOffer) =>
  Boolean(
    offer.title.trim() &&
      offer.category &&
      offer.internalCategoryId != null &&
      offer.description.trim() &&
      zoneLabel(offer).trim()
  );

const asStringList = (value: unknown) =>
  (Array.isArray(value) ? value : []).map((item) => String(item || "").trim()).filter(Boolean);

/** Flatten create-form offer into English typed service columns. */
export const rowFromOffer = (offer: ServiceOffer) => {
  const clean = sanitizeOffer(offer);
  return {
    title: clean.title,
    description: clean.description || null,
    category: clean.category || null,
    internal_category_id: clean.internalCategoryId,
    cover: clean.cover || null,
    gallery: clean.gallery,
    kinds: clean.kinds,
    included: clean.included,
    options: clean.options,
    price_mode: clean.priceMode,
    amount: clean.amount || null,
    duration: clean.duration || null,
    zone_mode: clean.zoneMode,
    cities: clean.cities,
    region: clean.region || null,
    travel: clean.travel,
    remote: clean.remote,
    audiences: clean.audiences,
    audience_other: clean.audienceOther || null,
    missions: clean.missions,
  };
};

/** Read a DB row into a ServiceOffer. */
export const offerFromRow = (row: any): ServiceOffer =>
  sanitizeOffer({
    ...emptyOffer(),
    title: row?.title || "",
    description: row?.description || "",
    category: row?.category || "",
    internalCategoryId:
      typeof row?.internal_category_id === "number" ? row.internal_category_id : null,
    cover: row?.cover || "",
    gallery: asStringList(row?.gallery),
    kinds: asStringList(row?.kinds),
    included: asStringList(row?.included),
    options: asStringList(row?.options),
    priceMode: row?.price_mode === "from" || row?.price_mode === "fixed" ? row.price_mode : "devis",
    amount: row?.amount || "",
    duration: row?.duration || "",
    zoneMode: row?.zone_mode === "region" || row?.zone_mode === "maroc" ? row.zone_mode : "villes",
    cities: asStringList(row?.cities),
    region: row?.region || "",
    travel: Boolean(row?.travel),
    remote: Boolean(row?.remote),
    audiences: asStringList(row?.audiences),
    audienceOther: row?.audience_other || "",
    missions: asStringList(row?.missions),
  });

const DRAFT_KEY = "sifarah.serviceDraft.v1";

export const saveServiceDraft = (userId: string, offer: ServiceOffer) => {
  localStorage.setItem(`${DRAFT_KEY}.${userId}`, JSON.stringify(sanitizeOffer(offer)));
};

export const loadServiceDraft = (userId: string): ServiceOffer | null => {
  try {
    const raw = localStorage.getItem(`${DRAFT_KEY}.${userId}`);
    if (!raw) return null;
    return sanitizeOffer({ ...emptyOffer(), ...JSON.parse(raw) });
  } catch {
    return null;
  }
};

export const clearServiceDraft = (userId: string) => {
  localStorage.removeItem(`${DRAFT_KEY}.${userId}`);
};
