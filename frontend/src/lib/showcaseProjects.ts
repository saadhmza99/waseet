import type { ProjectDossier } from "@/lib/projectDossier";
import type { KerixShowcaseRow } from "@/lib/showcaseProjectsKerix";

/** Live projects come from Supabase. Mocks archived in `lib/archive/showcaseProjects*.mock.ts`. */
export type ShowcaseRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  city: string;
  region: string;
  images: string[];
  details: { dossier: ProjectDossier; meta?: KerixShowcaseRow["details"]["meta"] };
} & Partial<
  Pick<
    KerixShowcaseRow,
    | "subtitle"
    | "description_short"
    | "cover_image"
    | "commercial_status"
    | "postal_code"
    | "latitude"
    | "longitude"
    | "promoter"
    | "urls"
    | "provenance"
  >
>;

export const SHOWCASE_PROJECTS: ShowcaseRow[] = [];

export const showcaseRow = (_id: string): ShowcaseRow | null => null;
