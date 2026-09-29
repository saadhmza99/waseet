import { supabase } from "@/lib/supabase";

export type MapPoint = { lat: number; lng: number };

type ExpandMapLinkResult = { lat?: number; lng?: number; error?: string };

export const resolveShortMapLink = async (url: string): Promise<MapPoint | null> => {
  const { data, error } = await supabase.functions.invoke<ExpandMapLinkResult>("expand-map-link", {
    body: { url },
  });
  if (error || !data) return null;
  const lat = Number(data.lat);
  const lng = Number(data.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
};

const pair = (latRaw: string, lngRaw: string): MapPoint | null => {
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
};

const decodeLink = (value: string) => {
  let text = value.trim();
  for (let i = 0; i < 2; i += 1) {
    try {
      const next = decodeURIComponent(text);
      if (next === text) break;
      text = next;
    } catch {
      break;
    }
  }
  return text.replace(/\+/g, " ");
};

export const isShortMapsLink = (value: string) => {
  const match = value.trim().match(/^https?:\/\/([^/?#]+)/i);
  if (!match) return false;
  const host = match[1].replace(/^www\./, "").toLowerCase();
  return host === "maps.app.goo.gl" || host === "goo.gl" || host === "g.co" || host.endsWith(".app.goo.gl");
};

export const parseMapLink = (input: string): MapPoint | null => {
  const text = input.trim();
  if (!text) return null;
  const decoded = decodeLink(text);

  const precise = [...decoded.matchAll(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/g)];
  if (precise.length > 0) {
    const last = precise[precise.length - 1];
    const point = pair(last[1], last[2]);
    if (point) return point;
  }

  const at = decoded.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)(?:[,/]|$)/);
  if (at) {
    const point = pair(at[1], at[2]);
    if (point) return point;
  }

  const param = decoded.match(
    /(?:[?&](?:q|query|ll|sll|center|destination)=|loc:)(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i
  );
  if (param) {
    const point = pair(param[1], param[2]);
    if (point) return point;
  }

  const path = decoded.match(/\/(?:place|search)\/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i);
  if (path) {
    const point = pair(path[1], path[2]);
    if (point) return point;
  }

  const osm = decoded.match(/mlat=(-?\d+(?:\.\d+)?)&mlon=(-?\d+(?:\.\d+)?)/i);
  if (osm) {
    const point = pair(osm[1], osm[2]);
    if (point) return point;
  }

  const hash = decoded.match(/#map=\d+\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/);
  if (hash) {
    const point = pair(hash[1], hash[2]);
    if (point) return point;
  }

  if (!/^https?:/i.test(text)) {
    const bare = text.match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (bare) return pair(bare[1], bare[2]);
  }

  return null;
};

export const mapLinkPlaceQuery = (input: string): string | null => {
  const decoded = decodeLink(input);
  const match = decoded.match(/[?&](?:q|query)=([^&]+)/i);
  if (!match) return null;
  const value = match[1].trim();
  if (!value || /^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/.test(value)) return null;
  return value;
};
