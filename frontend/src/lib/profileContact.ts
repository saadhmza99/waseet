const norm = (value?: string | null) => (value || "").trim().toLocaleLowerCase("fr");

/** Press, federations, public bodies, orders, observatories. No quote or contact button. */
const INSTITUTION_PROFESSIONS = new Set([
  "presse",
  "ordre",
  "organisme public",
  "fédération",
  "observatoire",
  "administration",
]);

export const isPromotionImmobiliere = (profession?: string | null) =>
  norm(profession) === "promotion immobilière";

export const isInstitutionProfession = (profession?: string | null) =>
  INSTITUTION_PROFESSIONS.has(norm(profession));

export const compactPhone = (phone?: string | null) => (phone || "").replace(/[\s().-]/g, "");

/** Moroccan landline: 05… or +2125… (includes +21252, +21253, and the rest of the 5-series). */
export const isLandlinePhone = (phone?: string | null) => {
  const value = compactPhone(phone);
  return value.startsWith("05") || value.startsWith("+2125") || value.startsWith("2125");
};

/** Mobile numbers that can receive WhatsApp. Landlines never do. */
export const isWhatsAppPhone = (phone?: string | null) => {
  const value = compactPhone(phone);
  if (!value || isLandlinePhone(value)) return false;
  return /^(06|07|\+2126|\+2127|2126|2127)/.test(value);
};

/** A real contact email. Seed logins are not a way to reach the professional. */
export const hasReachableEmail = (email?: string | null) => {
  const value = (email || "").trim().toLowerCase();
  if (!value.includes("@")) return false;
  return !value.endsWith("@sifarah.local") && !value.endsWith("@sifarah.com.local");
};

/**
 * Confirmation after a quote request to a BTP professional who is not a property developer.
 * Property developers never use this form.
 */
export const quoteOutcomeCopy = (input: { hasEmail?: boolean; email?: string | null; phone?: string | null }) => {
  const hasEmail = input.hasEmail ?? hasReachableEmail(input.email);
  const phone = compactPhone(input.phone);
  const landline = isLandlinePhone(phone);
  const whatsapp = isWhatsAppPhone(phone);

  if (!hasEmail && whatsapp) return "Votre demande a été envoyée sur WhatsApp.";
  if (landline && hasEmail) {
    return "Ce compte n'a pas WhatsApp. Un email a été envoyé. Vous pouvez les appeler avec le bouton Appel sur leur profil.";
  }
  if (landline) {
    return "Ce compte n'a pas WhatsApp. Vous pouvez les appeler avec le bouton Appel sur leur profil.";
  }
  if (hasEmail && phone) {
    return "Votre demande a été envoyée sur leur email et leur téléphone. Restez en attente d'une réponse sur les deux canaux.";
  }
  if (hasEmail) return "Un email a été envoyé. Restez en attente de leur réponse.";
  if (phone) return "Votre demande a été envoyée sur leur téléphone. Restez en attente de leur réponse.";
  return "Votre demande est enregistrée.";
};
