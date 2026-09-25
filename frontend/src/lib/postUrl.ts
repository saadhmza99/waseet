export const postPath = (postId: string) => `/post/${encodeURIComponent(postId)}`;

export const postAbsoluteUrl = (postId: string) => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}${postPath(postId)}`;
};
