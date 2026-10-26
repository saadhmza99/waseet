/** Kill-switch: hide @usernames in the UI; prefer full names everywhere. */
export const USERNAMES_ENABLED = false;

export const profileHandle = (username?: string | null) => {
  if (!USERNAMES_ENABLED) return "";
  const slug = (username || "").replace(/^@/, "").trim();
  return slug ? `@${slug}` : "@user";
};

/** Public label for a member (report/block/mute/toasts). Never shows @username while disabled. */
export const profileMemberLabel = (fullName?: string | null, username?: string | null) => {
  const name = (fullName || "").trim();
  if (name) return name;
  if (USERNAMES_ENABLED) {
    const handle = profileHandle(username);
    if (handle) return handle;
  }
  return "ce membre";
};
