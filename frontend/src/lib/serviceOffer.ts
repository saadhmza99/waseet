import { plainText } from "@/lib/safeText";

export const SERVICE_CATEGORIES = [
  "Immobilier",
  "Gestion immobilière",
  "Construction",
  "Rénovation & Aménagement",
  "Architecture",
  "Foncier & Conseil",
  "Notaires & Juridique",
  "ImmoTech",
  "Autres",
] as const;

export const SERVICE_KINDS = ["Conseil", "Réalisation", "Accompagnement", "Gestion", "Installation", "Étude"] as const;

export const SERVICE_AUDIENCES = [
  "Particuliers",
  "Propriétaires",
  "Agences immobilières",
  "Promoteurs",
  "Entreprises",
  "Investisseurs",
  "Architectes / Bureaux d'études",
  "Autres",
] as const;

export type PriceMode = "devis" | "from" | "fixed";
export type ZoneMode = "villes" | "region" | "maroc";

export type ServiceOffer = {
  title: string;
  category: string;
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
};

export const emptyOffer = (): ServiceOffer => ({
  title: "",
  category: "",
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
});

const listed = (value: string, allowed: readonly string[]) => (allowed.includes(value) ? value : "");

const lines = (items: string[], maxItems: number, maxLen: number) =>
  items.map((item) => plainText(item, maxLen)).filter(Boolean).slice(0, maxItems);

export const sanitizeOffer = (offer: ServiceOffer): ServiceOffer => {
  const amount = plainText(offer.amount, 16).replace(/[^\d\s]/g, "").trim();
  const priceMode: PriceMode = offer.priceMode === "from" || offer.priceMode === "fixed" ? offer.priceMode : "devis";
  const zoneMode: ZoneMode = offer.zoneMode === "region" || offer.zoneMode === "maroc" ? offer.zoneMode : "villes";
  return {
    title: plainText(offer.title, 120),
    category: listed(plainText(offer.category, 80), SERVICE_CATEGORIES),
    description: plainText(offer.description, 4000),
    cover: plainText(offer.cover, 2000),
    gallery: lines(offer.gallery || [], 12, 2000),
    kinds: lines(offer.kinds || [], 6, 40).filter((item) => (SERVICE_KINDS as readonly string[]).includes(item)),
    included: lines(offer.included || [], 16, 120),
    options: lines(offer.options || [], 16, 120),
    priceMode,
    amount: priceMode === "devis" ? "" : amount,
    duration: plainText(offer.duration, 60),
    zoneMode,
    cities: zoneMode === "villes" ? lines(offer.cities || [], 12, 80) : [],
    region: zoneMode === "region" ? plainText(offer.region, 80) : "",
    travel: Boolean(offer.travel),
    remote: Boolean(offer.remote),
    audiences: lines(offer.audiences || [], 8, 80).filter((item) => (SERVICE_AUDIENCES as readonly string[]).includes(item)),
    audienceOther: (offer.audiences || []).includes("Autres") ? plainText(offer.audienceOther, 80) : "",
  };
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
  Boolean(offer.title.trim() && offer.category && offer.description.trim() && zoneLabel(offer).trim());

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
