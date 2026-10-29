import { useLayoutEffect } from "react";
import { useAppLanguage } from "@/contexts/AppLanguageContext";
import { frenchSource, translateUi } from "@/lib/i18n";

const originals = new WeakMap<Text, string>();

const ATTRS = [
  ["placeholder", "frPlaceholder"],
  ["aria-label", "frAriaLabel"],
  ["title", "frTitle"],
  ["alt", "frAlt"],
] as const;

const skipText = (node: Text) => {
  const parent = node.parentElement;
  if (!parent) return true;
  const tag = parent.tagName;
  if (tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA" || tag === "INPUT") return true;
  if (parent.closest("[contenteditable='true'], .ProseMirror, .about-content")) return true;
  return false;
};

/** Keep the French source when copy changes, and ignore our own English swap. */
const adoptSource = (remembered: string | undefined, live: string) => {
  if (!remembered || live === remembered) return frenchSource(live);
  const translated = translateUi("English", remembered);
  if (translated != null && live.trim() === translated.trim()) return frenchSource(remembered);
  return frenchSource(live);
};

/** Swaps known French interface strings for English when that language is selected. */
const I18nApply = () => {
  const { language } = useAppLanguage();

  useLayoutEffect(() => {
    let busy = false;

    const apply = () => {
      if (busy || !document.body) return;
      busy = true;
      const english = language === "English";
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let current: Node | null = walker.nextNode();
      while (current) {
        const text = current as Text;
        current = walker.nextNode();
        if (skipText(text)) continue;
        const live = text.nodeValue || "";
        const source = adoptSource(originals.get(text), live);
        if (originals.get(text) !== source) originals.set(text, source);
        if (!english) {
          if (text.nodeValue !== source) text.nodeValue = source;
          continue;
        }
        const next = translateUi(language, source);
        if (next != null && text.nodeValue !== next) text.nodeValue = next;
      }

      const labeled = document.body.querySelectorAll<HTMLElement>("[placeholder], [aria-label], [title], img[alt]");
      labeled.forEach((el) => {
        if (el.closest("[contenteditable='true'], .ProseMirror, .about-content")) return;
        ATTRS.forEach(([attr, storedKey]) => {
          const current = el.getAttribute(attr);
          if (current == null || current === "") return;
          const stored = adoptSource(el.dataset[storedKey], current);
          if (el.dataset[storedKey] !== stored) el.dataset[storedKey] = stored;
          if (!english) {
            if (el.getAttribute(attr) !== stored) el.setAttribute(attr, stored);
            return;
          }
          const next = translateUi(language, stored);
          if (next != null && el.getAttribute(attr) !== next.trim()) el.setAttribute(attr, next.trim());
        });
      });
      busy = false;
    };

    apply();
    const observer = new MutationObserver(() => apply());
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "aria-label", "title", "alt"],
    });
    return () => observer.disconnect();
  }, [language]);

  return null;
};

export default I18nApply;
