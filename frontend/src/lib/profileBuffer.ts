const STORAGE_KEY = "sifarah.profileBuffer.v2";
const MAX_ACCOUNTS = 8;
const TTL_MS = 5 * 60 * 1000;

export type ProfileBufferBundle = {
  profile: any;
  posts: any[];
  postsHasMore: boolean;
  listings: any[];
  listingsHasMore: boolean;
  reviews: any[];
  reels: any[];
  reelsHasMore: boolean;
  propertyItems: any[];
  propertiesHasMore: boolean;
  projectItems: any[];
  projectsHasMore: boolean;
  postsCount: number;
  portfolioCount: number;
  listingsCount: number;
  followers: any[];
  isBlockedProfile: boolean;
  isFollowing: boolean;
};

type BufferEntry = {
  aliases: string[];
  savedAt: number;
  accessedAt: number;
  bundle: ProfileBufferBundle;
};

type BufferFile = {
  entries: BufferEntry[];
};

const normalizeAlias = (value: string) => value.trim().replace(/^@/, "").toLowerCase();

const storage = () => {
  try {
    if (typeof localStorage !== "undefined") return localStorage;
  } catch {
    /* private mode */
  }
  try {
    if (typeof sessionStorage !== "undefined") return sessionStorage;
  } catch {
    /* ignore */
  }
  return null;
};

const readFile = (): BufferFile => {
  const store = storage();
  if (!store) return { entries: [] };
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return { entries: [] };
    const parsed = JSON.parse(raw) as BufferFile;
    return Array.isArray(parsed?.entries) ? parsed : { entries: [] };
  } catch {
    return { entries: [] };
  }
};

const writeFile = (file: BufferFile) => {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(file));
  } catch {
    try {
      store.setItem(STORAGE_KEY, JSON.stringify({ entries: file.entries.slice(0, Math.max(1, MAX_ACCOUNTS - 1)) }));
    } catch {
      store.removeItem(STORAGE_KEY);
    }
  }
};

const isFresh = (entry: BufferEntry, now: number) => now - entry.savedAt < TTL_MS;

const isValidBundle = (bundle: ProfileBufferBundle | null | undefined): bundle is ProfileBufferBundle =>
  Boolean(bundle?.profile && typeof bundle.profile === "object" && bundle.profile.id);

const aliasList = (aliases: Array<string | null | undefined>) =>
  [...new Set(aliases.filter(Boolean).map((alias) => normalizeAlias(String(alias))))];

export const profileRouteSlug = (id?: string | null) => {
  if (id) return decodeURIComponent(id).replace(/^@/, "").trim();
  if (typeof window === "undefined") return "";
  const match = window.location.pathname.match(/\/profile\/([^/?#]+)/i);
  return match ? decodeURIComponent(match[1]).replace(/^@/, "").trim() : "";
};

export const profileBuffer = {
  read(aliases: Array<string | null | undefined>): ProfileBufferBundle | null {
    const keys = aliasList(aliases);
    if (!keys.length) return null;
    const now = Date.now();
    const file = readFile();
    const match = file.entries.find(
      (entry) => isFresh(entry, now) && isValidBundle(entry.bundle) && entry.aliases.some((alias) => keys.includes(alias))
    );
    if (!match) {
      writeFile({
        entries: file.entries.filter((entry) => isFresh(entry, now) && isValidBundle(entry.bundle)),
      });
      return null;
    }
    match.accessedAt = now;
    writeFile(file);
    return match.bundle;
  },

  write(aliases: Array<string | null | undefined>, bundle: ProfileBufferBundle) {
    const now = Date.now();
    const keys = aliasList(aliases);
    if (!keys.length) return;
    const file = readFile();
    const nextEntries = file.entries.filter(
      (entry) => isFresh(entry, now) && !entry.aliases.some((alias) => keys.includes(alias))
    );
    nextEntries.push({
      aliases: keys,
      savedAt: now,
      accessedAt: now,
      bundle,
    });
    nextEntries.sort((a, b) => b.accessedAt - a.accessedAt);
    writeFile({ entries: nextEntries.slice(0, MAX_ACCOUNTS) });
  },

  invalidate(profileIdOrUsername: string) {
    const needle = normalizeAlias(profileIdOrUsername);
    const file = readFile();
    writeFile({
      entries: file.entries.filter((entry) => !entry.aliases.includes(needle)),
    });
  },
};
