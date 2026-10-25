import { projectMetrics } from "@/lib/projectDossier";
import { SHOWCASE_POSTS } from "@/lib/showcasePosts";
import { SHOWCASE_PROJECTS } from "@/lib/archive/showcaseProjects.mock";
import { SHOWCASE_PROPERTIES } from "@/lib/archive/showcaseProperties.mock";
import { SHOWCASE_SERVICES } from "@/lib/archive/showcaseServices.mock";
import { featureLabel, labelOf, PROPERTY_STANDINGS } from "@/lib/propertyListing";
import { priceLabel } from "@/lib/serviceOffer";
import { feedSubCategoryBySlug } from "@/lib/taxonomy";

type ItemKind = "actualite" | "bien" | "projet" | "annonce" | "agence";

export type DiscoverItem = {
  id: string;
  feed_category: string;
  feed_sub_category: string;
  kind: ItemKind;
  profileName: string;
  image: string;
  title: string;
  city: string;
  price?: string;
  surface?: string;
  beds?: number;
  deal?: "sale" | "rent";
  blurb?: string;
  progress?: number;
  baths?: number;
  description?: string;
  highlights?: string[];
};

const tags = (subCategorySlug: string) => ({
  feed_category: feedSubCategoryBySlug(subCategorySlug)?.category.slug || "",
  feed_sub_category: subCategorySlug,
});

const PROJECT_FIRM: Record<string, { firm: string; subCategory: string }> = {
  "showcase-faubourgs-anfa": { firm: "Bouygues Immobilier", subCategory: "promotion-immobiliere" },
  "showcase-chu-beni-mellal": { firm: "TGCC", subCategory: "construction-gros-oeuvre" },
  "showcase-bmce-casa": { firm: "CHB Architects", subCategory: "architecture" },
  "showcase-renault-tanger": { firm: "Renault Group", subCategory: "construction-gros-oeuvre" },
  "KRX-PRJ-0661e901ab0f": { firm: "Aghouatim Al Baraka", subCategory: "promotion-immobiliere" },
  "KRX-PRJ-ad60d8387d59": { firm: "Addoha", subCategory: "promotion-immobiliere" },
  "KRX-PRJ-212ab9b6df14": { firm: "Alliances Darna", subCategory: "promotion-immobiliere" },
};

// Biens are published by Gestion & services immobiliers professionals only.
const PROPERTY_FIRM: Record<string, { firm: string; subCategory: string }> = {
  "showcase-anfa-place-129": { firm: "Anfa Place Living Resort", subCategory: "promotion-immobiliere" },
  "showcase-tours-vegetales-148": { firm: "Yasmine Signature", subCategory: "promotion-immobiliere" },
  "showcase-dar-tounsi": { firm: "Dar Tounsi", subCategory: "promotion-immobiliere" },
  "showcase-cfc-bureau-161": { firm: "Century 21 Casa", subCategory: "agences-agents" },
  "showcase-riad-mouassine": { firm: "Maison 26", subCategory: "agences-agents" },
  "showcase-cfc-plateau-430": { firm: "Casablanca Finance City", subCategory: "promotion-immobiliere" },
};

const FIRM_CITY: Record<string, string> = {
  "CHB Architects": "Casablanca",
  "Interstyle Design": "Casablanca",
  "Compagnie Générale Immobilière": "Casablanca",
  TGCC: "Casablanca",
  BETAM: "Casablanca",
  "Hajji & Associés": "Casablanca",
  "Bouygues Immobilier": "Casablanca",
  "Renault Group": "Tanger",
  "Yasmine Signature": "Casablanca",
  "Century 21 Casa": "Casablanca",
  "Maison 26": "Marrakech",
  "Anfa Place Living Resort": "Casablanca",
  "Dar Tounsi": "Marrakech",
  "Casablanca Finance City": "Casablanca",
  Castlewood: "Casablanca",
  ALQUIMAROC: "Casablanca",
  "AGS GROUPE": "Marrakech",
};

const priceOf = (priceDh: string, category: string) => {
  const amount = Number(String(priceDh).replace(/\s/g, ""));
  if (!amount) return "";
  const formatted = `${amount.toLocaleString("fr-FR")} DH`;
  return category === "location" || category === "location_vacances" ? `${formatted} / mois` : formatted;
};

const projects: DiscoverItem[] = SHOWCASE_PROJECTS.map((row) => {
  const meta = PROJECT_FIRM[row.id] || { firm: row.title, subCategory: "promotion-immobiliere" };
  const dossier = row.details?.dossier;
  return {
    id: row.id,
    ...tags(meta.subCategory),
    kind: "projet",
    profileName: meta.firm,
    image: row.cover_image || row.images[0] || "",
    title: row.title,
    city: row.city,
    progress: row.progress ?? dossier?.progress,
    description: row.description,
    highlights: projectMetrics(dossier || { progress: row.progress || 0, category: "immobilier", fields: {} } as any)
      .filter((item) => item.label !== "avancement" && item.label !== "réalisé")
      .sort((a, b) => Number(!/logement|surface/.test(a.label)) - Number(!/logement|surface/.test(b.label)))
      .slice(0, 3)
      .map((item) => `${item.value} ${item.label}`),
  };
});

const biens: DiscoverItem[] = SHOWCASE_PROPERTIES.map((row) => {
  const { details } = row;
  const meta = PROPERTY_FIRM[row.id] || { firm: details.title, subCategory: "agences-agents" };
  return {
    id: row.id,
    ...tags(meta.subCategory),
    kind: "bien",
    profileName: meta.firm,
    image: row.images[0] || "",
    title: details.title,
    city: details.city,
    price: priceOf(details.priceDh, details.category),
    surface: details.builtSurface ? `${details.builtSurface} m²` : "",
    beds: details.beds || undefined,
    baths: details.baths || undefined,
    deal: details.category === "location" || details.category === "location_vacances" ? "rent" : "sale",
    description: details.description,
    highlights: [
      labelOf(PROPERTY_STANDINGS, details.standing),
      ...details.features.slice(0, 4).map((feature) => featureLabel(feature)),
    ].filter(Boolean),
  };
});

const services: DiscoverItem[] = SHOWCASE_SERVICES.map((row) => ({
  id: row.id,
  feed_category: row.feed_category,
  feed_sub_category: row.feed_sub_category,
  kind: "annonce",
  profileName: row.firm,
  image: row.offer.gallery[0] || row.offer.cover || "",
  title: row.offer.title,
  city: FIRM_CITY[row.firm] || row.offer.cities[0] || "Casablanca",
  price: priceLabel(row.offer),
  description: row.offer.description,
  highlights: row.offer.included.slice(0, 4),
}));

const accounts: DiscoverItem[] = [
  ...SHOWCASE_SERVICES.map((row) => ({
    id: `account-${row.id}`,
    feed_category: row.feed_category,
    feed_sub_category: row.feed_sub_category,
    kind: "agence" as const,
    profileName: row.firm,
    image: row.offer.gallery[0] || row.offer.cover || "",
    title: row.firm,
    city: FIRM_CITY[row.firm] || "Casablanca",
    description: row.offer.description,
    highlights: row.offer.included.slice(0, 4),
  })),
  ...projects
    .filter((item) => !SHOWCASE_SERVICES.some((service) => service.firm === item.profileName))
    .map((item) => ({
      ...item,
      id: `account-${item.id}`,
      kind: "agence" as const,
      title: item.profileName,
      city: FIRM_CITY[item.profileName] || item.city,
    })),
  ...biens
    .filter((item) => !SHOWCASE_SERVICES.some((service) => service.firm === item.profileName))
    .filter((item) => !projects.some((project) => project.profileName === item.profileName))
    .map((item) => ({
      ...item,
      id: `account-${item.id}`,
      kind: "agence" as const,
      title: item.profileName,
      city: FIRM_CITY[item.profileName] || item.city,
    })),
];

const posts: DiscoverItem[] = SHOWCASE_POSTS.map((row) => ({
  id: row.id,
  feed_category: row.feed_category,
  feed_sub_category: row.feed_sub_category,
  kind: "actualite",
  profileName: row.profiles.full_name,
  image: row.images[0] || "",
  title: row.profiles.full_name,
  city: row.city,
  description: row.description,
}));

export const DISCOVER_ITEMS: DiscoverItem[] = [...accounts, ...projects, ...biens, ...services, ...posts];
