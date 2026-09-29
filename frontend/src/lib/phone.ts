import countryCodesCsv from "../../../country_codes_data.csv?raw";

export type PhoneCountry = {
  iso: string;
  name: string;
  dial: string;
  displayDial: string;
  flag: string;
  min: number;
  max: number;
};

const DEFAULT_ISO = "MA";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const flagFromIso = (iso: string) =>
  iso
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 2)
    .split("")
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");

const parseCountryCodes = (csv: string): PhoneCountry[] => {
  const rows = csv
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean);

  const countries = rows.map((line) => {
    const [name, dialCode, iso, lengthRaw] = line.split(",").map((part) => part.trim());
    const displayDial = dialCode.replace(/^\+/, "");
    const area = displayDial.includes("-") ? digitsOnly(displayDial.split("-").slice(1).join("-")) : "";
    const listed = Math.max(1, Number.parseInt(lengthRaw, 10) || 8);
    const national = Math.max(1, listed - area.length);
    return {
      iso,
      name,
      dial: digitsOnly(displayDial),
      displayDial,
      flag: flagFromIso(iso),
      min: national,
      max: national,
    };
  });

  return countries.sort((a, b) => {
    if (a.iso === DEFAULT_ISO) return -1;
    if (b.iso === DEFAULT_ISO) return 1;
    return a.name.localeCompare(b.name, "fr");
  });
};

export const PHONE_COUNTRIES = parseCountryCodes(countryCodesCsv);

export const countryByIso = (iso: string) =>
  PHONE_COUNTRIES.find((country) => country.iso === iso) || PHONE_COUNTRIES.find((country) => country.iso === DEFAULT_ISO) || PHONE_COUNTRIES[0];

const DIAL_SORTED = [...PHONE_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);

export const parseStoredPhone = (raw?: string | null, preferredIso?: string): { iso: string; national: string } => {
  const digits = digitsOnly(raw || "");
  if (!digits) return { iso: preferredIso || DEFAULT_ISO, national: "" };

  const preferred = preferredIso ? countryByIso(preferredIso) : null;
  if (preferred && (digits.startsWith(preferred.dial) || digits.startsWith(`00${preferred.dial}`))) {
    const prefix = digits.startsWith("00") ? preferred.dial.length + 2 : preferred.dial.length;
    return { iso: preferred.iso, national: digits.slice(prefix).slice(0, preferred.max) };
  }

  for (const country of DIAL_SORTED) {
    if (digits.startsWith(country.dial)) {
      return { iso: country.iso, national: digits.slice(country.dial.length).slice(0, country.max) };
    }
    if (digits.startsWith(`00${country.dial}`)) {
      return { iso: country.iso, national: digits.slice(country.dial.length + 2).slice(0, country.max) };
    }
  }

  if (digits.startsWith("0")) {
    const morocco = countryByIso(DEFAULT_ISO);
    return { iso: DEFAULT_ISO, national: digits.slice(1).slice(0, morocco.max) };
  }

  const morocco = countryByIso(DEFAULT_ISO);
  return { iso: DEFAULT_ISO, national: digits.slice(0, morocco.max) };
};

export const composePhone = (iso: string, national: string) => {
  const country = countryByIso(iso);
  let local = digitsOnly(national);
  if (local.startsWith("0")) local = local.slice(1);
  local = local.slice(0, country.max);
  return local ? `+${country.dial}${local}` : "";
};

export const isCompletePhone = (raw?: string | null) => {
  const { iso, national } = parseStoredPhone(raw);
  const country = countryByIso(iso);
  return national.length >= country.min && national.length <= country.max;
};
