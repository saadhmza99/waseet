/** Curated Accueil « Entreprises recommandées » — seeded batch recommended_firms_2026. */
export type RecommendedFirm = {
  id: string;
  username: string;
  full_name: string;
  profession: string;
  location: string;
  avatar_url: string;
  specialty: string;
  is_verified: true;
  /** Discover categories where this firm leads the results. */
  categories: string[];
  subcategories: string[];
  isPromoteur?: boolean;
};

export const RECOMMENDED_FIRMS: RecommendedFirm[] = [
  {
    id: "95c9cdbe-e880-5ce3-8319-88a44f7439ac",
    username: "chbarchitects",
    full_name: "CHB Architects",
    profession: "Architecture",
    location: "Casablanca",
    avatar_url:
      "https://chb.kscreasupport.com/wp-content/uploads/2022/03/logo-chbarchitects-hakim-benjelloun-1.png",
    specialty: "Architecture",
    is_verified: true,
    categories: ["architecture-design"],
    subcategories: ["architecture", "architecture-interieure"],
  },
  {
    id: "e5f9fff7-415f-5749-8468-151a926d4f4e",
    username: "tgcc",
    full_name: "TGCC",
    profession: "Construction & gros œuvre",
    location: "Casablanca",
    avatar_url: "https://tgcc.ma/wp-content/uploads/2025/10/Ensemble-logo.png",
    specialty: "Construction & gros œuvre",
    is_verified: true,
    categories: ["construction-btp"],
    subcategories: ["construction-gros-oeuvre"],
  },
  {
    id: "cef92b70-9083-53cd-9f2d-ffb47877669e",
    username: "cgi",
    full_name: "Compagnie Générale Immobilière",
    profession: "Promotion immobilière",
    location: "Rabat",
    avatar_url: "https://cdgdev.ma/sites/default/files/2024-12/4Ffv-4rM.jpeg",
    specialty: "Promotion immobilière",
    is_verified: true,
    categories: ["gestion-services-immobiliers", "promoteurs"],
    subcategories: ["promotion-immobiliere"],
    isPromoteur: true,
  },
  {
    id: "c9917c8b-b34c-5970-a885-abe9b157a66f",
    username: "interstyledesign",
    full_name: "Interstyle Design",
    profession: "Rénovation intérieure",
    location: "Casablanca",
    avatar_url: "https://interstyledesign.ma/images/Logo-interstyledesign.webp",
    specialty: "Rénovation intérieure",
    is_verified: true,
    categories: ["renovation-amenagement", "architecture-design"],
    subcategories: ["renovation", "architecture-interieure", "design"],
  },
  {
    id: "0c28bc7a-c563-5a3c-9d06-aee3467996c2",
    username: "betam",
    full_name: "BETAM",
    profession: "Bureau d'études",
    location: "Casablanca",
    avatar_url: "https://betam.ma/wp-content/uploads/2021/01/betam-fav.png",
    specialty: "Bureau d'études",
    is_verified: true,
    categories: ["construction-btp"],
    subcategories: ["ingenierie-etudes"],
  },
  {
    id: "87fe685f-aabf-509d-aa55-ecadd782ca72",
    username: "hajjiassocies",
    full_name: "Hajji & Associés",
    profession: "Droit immobilier & foncier",
    location: "Casablanca",
    avatar_url: "https://ahlo.ma/wp-content/uploads/2022/09/cropped-sigle-270x270.png",
    specialty: "Droit immobilier & foncier",
    is_verified: true,
    categories: ["juridique-foncier"],
    subcategories: ["droit-immobilier-foncier"],
  },
];

/** Feed firms for the Discover « À la une » block of the selected category. */
export const featuredFirmsForDiscover = ({
  category,
  sub,
  city,
  query,
}: {
  category: string | null;
  sub: string | null;
  city: string;
  query: string;
}) => {
  const cityKey = city.trim().toLowerCase();
  const queryKey = query.trim().toLowerCase();
  const openCategory = !category || category === "tout";
  return RECOMMENDED_FIRMS.filter((firm) => {
    if (cityKey && firm.location.trim().toLowerCase() !== cityKey) return false;
    if (queryKey) {
      const hay = `${firm.full_name} ${firm.username} ${firm.profession} ${firm.specialty}`.toLowerCase();
      if (!hay.includes(queryKey)) return false;
    }
    if (openCategory) return true;
    if (category === "promoteurs") return Boolean(firm.isPromoteur);
    if (category === "fournisseurs-filter") return false;
    if (!firm.categories.includes(category)) return false;
    if (sub && !firm.subcategories.includes(sub)) return false;
    return true;
  });
};
