import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VerifiedBadge from "@/components/VerifiedBadge";

interface ReviewCardProps {
  avatar: string;
  username: string;
  isVerified?: boolean;
  timeAgo: string;
  rating: number;
  text: string;
}

const ReviewCard = ({ avatar, username, isVerified, timeAgo, rating, text }: ReviewCardProps) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/${username}`);
  };

  return (
    <div className="px-5 sm:px-6 md:px-8 py-5 sm:py-6">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <button 
          onClick={handleProfileClick}
          className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
        >
          <img src={avatar} alt={username} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover" />
          <span className="inline-flex items-center gap-1 font-semibold text-sm sm:text-base md:text-lg text-card-foreground">
            {username}
            <VerifiedBadge verified={isVerified} className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </span>
        </button>
        <span className="text-xs sm:text-sm text-muted-foreground">{timeAgo}</span>
      </div>
      <div className="flex gap-0.5 sm:gap-1 mb-1.5 sm:mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 sm:w-5 sm:h-5 ${i < rating ? "text-star fill-star" : "text-border"}`}
          />
        ))}
      </div>
      <p className="text-sm sm:text-base text-card-foreground leading-relaxed">{text}</p>
    </div>
  );
};

export default ReviewCard;
