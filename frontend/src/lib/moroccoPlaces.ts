import places from "../../../cities_and_regions.json";

type Named = { ar?: string; en?: string; fr?: string };
type RegionRow = { id: number; names: Named };
type CityRow = { region_id: number; names: Named };

const labelOf = (names?: Named) => (names?.fr || names?.en || names?.ar || "").trim();

const regionRows = ((places as { regions?: { data?: RegionRow[] } }).regions?.data || []) as RegionRow[];
const cityRows = ((places as { cities?: { data?: CityRow[] } }).cities?.data || []) as CityRow[];

export const MOROCCO_REGION_CITIES: { id: number; region: string; cities: string[] }[] = regionRows.map((region) => ({
  id: region.id,
  region: labelOf(region.names),
  cities: cityRows
    .filter((city) => city.region_id === region.id)
    .map((city) => labelOf(city.names))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "fr")),
}));

export const MOROCCO_REGIONS = MOROCCO_REGION_CITIES.map((item) => item.region);

export const allMoroccoCities = () =>
  [...new Set(MOROCCO_REGION_CITIES.flatMap((item) => item.cities))].sort((a, b) => a.localeCompare(b, "fr"));

export const citiesForRegion = (region?: string | null) => {
  if (!region) return allMoroccoCities();
  return MOROCCO_REGION_CITIES.find((item) => item.region === region)?.cities || [];
};

const CITY_ALIASES = new Map<string, string>();
for (const city of cityRows) {
  const french = labelOf(city.names);
  if (!french) continue;
  for (const alias of [city.names.fr, city.names.en, city.names.ar]) {
    const key = (alias || "").trim().toLowerCase();
    if (key) CITY_ALIASES.set(key, french);
  }
}

export const matchMoroccoCity = (raw?: string | null) => {
  const value = (raw || "").trim();
  if (!value) return "";
  return CITY_ALIASES.get(value.toLowerCase()) || "";
};
