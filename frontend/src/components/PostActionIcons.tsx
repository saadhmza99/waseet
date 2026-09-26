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
