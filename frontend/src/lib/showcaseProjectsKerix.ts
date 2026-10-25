import type { ProjectDossier } from "@/lib/projectDossier";

/** Archived in `lib/archive/showcaseProjectsKerix.mock.ts`. */
export type KerixShowcaseMeta = {
  subtitle?: string;
  description_short?: string;
  cover_image?: string;
  commercial_status?: string;
  postal_code?: string;
  latitude?: string;
  longitude?: string;
  promoter?: { id: string; name: string; website: string };
  urls?: { project: string; canonical: string; promoter: string };
  provenance?: {
    sources: string[];
    niveau: string;
    date_extraction: string;
    date_consolidation: string;
    equipe_mentions: string;
  };
};

export type KerixShowcaseRow = {
  id: string;
  user_id: string;
  title: string;
  subtitle?: string;
  description: string;
  description_short?: string;
  city: string;
  region: string;
  cover_image?: string;
  images: string[];
  commercial_status?: string;
  postal_code?: string;
  latitude?: string;
  longitude?: string;
  promoter?: KerixShowcaseMeta["promoter"];
  urls?: KerixShowcaseMeta["urls"];
  provenance?: KerixShowcaseMeta["provenance"];
  details: { dossier: ProjectDossier; meta?: KerixShowcaseMeta };
};

export const KERIX_TEST_PROJECTS: KerixShowcaseRow[] = [];
