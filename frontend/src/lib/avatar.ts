export const getDefaultAvatar = (profileType?: string) => {
  const isFemale = profileType === "hunter";
  const svg = isFemale
    ? `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' fill='#e5e7eb'/><circle cx='60' cy='44' r='22' fill='#9ca3af'/><path d='M20 108c6-22 22-34 40-34s34 12 40 34' fill='#9ca3af'/><path d='M38 42c6-16 16-20 22-20s16 4 22 20' fill='none' stroke='#9ca3af' stroke-width='8'/></svg>`
    : `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' fill='#e5e7eb'/><circle cx='60' cy='40' r='22' fill='#9ca3af'/><path d='M18 108c8-24 24-34 42-34s34 10 42 34' fill='#9ca3af'/></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
