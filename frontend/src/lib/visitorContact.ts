import { clearVisitorContactCookie, readVisitorContactCookie } from "@/lib/visitorTrack";

const CONTACT_STORAGE_KEY = "sifarah.inquiryContact";

export type VisitorContact = { name: string; phone: string; email: string };

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const fromStorage = (): VisitorContact | null => {
  try {
    const raw = localStorage.getItem(CONTACT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<VisitorContact>;
    return {
      name: String(parsed.name || "").trim(),
      phone: String(parsed.phone || "").trim(),
      email: String(parsed.email || "").trim(),
    };
  } catch {
    return null;
  }
};

export const readVisitorContact = (): VisitorContact => {
  const fromLs = fromStorage();
  if (fromLs && (fromLs.name || fromLs.phone || fromLs.email)) return fromLs;

  // One-time migrate from legacy cookie, then delete it (PII must not stay in cookies).
  const fromCookie = readVisitorContactCookie();
  if (fromCookie && (fromCookie.name || fromCookie.phone || fromCookie.email)) {
    try {
      localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(fromCookie));
    } catch {
      /* ignore */
    }
    clearVisitorContactCookie();
    return fromCookie;
  }
  return { name: "", phone: "", email: "" };
};

export const storeVisitorContact = (contact: VisitorContact) => {
  const next = {
    name: contact.name.trim(),
    phone: contact.phone.trim(),
    email: contact.email.trim(),
  };
  try {
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  clearVisitorContactCookie();
};
