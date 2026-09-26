const STORAGE_KEY = "sifarah.feedCity";

export function getStoredFeedCity(): string {
  try {
    return (localStorage.getItem(STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

export function setStoredFeedCity(city: string) {
  try {
    localStorage.setItem(STORAGE_KEY, city.trim());
  } catch {
    /* ignore */
  }
}

export async function detectCityFromIp(): Promise<string> {
  try {
    const response = await fetch("https://ipwho.is/");
    if (!response.ok) return "";
    const data = (await response.json()) as { success?: boolean; city?: string };
    if (data.success === false) return "";
    return (data.city || "").trim();
  } catch {
    return "";
  }
}

export function cityFromProfileLocation(location?: string | null) {
  const first = (location || "").split(/\n|,/)[0]?.trim() || "";
  return first;
}
