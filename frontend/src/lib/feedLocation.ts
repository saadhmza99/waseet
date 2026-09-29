import { matchMoroccoCity } from "@/lib/moroccoPlaces";

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
    const detected = (data.city || "").trim();
    return matchMoroccoCity(detected) || detected;
  } catch {
    return "";
  }
}

export function cityFromProfileLocation(location?: string | null) {
  const first = (location || "").split(/\n|,/)[0]?.trim() || "";
  return first;
}

export function cityFromPostDetails(details?: Record<string, unknown> | null) {
  const city = details && typeof details.city === "string" ? details.city.trim() : "";
  return city;
}

export function cityFromPost(post?: {
  city?: string | null;
  property_details?: Record<string, unknown> | null;
} | null) {
  const direct = (post?.city || "").trim();
  return direct || cityFromPostDetails(post?.property_details);
}
