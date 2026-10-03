const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Plain text for storage and display. Markup is removed; length is capped. */
export const plainText = (value: unknown, max: number) =>
  String(value ?? "")
    .replace(CONTROL, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, max);

/** http(s) address only. javascript:, data:, and credentialed URLs are dropped. */
export const safeHttpUrl = (value: unknown, max = 2000) => {
  const raw = plainText(value, max);
  if (!raw) return "";
  if (/^(javascript|data|vbscript|file):/i.test(raw)) return "";
  const withScheme = /^https?:\/\//i.test(raw) ? raw : /^[\w.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(raw) ? `https://${raw}` : "";
  if (!withScheme) return "";
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    if (url.username || url.password) return "";
    return url.toString().slice(0, max);
  } catch {
    return "";
  }
};
