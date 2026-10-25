import type { ShowcaseService } from "@/lib/showcaseServices";
import { sanitizeOffer, type ServiceOffer } from "@/lib/serviceOffer";
import { feedSubCategoryBySlug } from "@/lib/taxonomy";

/** Frontend-only Tachrone / Kerix-style service previews. Not written to Supabase. */
export type ServicePreviewMeta = {
  firmId: string;
  zoneLabel: string;
  includedSource: string;
  scrapeConfidence: string;
  scrapeOk: boolean;
  publishable: boolean;
  contactPhone: string;
  contactEmail: string;
  scrapeFeedSubCategory: string;
};

export type ServicePreviewRow = ShowcaseService & {
  preview: true;
  meta: ServicePreviewMeta;
};

const toCities = (raw: string) =>
  raw
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

const toLines = (raw: string) =>
  raw
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

/** Photos field: cover first when present, then gallery URLs. Empty gallery + cover only ⇒ logo. */
const toPhotos = (cover: string, galleryRaw: string) => {
  const gallery = toLines(galleryRaw);
  const main = cover.trim();
  if (!gallery.length) return { cover: main, gallery: [] as string[] };
  const photos = main && !gallery.includes(main) ? [main, ...gallery] : gallery;
  return { cover: "", gallery: photos };
};

const preview = (input: {
  id: string;
  firm: string;
  firmId: string;
  sourceUrl: string;
  feedSubCategory: string;
  scrapeFeedSubCategory: string;
  zoneLabel: string;
  includedSource: string;
  scrapeConfidence: string;
  scrapeOk: boolean;
  publishable: boolean;
  contactPhone: string;
  contactEmail: string;
  offer: Omit<ServiceOffer, "category">;
}): ServicePreviewRow => {
  const match = feedSubCategoryBySlug(input.feedSubCategory);
  return {
    id: input.id,
    firm: input.firm,
    sourceUrl: input.sourceUrl,
    feed_category: match?.category.slug || "",
    feed_sub_category: match?.subCategory.slug || input.feedSubCategory,
    preview: true,
    meta: {
      firmId: input.firmId,
      zoneLabel: input.zoneLabel,
      includedSource: input.includedSource,
      scrapeConfidence: input.scrapeConfidence,
      scrapeOk: input.scrapeOk,
      publishable: input.publishable,
      contactPhone: input.contactPhone,
      contactEmail: input.contactEmail,
      scrapeFeedSubCategory: input.scrapeFeedSubCategory,
    },
    offer: sanitizeOffer({
      ...input.offer,
      category: match?.subCategory.label || "",
    }),
  };
};

const castlewoodPhotos = toPhotos(
  "https://tachrone-profile-logos-pro.s3.eu-west-3.amazonaws.com/file-50.png",
  "",
);

const castlewood = preview({
  id: "SVC-PRO-TCH-9-installation-de-revetement-mural-prestation-professi",
  firm: "Castlewood",
  firmId: "PRO-TCH-9",
  sourceUrl: "https://castlewood.ma/",
  feedSubCategory: "second-oeuvre",
  scrapeFeedSubCategory: "installation-de-revetement-mural",
  zoneLabel: "Benslimane, Casablanca, El Jadida, Larache, Marrakech, Rabat…",
  includedSource: "metier_template",
  scrapeConfidence: "db_only",
  scrapeOk: false,
  publishable: true,
  contactPhone: "+212621438334",
  contactEmail: "contactcastlewood@gmail.com",
  offer: {
    title: "Installation de revêtement mural — prestation professionnelle",
    description:
      "Castle Wood est une entreprise marocaine spécialisée dans l’aménagement intérieur sous toutes ses formes, avec une expérience terrain de 25 ans. Elle propose des solutions globales et personnalisées englobant la conception, la fabrication et la réalisation d’équipements intérieurs pour les habitations, les bureaux, ainsi que les espaces commerciaux et professionnels. Son champ d’intervention inclut les cuisines équipées, les placards, les dressings, les meubles de salle de bain, ainsi que des agencements sur mesure, tout en alliant qualité, précision et innovation à chaque étape du projet. Tarif établi sur devis selon le périmètre de la mission.",
    cover: castlewoodPhotos.cover,
    gallery: castlewoodPhotos.gallery,
    kinds: toLines("Réalisation | Accompagnement"),
    included: toLines(
      "Prestation Installation de revêtement mural | Conseil et chiffrage sur devis | Intervention selon le périmètre convenu | Suivi jusqu'à livraison de la mission",
    ),
    options: [],
    priceMode: "devis",
    amount: "",
    duration: "",
    zoneMode: "villes",
    cities: toCities("Benslimane | Casablanca | El Jadida | Larache | Marrakech | Rabat | Tétouan"),
    region: "",
    travel: true,
    remote: false,
    audiences: toLines("Entreprises | Particuliers"),
    audienceOther: "",
    missions: [],
  },
});

const alquimarocPhotos = toPhotos(
  "https://alquimaroc.ma/wp-content/uploads/2026/03/2026-03-13-143915_upscayl_3x_ultramix-balanced-4x-768x979.png",
  "https://alquimaroc.ma/wp-content/uploads/2026/03/2026-03-13-143915_upscayl_3x_ultramix-balanced-4x-1205x1536.png | https://alquimaroc.ma/wp-content/uploads/2026/03/2026-03-13-143915_upscayl_3x_ultramix-balanced-4x-803x1024.png | https://alquimaroc.ma/wp-content/uploads/2026/03/2026-03-13-143915_upscayl_3x_ultramix-balanced-4x-1606x2048.png | https://alquimaroc.ma/wp-content/uploads/2026/03/2026-03-13-143915_upscayl_3x_ultramix-balanced-4x-235x300.png | https://alquimaroc.ma/wp-content/uploads/2024/12/image1.png | https://alquimaroc.ma/wp-content/uploads/2026/03/2026-03-13-143915_upscayl_3x_ultramix-balanced-4x.png | https://alquimaroc.ma/wp-content/uploads/elementor/thumbs/trans-600x800-1-qxvgs21vk7cq9fgia3j1angovcvn9vuhh76jo1gfuo.png",
);

const alquimaroc = preview({
  id: "SVC-PRO-TCH-11-materiel-de-chantier-prestation-professionnelle",
  firm: "ALQUIMAROC",
  firmId: "PRO-TCH-11",
  sourceUrl: "https://alquimaroc.ma/",
  feedSubCategory: "materiaux-equipements",
  scrapeFeedSubCategory: "materiel-de-chantier",
  zoneLabel: "Casablanca, Tanger",
  includedSource: "metier_template",
  scrapeConfidence: "db_only",
  scrapeOk: false,
  publishable: true,
  contactPhone: "+212666632495",
  contactEmail: "",
  offer: {
    title: "Matériel de chantier — prestation professionnelle",
    description:
      "AlquiMaroc a été créée pour répondre aux besoins spécifiques des secteurs de la construction, du génie civil, des travaux publics et de l’industrie. AlquiMaroc propose des services personnalisés et de qualité, qui se distinguent de ceux de ses concurrents. Depuis sa création, AlquiMaroc privilégie le professionnalisme et la proximité avec ses clients, ce qui lui permet de se distinguer sur des projets complexes. Grâce à cette approche, l’entreprise jouit de la confiance de ses partenaires et d’une solide réputation. En partenariat avec des entreprises de renom comme Faresin, elle propose des solutions innovantes et sur mesure, accompagnées d’un service d’ingénierie gratuit pour garantir un…. Tarif établi sur devis selon le périmètre de la mission.",
    cover: alquimarocPhotos.cover,
    gallery: alquimarocPhotos.gallery,
    kinds: toLines("Fourniture | Accompagnement"),
    included: toLines(
      "Conseil produit adapté au chantier | Devis et disponibilité stock | Livraison / retrait | Support technique commercial",
    ),
    options: [],
    priceMode: "devis",
    amount: "",
    duration: "",
    zoneMode: "villes",
    cities: toCities("Casablanca | Tanger"),
    region: "",
    travel: true,
    remote: false,
    audiences: toLines("Entreprises | Collectivités"),
    audienceOther: "",
    missions: [],
  },
});

const agsPhotos = toPhotos(
  "https://agsgroupe.com/wp-content/uploads/elementor/thumbs/4-rjofehebiwl71vy5u1e1gqe5xecuc18gcofvfkbiq0.png",
  "https://agsgroupe.com/wp-content/uploads/2025/05/Creation-sans-titre-2-738x1024.png | https://agsgroupe.com/wp-content/uploads/2025/05/2-5-1106x1536.png | https://agsgroupe.com/wp-content/uploads/2025/05/Creation-sans-titre-2-1475x2048.png | https://agsgroupe.com/wp-content/uploads/2025/05/21-1106x1536.png | https://agsgroupe.com/wp-content/uploads/2025/05/2-2-768x1066.png | https://agsgroupe.com/wp-content/uploads/2025/05/7-2-1106x1536.png | https://agsgroupe.com/wp-content/uploads/2025/05/10-2-1106x1536.png | https://agsgroupe.com/wp-content/uploads/2025/05/9-2-1106x1536.png",
);

const agsGroupe = preview({
  id: "SVC-PRO-TCH-25-construction-et-renovation-cle-en-main-villas-ri",
  firm: "AGS GROUPE",
  firmId: "PRO-TCH-25",
  sourceUrl: "https://www.agsgroupe.ma/",
  feedSubCategory: "construction-gros-oeuvre",
  scrapeFeedSubCategory: "construction_renovation",
  zoneLabel: "Marrakech-Safi",
  includedSource: "pilot_curated",
  scrapeConfidence: "high",
  scrapeOk: true,
  publishable: true,
  contactPhone: "+212661659618",
  contactEmail: "",
  offer: {
    title: "Construction et rénovation clé en main — villas & riads",
    description:
      "AGS Groupe (Marrakech) intervient en entreprise générale TCE sur villas contemporaines, riads et programmes résidentiels : construction neuve, rénovation patrimoniale, finitions artisanales (zellige, tadelakt), aménagement extérieur. Pilotage possible à distance (visio, drone, interlocuteur FR/EN). Chiffrage détaillé sous 48 h après visite.",
    cover: agsPhotos.cover,
    gallery: agsPhotos.gallery,
    kinds: toLines("Réalisation | Accompagnement"),
    included: toLines(
      "Construction neuve villas / programmes | Rénovation de riads et villas | Coordination multi-corps de métier | Finitions artisanales (zellige, tadelakt, menuiserie) | Reporting chantier et suivi budgétaire",
    ),
    options: toLines(
      "Gestion de projet à distance (diaspora / investisseurs étrangers) | Aménagement paysager extérieur",
    ),
    priceMode: "from",
    amount: "4500",
    duration: "MAD/m² (villa haut de gamme, hors terrain)",
    zoneMode: "region",
    cities: [],
    region: "Marrakech-Safi",
    travel: true,
    remote: true,
    audiences: toLines("Particuliers | Promoteurs | Investisseurs"),
    audienceOther: "",
    missions: ["National", "International"],
  },
});

export const SERVICE_PREVIEW_ROWS: ServicePreviewRow[] = [castlewood, alquimaroc, agsGroupe];

export const isServicePreview = (row: ShowcaseService | null | undefined): row is ServicePreviewRow =>
  Boolean(row && "preview" in row && row.preview);
