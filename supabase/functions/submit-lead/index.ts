/**
 * IP + geo rate-limited lead submissions (devis / contact / partner).
 * Cloudflare (or any proxy) should forward CF-Connecting-IP / CF-IPCountry when available.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

type Action = "devis" | "contact" | "partner";

type Limits = { ipLimit: number; countryLimit: number; windowSeconds: number };

const LIMITS: Record<Action, Limits> = {
  devis: { ipLimit: 8, countryLimit: 120, windowSeconds: 3600 },
  contact: { ipLimit: 5, countryLimit: 80, windowSeconds: 3600 },
  partner: { ipLimit: 3, countryLimit: 40, windowSeconds: 3600 },
};

/** Hot-path memory cache per isolate (backs the DB bucket). */
const mem = new Map<string, { count: number; resetAt: number }>();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const clientIp = (req: Request) => {
  const cf = req.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const xff = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (xff) return xff;
  return "unknown";
};

const clientCountry = (req: Request) => {
  const cf = req.headers.get("cf-ipcountry")?.trim().toUpperCase();
  if (cf && cf !== "XX" && cf !== "T1") return cf.slice(0, 8);
  const xr = req.headers.get("x-vercel-ip-country")?.trim().toUpperCase();
  if (xr) return xr.slice(0, 8);
  return null;
};

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function memAllow(key: string, limit: number, windowSeconds: number) {
  const now = Date.now();
  const row = mem.get(key);
  if (!row || row.resetAt <= now) {
    mem.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfter: windowSeconds };
  }
  row.count += 1;
  if (row.count > limit) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((row.resetAt - now) / 1000)) };
  }
  return { allowed: true, retryAfter: Math.max(1, Math.ceil((row.resetAt - now) / 1000)) };
}

async function enforceRate(
  admin: ReturnType<typeof createClient>,
  action: Action,
  ip: string,
  country: string | null,
) {
  const limits = LIMITS[action];
  const ipHash = await sha256Hex(`ip:${ip}`);
  const ipKey = `${action}:ip:${ipHash}`;
  const countryKey = country ? `${action}:cc:${country}` : null;

  const memIp = memAllow(ipKey, limits.ipLimit, limits.windowSeconds);
  if (!memIp.allowed) {
    return { ok: false as const, retryAfter: memIp.retryAfter, reason: "ip_memory" };
  }
  if (countryKey) {
    const memCc = memAllow(countryKey, limits.countryLimit, limits.windowSeconds);
    if (!memCc.allowed) {
      return { ok: false as const, retryAfter: memCc.retryAfter, reason: "geo_memory" };
    }
  }

  const { data: ipRes, error: ipErr } = await admin.rpc("consume_rate_limit", {
    p_bucket_key: ipKey,
    p_limit: limits.ipLimit,
    p_window_seconds: limits.windowSeconds,
    p_country: country,
  });
  if (ipErr) throw ipErr;
  if (ipRes && ipRes.allowed === false) {
    return {
      ok: false as const,
      retryAfter: Number(ipRes.retry_after_seconds) || limits.windowSeconds,
      reason: "ip",
    };
  }

  if (countryKey) {
    const { data: ccRes, error: ccErr } = await admin.rpc("consume_rate_limit", {
      p_bucket_key: countryKey,
      p_limit: limits.countryLimit,
      p_window_seconds: limits.windowSeconds,
      p_country: country,
    });
    if (ccErr) throw ccErr;
    if (ccRes && ccRes.allowed === false) {
      return {
        ok: false as const,
        retryAfter: Number(ccRes.retry_after_seconds) || limits.windowSeconds,
        reason: "geo",
      };
    }
  }

  return { ok: true as const };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    if (!supabaseUrl || !serviceKey) {
      return json({ error: "Server misconfigured" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Optional user JWT — used to stamp requester/user_id when present.
    const authHeader = req.headers.get("Authorization") || "";
    let userId: string | null = null;
    if (authHeader.toLowerCase().startsWith("bearer ") && anonKey) {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data } = await userClient.auth.getUser();
      userId = data.user?.id ?? null;
    }

    const body = (await req.json().catch(() => null)) as {
      action?: string;
      payload?: Record<string, unknown>;
    } | null;
    const action = (body?.action || "") as Action;
    const payload = body?.payload || {};
    if (!["devis", "contact", "partner"].includes(action)) {
      return json({ error: "Unsupported action" }, 400);
    }

    const ip = clientIp(req);
    const country = clientCountry(req);
    const rate = await enforceRate(admin, action, ip, country);
    if (!rate.ok) {
      return json(
        {
          error: "RATE_LIMIT",
          reason: rate.reason,
          retryAfterSeconds: rate.retryAfter,
          message: "Trop de demandes. Réessayez plus tard.",
        },
        429,
      );
    }

    if (action === "devis") {
      const projectTypeId = String(payload.projectTypeId || "").trim();
      const projectTypeLabel = String(payload.projectTypeLabel || "").trim();
      const city = String(payload.city || "").trim();
      const name = String(payload.name || "").trim();
      const phone = String(payload.phone || "").trim();
      if (!projectTypeId || !projectTypeLabel || !city || !name || !phone) {
        return json({ error: "Missing required devis fields" }, 400);
      }
      const { data, error } = await admin
        .from("devis_requests")
        .insert({
          project_type_id: projectTypeId.slice(0, 80),
          project_type_label: projectTypeLabel.slice(0, 160),
          city: city.slice(0, 120),
          budget: String(payload.budget || "").trim().slice(0, 80) || null,
          description: String(payload.description || "").trim().slice(0, 4000) || null,
          name: name.slice(0, 120),
          phone: phone.slice(0, 40),
          email: String(payload.email || "").trim().slice(0, 180) || null,
          whatsapp: payload.whatsapp !== false,
          extras: typeof payload.extras === "object" && payload.extras ? payload.extras : {},
          seller_id: (payload.sellerId as string) || null,
          seller_name: String(payload.sellerName || "").trim().slice(0, 160) || null,
          service_id: (payload.serviceId as string) || null,
          product_id: (payload.productId as string) || null,
          source: ["open", "profile", "service", "product"].includes(String(payload.source))
            ? payload.source
            : "open",
          source_path: String(payload.sourcePath || "").trim().slice(0, 500) || null,
          source_label: String(payload.sourceLabel || "").trim().slice(0, 120) || null,
          requester_id: userId,
        })
        .select("id")
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({ success: true, id: data.id, country });
    }

    if (action === "contact") {
      const topic = String(payload.topic || "").trim();
      const name = String(payload.name || "").trim();
      const email = String(payload.email || "").trim();
      const message = String(payload.message || "").trim();
      if (!["partnership", "sponsorship", "visibility", "problem"].includes(topic)) {
        return json({ error: "Invalid topic" }, 400);
      }
      if (name.length < 2 || !email.includes("@") || message.length < 8) {
        return json({ error: "Invalid contact fields" }, 400);
      }
      const { data, error } = await admin
        .from("contact_messages")
        .insert({
          topic,
          name: name.slice(0, 120),
          email: email.slice(0, 180),
          phone: String(payload.phone || "").trim().slice(0, 40) || null,
          organization: String(payload.organization || "").trim().slice(0, 160) || null,
          message: message.slice(0, 4000),
          page_url: String(payload.pageUrl || "").trim().slice(0, 500) || null,
          user_id: userId,
        })
        .select("id")
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({ success: true, id: data.id, country });
    }

    // partner
    const enterpriseName = String(payload.enterpriseName || "").trim();
    const professionalName = String(payload.professionalName || "").trim();
    const phone = String(payload.phone || "").trim();
    const email = String(payload.email || "").trim();
    const location = String(payload.location || "").trim();
    if (!enterpriseName || !professionalName || !phone || !email.includes("@") || !location) {
      return json({ error: "Invalid partner fields" }, 400);
    }
    const { data, error } = await admin
      .from("partner_requests")
      .insert({
        enterprise_name: enterpriseName.slice(0, 160),
        professional_name: professionalName.slice(0, 160),
        phone: phone.slice(0, 40),
        email: email.slice(0, 180),
        website: String(payload.website || "").trim().slice(0, 300) || null,
        location: location.slice(0, 160),
      })
      .select("id")
      .single();
    if (error) return json({ error: error.message }, 400);
    return json({ success: true, id: data.id, country });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return json({ error: message }, 500);
  }
});
