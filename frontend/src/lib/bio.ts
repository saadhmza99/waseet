/** Max profile bio length (matched to sample Sonajib paragraph). */
export const MAX_BIO_LENGTH = 251;

export const clampBio = (value?: string | null) =>
  (value || "").slice(0, MAX_BIO_LENGTH);
