type ActionIconProps = { className?: string };

export const RoundCommentIcon = ({ className }: ActionIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <path d="M12 2.5c5.3 0 9.5 3.8 9.5 8.5 0 4.2-3.2 7.7-7.5 8.4L12 23l-2.1-3.6C5.6 18.6 2.5 15.2 2.5 11c0-4.7 4.2-8.5 9.5-8.5Z" />
  </svg>
);

export const WhatsAppIcon = ({ className }: ActionIconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.41a10.1 10.1 0 0 0 4.65 1.12h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2Z"
      fill="white"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M17.8 15.92c-.24.68-1.4 1.25-1.93 1.33-.49.07-1.12.1-1.81-.11-.41-.13-.94-.31-1.62-.6-2.85-1.23-4.7-4.1-4.84-4.29-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07 1-2.35.24-.26.64-.38.85-.38.21 0 .42 0 .6.01.19.01.45-.07.7.53.26.63.88 2.16.96 2.32.08.16.13.35.03.56-.1.21-.16.34-.31.52-.16.18-.33.4-.47.54-.16.15-.32.32-.14.63.19.31.83 1.37 1.78 2.22 1.23 1.09 2.26 1.43 2.58 1.59.32.16.5.13.69-.08.19-.21.8-.93 1.01-1.25.21-.32.42-.26.7-.16.28.1 1.79.84 2.1.99.31.16.51.23.59.36.07.13.07.75-.17 1.43Z"
      fill="#1f6b58"
    />
  </svg>
);

export const IosShareIcon = ({ className }: ActionIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <path d="M8 9H6.5A2.5 2.5 0 0 0 4 11.5v7A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5v-7A2.5 2.5 0 0 0 17.5 9H16" />
    <path d="M12 15V3m0 0L8.5 6.5M12 3l3.5 3.5" />
  </svg>
);
