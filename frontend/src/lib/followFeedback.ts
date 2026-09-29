import { useEffect, useState } from "react";

const authors = new Set<string>();
const posts = new Set<string>();
const listeners = new Set<() => void>();

/** Remember a follow for this page load only. A refresh starts empty. */
export const markFollowedNow = (authorId: string, postId: string) => {
  authors.add(authorId);
  if (postId) posts.add(postId);
  listeners.forEach((listener) => listener());
};

export const useFollowFeedback = (authorId?: string, postId?: string) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const update = () => setTick((tick) => tick + 1);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return {
    followedNow: Boolean(postId && posts.has(postId)),
    followedAuthorNow: Boolean(authorId && authors.has(authorId)),
  };
};
