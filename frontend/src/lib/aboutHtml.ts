const ALLOWED_TAGS = new Set([
  "P",
  "BR",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "S",
  "SPAN",
  "IMG",
  "H1",
  "H2",
  "H3",
  "UL",
  "OL",
  "LI",
  "DIV",
  "A",
]);

const escapeText = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const aboutHtmlIsEmpty = (html?: string | null) => {
  const raw = html || "";
  if (/<img\s/i.test(raw)) return false;
  const text = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return !text;
};

export const toAboutHtml = (value?: string | null) => {
  const raw = (value || "").trim();
  if (!raw) return "";
  if (/<[a-z][\s\S]*>/i.test(raw)) return raw;
  return raw
    .split("\n")
    .map((line) => `<p>${escapeText(line) || "<br>"}</p>`)
    .join("");
};

export const sanitizeAboutHtml = (html?: string | null) => {
  if (typeof window === "undefined" || !html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");

  const clean = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.parentNode?.removeChild(child);
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const el = child as HTMLElement;
      if (!ALLOWED_TAGS.has(el.tagName)) {
        const parent = el.parentNode;
        while (el.firstChild) parent?.insertBefore(el.firstChild, el);
        parent?.removeChild(el);
        return;
      }
      [...el.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (el.tagName === "IMG") {
          if (name === "src" && /^https?:\/\//i.test(attr.value)) return;
          if (name === "alt" || name === "width" || name === "height" || name === "data-size") return;
          if (name === "class") {
            const allowed = attr.value
              .split(/\s+/)
              .filter((cls) => cls === "about-img-full" || cls === "about-img-natural")
              .join(" ");
            if (allowed) el.setAttribute("class", allowed);
            else el.removeAttribute("class");
            return;
          }
          el.removeAttribute(attr.name);
          return;
        }
        if (el.tagName === "A") {
          if (name === "href" && /^(https?:|mailto:)/i.test(attr.value)) return;
          if (name === "target" || name === "rel") return;
          el.removeAttribute(attr.name);
          return;
        }
        if (name === "style") {
          const fontSize = el.style.fontSize;
          el.removeAttribute("style");
          if (fontSize) el.style.fontSize = fontSize;
          return;
        }
        el.removeAttribute(attr.name);
      });
      if (el.tagName === "IMG" && !el.getAttribute("src")) {
        el.remove();
        return;
      }
      if (el.tagName === "A") {
        const href = el.getAttribute("href") || "";
        if (!/^(https?:|mailto:)/i.test(href)) {
          const parent = el.parentNode;
          while (el.firstChild) parent?.insertBefore(el.firstChild, el);
          parent?.removeChild(el);
          return;
        }
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }
      clean(el);
    });
  };

  clean(doc.body);
  return doc.body.innerHTML;
};
