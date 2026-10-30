export type SignupGeo = {
  ip: string | null;
  country: string | null;
  countryCode: string | null;
};

/** ISO codes: United States, Canada, United Kingdom, Spain. */
const ENGLISH_IP_COUNTRIES = new Set(["US", "CA", "GB", "ES"]);

export const prefersEnglishFromCountry = (countryCode?: string | null) =>
  ENGLISH_IP_COUNTRIES.has((countryCode || "").trim().toUpperCase());

export async function lookupSignupGeo(): Promise<SignupGeo> {
  try {
    const response = await fetch("https://ipwho.is/");
    if (!response.ok) return { ip: null, country: null, countryCode: null };
    const data = (await response.json()) as {
      success?: boolean;
      ip?: string;
      country?: string;
      country_code?: string;
    };
    if (data.success === false) return { ip: null, country: null, countryCode: null };
    return {
      ip: data.ip?.trim() || null,
      country: data.country?.trim() || null,
      countryCode: data.country_code?.trim().toUpperCase() || null,
    };
  } catch {
    return { ip: null, country: null, countryCode: null };
  }
}
