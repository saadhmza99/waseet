/**
 * Sifarah Product taxonomy — parent categories + Le Chantier EN subcategories.
 * Product rows store the EN subcategory (or parent) in `products.category`.
 */

export type ProductSubcategory = {
  /** English key as stored in products.category / Le Chantier */
  en: string;
  /** French label in filters & cards */
  fr: string;
};

export type ProductCategory = {
  id: string;
  fr: string;
  /** Also match when products.category equals these parent EN names */
  enAliases?: string[];
  subs: ProductSubcategory[];
};

export const PRODUCT_TAXONOMY: ProductCategory[] = [
  {
    id: "materiaux-construction",
    fr: "Matériaux de construction",
    enAliases: ["Building materials"],
    subs: [
      { en: "Steel", fr: "Acier" },
      { en: "Aggregates", fr: "Granulats" },
      { en: "Ready-mix concrete", fr: "Béton prêt à l'emploi" },
      { en: "Bricks", fr: "Briques" },
      { en: "Cement", fr: "Ciment" },
      { en: "Nails", fr: "Clous" },
      { en: "Tie wire", fr: "Fil à ligaturer" },
      { en: "Concrete masonry", fr: "Maçonnerie béton" },
      { en: "Mortar & render", fr: "Mortier & enduit" },
      { en: "Floor systems (beams & blocks)", fr: "Planchers (poutrelles & hourdis)" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "materiel-electrique",
    fr: "Matériel électrique",
    enAliases: ["Electrical supplies", "Electrical equipment"],
    subs: [
      { en: "Automation & smart home", fr: "Automatisme & domotique" },
      { en: "Boxes & enclosures", fr: "Boîtes & coffrets" },
      { en: "Wiring connections", fr: "Connexions électriques" },
      { en: "Cables & wiring", fr: "Câbles & fils" },
      { en: "Circuit breakers & fuses", fr: "Disjoncteurs & fusibles" },
      { en: "Switches & sockets", fr: "Interrupteurs & prises" },
      { en: "Lighting", fr: "Éclairage" },
      { en: "Solar energy", fr: "Énergie solaire" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "salle-de-bain-sanitaire",
    fr: "Salle de bain / Sanitaire",
    enAliases: ["Bathroom & sanitary ware", "Bathroom / Sanitary"],
    subs: [
      { en: "Bathtubs", fr: "Baignoires" },
      { en: "Water heaters", fr: "Chauffe-eau" },
      { en: "Bathroom furniture", fr: "Meubles de salle de bain" },
      { en: "Taps & faucets", fr: "Robinets" },
      { en: "Basins & washbasins", fr: "Lavabos & vasques" },
      { en: "Toilets & bidets", fr: "WC & bidets" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "pierre-naturelle",
    fr: "Pierre naturelle",
    enAliases: ["Natural stone"],
    subs: [
      { en: "Granite", fr: "Granit" },
      { en: "Marble", fr: "Marbre" },
      { en: "Natural stone", fr: "Pierre naturelle" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "peinture",
    fr: "Peinture",
    enAliases: ["Paint"],
    subs: [
      { en: "Surface preparation", fr: "Préparation de surface" },
      { en: "Exterior coatings", fr: "Revêtements extérieurs" },
      { en: "Interior coatings", fr: "Revêtements intérieurs" },
      { en: "Paint", fr: "Peinture" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "epi",
    fr: "EPI",
    enAliases: ["Safety gear (PPE)"],
    subs: [
      { en: "Hard hat", fr: "Casque" },
      { en: "Safety footwear", fr: "Chaussures de sécurité" },
      { en: "Hearing protection", fr: "Protection auditive" },
      { en: "Hand protection", fr: "Protection des mains" },
      { en: "Workwear", fr: "Vêtements de travail" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "piscine",
    fr: "Piscine",
    enAliases: ["Swimming pools", "Pool"],
    subs: [{ en: "Pool", fr: "Piscine" }],
  },
  {
    id: "revetement-mural",
    fr: "Revêtement mural",
    enAliases: ["Wall covering", "Wall coverings"],
    subs: [
      { en: "Cladding", fr: "Bardage" },
      { en: "Mouldings", fr: "Moulures" },
      { en: "Wall panels", fr: "Panneaux muraux" },
      { en: "Wallpaper", fr: "Papier peint" },
      { en: "Façade cladding", fr: "Habillage de façade" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "materiel-chantier",
    fr: "Matériel de chantier",
    enAliases: ["Site equipment"],
    subs: [
      { en: "Formwork", fr: "Coffrage" },
      { en: "Scaffolding", fr: "Échafaudage" },
      { en: "Construction machinery", fr: "Engins de chantier" },
      { en: "Cranes", fr: "Grues" },
      { en: "Site tools", fr: "Outils de chantier" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "revetement-sol",
    fr: "Revêtement de sol",
    enAliases: ["Flooring"],
    subs: [
      { en: "Carpets & rugs", fr: "Moquettes & tapis" },
      { en: "Parquet", fr: "Parquet" },
      { en: "Laminate flooring", fr: "Stratifié" },
      { en: "Outdoor flooring", fr: "Sol extérieur" },
      { en: "PVC flooring", fr: "Sol PVC" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "carrelage",
    fr: "Carrelage",
    enAliases: ["Tiles", "Tile"],
    subs: [
      { en: "Kitchen", fr: "Cuisine" },
      { en: "Indoor", fr: "Intérieur" },
      { en: "Pool", fr: "Piscine" },
      { en: "Adhesives & installation products", fr: "Colles & produits de pose" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "amenagement-exterieur",
    fr: "Aménagement extérieur",
    enAliases: ["Outdoor landscaping"],
    subs: [
      { en: "Garden", fr: "Jardin" },
      { en: "Pergolas", fr: "Pergolas" },
      { en: "Pool", fr: "Piscine" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "menuiserie",
    fr: "Menuiserie",
    enAliases: ["Joinery", "Carpentry / Woodwork"],
    subs: [
      { en: "Interior fit-out", fr: "Agencement intérieur" },
      { en: "Kitchens", fr: "Cuisines" },
      { en: "Doors", fr: "Portes" },
      { en: "Joinery", fr: "Menuiserie" },
    ],
  },
  {
    id: "quincaillerie",
    fr: "Quincaillerie",
    enAliases: ["Hardware"],
    subs: [
      { en: "Door hardware", fr: "Quincaillerie de porte" },
      { en: "Hand tools", fr: "Outillage à main" },
      { en: "Security", fr: "Sécurité" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "aluminium",
    fr: "Aluminium",
    enAliases: ["Aluminium"],
    subs: [
      { en: "Sliding doors & windows", fr: "Baies & fenêtres coulissantes" },
      { en: "Railings", fr: "Garde-corps" },
      { en: "Doors", fr: "Portes" },
      { en: "Roller shutters", fr: "Volets roulants" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "systeme-surveillance",
    fr: "Système de surveillance",
    enAliases: ["Surveillance systems"],
    subs: [
      { en: "Access control", fr: "Contrôle d'accès" },
      { en: "Fire detection", fr: "Détection incendie" },
      { en: "Video surveillance (CCTV)", fr: "Vidéosurveillance (CCTV)" },
    ],
  },
  {
    id: "batiment-modulaire",
    fr: "Bâtiment modulaire",
    enAliases: ["Modular buildings", "Modular building"],
    subs: [
      { en: "Site accommodation", fr: "Hébergement de chantier" },
      { en: "Toilet & shower block", fr: "Bloc sanitaires" },
      { en: "Site office", fr: "Bureau de chantier" },
      { en: "Sales office", fr: "Bureau de vente" },
      { en: "Guard booth", fr: "Guérite" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "climatisation-chauffage",
    fr: "Climatisation / Chauffage",
    enAliases: ["Air conditioning & heating", "HVAC"],
    subs: [
      { en: "Cassette units", fr: "Unités cassette" },
      { en: "Ducted units", fr: "Unités gainables" },
      { en: "Single-split units", fr: "Splits" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "cuisine",
    fr: "Cuisine",
    enAliases: ["Kitchen"],
    subs: [
      { en: "Oven", fr: "Four" },
      { en: "Range hood", fr: "Hotte" },
      { en: "Hob", fr: "Plaque de cuisson" },
    ],
  },
  {
    id: "automatisme",
    fr: "Automatisme",
    enAliases: ["Automation", "Home automation"],
    subs: [
      { en: "Automatic doors", fr: "Portes automatiques" },
      { en: "Garage doors", fr: "Portes de garage" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "ferronnerie-metallurgie",
    fr: "Ferronnerie / Métallurgie",
    enAliases: ["Ironwork & metalwork", "Ironworks / Metalworking"],
    subs: [
      { en: "Security bars", fr: "Barreaux de sécurité" },
      { en: "Wire fencing", fr: "Grillage" },
      { en: "Metal sheets", fr: "Tôles" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "isolation",
    fr: "Isolation",
    enAliases: ["Insulation"],
    subs: [
      { en: "Sound insulation", fr: "Isolation phonique" },
      { en: "Thermal insulation", fr: "Isolation thermique" },
    ],
  },
  {
    id: "plomberie",
    fr: "Plomberie",
    enAliases: ["Plumbing"],
    subs: [
      { en: "Pipes", fr: "Tuyaux" },
      { en: "Other", fr: "Autre" },
    ],
  },
  {
    id: "vitrerie",
    fr: "Vitrerie",
    enAliases: ["Glazing", "Glass"],
    subs: [{ en: "Glass supply", fr: "Fourniture de verre" }],
  },
  {
    id: "platre",
    fr: "Plâtre",
    enAliases: ["Plaster"],
    subs: [{ en: "Plaster", fr: "Plâtre" }],
  },
];

/** Flat parent options for the Catégorie filter. */
export const PRODUCT_PARENT_OPTIONS = PRODUCT_TAXONOMY.map((cat) => ({
  id: cat.id,
  label: cat.fr,
}));

export const productCategoryById = (id: string | null | undefined) =>
  PRODUCT_TAXONOMY.find((cat) => cat.id === id) || null;

const normalizeKey = (value: string) => value.trim().toLowerCase();

/** EN subcategory / alias → parent category id */
const SUB_TO_PARENT = new Map<string, string>();
/** EN subcategory → FR label */
const SUB_EN_TO_FR = new Map<string, string>();
/** Parent id → set of EN keys (subs + aliases) */
const PARENT_EN_KEYS = new Map<string, Set<string>>();

for (const cat of PRODUCT_TAXONOMY) {
  const keys = new Set<string>();
  SUB_TO_PARENT.set(normalizeKey(cat.fr), cat.id);
  SUB_TO_PARENT.set(normalizeKey(cat.id), cat.id);
  for (const alias of cat.enAliases || []) {
    SUB_TO_PARENT.set(normalizeKey(alias), cat.id);
    keys.add(normalizeKey(alias));
  }
  for (const sub of cat.subs) {
    SUB_TO_PARENT.set(normalizeKey(sub.en), cat.id);
    SUB_EN_TO_FR.set(normalizeKey(sub.en), sub.fr);
    keys.add(normalizeKey(sub.en));
  }
  // Parent FR also resolves to itself for fuzzy matching
  SUB_EN_TO_FR.set(normalizeKey(cat.fr), cat.fr);
  PARENT_EN_KEYS.set(cat.id, keys);
}

/** Legacy flat EN→FR map (cards / seed). */
export const PRODUCT_CATEGORY_EN_TO_FR: Record<string, string> = Object.fromEntries(
  [...SUB_EN_TO_FR.entries()].map(([en, fr]) => {
    // restore a readable key: prefer first matching taxonomy en
    const hit = PRODUCT_TAXONOMY.flatMap((c) => c.subs).find((s) => normalizeKey(s.en) === en);
    return [hit?.en || en, fr];
  }),
);

for (const cat of PRODUCT_TAXONOMY) {
  PRODUCT_CATEGORY_EN_TO_FR[cat.fr] = cat.fr;
  for (const alias of cat.enAliases || []) {
    PRODUCT_CATEGORY_EN_TO_FR[alias] = cat.fr;
  }
}

export const productCategoryFr = (en?: string | null) => {
  const key = (en || "").trim();
  if (!key) return "";
  return PRODUCT_CATEGORY_EN_TO_FR[key] || SUB_EN_TO_FR.get(normalizeKey(key)) || key;
};

export const productParentId = (en?: string | null) => {
  const key = normalizeKey(en || "");
  if (!key) return "";
  return SUB_TO_PARENT.get(key) || "";
};

/** Value stored when the product is filed under the family itself, not a subcategory. */
export const productFamilyCategoryValue = (parentId: string) => {
  const cat = productCategoryById(parentId);
  if (!cat) return "";
  return cat.enAliases?.[0] || cat.fr;
};

/** Stored category (EN, alias, or FR) → parent id and the EN value used by the form. */
export const productCategorySelection = (value?: string | null): { parentId: string; en: string } => {
  const raw = (value || "").trim();
  const key = normalizeKey(raw);
  if (!key) return { parentId: "", en: "" };
  for (const cat of PRODUCT_TAXONOMY) {
    const sub = cat.subs.find((item) => normalizeKey(item.en) === key || normalizeKey(item.fr) === key);
    if (sub) return { parentId: cat.id, en: sub.en };
  }
  for (const cat of PRODUCT_TAXONOMY) {
    const family =
      normalizeKey(cat.fr) === key ||
      normalizeKey(cat.id) === key ||
      (cat.enAliases || []).some((alias) => normalizeKey(alias) === key);
    if (family) return { parentId: cat.id, en: cat.enAliases?.[0] || cat.fr };
  }
  return { parentId: "", en: raw };
};

export const productParentLabel = (en?: string | null) => {
  const id = productParentId(en);
  return PRODUCT_TAXONOMY.find((c) => c.id === id)?.fr || productCategoryFr(en);
};

/** Subcategory options for filter — optionally limited to selected parent ids. */
export const productSubOptions = (parentIds?: string[]) => {
  const cats =
    parentIds && parentIds.length
      ? PRODUCT_TAXONOMY.filter((c) => parentIds.includes(c.id))
      : PRODUCT_TAXONOMY;
  const seen = new Set<string>();
  const options: { en: string; fr: string; parentId: string }[] = [];
  for (const cat of cats) {
    for (const sub of cat.subs) {
      const key = `${cat.id}::${sub.en}`;
      // "Other" / "Pool" / "Doors" / "Kitchen" appear in several parents — keep per-parent
      if (seen.has(key)) continue;
      seen.add(key);
      options.push({ en: sub.en, fr: sub.fr, parentId: cat.id });
    }
  }
  return options;
};

/**
 * Match a product category EN value against selected parent ids and/or
 * subcategory keys (`parentId::en` or plain `en`).
 */
export const productMatchesTaxonomy = (
  categoryEn: string | null | undefined,
  parentIds: string[],
  subKeys: string[],
) => {
  const raw = (categoryEn || "").trim();
  if (!parentIds.length && !subKeys.length) return true;
  const parent = productParentId(raw);
  if (subKeys.length) {
    const hit = subKeys.some((key) => {
      if (key.includes("::")) {
        const [parentId, ...rest] = key.split("::");
        const en = rest.join("::");
        return parentId === parent && normalizeKey(en) === normalizeKey(raw);
      }
      return normalizeKey(key) === normalizeKey(raw);
    });
    if (!hit) return false;
    if (parentIds.length) return parentIds.includes(parent);
    return true;
  }
  if (parentIds.length) return parentIds.includes(parent);
  return true;
};
