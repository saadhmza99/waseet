import { plainText, safeHttpUrl } from "@/lib/safeText";

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
  | "termine"
  | "livre";

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
  thumbnail: string;
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

export type ProjectRecord = ProjectDossier & {
  id: string;
  userId: string;
  title: string;
  description: string;
  city: string;
  region: string;
  image: string;
  images: string[];
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
  { id: "construction", label: "En construction" },
  { id: "pause", label: "En pause" },
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
  thumbnail: "",
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
  team: (dossier.team || []).slice(0, 30).map((member) => ({
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
    thumbnail: safeHttpUrl(doc.thumbnail),
  })),
  updates: (dossier.updates || []).slice(0, 60).map((entry) => ({
    id: safeId(entry.id) || uid(),
    date: plainText(entry.date, 10),
    phase: plainText(entry.phase, 80),
    text: plainText(entry.text, 800),
    images: (entry.images || []).slice(0, 8).map((url) => safeHttpUrl(url)).filter(Boolean),
  })),
  media: (dossier.media || []).slice(0, 24).map((item) => ({
    url: safeHttpUrl(item.url),
    caption: plainText(item.caption, 160),
    category: plainText(item.category, 40),
  })).filter((item) => item.url),
});

export const dossierFromRow = (row: any): ProjectRecord => {
  const details = row?.details && typeof row.details === "object" ? row.details : {};
  const stored = details.dossier && details.dossier.version === 2 ? (details.dossier as ProjectDossier) : null;
  const images = Array.isArray(row?.images) ? row.images.filter(Boolean) : [];
  const base = stored || {
    ...emptyDossier(),
    category: "immobilier" as const,
    status: "construction" as const,
    progress: 0,
    fields: {
      builtArea: String(row?.surface || "").replace(/[^\d]/g, ""),
      apartments: row?.beds ? String(row.beds) : "",
    },
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
      privacy: doc.privacy === "private" ? "private" as const : "public" as const,
      thumbnail: doc.thumbnail || "",
    })),
    updates: (base.updates || []).map((entry) => ({ ...entry, images: entry.images || [] })),
    media: base.media || [],
  };
  const clean = sanitizeDossier(record);
  const safeImages = images.map((url: string) => safeHttpUrl(url)).filter(Boolean).slice(0, 24);
  return {
    ...clean,
    id: plainText(row?.id, 80),
    userId: plainText(row?.user_id, 80),
    title: plainText(row?.title, 120) || "Projet",
    description: plainText(row?.description, 2000),
    city: plainText(row?.city, 80),
    region: plainText(row?.region, 80),
    image: safeImages[0] || "",
    images: safeImages,
  };
};

export const rowFromDossier = (title: string, description: string, city: string, region: string, images: string[], dossier: ProjectDossier) => {
  const clean = sanitizeDossier(dossier);
  const safeImages = images.map((url) => safeHttpUrl(url)).filter(Boolean).slice(0, 24);
  return {
    title: plainText(title, 120) || "Projet",
    description: plainText(description, 200),
    city: plainText(city, 80),
    region: plainText(region, 80),
    surface: plainText(clean.fields.builtArea || clean.fields.surface || clean.fields.landArea || "", 20) || null,
    images: safeImages,
    details: { dossier: clean },
  };
};
