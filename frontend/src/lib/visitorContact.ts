const CONTACT_STORAGE_KEY = "sifarah.inquiryContact";

export type VisitorContact = { name: string; phone: string; email: string };

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const readVisitorContact = (): VisitorContact => {
  try {
    const raw = localStorage.getItem(CONTACT_STORAGE_KEY);
    if (raw) return { name: "", phone: "", email: "", ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { name: "", phone: "", email: "" };
};

export const storeVisitorContact = (contact: VisitorContact) => {
  try {
    localStorage.setItem(
      CONTACT_STORAGE_KEY,
      JSON.stringify({ name: contact.name.trim(), phone: contact.phone.trim(), email: contact.email.trim() }),
    );
  } catch {
    /* ignore */
  }
};
