import defaultProAvatar from "@/assets/default-pro-avatar.jpg";

/** Bundled Sifarah PRO default (hard-hat avatar) — always works in the SPA. */
export const DEFAULT_PRO_AVATAR = defaultProAvatar;

/**
 * Public Storage URL for the same asset (DB / emails / external clients).
 * Keep in sync with `images/avatars/default-pro.jpg` in the `images` bucket.
 */
export const DEFAULT_PRO_AVATAR_STORAGE_URL =
  `${import.meta.env.VITE_SUPABASE_URL || "https://auusinntfgmoneqhjcbe.supabase.co"}/storage/v1/object/public/images/avatars/default-pro.jpg`.replace(
    /([^:]\/)\/+/g,
    "$1",
  );

/** Public path served from `frontend/public` (local / CDN fallback). */
export const DEFAULT_PRO_AVATAR_PUBLIC_PATH = "/avatars/default-pro.jpg";

/**
 * Default profile photo when none is set (Sifarah PRO hard-hat mark).
 */
export const getDefaultAvatar = (_profileType?: string) => DEFAULT_PRO_AVATAR;

/** True when avatar_url is missing or already pointing at our default asset. */
export const isMissingAvatarUrl = (url?: string | null) => {
  const value = (url || "").trim();
  if (!value) return true;
  return (
    value.includes("/avatars/default-pro.jpg") ||
    value.includes("default-pro-avatar") ||
    value.endsWith("default.jpeg") ||
    value.includes("kerix-net-logo") ||
    value.includes("kerix.net/images/kerix") ||
    value.includes("woomar-footer") ||
    value.includes("yelo.ma/img/logos/woomar") ||
    value.includes("lechantier.ma/logo") ||
    value.includes("goafricaonline.com")
  );
};

/** Substrings that mean the URL is a default or an initials SVG, not a company logo. */
export const NON_REAL_LOGO_FRAGMENTS = [
  "/monograms/",
  "/notaires/",
  "/avatars/default-pro",
  "default-pro-avatar",
  "default.jpeg",
  "kerix-net-logo",
  "kerix.net/images/kerix",
  "woomar-footer",
  "yelo.ma/img/logos/woomar",
  "lechantier.ma/logo",
  "goafricaonline.com",
];

/** Initials SVG placeholders (/monograms or /notaires) — not a real uploaded logo. */
export const isMonogramAvatarUrl = (url?: string | null) => {
  const value = (url || "").trim().toLowerCase();
  if (!value || isMissingAvatarUrl(value)) return false;
  return value.includes("/monograms/") || value.includes("/notaires/");
};

/** Real photo/logo (excludes defaults and monogram SVGs). */
export const hasRealLogoUrl = (url?: string | null) =>
  Boolean((url || "").trim()) && !isMissingAvatarUrl(url) && !isMonogramAvatarUrl(url);

/** Fix scraped URLs that embedded the host twice with escaped slashes. */
export const sanitizeRemoteImageUrl = (url?: string | null) => {
  let value = (url || "").trim();
  if (!value) return value;
  // e.g. https://acmatec.ma/\/\/acmatec.ma\/wp-content\/... → drop
  if (/Logo-acmatec\.png/i.test(value) || /acmatec\.ma[/\\]+acmatec\.ma/i.test(value)) {
    return "https://simc-maroc.com/contents/exhibitors/pictures/2025/large/qfOh0VApxIdaQT7Zi7jY4fbrfqkqzTsrXPVCNx8a.jpg";
  }
  if (value.includes("\\/")) value = value.replace(/\\\//g, "/");
  value = value.replace(/([^:]\/)\/+/g, "$1");
  return value;
};

/**
 * Display URL for a profile photo: real upload when set, otherwise the bundled default.
 * Prefer this over raw `avatar_url` in lists (Discover, feed, etc.).
 */
export const resolveAvatarUrl = (url?: string | null, profileType?: string) => {
  const value = sanitizeRemoteImageUrl(url);
  if (!value || isMissingAvatarUrl(value)) return getDefaultAvatar(profileType);
  return value;
};
