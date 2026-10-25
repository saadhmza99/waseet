import type { PropertyDetails } from "@/lib/propertyListing";

/** Live biens come from Supabase. Mocks archived in `lib/archive/showcaseProperties.mock.ts`. */
export type ShowcaseProperty = {
  id: string;
  sourceUrl: string;
  images: string[];
  details: PropertyDetails;
};

export const SHOWCASE_PROPERTIES: ShowcaseProperty[] = [];

export const showcaseProperty = (_id: string): ShowcaseProperty | null => null;
