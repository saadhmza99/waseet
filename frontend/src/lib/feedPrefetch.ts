import { FEED_PAGE_SIZE, postService, type FeedPage } from "@/services/postService";

const MAX_AGE_MS = 60 * 1000;

let pending: { page: Promise<FeedPage | null>; at: number } | null = null;

export const prefetchFeedFirstPage = () => {
  if (pending && Date.now() - pending.at < MAX_AGE_MS) return;
  pending = { page: postService.getFeedPage(FEED_PAGE_SIZE, 0).catch(() => null), at: Date.now() };
};

export const takeFeedFirstPage = async () => {
  const entry = pending;
  pending = null;
  if (!entry || Date.now() - entry.at > MAX_AGE_MS) return null;
  return entry.page;
};
