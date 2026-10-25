import { plainText, safeHttpUrl } from "@/lib/safeText";
import { PROJECT_TYPES } from "@/lib/taxonomy";

export type ProjectCategoryId =
  | "immobilier"
  | "btp"
  | "renovation"
  | "industriel"
  | "infrastructure"
  | "sport"
  | "sante"
  | "education"
  | "hotellerie"
  | "commercial"
  | "amenagement"
  | "autre";

export type ProjectStatusId =
  | "planification"
  | "preparation"
  | "construction"
  | "pause"
  | "pret_a_livrer"
  | "termine"
  | "livre"
  | "sur_plan";

export type PhaseStatus = "a_venir" | "en_cours" | "termine";

export type ProjectTeamMember = {
  id: string;
  role: string;
  name: string;
  website: string;
  description: string;
  logo: string;
};

export type ProjectPartner = {
  id: string;
  name: string;
  website: string;
  logo: string;
};

export type ProjectPhase = {
  id: string;
  name: string;
  description: string;
  status: PhaseStatus;
  progress: number;
  start: string;
  end: string;
  company: string;
};

export type ProjectDocument = {
  id: string;
  title: string;
  type: string;
  url: string;
  privacy: "public" | "private";
  /** Byte size when the file was uploaded to Sifarah (links stay 0). */
  sizeBytes?: number;
};

export type ProjectMedia = {
  url: string;
  caption: string;
  category: string;
};

export type ProjectUpdate = {
  id: string;
  date: string;
  phase: string;
  text: string;
  images: string[];
};

export type UnitRow = {
  type: string;
  count: string;
  min: string;
  max: string;
};

export type ProjectDossier = {
  version: 2;
  category: ProjectCategoryId | "";
  subtype: string;
  projectType: string;
  status: ProjectStatusId | "";
  country: string;
  neighborhood: string;
  address: string;
  startDate: string;
  expectedEnd: string;
  actualEnd: string;
  progress: number;
  fields: Record<string, string>;
  choices: string[];
  units: UnitRow[];
  team: ProjectTeamMember[];
  partners: ProjectPartner[];
  phases: ProjectPhase[];
  documents: ProjectDocument[];
  updates: ProjectUpdate[];
  media: ProjectMedia[];
};

export type ProjectPromoter = {
  id: string;
  name: string;
  website: string;
};

export type ProjectProvenance = {
  sources: string[];
  niveau: string;
  dateExtraction: string;
  dateConsolidation: string;
  equipeMentions: string;
};

export type ProjectUrls = {
  project: string;
  canonical: string;
  promoter: string;
};

export type ProjectRecord = ProjectDossier & {
  id: string;
  userId: string;
  title: string;
  subtitle: string;
  description: string;
  descriptionShort: string;
  city: string;
  region: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  image: string;
  images: string[];
  commercialStatus: string;
  promoter: ProjectPromoter | null;
  urls: ProjectUrls | null;
  provenance: ProjectProvenance | null;
};

export const PROJECT_CATEGORIES: { id: ProjectCategoryId; label: string }[] = [
  { id: "immobilier", label: "Immobilier / Développement" },
  { id: "btp", label: "Construction / BTP" },
  { id: "renovation", label: "Rénovation / Réhabilitation" },
  { id: "industriel", label: "Industriel" },
  { id: "infrastructure", label: "Infrastructure / Transport" },
  { id: "sport", label: "Sport & Loisirs" },
  { id: "sante", label: "Santé" },
  { id: "education", label: "Éducation" },
  { id: "hotellerie", label: "Hôtellerie / Tourisme" },
  { id: "commercial", label: "Commercial / Tertiaire" },
  { id: "amenagement", label: "Aménagement / Urbanisme" },
  { id: "autre", label: "Autre" },
];

export const PROJECT_STATUSES: { id: ProjectStatusId; label: string }[] = [
  { id: "planification", label: "Planification" },
  { id: "preparation", label: "En préparation" },
  { id: "sur_plan", label: "Sur plan" },
  { id: "construction", label: "En construction" },
  { id: "pause", label: "En pause" },
  { id: "pret_a_livrer", label: "Prêt à livrer" },
  { id: "termine", label: "Terminé" },
  { id: "livre", label: "Livré" },
];

export const SUBTYPES: Record<ProjectCategoryId, string[]> = {
  immobilier: ["Résidence", "Immeuble", "Lotissement", "Villa", "Programme mixte", "Bureaux", "Résidence touristique", "Autre"],
  btp: ["Construction neuve", "Extension", "Réhabilitation", "Transformation", "Aménagement", "Autre"],
  renovation: ["Rénovation complète", "Rénovation partielle", "Réhabilitation", "Transformation intérieure", "Façade", "Autre"],
  industriel: ["Usine", "Manufacture", "Entrepôt", "Centre logistique", "Atelier", "Plateforme industrielle", "Autre"],
  infrastructure: ["Route", "Autoroute", "Pont", "Tunnel", "Voie ferrée", "Port", "Aéroport", "Échangeur", "Autre"],
  sport: ["Stade", "Complexe sportif", "Salle omnisports", "Piscine", "Centre de loisirs", "Arène", "Autre"],
  sante: ["Hôpital", "Clinique", "Centre médical", "Laboratoire", "Autre"],
  education: ["École", "Lycée", "Université", "Centre de formation", "Autre"],
  hotellerie: ["Hôtel", "Resort", "Résidence touristique", "Complexe hôtelier", "Villa resort", "Autre"],
  commercial: ["Centre commercial", "Immeuble de bureaux", "Centre d'affaires", "Retail park", "Showroom", "Mixte commercial", "Autre"],
  amenagement: ["Aménagement urbain", "Lotissement", "Place publique", "Parc", "Paysage", "Espace public", "Autre"],
  autre: ["Autre"],
};

export const DOCUMENT_TYPES = [
  "Brochure commerciale",
  "Présentation du projet",
  "Fiche projet",
  "Catalogue",
  "Plan de situation",
  "Images / rendus",
  "Spécifications publiques du projet",
  "Aperçu technique et durabilité",
  "Autre",
];

export const TEAM_ROLES = [
  "Maître d'ouvrage",
  "Client",
  "Promoteur",
  "Architecte",
  "BET / Ingénieur",
  "Entreprise générale",
  "Entreprise de construction",
  "Bureau de contrôle",
  "AMO",
  "MOD",
  "Entreprise spécialisée",
  "Sous-traitant",
  "Fournisseur",
  "Paysagiste",
  "Designer",
  "Autre",
];

export const PHASE_STATUSES: { id: PhaseStatus; label: string }[] = [
  { id: "a_venir", label: "À venir" },
  { id: "en_cours", label: "En cours" },
  { id: "termine", label: "Terminé" },
];

type FieldKind = "text" | "number";

export type DetailField = { key: string; label: string; kind: FieldKind; whenSubtype?: string[] };

export type DetailSection = {
  title: string;
  fields: DetailField[];
  choices?: string[];
};

const num = (key: string, label: string): DetailField => ({ key, label, kind: "number" });
const text = (key: string, label: string): DetailField => ({ key, label, kind: "text" });

export const DETAIL_SECTIONS: Record<ProjectCategoryId, DetailSection[]> = {
  immobilier: [
    {
      title: "Programme immobilier",
      fields: [
        text("usage", "Usage"),
        num("landArea", "Surface du terrain (m²)"),
        num("builtArea", "Surface bâtie (m²)"),
        num("buildings", "Nombre de bâtiments"),
        text("floors", "Nombre d'étages"),
        num("basements", "Sous-sols"),
        num("apartments", "Nombre de logements"),
        num("parking", "Places de parking"),
      ],
      choices: ["Piscine", "Salle de sport", "Jardin", "Espaces verts", "Aire de jeux", "Sécurité", "Conciergerie", "Commerces", "Restaurant", "Accès PMR", "Ascenseur"],
    },
  ],
  btp: [
    {
      title: "Caractéristiques du projet",
      fields: [
        text("destination", "Destination"),
        num("landArea", "Surface du terrain (m²)"),
        num("builtArea", "Surface bâtie (m²)"),
        num("buildings", "Bâtiments"),
        text("floors", "Étages"),
        text("structure", "Système structurel"),
      ],
      choices: ["Terrassement", "Fondations", "Gros œuvre", "Structure", "Façade", "Étanchéité", "Électricité", "Plomberie", "HVAC", "Menuiserie", "Peinture", "Voirie"],
    },
  ],
  renovation: [
    {
      title: "Bâtiment existant",
      fields: [
        text("buildingType", "Type de bâtiment"),
        num("surface", "Surface existante (m²)"),
        text("floors", "Étages"),
        num("rooms", "Pièces / unités"),
        text("year", "Année de construction"),
        text("condition", "État existant"),
      ],
      choices: ["Démolition", "Structure", "Plomberie", "Électricité", "HVAC", "Isolation", "Façade", "Menuiserie", "Sols", "Peinture", "Cuisine", "Salles de bain"],
    },
  ],
  industriel: [
    {
      title: "Site",
      fields: [
        num("landArea", "Surface du terrain (m²)"),
        num("builtArea", "Surface bâtie (m²)"),
        num("productionArea", "Surface de production (m²)"),
        num("storageArea", "Surface de stockage (m²)"),
        num("buildings", "Bâtiments"),
        text("height", "Hauteur sous plafond"),
        num("docks", "Quais de chargement"),
        num("lines", "Lignes de production"),
      ],
      choices: ["Électricité industrielle", "HVAC", "Protection incendie", "Groupe électrogène", "Pont roulant", "Quais", "Sécurité"],
    },
  ],
  infrastructure: [
    {
      title: "Infrastructure",
      fields: [
        num("length", "Longueur (km)"),
        text("width", "Largeur"),
        num("lanes", "Voies"),
        text("from", "Point de départ"),
        text("to", "Point d'arrivée"),
        { key: "spans", label: "Travées", kind: "number", whenSubtype: ["Pont"] },
        { key: "tubes", label: "Tubes", kind: "number", whenSubtype: ["Tunnel"] },
        { key: "tunnelWidth", label: "Largeur du tunnel", kind: "text", whenSubtype: ["Tunnel"] },
        { key: "bridgeWidth", label: "Largeur du pont", kind: "text", whenSubtype: ["Pont"] },
      ],
    },
  ],
  sport: [
    {
      title: "Équipement",
      fields: [
        num("landArea", "Surface du terrain (m²)"),
        num("builtArea", "Surface bâtie (m²)"),
        num("capacity", "Capacité spectateurs"),
        num("stands", "Tribunes"),
        num("seats", "Sièges"),
        num("parking", "Parking"),
      ],
      choices: ["Terrain principal", "Vestiaires", "Espaces VIP", "Restaurants", "Piscine", "Éclairage", "Toiture", "Accès PMR"],
    },
  ],
  sante: [
    {
      title: "Établissement",
      fields: [
        num("landArea", "Surface du terrain (m²)"),
        num("builtArea", "Surface bâtie (m²)"),
        num("buildings", "Bâtiments"),
        text("floors", "Étages"),
        num("beds", "Lits"),
        num("rooms", "Chambres"),
        num("operating", "Blocs opératoires"),
      ],
      choices: ["Imagerie", "Chirurgie", "Réanimation", "Laboratoires", "Pharmacie", "Groupe électrogène", "Accès PMR"],
    },
  ],
  education: [
    {
      title: "Établissement",
      fields: [
        num("landArea", "Surface du terrain (m²)"),
        num("builtArea", "Surface bâtie (m²)"),
        num("buildings", "Bâtiments"),
        text("floors", "Étages"),
        num("classrooms", "Salles de classe"),
        num("students", "Capacité élèves"),
        num("labs", "Laboratoires"),
      ],
      choices: ["Terrains de sport", "Gymnase", "Restaurant", "Résidence", "Parking", "Espaces verts", "Accès PMR"],
    },
  ],
  hotellerie: [
    {
      title: "Établissement",
      fields: [
        num("landArea", "Surface du terrain (m²)"),
        num("builtArea", "Surface bâtie (m²)"),
        num("buildings", "Bâtiments"),
        text("floors", "Étages"),
        num("rooms", "Chambres"),
        num("suites", "Suites"),
        num("capacity", "Capacité"),
        text("stars", "Catégorie"),
      ],
      choices: ["Restaurants", "Piscines", "Spa", "Salle de sport", "Salles de conférence", "Jardin", "Parking"],
    },
  ],
  commercial: [
    {
      title: "Programme",
      fields: [
        num("landArea", "Surface du terrain (m²)"),
        num("builtArea", "Surface bâtie (m²)"),
        num("retailArea", "Surface commerciale (m²)"),
        num("officeArea", "Surface de bureaux (m²)"),
        num("shops", "Cellules commerciales"),
        num("offices", "Bureaux"),
        num("floors", "Étages"),
        num("parking", "Parking"),
      ],
      choices: ["Ascenseurs", "Escaliers mécaniques", "Sécurité", "HVAC", "Restaurants", "Commerces", "Parking"],
    },
  ],
  amenagement: [
    {
      title: "Aménagement",
      fields: [
        num("landArea", "Surface du terrain (m²)"),
        num("developedArea", "Surface aménagée (m²)"),
        num("greenArea", "Espaces verts (m²)"),
        num("plots", "Lots"),
        num("buildings", "Bâtiments prévus"),
        num("parking", "Parking"),
      ],
      choices: ["Terrassement", "Voirie", "Réseaux", "Éclairage public", "Paysage", "Assainissement", "Eau", "Électricité"],
    },
  ],
  autre: [
    {
      title: "Caractéristiques",
      fields: [
        num("landArea", "Surface du terrain (m²)"),
        num("builtArea", "Surface bâtie (m²)"),
        num("buildings", "Bâtiments"),
        text("floors", "Étages"),
      ],
    },
  ],
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const emptyDossier = (): ProjectDossier => ({
  version: 2,
  category: "",
  subtype: "",
  projectType: "",
  status: "",
  country: "Maroc",
  neighborhood: "",
  address: "",
  startDate: "",
  expectedEnd: "",
  actualEnd: "",
  progress: 0,
  fields: {},
  choices: [],
  units: [],
  team: [],
  partners: [],
  phases: [],
  documents: [],
  updates: [],
  media: [],
});

export const newTeamMember = (): ProjectTeamMember => ({
  id: uid(),
  role: "Maître d'ouvrage",
  name: "",
  website: "",
  description: "",
  logo: "",
});

export const newPartner = (): ProjectPartner => ({
  id: uid(),
  name: "",
  website: "",
  logo: "",
});

export const newPhase = (): ProjectPhase => ({
  id: uid(),
  name: "",
  description: "",
  status: "a_venir",
  progress: 0,
  start: "",
  end: "",
  company: "",
});

export const newDocument = (): ProjectDocument => ({
  id: uid(),
  title: "",
  type: "Brochure commerciale",
  url: "",
  privacy: "public",
  sizeBytes: 0,
});

export const newUpdate = (): ProjectUpdate => ({
  id: uid(),
  date: "",
  phase: "",
  text: "",
  images: [],
});

export const categoryLabel = (id: string) => PROJECT_CATEGORIES.find((item) => item.id === id)?.label || "Projet";
export const statusLabel = (id: string) => PROJECT_STATUSES.find((item) => item.id === id)?.label || "En cours";
export const phaseStatusLabel = (id: string) => PHASE_STATUSES.find((item) => item.id === id)?.label || id;

const fieldValue = (dossier: ProjectDossier, key: string) => (dossier.fields[key] || "").trim();

const metric = (value: string, label: string) => (value ? { value, label } : null);

export const projectMetrics = (dossier: ProjectDossier) => {
  const f = (key: string) => fieldValue(dossier, key);
  const area = (key: string) => (f(key) ? `${Number(f(key)).toLocaleString("fr-FR")} m²` : "");
  const list = {
    immobilier: [
      metric(f("apartments"), "logements"),
      metric(f("buildings"), "bâtiments"),
      metric(f("floors"), "hauteur"),
      metric(area("builtArea"), "surface"),
    ],
    btp: [
      metric(area("builtArea"), "surface"),
      metric(f("buildings"), "bâtiments"),
      metric(f("floors"), "étages"),
      metric(`${dossier.progress || 0} %`, "avancement"),
    ],
    renovation: [
      metric(area("surface") || area("builtArea"), "surface"),
      metric(f("rooms"), "pièces"),
      metric(`${dossier.progress || 0} %`, "avancement"),
      metric(f("condition"), "état"),
    ],
    industriel: [
      metric(area("builtArea"), "surface"),
      metric(area("productionArea"), "production"),
      metric(f("buildings"), "bâtiments"),
      metric(f("docks"), "quais"),
    ],
    infrastructure: [
      metric(f("length") ? `${f("length")} km` : "", "longueur"),
      metric(f("lanes") ? `${f("lanes")} voies` : "", "voies"),
      metric(`${dossier.progress || 0} %`, "réalisé"),
      metric(dossier.expectedEnd, "livraison"),
    ],
    sport: [
      metric(f("capacity") ? Number(f("capacity")).toLocaleString("fr-FR") : "", "places"),
      metric(area("builtArea"), "surface"),
      metric(f("stands"), "tribunes"),
      metric(f("parking"), "parking"),
    ],
    sante: [
      metric(f("beds"), "lits"),
      metric(area("builtArea"), "surface"),
      metric(f("buildings"), "bâtiments"),
      metric(f("floors"), "étages"),
    ],
    education: [
      metric(f("students"), "élèves"),
      metric(f("classrooms"), "salles"),
      metric(area("builtArea"), "surface"),
      metric(f("buildings"), "bâtiments"),
    ],
    hotellerie: [
      metric(f("rooms"), "chambres"),
      metric(f("suites"), "suites"),
      metric(f("capacity"), "capacité"),
      metric(area("builtArea"), "surface"),
    ],
    commercial: [
      metric(area("retailArea") || area("builtArea"), "surface"),
      metric(f("shops"), "cellules"),
      metric(f("floors"), "étages"),
      metric(f("parking"), "parking"),
    ],
    amenagement: [
      metric(area("landArea"), "terrain"),
      metric(f("plots"), "lots"),
      metric(area("greenArea"), "espaces verts"),
      metric(`${dossier.progress || 0} %`, "avancement"),
    ],
    autre: [
      metric(area("builtArea"), "surface"),
      metric(f("buildings"), "bâtiments"),
      metric(`${dossier.progress || 0} %`, "avancement"),
    ],
  }[dossier.category || "autre"];
  return (list || []).filter((item): item is { value: string; label: string } => Boolean(item)).slice(0, 4);
};

export const projectLocation = (record: Pick<ProjectRecord, "neighborhood" | "city" | "region">) =>
  [record.neighborhood, record.city, record.region].filter(Boolean).join(" · ");

const safeId = (value: unknown) => plainText(value, 40).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);

const listed = (value: string, allowed: readonly string[]) => (allowed.includes(value) ? value : allowed[allowed.length - 1] || "");

export const sanitizeDossier = (dossier: ProjectDossier): ProjectDossier => ({
  ...dossier,
  subtype: plainText(dossier.subtype, 80),
  projectType: PROJECT_TYPES.some((item) => item.id === dossier.projectType) ? dossier.projectType : "",
  country: plainText(dossier.country, 60) || "Maroc",
  neighborhood: plainText(dossier.neighborhood, 80),
  address: plainText(dossier.address, 160),
  startDate: plainText(dossier.startDate, 10),
  expectedEnd: plainText(dossier.expectedEnd, 10),
  actualEnd: plainText(dossier.actualEnd, 10),
  progress: Math.min(100, Math.max(0, Number(dossier.progress) || 0)),
  fields: Object.fromEntries(
    Object.entries(dossier.fields || {})
      .slice(0, 40)
      .map(([key, value]) => [plainText(key, 40), plainText(value, 80)]),
  ),
  choices: (dossier.choices || []).slice(0, 40).map((item) => plainText(item, 60)).filter(Boolean),
  units: (dossier.units || []).slice(0, 20).map((unit) => ({
    type: plainText(unit.type, 40),
    count: plainText(unit.count, 12),
    min: plainText(unit.min, 12),
    max: plainText(unit.max, 12),
  })),
  team: (dossier.team || []).slice(0, 60).map((member) => ({
    id: safeId(member.id) || uid(),
    role: listed(plainText(member.role, 80), TEAM_ROLES),
    name: plainText(member.name, 120),
    website: safeHttpUrl(member.website),
    description: plainText(member.description, 160),
    logo: safeHttpUrl(member.logo),
  })),
  partners: (dossier.partners || []).slice(0, 40).map((partner) => ({
    id: safeId(partner.id) || uid(),
    name: plainText(partner.name, 120),
    website: safeHttpUrl(partner.website),
    logo: safeHttpUrl(partner.logo),
  })),
  phases: (dossier.phases || []).slice(0, 30).map((phase) => ({
    ...phase,
    id: safeId(phase.id) || uid(),
    name: plainText(phase.name, 80),
    description: plainText(phase.description, 500),
    company: plainText(phase.company, 120),
    progress: Math.min(100, Math.max(0, Number(phase.progress) || 0)),
    start: plainText(phase.start, 10),
    end: plainText(phase.end, 10),
  })),
  documents: (dossier.documents || []).slice(0, 40).map((doc) => ({
    id: safeId(doc.id) || uid(),
    title: plainText(doc.title, 120),
    type: listed(plainText(doc.type, 80), DOCUMENT_TYPES),
    url: safeHttpUrl(doc.url),
    privacy: doc.privacy === "private" ? "private" : "public",
    sizeBytes: Math.max(0, Math.min(Number(doc.sizeBytes) || 0, 20 * 1024 * 1024)),
  })),
  updates: (dossier.updates || []).slice(0, 60).map((entry) => ({
    id: safeId(entry.id) || uid(),
    date: plainText(entry.date, 10),
    phase: plainText(entry.phase, 80),
    text: plainText(entry.text, 800),
    images: (entry.images || []).slice(0, 8).map((url) => safeHttpUrl(url)).filter(Boolean),
  })),
  media: (dossier.media || []).slice(0, 40).map((item) => ({
    url: safeHttpUrl(item.url),
    caption: plainText(item.caption, 160),
    category: plainText(item.category, 40),
  })).filter((item) => item.url),
});

export const COMMERCIAL_STATUSES = [
  { id: "en_commercialisation", label: "En commercialisation" },
  { id: "commercialise", label: "Commercialisé" },
  { id: "suspendu", label: "Suspendu" },
  { id: "non_determine", label: "Non déterminé" },
] as const;

export type CommercialStatusId = (typeof COMMERCIAL_STATUSES)[number]["id"];

export type ProjectPriceMode = "request" | "from" | "range";

const commercialStatusLabels: Record<string, string> = Object.fromEntries(
  COMMERCIAL_STATUSES.map((item) => [item.id, item.label]),
);

export const commercialStatusLabel = (value?: string | null) =>
  commercialStatusLabels[value || ""] || (value ? plainText(value, 60) : "");

export type ProjectPublishExtras = {
  commercialStatus?: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
  promoter?: { name: string; website: string } | null;
};

export const TEAM_ROLE_BUCKETS = [
  { id: "promoteur", label: "Promoteur", roles: ["Promoteur", "Maître d'ouvrage", "Client"] },
  { id: "architecte", label: "Architecte", roles: ["Architecte", "Paysagiste", "Designer"] },
  { id: "bet", label: "BET", roles: ["BET / Ingénieur", "Bureau de contrôle", "AMO", "MOD"] },
  { id: "eg", label: "Entreprise générale", roles: ["Entreprise générale", "Entreprise de construction"] },
  { id: "sous_traitant", label: "Sous-traitants", roles: ["Sous-traitant", "Entreprise spécialisée", "Fournisseur"] },
] as const;

export const teamRoleBucket = (role: string) =>
  TEAM_ROLE_BUCKETS.find((bucket) => (bucket.roles as readonly string[]).includes(role)) || null;

const asList = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const asObject = (value: unknown): Record<string, string> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, String(item ?? "")]))
    : {};

const numericOrNull = (value: string) => {
  const cleaned = String(value || "").replace(/[^\d.,]/g, "").replace(",", ".");
  if (!cleaned) return null;
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : null;
};

const PROMOTED_FIELD_KEYS = [
  "typologies",
  "equipment",
  "nearby",
  "priceOnRequest",
  "priceFrom",
  "priceMin",
  "priceMax",
  "currency",
  "usage",
  "landArea",
  "builtArea",
  "buildings",
  "floors",
  "basements",
  "apartments",
  "parking",
  "surface",
] as const;

const CATEGORY_IDS = new Set<string>(PROJECT_CATEGORIES.map((item) => item.id));

const STATUS_ALIASES: Record<string, ProjectStatusId> = {
  en_construction: "construction",
  construction: "construction",
  non_determine: "planification",
  planification: "planification",
  preparation: "preparation",
  sur_plan: "sur_plan",
  pret_a_livrer: "pret_a_livrer",
  livre: "livre",
  termine: "termine",
  pause: "pause",
};

const CATEGORY_ALIASES: Record<string, ProjectCategoryId> = {
  immobilier: "immobilier",
  residentiel: "immobilier",
  mixte: "immobilier",
  lotissement: "immobilier",
  btp: "btp",
  commercial: "commercial",
  industriel: "industriel",
  infrastructure: "infrastructure",
  hotellerie: "hotellerie",
  renovation: "renovation",
  amenagement: "amenagement",
  autre: "autre",
};

const ATTR_META_KEYS = new Set([
  "seed_batch",
  "source_project_id",
  "source_url",
  "professionnel_nom",
  "description_courte",
  "architecte",
  "bureau_etudes",
  "entreprises_construction",
  "sous_traitants",
  "equipe_realisation_mentions",
  "chambres_min",
  "chambres_max",
  "nb_offres",
]);

const normalizeCategory = (raw?: string | null): ProjectCategoryId => {
  const key = plainText(raw, 40).toLowerCase();
  if (CATEGORY_ALIASES[key]) return CATEGORY_ALIASES[key];
  if (CATEGORY_IDS.has(key)) return key as ProjectCategoryId;
  return "immobilier";
};

const normalizeStatus = (raw?: string | null): ProjectStatusId | "" => {
  const key = plainText(raw, 40).toLowerCase();
  return STATUS_ALIASES[key] || (key as ProjectStatusId) || "";
};

const roleFromLabel = (raw: string): string => {
  const text = raw.trim().toLowerCase();
  if (/ma[iî]tre\s*d.?ouvrage|promoteur|client/.test(text)) return "Maître d'ouvrage";
  if (/architecte/.test(text)) return "Architecte";
  if (/bet|ing[eé]nieur|bureau\s*d.?[eé]tudes|amo|mod|contr[oô]le/.test(text)) return "BET / Ingénieur";
  if (/entreprise\s*g[eé]n[eé]rale|eg\b/.test(text)) return "Entreprise générale";
  if (/construction|entreprise/.test(text)) return "Entreprise de construction";
  if (/sous.?trait/.test(text)) return "Sous-traitant";
  if (/paysagiste/.test(text)) return "Paysagiste";
  if (/design/.test(text)) return "Designer";
  if (/fournisseur|prestataire/.test(text)) return "Fournisseur";
  return "Autre";
};

const pushTeamMember = (
  list: ProjectTeamMember[],
  seen: Set<string>,
  role: string,
  nameRaw: string,
  description = "",
  website = "",
) => {
  // Drop a trailing "(…)" note and anything after a spaced dash separator,
  // but keep intra-word hyphens (e.g. "HAM-ARCHI").
  const name = plainText(nameRaw.replace(/\s*\([^)]*\)\s*$/, "").split(/\s+[—–-]\s+/)[0], 120);
  if (!name) return;
  const key = `${role}|${name}`.toLowerCase();
  if (seen.has(key)) return;
  seen.add(key);
  const urlMatch = `${nameRaw} ${description} ${website}`.match(/https?:\/\/[^\s)\]|>]+/i);
  list.push({
    id: `team-${list.length + 1}`,
    role,
    name,
    website: safeHttpUrl(website || urlMatch?.[0] || ""),
    description: plainText(description, 160),
    logo: "",
  });
};

/** Build Équipe from typed `team` or Kerix attribute blobs on seeded rows. */
const teamFromRow = (row: any, attributes: Record<string, string>): ProjectTeamMember[] => {
  const existing = asList<ProjectTeamMember>(row?.team).filter((member) => member?.name);
  if (existing.length) return existing;

  const team: ProjectTeamMember[] = [];
  const seen = new Set<string>();

  pushTeamMember(team, seen, "Architecte", attributes.architecte || "");
  pushTeamMember(team, seen, "BET / Ingénieur", attributes.bureau_etudes || "");
  pushTeamMember(team, seen, "Entreprise de construction", attributes.entreprises_construction || "");
  pushTeamMember(team, seen, "Sous-traitant", (row?.sous_traitants as string) || attributes.sous_traitants || "");

  const mentions = attributes.equipe_realisation_mentions || "";
  for (const chunk of mentions.split("|")) {
    const part = chunk.trim();
    if (!part) continue;
    const colon = part.indexOf(":");
    if (colon > 0) {
      const roleLabel = part.slice(0, colon).trim();
      const rest = part.slice(colon + 1).trim();
      pushTeamMember(team, seen, roleFromLabel(roleLabel), rest, roleLabel);
    } else {
      pushTeamMember(team, seen, "Autre", part);
    }
  }

  if (row?.promoter_name) {
    pushTeamMember(team, seen, "Promoteur", String(row.promoter_name), "", String(row.promoter_website || ""));
  }

  return team.slice(0, 60);
};

/** Read a DB / showcase row into the in-app project record. */
export const dossierFromRow = (row: any): ProjectRecord => {
  const legacyDetails = row?.details && typeof row.details === "object" ? row.details : {};
  const legacyMeta = legacyDetails.meta && typeof legacyDetails.meta === "object" ? legacyDetails.meta : {};
  const legacyDossier =
    legacyDetails.dossier && legacyDetails.dossier.version === 2 ? (legacyDetails.dossier as ProjectDossier) : null;

  const images = asList<string>(row?.images).filter(Boolean);
  const cover = safeHttpUrl(row?.cover_image || legacyMeta.cover_image || "");
  const attributes = asObject(row?.attributes);
  const attrFields = Object.fromEntries(
    Object.entries(attributes).filter(([key, value]) => !ATTR_META_KEYS.has(key) && value != null && String(value).trim()),
  );

  const fieldsFromColumns: Record<string, string> = {
    ...attrFields,
    typologies: plainText(row?.typologies, 200),
    equipment: plainText(row?.equipment, 200),
    nearby: plainText(row?.nearby, 200),
    priceOnRequest: row?.price_on_request ? "true" : "",
    priceFrom: row?.price_from != null ? String(row.price_from) : "",
    priceMin: row?.price_min != null ? String(row.price_min) : "",
    priceMax: row?.price_max != null ? String(row.price_max) : "",
    currency: plainText(row?.currency, 8) || "MAD",
    usage: plainText(row?.usage, 80),
    landArea: plainText(row?.land_area, 40),
    builtArea: plainText(row?.built_area, 40),
    buildings: plainText(row?.buildings, 40),
    floors: plainText(row?.floors, 40),
    basements: plainText(row?.basements, 40),
    apartments: plainText(row?.apartments, 40),
    parking: plainText(row?.parking, 40),
    surface: plainText(row?.surface, 40),
  };

  const hasTypedProject =
    Boolean(row?.category || row?.status || row?.project_type || row?.neighborhood || row?.address || row?.team);

  const base: ProjectDossier = legacyDossier && !hasTypedProject
    ? legacyDossier
    : {
        ...emptyDossier(),
        category: normalizeCategory(row?.category),
        subtype: plainText(row?.subtype || row?.project_type, 80),
        projectType: plainText(row?.project_type, 80),
        status: normalizeStatus(row?.status),
        country: plainText(row?.country, 60) || "Maroc",
        neighborhood: plainText(row?.neighborhood, 80),
        address: plainText(row?.address, 160),
        startDate: plainText(row?.start_date, 10),
        expectedEnd: plainText(row?.expected_end, 10),
        actualEnd: plainText(row?.actual_end, 10),
        progress: Math.min(100, Math.max(0, Number(row?.progress) || 0)),
        fields: Object.fromEntries(Object.entries(fieldsFromColumns).filter(([, value]) => Boolean(value))),
        choices: asList<string>(row?.choices).map((item) => plainText(item, 80)).filter(Boolean),
        units: asList<UnitRow>(row?.units),
        team: teamFromRow(row, attributes),
        partners: asList<ProjectPartner>(row?.partners),
        phases: asList<ProjectPhase>(row?.phases),
        documents: asList<ProjectDocument>(row?.documents),
        updates: asList<ProjectUpdate>(row?.updates),
        media: asList<ProjectMedia>(row?.media),
      };

  const record = {
    ...emptyDossier(),
    ...base,
    fields: { ...base.fields },
    choices: base.choices || [],
    units: base.units || [],
    team: (base.team || []).map((member) => ({ ...member, logo: member.logo || "" })),
    partners: base.partners || [],
    phases: base.phases || [],
    documents: (base.documents || []).map((doc) => ({
      id: doc.id,
      title: doc.title || "",
      type: doc.type || "Autre",
      url: doc.url || "",
      privacy: doc.privacy === "private" ? ("private" as const) : ("public" as const),
      sizeBytes: Math.max(0, Number(doc.sizeBytes) || 0),
    })),
    updates: (base.updates || []).map((entry) => ({ ...entry, images: entry.images || [] })),
    media: base.media || [],
  };
  const clean = sanitizeDossier(record);
  const safeImages = images.map((url: string) => safeHttpUrl(url)).filter(Boolean).slice(0, 40);
  const promoterRaw =
    row?.promoter_name || row?.promoter?.name || legacyMeta.promoter?.name
      ? {
          id: row?.promoter_id || row?.promoter?.id || legacyMeta.promoter?.id || "",
          name: row?.promoter_name || row?.promoter?.name || legacyMeta.promoter?.name || "",
          website: row?.promoter_website || row?.promoter?.website || legacyMeta.promoter?.website || "",
        }
      : null;
  const urlsRaw = row?.urls || legacyMeta.urls;
  const provenanceRaw = row?.provenance || legacyMeta.provenance;
  return {
    ...clean,
    id: plainText(row?.id, 80),
    userId: plainText(row?.user_id, 80),
    title: plainText(row?.title, 160) || "Projet",
    subtitle: plainText(row?.subtitle || legacyMeta.subtitle, 160),
    description: plainText(row?.description, 2000),
    descriptionShort: plainText(row?.description_short || legacyMeta.description_short, 400),
    city: plainText(row?.city, 80),
    region: plainText(row?.region, 80),
    postalCode: plainText(row?.postal_code || legacyMeta.postal_code, 20),
    latitude: plainText(row?.latitude != null ? String(row.latitude) : legacyMeta.latitude, 24),
    longitude: plainText(row?.longitude != null ? String(row.longitude) : legacyMeta.longitude, 24),
    image: cover || safeImages[0] || "",
    images: safeImages.length ? safeImages : cover ? [cover] : [],
    commercialStatus: plainText(row?.commercial_status || legacyMeta.commercial_status, 40),
    promoter: promoterRaw?.name
      ? {
          id: plainText(promoterRaw.id, 80),
          name: plainText(promoterRaw.name, 120),
          website: safeHttpUrl(promoterRaw.website),
        }
      : null,
    urls: urlsRaw
      ? {
          project: safeHttpUrl(urlsRaw.project),
          canonical: safeHttpUrl(urlsRaw.canonical),
          promoter: safeHttpUrl(urlsRaw.promoter),
        }
      : null,
    provenance: provenanceRaw
      ? {
          sources: Array.isArray(provenanceRaw.sources)
            ? provenanceRaw.sources.map((item: string) => plainText(item, 80)).filter(Boolean).slice(0, 40)
            : [],
          niveau: plainText(provenanceRaw.niveau || provenanceRaw.niveau_verification, 8),
          dateExtraction: plainText(provenanceRaw.dateExtraction || provenanceRaw.date_extraction, 20),
          dateConsolidation: plainText(provenanceRaw.dateConsolidation || provenanceRaw.date_consolidation, 20),
          equipeMentions: plainText(provenanceRaw.equipeMentions || provenanceRaw.equipe_mentions, 2000),
        }
      : null,
  };
};

/** Flatten create-form dossier into English typed project columns (no details blob). */
export const rowFromDossier = (
  title: string,
  description: string,
  city: string,
  region: string,
  images: string[],
  dossier: ProjectDossier,
  extras: ProjectPublishExtras = {},
) => {
  const clean = sanitizeDossier(dossier);
  const safeImages = images.map((url) => safeHttpUrl(url)).filter(Boolean).slice(0, 24);
  const commercialStatus = COMMERCIAL_STATUSES.some((item) => item.id === extras.commercialStatus)
    ? extras.commercialStatus
    : null;
  const promoterName = plainText(extras.promoter?.name || "", 120);
  const attributes = Object.fromEntries(
    Object.entries(clean.fields).filter(([key]) => !(PROMOTED_FIELD_KEYS as readonly string[]).includes(key)),
  );
  const lat = extras.latitude?.trim() ? Number(extras.latitude) : null;
  const lng = extras.longitude?.trim() ? Number(extras.longitude) : null;

  return {
    title: plainText(title, 120) || "Projet",
    description: plainText(description, 200),
    city: plainText(city, 80) || null,
    region: plainText(region, 80) || null,
    neighborhood: plainText(clean.neighborhood, 80) || null,
    address: plainText(clean.address, 160) || null,
    postal_code: plainText(extras.postalCode || "", 20) || null,
    country: plainText(clean.country, 60) || "Maroc",
    latitude: Number.isFinite(lat) ? lat : null,
    longitude: Number.isFinite(lng) ? lng : null,
    category: clean.category || null,
    subtype: plainText(clean.subtype, 80) || null,
    project_type: clean.projectType || null,
    status: clean.status || null,
    commercial_status: commercialStatus,
    progress: clean.progress,
    start_date: plainText(clean.startDate, 10) || null,
    expected_end: plainText(clean.expectedEnd, 10) || null,
    actual_end: plainText(clean.actualEnd, 10) || null,
    cover_image: safeImages[0] || null,
    images: safeImages,
    typologies: plainText(clean.fields.typologies, 200) || null,
    equipment: plainText(clean.fields.equipment, 200) || null,
    nearby: plainText(clean.fields.nearby, 200) || null,
    price_on_request: clean.fields.priceOnRequest === "true",
    price_from: numericOrNull(clean.fields.priceFrom),
    price_min: numericOrNull(clean.fields.priceMin),
    price_max: numericOrNull(clean.fields.priceMax),
    currency: plainText(clean.fields.currency, 8) || "MAD",
    usage: plainText(clean.fields.usage, 80) || null,
    land_area: plainText(clean.fields.landArea, 40) || null,
    built_area: plainText(clean.fields.builtArea, 40) || null,
    buildings: plainText(clean.fields.buildings, 40) || null,
    floors: plainText(clean.fields.floors, 40) || null,
    basements: plainText(clean.fields.basements, 40) || null,
    apartments: plainText(clean.fields.apartments, 40) || null,
    parking: plainText(clean.fields.parking, 40) || null,
    surface: plainText(clean.fields.builtArea || clean.fields.surface || clean.fields.landArea || "", 40) || null,
    promoter_id: null,
    promoter_name: promoterName || null,
    promoter_website: promoterName ? safeHttpUrl(extras.promoter?.website || "") || null : null,
    team: clean.team,
    partners: clean.partners,
    phases: clean.phases,
    // Not a projects column: catalogService splits this off into
    // public.projects_documents rows on create/update.
    documents: clean.documents,
    updates: clean.updates,
    media: clean.media,
    units: clean.units,
    choices: clean.choices,
    attributes,
  };
};
