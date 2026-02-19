import { Sparkles, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SponsoredBannerProps {
  title?: string;
  location?: string;
  description?: string;
  jobId?: string;
  image?: string;
  avatar?: string;
  username?: string;
  timeAgo?: string;
  profession?: string;
  priceRange?: string;
}

const SponsoredBanner = ({ 
  title = "Bathroom Remodel in Chicago, IL",
  location = "Chicago, IL",
  description = "Looking for experienced professionals",
  jobId,
  image,
  avatar,
  username,
  timeAgo,
  profession,
  priceRange
}: SponsoredBannerProps) => {
  const navigate = useNavigate();

  const handleView = () => {
    const jobTitle = jobId || title || "";
    navigate(`/job/${encodeURIComponent(jobTitle)}`, {
      state: { 
        avatar, 
        username, 
        location, 
        timeAgo, 
        title, 
        image, 
        profession, 
        jobLocation: location,
        priceRange 
      },
    });
  };

  return (
    <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/20 overflow-hidden relative">
      {image && (
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        </div>
      )}
      <div className="relative p-3 sm:p-4 flex items-center justify-between gap-3 min-h-[120px] sm:min-h-[130px]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent flex-shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-semibold text-accent uppercase tracking-wide">
              Sponsored
            </span>
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-white leading-tight mb-0.5 line-clamp-1">
            {title}
          </h3>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-white/90">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>
        <button 
          onClick={handleView}
          className="bg-accent text-accent-foreground text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-accent/90 transition-all active:scale-95 whitespace-nowrap flex-shrink-0"
        >
          Voir
        </button>
      </div>
    </div>
  );
};

export default SponsoredBanner;
