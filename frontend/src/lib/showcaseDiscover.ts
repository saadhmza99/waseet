import { SHOWCASE_POSTS } from "@/lib/showcasePosts";

type ItemKind = "actualite" | "bien" | "projet" | "annonce" | "agence";

export type DiscoverItem = {
  id: string;
  feed_category: string;
  feed_sub_category: string;
  is_promoteur?: boolean;
  is_fournisseur?: boolean;
  kind: ItemKind;
  profileName: string;
  image: string;
  title: string;
  city: string;
  price?: string;
  surface?: string;
  beds?: number;
  deal?: "sale" | "rent";
  blurb?: string;
  progress?: number;
  baths?: number;
  description?: string;
  highlights?: string[];
  username?: string;
};

/** Feed mock posts only. Biens / projets / services / comptes load from Supabase in Explore. */
const posts: DiscoverItem[] = SHOWCASE_POSTS.map((row) => ({
  id: row.id,
  feed_category: row.feed_category,
  feed_sub_category: row.feed_sub_category,
  kind: "actualite" as const,
  profileName: row.profiles.full_name,
  username: row.profiles.username,
  image: row.images[0] || row.single_image_url || "",
  title: row.profiles.full_name,
  city: row.city,
  description: row.description,
}));

export const DISCOVER_ITEMS: DiscoverItem[] = posts;
