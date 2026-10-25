import type { ServiceOffer } from "@/lib/serviceOffer";

/** Live services come from Supabase. Mock rows archived in `lib/archive/showcaseServices*.mock.ts`. */
export type ShowcaseService = {
  id: string;
  firm: string;
  sourceUrl: string;
  feed_category: string;
  feed_sub_category: string;
  offer: ServiceOffer;
};

export const SHOWCASE_SERVICES: ShowcaseService[] = [];

export const showcaseService = (_id: string): ShowcaseService | null => null;
