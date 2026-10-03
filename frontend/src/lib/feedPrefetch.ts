import { FEED_PAGE_SIZE, postService, type FeedPage } from "@/services/postService";

const MAX_AGE_MS = 60 * 1000;

type Slot = { page: Promise<FeedPage | null>; at: number };

let first: Slot | null = null;
let next: Slot | null = null;

const fresh = (slot: Slot | null) => (slot && Date.now() - slot.at < MAX_AGE_MS ? slot : null);

export const prefetchFeedFirstPage = () => {
  if (fresh(first)) return;
  const at = Date.now();
  const page = postService.getFeedPage(FEED_PAGE_SIZE, 0).catch(() => null);
  first = { page, at };
  next = {
    at,
    page: page.then((result) =>
      result?.hasMore ? postService.getFeedPage(FEED_PAGE_SIZE, FEED_PAGE_SIZE).catch(() => null) : null
    ),
  };
};

export const takeFeedFirstPage = () => {
  const entry = fresh(first);
  if (!entry) return null;
  const page = entry.page;
  window.setTimeout(() => {
    if (first === entry) first = null;
  }, 0);
  return page;
};

export const takeFeedNextPage = () => {
  const entry = fresh(next);
  if (!entry) return null;
  const page = entry.page;
  window.setTimeout(() => {
    if (next === entry) next = null;
  }, 0);
  return page;
};
