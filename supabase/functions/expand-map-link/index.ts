declare const Deno: {
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

type MapPoint = { lat: number; lng: number };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

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

const parseCoordinates = (input: string): MapPoint | null => {
  const decoded = decodeLink(input);
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
    /(?:[?&](?:q|query|ll|sll|center|destination)=|loc:)(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i,
  );
  if (param) {
    const point = pair(param[1], param[2]);
    if (point) return point;
  }

  const path = decoded.match(/\/(?:place|search)\/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i);
  if (path) return pair(path[1], path[2]);
  return null;
};

const allowedShortLink = (raw: string): URL | null => {
  if (raw.length > 2048) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password) return null;
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const allowed = host === "maps.app.goo.gl" || host === "goo.gl" || host === "g.co" ||
    host.endsWith(".app.goo.gl");
  return allowed ? url : null;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json().catch(() => null) as { url?: unknown } | null;
    const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
    const shortUrl = allowedShortLink(rawUrl);
    if (!shortUrl) {
      return json({ error: "Only https short Google Maps links are accepted" }, 400);
    }

    const response = await fetch(shortUrl, {
      method: "GET",
      redirect: "manual",
      headers: {
        Accept: "text/html",
        "User-Agent": "SifarahMapLink/1.0",
      },
    });
    const location = response.headers.get("location");
    if (!location) {
      return json({ error: "Short link did not return a location" }, 422);
    }

    const expanded = new URL(location, shortUrl).toString();
    const point = parseCoordinates(expanded);
    if (!point) {
      return json({ error: "Location header has no coordinates" }, 422);
    }

    return json(point);
  } catch {
    return json({ error: "Could not expand the short link" }, 502);
  }
});
