import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  verified?: boolean | null;
  className?: string;
}

const VerifiedBadge = ({ verified, className = "h-4 w-4" }: VerifiedBadgeProps) => {
  if (!verified) return null;

  return (
    <BadgeCheck
      className={`shrink-0 fill-blue-500 text-white ${className}`}
      strokeWidth={2.5}
      aria-label="Compte vérifié"
    />
  );
};

export default VerifiedBadge;
