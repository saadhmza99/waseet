/** Devis wizard catalog — modeled on lechantier.ma project types. */

export type DevisProjectType = {
  id: string;
  label: string;
  hint: string;
  icon: string;
  groupId: string;
};

export type DevisProjectGroup = {
  id: string;
  label: string;
  hint: string;
  icon: string;
  types: DevisProjectType[];
};

export type DevisExtraField = {
  id: string;
  label: string;
  options: string[];
};

export const DEVIS_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Tanger",
  "Fes",
  "Agadir",
  "Meknes",
  "Kenitra",
  "Oujda",
  "Tetouan",
  "El Jadida",
  "Beni Mellal",
  "Sale",
  "Nador",
  "Mohammedia",
  "Temara",
] as const;

export const DEVIS_BUDGETS = [
  "Moins de 300 000 MAD",
  "300 000 - 500 000 MAD",
  "500 000 - 1 000 000 MAD",
  "1 000 000 - 2 000 000 MAD",
  "Plus de 2 000 000 MAD",
  "Je ne sais pas encore",
] as const;

export const DEVIS_PROJECT_GROUPS: DevisProjectGroup[] = [
  {
    id: "construire",
    label: "Construire neuf",
    hint: "Villa, immeuble, commerce",
    icon: "🏗️",
    types: [
      { id: "villa", label: "Villa individuelle", hint: "Construction villa neuve", icon: "🏡", groupId: "construire" },
      { id: "r1", label: "R+1", hint: "Maison 1 étage (RDC + 1)", icon: "🏠", groupId: "construire" },
      { id: "r2-r3", label: "R+2 / R+3", hint: "Petit immeuble 2-3 étages", icon: "🏢", groupId: "construire" },
      { id: "commerce", label: "Commerce / bureau", hint: "Local commercial, bureau, showroom", icon: "🏬", groupId: "construire" },
    ],
  },
  {
    id: "renover",
    label: "Rénover / agrandir",
    hint: "Rénovation, extension, surélévation",
    icon: "🔨",
    types: [
      { id: "reno-complete", label: "Rénovation complète", hint: "Rénovation totale d'un bien existant", icon: "🔨", groupId: "renover" },
      { id: "reno-partielle", label: "Rénovation partielle", hint: "Une ou plusieurs pièces", icon: "🪜", groupId: "renover" },
      { id: "extension", label: "Extension", hint: "Agrandissement de bâti existant", icon: "➕", groupId: "renover" },
      { id: "surelevation", label: "Surélévation", hint: "Ajouter un étage", icon: "🏗️", groupId: "renover" },
      { id: "toiture", label: "Toiture / terrasse", hint: "Réfection toit, étanchéité", icon: "🧱", groupId: "renover" },
    ],
  },
  {
    id: "interieur",
    label: "Aménagement intérieur",
    hint: "Cuisine, SDB, finitions",
    icon: "🛋️",
    types: [
      { id: "cuisine", label: "Cuisine équipée", hint: "Installation clé en main", icon: "🍳", groupId: "interieur" },
      { id: "sdb", label: "Salle de bain", hint: "Rénovation ou création", icon: "🛁", groupId: "interieur" },
      { id: "tadelakt", label: "Tadelakt / zellige", hint: "Finitions marocaines traditionnelles", icon: "🎨", groupId: "interieur" },
      { id: "peinture", label: "Peinture / revêtements", hint: "Peinture, carrelage, parquet", icon: "🖌️", groupId: "interieur" },
      { id: "menuiserie", label: "Menuiserie / dressing", hint: "Placards, portes, dressing sur mesure", icon: "🪵", groupId: "interieur" },
    ],
  },
  {
    id: "exterieur",
    label: "Aménagement extérieur",
    hint: "Piscine, jardin, pergola",
    icon: "🌿",
    types: [
      { id: "piscine", label: "Piscine", hint: "Construction ou rénovation piscine", icon: "🏊", groupId: "exterieur" },
      { id: "pergola", label: "Pergola / terrasse", hint: "Pergola alu, bioclimatique, terrasse bois", icon: "🌿", groupId: "exterieur" },
      { id: "jardin", label: "Jardin paysager", hint: "Aménagement végétal, gazon, arrosage", icon: "🌱", groupId: "exterieur" },
      { id: "cloture", label: "Clôture / portail", hint: "Mur d'enceinte, portail automatique", icon: "🚪", groupId: "exterieur" },
    ],
  },
  {
    id: "equipement",
    label: "Équipement maison",
    hint: "Solaire, clim, sécurité",
    icon: "⚡",
    types: [
      { id: "solaire", label: "Panneaux solaires", hint: "Photovoltaïque, chauffe-eau solaire", icon: "☀️", groupId: "equipement" },
      { id: "clim", label: "Climatisation / PAC", hint: "Split, gaine, pompe à chaleur", icon: "❄️", groupId: "equipement" },
      { id: "securite", label: "Sécurité / alarme", hint: "Caméras, alarme, interphone", icon: "📹", groupId: "equipement" },
      { id: "domotique", label: "Domotique", hint: "Maison connectée, volets, éclairage", icon: "💡", groupId: "equipement" },
    ],
  },
  {
    id: "materiaux",
    label: "Matériaux & produits",
    hint: "Ciment, carrelage, alu…",
    icon: "📦",
    types: [
      { id: "achat-materiaux", label: "Achat matériaux", hint: "Ciment, fer, sable, carrelage…", icon: "🧱", groupId: "materiaux" },
    ],
  },
  {
    id: "pro",
    label: "Trouver un pro",
    hint: "Architecte, artisan, entrepreneur",
    icon: "👷",
    types: [
      {
        id: "trouver-un-pro",
        label: "Trouver un pro",
        hint: "Architecte, artisan, entrepreneur",
        icon: "👷",
        groupId: "pro",
      },
    ],
  },
];

export const allDevisProjectTypes = () => DEVIS_PROJECT_GROUPS.flatMap((g) => g.types);

export const devisProjectTypeById = (id?: string | null) =>
  allDevisProjectTypes().find((t) => t.id === id) || null;

/** Extra detail fields shown on step 2 for a given project type. */
export const devisExtraFieldsFor = (typeId?: string | null): DevisExtraField[] => {
  if (typeId === "trouver-un-pro") {
    return [
      {
        id: "proType",
        label: "Quel pro recherchez-vous ?",
        options: [
          "Architecte",
          "Bureau d'études",
          "Constructeur / gros œuvre",
          "Artisan / maalem",
          "Topographe",
          "Fournisseur matériaux",
          "Autre",
        ],
      },
      {
        id: "proUrgency",
        label: "Urgence",
        options: ["Immédiate (< 7 jours)", "Dans le mois", "Dans les 3 mois", "Pas pressé"],
      },
      {
        id: "proVisit",
        label: "Visite terrain nécessaire ?",
        options: ["Oui", "Non, juste un devis papier"],
      },
    ];
  }
  if (typeId === "achat-materiaux") {
    return [
      {
        id: "materialKind",
        label: "Type de matériaux",
        options: ["Gros œuvre", "Finitions", "Menuiserie / alu", "Électricité / plomberie", "Mixte", "Autre"],
      },
      {
        id: "delivery",
        label: "Livraison",
        options: ["Sur chantier", "Retrait magasin", "À préciser"],
      },
    ];
  }
  if (typeId?.startsWith("reno") || typeId === "extension" || typeId === "surelevation" || typeId === "toiture") {
    return [
      {
        id: "surface",
        label: "Surface approximative",
        options: ["Moins de 50 m²", "50 – 100 m²", "100 – 200 m²", "Plus de 200 m²", "Je ne sais pas"],
      },
      {
        id: "timeline",
        label: "Délai souhaité",
        options: ["Immédiat", "Dans le mois", "Dans les 3 mois", "Pas pressé"],
      },
    ];
  }
  if (typeId === "villa" || typeId === "r1" || typeId === "r2-r3" || typeId === "commerce") {
    return [
      {
        id: "landStatus",
        label: "Terrain",
        options: ["Déjà propriétaire", "En cours d'achat", "Pas encore", "Non applicable"],
      },
      {
        id: "surface",
        label: "Surface approximative",
        options: ["Moins de 100 m²", "100 – 200 m²", "200 – 400 m²", "Plus de 400 m²", "Je ne sais pas"],
      },
    ];
  }
  return [
    {
      id: "timeline",
      label: "Délai souhaité",
      options: ["Immédiat", "Dans le mois", "Dans les 3 mois", "Pas pressé"],
    },
  ];
};

/** Map a profession / category label to a proType option when possible. */
export const guessProType = (profession?: string | null) => {
  const p = (profession || "").toLowerCase();
  if (!p) return "";
  if (p.includes("architect")) return "Architecte";
  if (p.includes("bureau") || p.includes("études") || p.includes("etudes") || p.includes("ingénieur") || p.includes("bet"))
    return "Bureau d'études";
  if (p.includes("topo") || p.includes("géom")) return "Topographe";
  if (p.includes("fournisseur") || p.includes("matériau") || p.includes("materiau")) return "Fournisseur matériaux";
  if (p.includes("artisan") || p.includes("maal") || p.includes("peintre") || p.includes("plomb") || p.includes("électric"))
    return "Artisan / maalem";
  if (p.includes("construct") || p.includes("gros") || p.includes("bâtiment") || p.includes("batiment") || p.includes("entreprise"))
    return "Constructeur / gros œuvre";
  return "Autre";
};
