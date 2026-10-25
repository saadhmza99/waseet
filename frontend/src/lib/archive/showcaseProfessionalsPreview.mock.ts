import { SERVICE_PREVIEW_ROWS } from "@/lib/archive/showcaseServicesPreview.mock";
import { feedSubCategoryBySlug } from "@/lib/taxonomy";

/** Frontend-only professional profile previews. Not written to Supabase. */
export type ProfessionalPreview = {
  id: string;
  username: string;
  full_name: string;
  location: string;
  profession: string;
  categoryLabel: string;
  phone: string;
  website_url: string;
  avatar_url: string;
  email: string;
  ice: string;
  bio: string;
};

const categoryLabel = (raw: string) => {
  const slug = raw.replace(/_/g, "-");
  const match = feedSubCategoryBySlug(slug);
  if (match) return match.subCategory.label;
  if (raw === "second_oeuvre_finitions") return "Second œuvre";
  if (raw === "materiaux_equipements") return "Matériaux & équipements";
  if (raw === "construction_gros_oeuvre") return "Construction & gros œuvre";
  return raw;
};

export const PROFESSIONAL_PREVIEW_ROWS: ProfessionalPreview[] = [
  {
    id: "PRO-TCH-9",
    username: "castlewood",
    full_name: "Castlewood",
    location: "Casablanca",
    profession: "Installation de revêtement mural",
    categoryLabel: categoryLabel("second_oeuvre_finitions"),
    phone: "+212621438334",
    website_url: "https://castlewood.ma/",
    avatar_url: "https://tachrone-profile-logos-pro.s3.eu-west-3.amazonaws.com/file-50.png",
    email: "contactcastlewood@gmail.com",
    ice: "003505389000016",
    bio: "Entreprise marocaine d’aménagement intérieur — conception, fabrication et pose.",
  },
  {
    id: "PRO-TCH-11",
    username: "alquimaroc",
    full_name: "ALQUIMAROC",
    location: "Tétouan",
    profession: "Matériel de chantier",
    categoryLabel: categoryLabel("materiaux_equipements"),
    phone: "+212666632495",
    website_url: "https://alquimaroc.ma/",
    avatar_url: "https://tachrone-profile-logos-pro.s3.eu-west-3.amazonaws.com/file-54.png",
    email: "",
    ice: "003138573000057",
    bio: "Matériel et solutions pour la construction, le génie civil et l’industrie.",
  },
  {
    id: "PRO-TCH-25",
    username: "ags_groupe",
    full_name: "AGS GROUPE",
    location: "Marrakech",
    profession: "Gros œuvre",
    categoryLabel: categoryLabel("construction_gros_oeuvre"),
    phone: "+212661659618",
    website_url: "https://www.agsgroupe.ma/",
    avatar_url: "https://tachrone-profile-logos-pro.s3.eu-west-3.amazonaws.com/file-80.png",
    email: "",
    ice: "003436634000015",
    bio: "Entreprise générale — villas, riads et programmes résidentiels à Marrakech.",
  },
];

export const servicesForProfessional = (firmId: string) =>
  SERVICE_PREVIEW_ROWS.filter((row) => row.meta.firmId === firmId);
