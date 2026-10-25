import type { ShowcaseService } from "@/lib/showcaseServices";

/** Archived in `lib/archive/showcaseServicesPreview.mock.ts`. */
export type ServicePreviewMeta = {
  firmId: string;
  zoneLabel: string;
  includedSource: string;
  scrapeConfidence: string;
  scrapeOk: boolean;
  publishable: boolean;
  contactPhone: string;
  contactEmail: string;
  scrapeFeedSubCategory: string;
};

export type ServicePreviewRow = ShowcaseService & {
  preview: true;
  meta: ServicePreviewMeta;
};

export const SERVICE_PREVIEW_ROWS: ServicePreviewRow[] = [];

export const isServicePreview = (_row: ShowcaseService | null | undefined): _row is ServicePreviewRow => false;
