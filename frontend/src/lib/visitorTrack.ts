import { deleteCookie, getCookie, setCookie } from "@/lib/cookies";
import { supabase } from "@/lib/supabase";

export const VISITOR_ID_COOKIE = "sifarah_vid";
export const VISITOR_SESSION_COOKIE = "sifarah_sid";
export const VISITOR_CONTACT_COOKIE = "sifarah_vc";

export type AccountKind = "anon" | "visitor" | "member";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const COOKIE_DAYS = 400;
const SESSION_HOURS = 12;
const HIT_DEDUP_MS = 30_000;

type TrackIdentity = {
  accountKind: AccountKind;
  userId: string | null;
};

let identity: TrackIdentity = { accountKind: "anon", userId: null };
let currentHitId: string | null = null;
let currentPath = "";
let pathStartedAt = 0;
let lastHitKey = "";
let lastHitAt = 0;
let dwellFlushTimer: ReturnType<typeof setInterval> | null = null;

const newId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const setVisitorTrackIdentity = (next: TrackIdentity) => {
  identity = {
    accountKind: next.accountKind || "anon",
    userId: next.userId || null,
  };
};

/** Durable anonymous visitor id (first-party cookie). */
export const getOrCreateVisitorId = (): string => {
  const existing = getCookie(VISITOR_ID_COOKIE)?.trim() || "";
  if (UUID_RE.test(existing)) {
    setCookie(VISITOR_ID_COOKIE, existing, { maxAgeDays: COOKIE_DAYS });
    return existing;
  }
  const id = newId();
  setCookie(VISITOR_ID_COOKIE, id, { maxAgeDays: COOKIE_DAYS });
  return id;
};

export const getOrCreateSessionId = (): string => {
  const existing = getCookie(VISITOR_SESSION_COOKIE)?.trim() || "";
  if (UUID_RE.test(existing)) {
    setCookie(VISITOR_SESSION_COOKIE, existing, { maxAgeDays: SESSION_HOURS / 24 });
    return existing;
  }
  const id = newId();
  setCookie(VISITOR_SESSION_COOKIE, id, { maxAgeDays: SESSION_HOURS / 24 });
  return id;
};

export const readVisitorContactCookie = (): { name: string; phone: string; email: string } | null => {
  const raw = getCookie(VISITOR_CONTACT_COOKIE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { name?: string; phone?: string; email?: string };
    return {
      name: String(parsed.name || "").trim(),
      phone: String(parsed.phone || "").trim(),
      email: String(parsed.email || "").trim(),
    };
  } catch {
    return null;
  }
};

/** @deprecated PII must not live in cookies — cleared for migration only. */
export const writeVisitorContactCookie = (_contact: { name: string; phone: string; email: string }) => {
  deleteCookie(VISITOR_CONTACT_COOKIE);
};

export const clearVisitorContactCookie = () => {
  deleteCookie(VISITOR_CONTACT_COOKIE);
};

/** Strip query/hash so auth tokens never enter analytics. */
export const sanitizeAnalyticsPath = (path: string) => {
  const raw = (path || "/").trim() || "/";
  const noHash = raw.split("#")[0] || "/";
  const noQuery = noHash.split("?")[0] || "/";
  return noQuery.slice(0, 500) || "/";
};

export const sanitizeAnalyticsHref = (href?: string | null) => {
  const raw = (href || "").trim();
  if (!raw) return null;
  try {
    const u = new URL(raw, typeof window !== "undefined" ? window.location.origin : "https://local");
    return `${u.origin}${u.pathname}`.slice(0, 500);
  } catch {
    return sanitizeAnalyticsPath(raw);
  }
};

const flushDwell = async (force = false) => {
  if (!currentHitId || !pathStartedAt) return;
  const dwell = Date.now() - pathStartedAt;
  if (!force && dwell < 1500) return;
  try {
    await supabase.rpc("track_visitor_dwell", {
      p_hit_id: currentHitId,
      p_dwell_ms: Math.round(dwell),
      p_session_id: getOrCreateSessionId(),
    });
  } catch {
    /* ignore */
  }
};

/** Record a page view against the visitor cookie (rate-limited per path). */
export const trackVisitorPage = async (path: string) => {
  const clientKey = getOrCreateVisitorId();
  const sessionId = getOrCreateSessionId();
  const cleanPath = sanitizeAnalyticsPath(path);
  const now = Date.now();

  if (currentHitId && currentPath && currentPath !== cleanPath) {
    await flushDwell(true);
  }

  const key = `${clientKey}:${sessionId}:${cleanPath}`;
  if (key === lastHitKey && now - lastHitAt < HIT_DEDUP_MS) {
    currentPath = cleanPath;
    return;
  }
  lastHitKey = key;
  lastHitAt = now;
  currentPath = cleanPath;
  pathStartedAt = now;

  try {
    const { data } =     await supabase.rpc("track_visitor_hit", {
      p_client_key: clientKey,
      p_path: cleanPath,
      p_referrer:
        typeof document !== "undefined" ? sanitizeAnalyticsHref(document.referrer) : null,
      p_session_id: sessionId,
      p_account_kind: identity.accountKind,
      p_user_id: identity.userId,
    });
    currentHitId = typeof data === "string" ? data : null;
  } catch {
    currentHitId = null;
  }
};

export const trackVisitorClick = async (detail: {
  label?: string | null;
  href?: string | null;
  targetTag?: string | null;
}) => {
  try {
    await supabase.rpc("track_visitor_click", {
      p_client_key: getOrCreateVisitorId(),
      p_path: currentPath || (typeof window !== "undefined" ? window.location.pathname : "/"),
      p_label: (detail.label || "").slice(0, 200) || null,
      p_href: sanitizeAnalyticsHref(detail.href),
      p_target_tag: (detail.targetTag || "").slice(0, 40) || null,
      p_session_id: getOrCreateSessionId(),
    });
  } catch {
    /* ignore */
  }
};

export const startVisitorDwellHeartbeat = () => {
  if (dwellFlushTimer || typeof window === "undefined") return;
  dwellFlushTimer = setInterval(() => {
    if (document.visibilityState === "visible") void flushDwell();
  }, 15000);

  const onHide = () => {
    void flushDwell(true);
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") onHide();
  });
  window.addEventListener("pagehide", onHide);
};

const clickLabel = (el: HTMLElement) => {
  const text = (el.innerText || el.getAttribute("aria-label") || el.getAttribute("title") || "")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 120) || null;
};

export const startVisitorClickCapture = () => {
  if (typeof document === "undefined") return;
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const actionable = target.closest("a,button,[role='button'],summary") as HTMLElement | null;
      if (!actionable) return;
      const href =
        actionable instanceof HTMLAnchorElement
          ? actionable.href
          : actionable.getAttribute("href") || actionable.getAttribute("data-href");
      void trackVisitorClick({
        label: clickLabel(actionable),
        href,
        targetTag: actionable.tagName.toLowerCase(),
      });
    },
    true,
  );
};
