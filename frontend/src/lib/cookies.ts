/** First-party cookie helpers (readable by JS; not HttpOnly). */

const isSecureOrigin = () =>
  typeof window !== "undefined" && window.location.protocol === "https:";

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const prefix = `${encodeURIComponent(name)}=`;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      try {
        return decodeURIComponent(trimmed.slice(prefix.length));
      } catch {
        return trimmed.slice(prefix.length);
      }
    }
  }
  return null;
};

export const setCookie = (
  name: string,
  value: string,
  options?: { maxAgeDays?: number; path?: string },
) => {
  if (typeof document === "undefined") return;
  const maxAgeDays = options?.maxAgeDays ?? 400;
  const path = options?.path ?? "/";
  const maxAge = Math.max(1, Math.round(maxAgeDays * 24 * 60 * 60));
  const secure = isSecureOrigin() ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=${path}; Max-Age=${maxAge}; SameSite=Lax${secure}`;
};

export const deleteCookie = (name: string, path = "/") => {
  if (typeof document === "undefined") return;
  const secure = isSecureOrigin() ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=; Path=${path}; Max-Age=0; SameSite=Lax${secure}`;
};
