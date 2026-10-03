import { projectMetrics } from "@/lib/projectDossier";
import { SHOWCASE_POSTS } from "@/lib/showcasePosts";
import { SHOWCASE_PROJECTS } from "@/lib/showcaseProjects";
import { SHOWCASE_PROPERTIES } from "@/lib/showcaseProperties";
import { SHOWCASE_SERVICES } from "@/lib/showcaseServices";
import { featureLabel, labelOf, PROPERTY_STANDINGS } from "@/lib/propertyListing";
import { priceLabel } from "@/lib/serviceOffer";

type CategoryId =
  | "foncier"
  | "gestion"
  | "biens"
  | "construction"
  | "renovation"
  | "architecture"
  | "notaires"
  | "immotech"
  | "autres";

type ItemKind = "actualite" | "bien" | "projet" | "annonce" | "agence";

export type DiscoverItem = {
  id: string;
  category: CategoryId;
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

const SERVICE_CATEGORY: Record<string, CategoryId> = {
  Immobilier: "gestion",
  "Gestion immobilière": "gestion",
  Construction: "construction",
  "Rénovation & Aménagement": "renovation",
  Architecture: "architecture",
  "Foncier & Conseil": "foncier",
  "Notaires & Juridique": "notaires",
  ImmoTech: "immotech",
  Autres: "autres",
};

const PROJECT_FIRM: Record<string, { firm: string; category: CategoryId }> = {
  "showcase-faubourgs-anfa": { firm: "Bouygues Immobilier", category: "biens" },
  "showcase-chu-beni-mellal": { firm: "TGCC", category: "construction" },
  "showcase-bmce-casa": { firm: "CHB Architects", category: "architecture" },
  "showcase-renault-tanger": { firm: "Renault Group", category: "construction" },
};

const PROPERTY_FIRM: Record<string, string> = {
  "showcase-anfa-place-129": "Anfa Place Living Resort",
  "showcase-tours-vegetales-148": "Yasmine Signature",
  "showcase-dar-tounsi": "Dar Tounsi",
  "showcase-cfc-bureau-161": "Century 21 Casa",
  "showcase-riad-mouassine": "Maison 26",
  "showcase-cfc-plateau-430": "Casablanca Finance City",
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
};

const priceOf = (priceDh: string, category: string) => {
  const amount = Number(String(priceDh).replace(/\s/g, ""));
  if (!amount) return "";
  const formatted = `${amount.toLocaleString("fr-FR")} DH`;
  return category === "location" || category === "location_vacances" ? `${formatted} / mois` : formatted;
};

const projects: DiscoverItem[] = SHOWCASE_PROJECTS.map((row) => {
  const meta = PROJECT_FIRM[row.id] || { firm: row.title, category: "biens" as CategoryId };
  const dossier = row.details.dossier;
  return {
    id: row.id,
    category: meta.category,
    kind: "projet",
    profileName: meta.firm,
    image: row.images[0] || "",
    title: row.title,
    city: row.city,
    progress: dossier.progress,
    description: row.description,
    highlights: projectMetrics(dossier)
      .filter((item) => item.label !== "avancement" && item.label !== "réalisé")
      .sort((a, b) => Number(!/logement|surface/.test(a.label)) - Number(!/logement|surface/.test(b.label)))
      .slice(0, 3)
      .map((item) => `${item.value} ${item.label}`),
  };
});

const biens: DiscoverItem[] = SHOWCASE_PROPERTIES.map((row) => {
  const { details } = row;
  return {
    id: row.id,
    category: "biens",
    kind: "bien",
    profileName: PROPERTY_FIRM[row.id] || details.title,
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
  category: SERVICE_CATEGORY[row.offer.category] || "autres",
  kind: "annonce",
  profileName: row.firm,
  image: row.offer.cover || row.offer.gallery[0] || "",
  title: row.offer.title,
  city: FIRM_CITY[row.firm] || row.offer.cities[0] || "Casablanca",
  price: priceLabel(row.offer),
  description: row.offer.description,
  highlights: row.offer.included.slice(0, 4),
}));

const accounts: DiscoverItem[] = [
  ...SHOWCASE_SERVICES.map((row) => ({
    id: `account-${row.id}`,
    category: SERVICE_CATEGORY[row.offer.category] || "autres",
    kind: "agence" as const,
    profileName: row.firm,
    image: row.offer.cover || "",
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
      category: item.profileName === "Century 21 Casa" || item.profileName === "Maison 26" ? "gestion" as const : item.category,
    })),
];

const posts: DiscoverItem[] = SHOWCASE_POSTS.map((row) => ({
  id: row.id,
  category: SERVICE_CATEGORY[row.profiles.profession] || (row.profiles.profession === "Immobilier" ? "gestion" : "autres"),
  kind: "actualite",
  profileName: row.profiles.full_name,
  image: row.images[0] || "",
  title: row.profiles.full_name,
  city: row.city,
  description: row.description,
}));

export const DISCOVER_ITEMS: DiscoverItem[] = [...accounts, ...projects, ...biens, ...services, ...posts];
