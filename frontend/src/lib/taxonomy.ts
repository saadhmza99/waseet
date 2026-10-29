// Mirrors the seeds of public.categories, public.feed_sub_categories,
// public.property_types and public.project_types in supabase/schema.sql. Slugs must match.

export type FeedSubCategory = { slug: string; label: string };

export type FeedCategory = {
  id: number;
  slug: string;
  label: string;
  description: string;
  subCategories: FeedSubCategory[];
};

export const FEED_CATEGORIES: FeedCategory[] = [
  {
    id: 1,
    slug: "gestion-services-immobiliers",
    label: "Gestion & services immobiliers",
    description: "Agences immobilières, agents indépendants, promoteurs immobiliers, gestionnaires de biens, syndics et conciergeries.",
    subCategories: [
      { slug: "agences-agents", label: "Agences & agents" },
      { slug: "promotion-immobiliere", label: "Promotion immobilière" },
      { slug: "gestion-immobiliere", label: "Gestion immobilière" },
      { slug: "conseil-expertise", label: "Conseil & expertise" },
    ],
  },
  {
    id: 3,
    slug: "construction-btp",
    label: "Construction, études et BTP",
    description: "Entreprises de construction, gros œuvre, génie civil, ingénierie, topographie, bureaux d'études techniques et entreprises spécialisées.",
    subCategories: [
      { slug: "construction-gros-oeuvre", label: "Construction & gros œuvre" },
      { slug: "second-oeuvre", label: "Second œuvre" },
      { slug: "ingenierie-etudes", label: "Ingénierie & études" },
      { slug: "entreprises-specialisees", label: "Entreprises spécialisées" },
      { slug: "materiaux-equipements", label: "Matériaux & équipements" },
    ],
  },
  {
    id: 4,
    slug: "renovation-amenagement",
    label: "Rénovation & Aménagement",
    description: "Rénovation, artisans, peinture, plomberie, électricité, menuiserie, aménagement intérieur et extérieur, paysagisme et décoration.",
    subCategories: [
      { slug: "renovation", label: "Rénovation" },
      { slug: "amenagement-interieur", label: "Aménagement intérieur" },
      { slug: "amenagement-exterieur", label: "Aménagement extérieur" },
      { slug: "decoration", label: "Décoration" },
      { slug: "travaux-specialises", label: "Travaux spécialisés" },
    ],
  },
  {
    id: 5,
    slug: "architecture-design",
    label: "Architecture & Design",
    description: "Architectes, architectes d'intérieur, designers, paysagistes et cabinets de conception.",
    subCategories: [
      { slug: "architecture", label: "Architecture" },
      { slug: "architecture-interieure", label: "Architecture intérieure" },
      { slug: "design", label: "Design" },
      { slug: "urbanisme-paysage", label: "Urbanisme & paysage" },
      { slug: "bim-3d", label: "BIM & 3D" },
    ],
  },
  {
    id: 6,
    slug: "juridique-foncier",
    label: "Juridique & Foncier",
    description: "Notaires, avocats spécialisés, conseil foncier, cadastre, expertise foncière et conseil en fiscalité immobilière.",
    subCategories: [
      { slug: "foncier-developpement", label: "Foncier & développement" },
      { slug: "droit-immobilier-foncier", label: "Droit immobilier & foncier" },
      { slug: "notariat", label: "Notariat" },
      { slug: "fiscalite", label: "Fiscalité" },
      { slug: "expertise-etudes", label: "Expertise & études" },
    ],
  },
  {
    id: 7,
    slug: "immotech",
    label: "ImmoTech",
    description: "PropTech, logiciels immobiliers, plateformes numériques, domotique, gestion technique des bâtiments et solutions innovantes.",
    subCategories: [
      { slug: "proptech", label: "PropTech" },
      { slug: "logiciels-immobiliers", label: "Logiciels immobiliers" },
      { slug: "construction-tech", label: "Construction Tech" },
      { slug: "data-ia", label: "Data & IA" },
      { slug: "smart-building", label: "Smart Building" },
    ],
  },
  {
    id: 8,
    slug: "autres-services",
    label: "Autres services",
    description: "Assurances, financement immobilier, courtiers, experts-comptables et prestataires qui ne rentrent pas dans les autres catégories.",
    subCategories: [
      { slug: "finance-assurance", label: "Finance & assurance" },
      { slug: "conseil-comptabilite", label: "Conseil & comptabilité" },
      { slug: "marketing-communication", label: "Marketing & communication" },
      { slug: "services-professionnels", label: "Services professionnels" },
    ],
  },
];

export const PROPERTY_AUTHOR_CATEGORY_ID = 1;

export const feedCategoryBySlug = (slug?: string | null) =>
  FEED_CATEGORIES.find((item) => item.slug === slug) || null;

export const feedSubCategoryBySlug = (slug?: string | null) => {
  for (const category of FEED_CATEGORIES) {
    const subCategory = category.subCategories.find((item) => item.slug === slug);
    if (subCategory) return { category, subCategory };
  }
  return null;
};

/**
 * Internal category code prefix for a Discover feed category slug.
 * Prefer this over nested PostgREST category.slug filters (more reliable for profiles).
 * Autres services uses 8.* but excludes fournisseurs (8.5.*) — those have their own chip.
 */
export const FEED_CATEGORY_CODE_PREFIX: Record<string, string> = {
  "gestion-services-immobiliers": "1.",
  "construction-btp": "3.",
  "renovation-amenagement": "4.",
  "architecture-design": "5.",
  "juridique-foncier": "6.",
  immotech: "7.",
  "autres-services": "8.",
};

/** Codes under Autres that belong only to the dedicated Fournisseurs filter. */
export const FOURNISSEUR_CODE_PREFIX = "8.5.";

export const feedCategoryCodePrefix = (slug?: string | null) => {
  const key = (slug || "").trim();
  if (!key || key === "tout") return null;
  return FEED_CATEGORY_CODE_PREFIX[key] || null;
};

/** Extra PostgREST exclusion when browsing a feed category (e.g. hide 8.5 from Autres). */
export const feedCategoryCodeExcludePrefix = (slug?: string | null) => {
  const key = (slug || "").trim();
  if (key === "autres-services") return FOURNISSEUR_CODE_PREFIX;
  return null;
};

export const FEED_SUB_CATEGORY_LABELS = FEED_CATEGORIES.flatMap((item) => item.subCategories.map((sub) => sub.label));

/** Pseudo-category in the Catégories filter: promoteurs (internal category 1.2.1). */
export const PROMOTEUR_CATEGORY_ID = "promoteurs";
export const PROMOTEUR_INTERNAL_CODE = "1.2.1";

/** Pseudo-category in the Catégories filter: fournisseurs (internal 8.5.1–8.5.5). */
export const FOURNISSEUR_CATEGORY_ID = "fournisseurs-filter";
export const isFournisseurInternalCode = (code?: string | null) => /^8\.5\.[1-5]$/.test((code || "").trim());
export const isPromoteurInternalCode = (code?: string | null) => (code || "").trim() === PROMOTEUR_INTERNAL_CODE;

/** Discover sub under Construction & BTP that opens leaf multi-select. */
export const INGENIERIE_ETUDES_SUB_SLUG = "ingenierie-etudes";

/** Peer leaf that unlocks BET agrément (D) filters. */
export const BUREAU_ETUDES_CODE = "3.4.2";

/** Peer leaves under ingenierie-etudes (shown until Bureau d'études is checked). */
export const INGENIERIE_ETUDES_PEER_OPTIONS: { code: string; label: string }[] = [
  { code: "3.4.1", label: "Génie civil / structure" },
  { code: BUREAU_ETUDES_CODE, label: "Bureau d'études" },
  { code: "3.4.3", label: "Études techniques" },
  { code: "3.4.4", label: "Contrôle technique" },
  { code: "3.4.5", label: "Économie de la construction" },
  { code: "3.4.6", label: "Coordination de chantier" },
  { code: "3.4.7", label: "Géomètre-topographe" },
  { code: "3.4.8", label: "Topographie" },
  { code: "3.4.9", label: "Études de terrain" },
];

/** Agréments BET (D13–D21) — only after Bureau d'études is checked. */
export const BET_AGREMENT_OPTIONS: { code: string; label: string }[] = [
  { code: "3.4.13", label: "D13" },
  { code: "3.4.14", label: "D14" },
  { code: "3.4.15", label: "D15" },
  { code: "3.4.16", label: "D16" },
  { code: "3.4.17", label: "D17" },
  { code: "3.4.18", label: "D18" },
  { code: "3.4.19", label: "D19" },
  { code: "3.4.20", label: "D20" },
  { code: "3.4.21", label: "D21" },
];

export const INGENIERIE_ETUDES_LEAF_OPTIONS = [
  ...INGENIERIE_ETUDES_PEER_OPTIONS,
  ...BET_AGREMENT_OPTIONS,
];

export const isBetAgrementCode = (code?: string | null) =>
  /^3\.4\.(1[3-9]|2[01])$/.test((code || "").trim());

export const isIngenierieEtudesLeafCode = (code?: string | null) =>
  INGENIERIE_ETUDES_LEAF_OPTIONS.some((o) => o.code === (code || "").trim());

/**
 * Codes sent to Discover `.in(code)`.
 * If any D agrément is checked, filter by those Ds only; otherwise by peer leaves.
 */
export const normalizeIngenierieFilterCodes = (codes: string[]) => {
  const cleaned = codes.map((c) => String(c || "").trim()).filter(Boolean);
  const ds = cleaned.filter(isBetAgrementCode);
  if (ds.length) return ds;
  return cleaned.filter((c) => !isBetAgrementCode(c));
};

/** Profile tabs visibility from internal category code. */
export type ProfileSectionVisibility = {
  showPosts: boolean;
  /** Work showcase for artisans / BTP (not agencies or promoteurs). */
  showRealisations: boolean;
  showProjets: boolean;
  showBiens: boolean;
  showServices: boolean;
  showProduits: boolean;
};

/**
 * Kill-switch: hide Réalisations everywhere while keeping list/create/schema code.
 * Flip to true when the feature is ready to ship again.
 */
export const REALISATIONS_ENABLED = false;

/**
 * Posts tab / feed posts: verified badge only (see isVerified in profileSectionsForInternalCodes).
 * Group A (1.1.1–1.1.7, Marchand 1.2.3, 1.3.1–1.3.7, 8.4.1–8.4.5):
 *   Biens; hide Réalisations, Projets, Produits, Services.
 * Promoteur / Développeur / Opérateur (1.2.1, 1.2.2, 1.2.4):
 *   Biens + Projets; hide Réalisations, Produits, Services.
 * No Réalisations also for: 1.3–1.4, all 6.x (juridique), all 7.x (immotech), 8.1–8.6.
 * Everyone else: Réalisations; hide Biens + Projets; Produits only for 3.5.1–3.5.4; Services on.
 */
export const profileSectionsForInternalCode = (code?: string | null): ProfileSectionVisibility => {
  const c = (code || "").trim();
  if (!c) {
    return {
      showPosts: false,
      showRealisations: false,
      showProjets: false,
      showBiens: false,
      showServices: true,
      showProduits: false,
    };
  }

  const isAgencyTxn = /^1\.1\.[1-7]$/.test(c);
  const isGestion = /^1\.3\.[1-7]$/.test(c);
  const isConseilImmo = /^1\.4\.[1-5]$/.test(c);
  const isMarketing = /^8\.4\.[1-5]$/.test(c);
  const isFournisseur = isFournisseurInternalCode(c);
  const isMarchand = c === "1.2.3";
  const isPromoteurCore = c === "1.2.1" || c === "1.2.2" || c === "1.2.4";
  const isMateriaux = /^3\.5\.[1-4]$/.test(c);
  const isJuridique = /^6\./.test(c);
  const isImmotech = /^7\./.test(c);
  const isFinance = /^8\.1\.[1-5]$/.test(c);
  const isAssurance = /^8\.2\.[1-3]$/.test(c);
  const isConseilPro = /^8\.3\.[1-6]$/.test(c);
  const isServicesOps = /^8\.6\.[1-6]$/.test(c);

  const noRealisations =
    isGestion ||
    isConseilImmo ||
    isJuridique ||
    isImmotech ||
    isFinance ||
    isAssurance ||
    isConseilPro ||
    isMarketing ||
    isFournisseur ||
    isServicesOps;

  // Group A includes Marchand de biens
  if (isAgencyTxn || isGestion || isMarketing || isMarchand) {
    return {
      showPosts: false,
      showRealisations: false,
      showProjets: false,
      showBiens: true,
      showServices: false,
      showProduits: false,
    };
  }

  if (isPromoteurCore) {
    return {
      showPosts: false,
      showRealisations: false,
      showProjets: true,
      showBiens: true,
      showServices: false,
      showProduits: false,
    };
  }

  return {
    showPosts: false,
    // Feature flag — logic kept; hidden until REALISATIONS_ENABLED is true.
    showRealisations: REALISATIONS_ENABLED && !noRealisations,
    showProjets: false,
    showBiens: false,
    // Fournisseurs (8.5.1–8.5.5) sell products, not services.
    showServices: !isFournisseur,
    showProduits: isMateriaux || isFournisseur,
  };
};

/**
 * Multi-specialty profiles unlock the union of each code’s sections
 * (e.g. agence + artisan → Biens + Services when Réalisations are off).
 * Primary specialty only affects feed placement, not which tabs exist.
 * Feed Posts tab / create « Post » require a verified badge.
 */
export const profileSectionsForInternalCodes = (
  codes?: Array<string | null | undefined> | null,
  opts?: { isVerified?: boolean | null },
): ProfileSectionVisibility => {
  const list = (codes || []).map((c) => (c || "").trim()).filter(Boolean);
  const base = list.length
    ? list.map((code) => profileSectionsForInternalCode(code)).reduce((acc, next) => ({
        showPosts: false,
        showRealisations: acc.showRealisations || next.showRealisations,
        showProjets: acc.showProjets || next.showProjets,
        showBiens: acc.showBiens || next.showBiens,
        showServices: acc.showServices || next.showServices,
        showProduits: acc.showProduits || next.showProduits,
      }))
    : profileSectionsForInternalCode(null);
  return {
    ...base,
    showPosts: Boolean(opts?.isVerified),
    showRealisations: REALISATIONS_ENABLED && base.showRealisations,
  };
};

export type CategoryTagged = {
  feed_category?: string | null;
  feed_sub_category?: string | null;
  is_promoteur?: boolean | null;
  is_fournisseur?: boolean | null;
};

export const matchesFeedCategory = (category: string | null, subCategory: string | null, item: CategoryTagged) => {
  if (!category || category === "tout") return true;
  if (category === PROMOTEUR_CATEGORY_ID) return item.is_promoteur === true;
  if (category === FOURNISSEUR_CATEGORY_ID) return item.is_fournisseur === true;
  // Fournisseurs have their own chip — never list them under Autres services.
  if (category === "autres-services" && item.is_fournisseur) return false;
  if (item.feed_category !== category) return false;
  return !subCategory || item.feed_sub_category === subCategory;
};

export type FeedSubCategoryRow = { slug?: string | null; category?: { slug?: string | null } | null } | null | undefined;

export const categoryTagsFromHistory = (history: { internal_category?: { code?: string | null; feed_sub_category?: FeedSubCategoryRow } | null } | null | undefined) => {
  const feedSub = history?.internal_category?.feed_sub_category;
  const code = history?.internal_category?.code || null;
  return {
    feed_category: feedSub?.category?.slug || null,
    feed_sub_category: feedSub?.slug || null,
    is_promoteur: isPromoteurInternalCode(code),
    is_fournisseur: isFournisseurInternalCode(code) || feedSub?.slug === "fournisseurs",
  };
};

export const feedCategoryLabel = (category: string | null) => {
  if (!category || category === "tout") return "Tout";
  if (category === PROMOTEUR_CATEGORY_ID) return "Promoteurs";
  if (category === FOURNISSEUR_CATEGORY_ID) return "Fournisseurs";
  return feedCategoryBySlug(category)?.label || null;
};

export const CATEGORY_HISTORY_SELECT = `category_history:profile_category_history(
    internal_category:internal_categories(
      code,
      feed_sub_category:feed_sub_categories(slug, category:categories(slug))
    )
  )`;

export const PROPERTY_TYPES = [
  { id: "appartement", label: "Appartement" },
  { id: "maison_villa", label: "Maison / Villa" },
  { id: "riad", label: "Riad" },
  { id: "terrain", label: "Terrain" },
  { id: "local_commercial", label: "Local commercial" },
  { id: "bureau", label: "Bureau" },
  { id: "entrepot", label: "Entrepôt" },
  { id: "immeuble", label: "Immeuble" },
  { id: "residence", label: "Résidence" },
  { id: "hotel", label: "Hôtel" },
  { id: "bien_industriel", label: "Bien industriel" },
  { id: "bien_agricole", label: "Bien agricole" },
] as const;

const LEGACY_PROPERTY_KINDS: Record<string, string> = {
  maison: "maison_villa",
  villa: "maison_villa",
  ferme: "bien_agricole",
};

export const normalizePropertyKind = (kind?: string | null) => {
  const value = (kind || "").trim();
  return LEGACY_PROPERTY_KINDS[value] || value;
};

export const PROJECT_TYPE_GROUPS = [
  {
    label: "Projets immobiliers",
    types: [
      { id: "projet_residentiel", label: "Projet résidentiel" },
      { id: "lotissement", label: "Lotissement" },
      { id: "residence", label: "Résidence" },
      { id: "complexe_immobilier", label: "Complexe immobilier" },
      { id: "projet_commercial", label: "Projet commercial" },
      { id: "projet_hotelier", label: "Projet hôtelier" },
      { id: "projet_industriel", label: "Projet industriel" },
      { id: "projet_mixte", label: "Projet mixte" },
    ],
  },
  {
    label: "Projets non-résidentiels",
    types: [
      { id: "usine", label: "Usine" },
      { id: "centre_commercial", label: "Centre commercial" },
      { id: "bureau", label: "Bureau" },
      { id: "hotel", label: "Hôtel" },
      { id: "equipement_prive", label: "Équipement privé" },
      { id: "equipement_collectif", label: "Équipement collectif" },
      { id: "infrastructure_projet", label: "Infrastructure liée à un projet immobilier" },
    ],
  },
] as const;

type ProjectType = (typeof PROJECT_TYPE_GROUPS)[number]["types"][number];

export const PROJECT_TYPES: ProjectType[] = PROJECT_TYPE_GROUPS.flatMap(
  (group) => [...group.types],
);

export const projectTypeLabel = (id?: string | null) =>
  PROJECT_TYPES.find((item) => item.id === id)?.label || "";
