import {
  profileSectionsForInternalCodes,
  type ProfileSectionVisibility,
} from "@/lib/taxonomy";

export const INSTITUTION_KINDS = [
  { id: "federation", label: "Fédération" },
  { id: "order", label: "Ordre" },
  { id: "chamber", label: "Chambre" },
  { id: "public", label: "Organisme public" },
  { id: "media", label: "Presse" },
  { id: "observatory", label: "Observatoire" },
] as const;

export type InstitutionKind = (typeof INSTITUTION_KINDS)[number]["id"];

const FORMATION_KINDS = new Set<InstitutionKind>(["federation", "order", "chamber", "public"]);

export const isInstitutionProfile = (profile?: { profile_type?: string | null } | null) =>
  profile?.profile_type === "institution";

export const institutionKindLabel = (kind?: string | null) =>
  INSTITUTION_KINDS.find((item) => item.id === kind)?.label || "Institution";

export const institutionOffersFormations = (kind?: string | null) =>
  FORMATION_KINDS.has(kind as InstitutionKind);

const institutionSections = (): ProfileSectionVisibility => ({
  showPosts: true,
  showRealisations: false,
  showProjets: false,
  showBiens: false,
  showServices: false,
  showProduits: false,
});

/** Institution accounts publish posts only. Companies keep the catalog tabs. */
export const sectionsForProfile = (
  profile: { profile_type?: string | null; is_verified?: boolean | null } | null | undefined,
  codes?: Array<string | null | undefined> | null,
): ProfileSectionVisibility => {
  if (isInstitutionProfile(profile)) return institutionSections();
  return profileSectionsForInternalCodes(codes, { isVerified: Boolean(profile?.is_verified) });
};
