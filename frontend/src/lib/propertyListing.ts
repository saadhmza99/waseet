export const LISTING_CATEGORIES = [
  { id: "vente", label: "Vente" },
  { id: "location", label: "Location" },
  { id: "location_vacances", label: "Location vacances" },
] as const;

export const PROPERTY_KINDS = [
  { id: "appartement", label: "Appartements" },
  { id: "maison", label: "Maisons" },
  { id: "villa", label: "Villas & maisons de luxe" },
  { id: "riad", label: "Riad" },
  { id: "local_commercial", label: "Locaux commerciaux" },
  { id: "bureau", label: "Bureaux" },
  { id: "terrain", label: "Terrains" },
  { id: "ferme", label: "Fermes" },
] as const;

export const PROPERTY_CONDITIONS = [
  { id: "jamais_habite", label: "Jamais habité / rénové" },
  { id: "bon_etat", label: "Bon état / habitable" },
  { id: "a_renover", label: "À rénover" },
] as const;

export const PROPERTY_STANDINGS = [
  { id: "standard", label: "Standard" },
  { id: "haut_standing", label: "Haut standing" },
  { id: "luxe", label: "Luxe" },
] as const;

export const PROPERTY_STATUSES = [
  { id: "disponible", label: "Disponible" },
  { id: "en_construction", label: "En construction" },
  { id: "occupe", label: "Occupé" },
] as const;

export const AGE_OPTIONS = [
  "Neuf",
  "Moins de 5 ans",
  "5-10 ans",
  "10-20 ans",
  "Plus de 20 ans",
];

export const FLOORING_OPTIONS = ["Carrelage", "Parquet", "Marbre", "Moquette", "Béton", "Autre"];

export const ORIENTATIONS = ["Nord", "Sud", "Est", "Ouest"];

export const MOROCCO_REGIONS = [
  "Tanger-Tétouan-Al Hoceïma",
  "Oriental",
  "Fès-Meknès",
  "Rabat-Salé-Kénitra",
  "Béni Mellal-Khénifra",
  "Casablanca-Settat",
  "Marrakech-Safi",
  "Drâa-Tafilalet",
  "Souss-Massa",
  "Guelmim-Oued Noun",
  "Laâyoune-Sakia El Hamra",
  "Dakhla-Oued Ed-Dahab",
];

export const FEATURE_GROUPS: { title: string; items: { id: string; label: string }[] }[] = [
  {
    title: "Caractéristiques générales",
    items: [
      { id: "jardin", label: "Jardin" },
      { id: "terrasse", label: "Terrasse" },
      { id: "garage", label: "Garage" },
      { id: "ascenseur", label: "Ascenseur" },
      { id: "vue_mer", label: "Vue sur mer" },
      { id: "vue_montagnes", label: "Vue sur les montagnes" },
      { id: "piscine", label: "Piscine" },
      { id: "concierge", label: "Concierge" },
      { id: "rangement", label: "Chambre rangement" },
      { id: "meuble", label: "Meublé" },
      { id: "entre_seul", label: "Entre-seul" },
    ],
  },
  {
    title: "Intérieur",
    items: [
      { id: "salon_marocain", label: "Salon Marocain" },
      { id: "salon_europeen", label: "Salon européen" },
      { id: "antenne", label: "Antenne parabolique" },
      { id: "cheminee", label: "Cheminée" },
      { id: "clim", label: "Climatisation" },
      { id: "chauffage", label: "Chauffage central" },
      { id: "securite", label: "Sécurité" },
      { id: "double_vitrage", label: "Double vitrage" },
      { id: "porte_blindee", label: "Porte blindée" },
    ],
  },
  {
    title: "Options supplémentaires",
    items: [
      { id: "cuisine_equipee", label: "Cuisine équipée" },
      { id: "frigo", label: "Réfrigérateur" },
      { id: "four", label: "Four" },
      { id: "lave_linge", label: "Machine à laver" },
      { id: "micro_ondes", label: "Micro-ondes" },
    ],
  },
];

export type PropertyDetails = {
  category: string;
  propertyKind: string;
  condition: string;
  standing: string;
  status: string;
  delivery: string;
  address: string;
  region: string;
  city: string;
  lat: number | null;
  lng: number | null;
  builtSurface: string;
  plotSurface: string;
  gardenSurface: string;
  terraceSurface: string;
  parkingPlaces: string;
  age: string;
  flooring: string;
  floors: string;
  orientation: string;
  pieces: number;
  beds: number;
  baths: number;
  features: string[];
  phones: string[];
  priceDh: string;
  title: string;
  description: string;
};

export const emptyPropertyDetails = (): PropertyDetails => ({
  category: "",
  propertyKind: "",
  condition: "",
  standing: "",
  status: "",
  delivery: "",
  address: "",
  region: "",
  city: "",
  lat: 30.4278,
  lng: -9.5981,
  builtSurface: "",
  plotSurface: "",
  gardenSurface: "",
  terraceSurface: "",
  parkingPlaces: "",
  age: "",
  flooring: "",
  floors: "",
  orientation: "",
  pieces: 0,
  beds: 0,
  baths: 0,
  features: [],
  phones: [""],
  priceDh: "",
  title: "",
  description: "",
});

export const labelOf = (
  list: readonly { id: string; label: string }[],
  id?: string | null
) => list.find((item) => item.id === id)?.label || id || "";

export const ALL_FEATURES = FEATURE_GROUPS.flatMap((group) => group.items);

export const featureLabel = (id: string) =>
  ALL_FEATURES.find((item) => item.id === id)?.label || id;

export const formatPriceDh = (value?: string | null) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/dh/i.test(trimmed)) return trimmed;
  return `${trimmed} DH`;
};

export const formatSurface = (surface?: string | null) => {
  if (!surface) return "";
  return `${surface}${/\d/.test(surface) && !/m/i.test(surface) ? " m²" : ""}`;
};

export const isValidMoroccoPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return /^(0[5-7]\d{8}|212[5-7]\d{8})$/.test(digits);
};

export const toWhatsAppNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `212${digits.slice(1)}`;
  return digits;
};
