export const iconUrl = (fileName: string) =>
  new URL(`./${fileName}`, import.meta.url).href;
