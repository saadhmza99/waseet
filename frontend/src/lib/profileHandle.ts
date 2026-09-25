export const profileHandle = (username?: string | null) => {
  const slug = (username || "").replace(/^@/, "").trim();
  return slug ? `@${slug}` : "@user";
};
