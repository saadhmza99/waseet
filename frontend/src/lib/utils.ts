import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const listingBudgetLabel = (value?: string | null) => {
  const text = (value || "").replace(/\s+/g, " ").trim();
  if (!text || /^[-–—]$/.test(text) || /prix sur demande/i.test(text)) return "— / à discuter";
  return text;
};

