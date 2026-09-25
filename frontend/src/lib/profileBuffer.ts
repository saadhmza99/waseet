const STORAGE_KEY = "sifarah.profileBuffer.v1";
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

const viewerScope = (viewerId?: string | null) => (viewerId ? `u:${viewerId}` : "anon");

const aliasKey = (viewerId: string | null | undefined, alias: string) =>
  `${viewerScope(viewerId)}|${normalizeAlias(alias)}`;

const readFile = (): BufferFile => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [] };
    const parsed = JSON.parse(raw) as BufferFile;
    return Array.isArray(parsed?.entries) ? parsed : { entries: [] };
  } catch {
    return { entries: [] };
  }
};

const writeFile = (file: BufferFile) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(file));
  } catch {
    try {
      const trimmed = { entries: file.entries.slice(0, Math.max(1, MAX_ACCOUNTS - 1)) };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }
};

const isFresh = (entry: BufferEntry, now: number) => now - entry.savedAt < TTL_MS;

export const profileBuffer = {
  read(aliases: Array<string | null | undefined>, viewerId?: string | null): ProfileBufferBundle | null {
    const scoped = [...new Set(aliases.filter(Boolean).map((alias) => aliasKey(viewerId, String(alias))))];
    if (!scoped.length) return null;
    const now = Date.now();
    const file = readFile();
    const match = file.entries.find(
      (entry) => isFresh(entry, now) && entry.aliases.some((alias) => scoped.includes(alias))
    );
    if (!match) {
      writeFile({ entries: file.entries.filter((entry) => isFresh(entry, now)) });
      return null;
    }
    match.accessedAt = now;
    writeFile(file);
    return match.bundle;
  },

  write(
    aliases: Array<string | null | undefined>,
    viewerId: string | null | undefined,
    bundle: ProfileBufferBundle
  ) {
    const now = Date.now();
    const scoped = [...new Set(aliases.filter(Boolean).map((alias) => aliasKey(viewerId, String(alias))))];
    if (!scoped.length) return;
    const file = readFile();
    const nextEntries = file.entries.filter(
      (entry) => isFresh(entry, now) && !entry.aliases.some((alias) => scoped.includes(alias))
    );
    nextEntries.push({
      aliases: scoped,
      savedAt: now,
      accessedAt: now,
      bundle,
    });
    nextEntries.sort((a, b) => b.accessedAt - a.accessedAt);
    writeFile({ entries: nextEntries.slice(0, MAX_ACCOUNTS) });
  },

  invalidate(profileIdOrUsername: string, viewerId?: string | null) {
    const needle = normalizeAlias(profileIdOrUsername);
    const file = readFile();
    writeFile({
      entries: file.entries.filter((entry) => {
        const matchesPerson = entry.aliases.some((alias) => (alias.split("|").pop() || "") === needle);
        if (!matchesPerson) return true;
        if (!viewerId) return false;
        return !entry.aliases.some((alias) => alias.startsWith(`${viewerScope(viewerId)}|`));
      }),
    });
  },
};
