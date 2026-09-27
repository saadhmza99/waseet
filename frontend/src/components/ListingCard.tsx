import { MapPin, User, MoreHorizontal, Sparkles, Bookmark, Banknote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { savedService } from "@/services/savedService";
import { notificationService } from "@/services/notificationService";
import { toast } from "@/components/ui/use-toast";
import { listingBudgetLabel } from "@/lib/utils";
import { RetryImage } from "@/components/RetryImage";
import VerifiedBadge from "@/components/VerifiedBadge";

interface ListingCardProps {
  id?: string;
  userId?: string;
  avatar: string;
  username: string;
  isVerified?: boolean;
  timeAgo: string;
  image: string;
  imageCount?: number;
  location: string;
  title: string;
  profession?: string;
  priceRange: string;
  isSponsored?: boolean;
  isLarge?: boolean; // For sponsored section only
  fillWidth?: boolean;
  compact?: boolean;
  initialSaved?: boolean;
  details?: {
    beds?: number;
    baths?: number;
    area?: string;
  };
}

const ListingCard = ({
  id,
  userId,
  avatar,
  username,
  isVerified = false,
  timeAgo,
  image,
  imageCount,
  location,
  title,
  profession,
  priceRange,
  isSponsored = false,
  isLarge = false,
  fillWidth = false,
  compact = false,
  initialSaved = false,
  details,
}: ListingCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(initialSaved);

  const handleSaveListing = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !id) return;

    try {
      if (isSaved) {
        await savedService.unsaveListing(user.id, id);
        setIsSaved(false);
      } else {
        await savedService.saveListing(user.id, id);
        setIsSaved(true);
        if (userId && userId !== user.id) {
          await notificationService.createNotification({
            actorUserId: user.id,
            targetUserId: userId,
            type: "listing_save",
            entityType: "listing",
            entityId: id,
            message: "a enregistré votre service.",
          });
        }
      }
    } catch (error) {
      console.error("Error toggling listing save:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer cette service." });
    }
  };

  const handleViewJob = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigate("/job/" + encodeURIComponent(title), {
      state: { avatar, username, location, timeAgo, title, image, profession, priceRange },
    });
  };

  const handleProfileClick = () => {
    navigate(`/profile/${username}`);
  };

  if (compact) {
    return (
      <article
        role="button"
        tabIndex={0}
        onClick={() => handleViewJob()}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleViewJob();
        }}
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-2 transition-transform duration-150 hover:scale-[0.98] active:scale-[0.97]"
      >
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleProfileClick();
            }}
            className="mb-1 flex max-w-full items-center gap-2"
          >
            <img src={avatar} alt={username} className="h-8 w-8 shrink-0 rounded-full object-cover" />
            <span className="truncate text-[15px] font-semibold text-card-foreground">{username}</span>
            <VerifiedBadge verified={isVerified} className="h-4 w-4" />
          </button>
          <h3 className="line-clamp-1 text-sm font-semibold text-card-foreground">{title}</h3>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleViewJob}
              className="shrink-0 rounded-md bg-[#174f43] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#123d34]"
            >
              Contacter
            </button>
            <div className="flex min-w-0 items-center gap-1">
              <button
                type="button"
                onClick={handleSaveListing}
                aria-label="Enregistrer"
                className={`shrink-0 rounded-md p-1.5 transition-colors ${isSaved ? "text-accent" : "text-muted-foreground hover:text-accent"}`}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
              </button>
              <span className="flex min-w-0 items-center gap-1 text-xs font-medium text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{location}</span>
              </span>
            </div>
          </div>
        </div>
        <RetryImage
          src={image}
          alt={title}
          wrapClassName="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted"
          className="h-full w-full object-cover"
        />
      </article>
    );
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => handleViewJob()}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleViewJob();
      }}
      className={`cursor-pointer bg-card border border-border rounded-lg overflow-hidden transition-transform duration-150 hover:scale-[0.98] active:scale-[0.97] flex-shrink-0 w-full ${isLarge ? "max-w-[320px] sm:max-w-[420px]" : fillWidth ? "max-w-none" : "max-w-[320px]"}`}
    >
      {/* User Info Header */}
      <div className={`flex items-center justify-between ${isLarge ? 'px-3 sm:px-4 md:px-5 pt-3 sm:pt-4 pb-2 sm:pb-3' : 'px-3 sm:px-4 pt-3 pb-2'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleProfileClick();
          }}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-1 min-w-0"
        >
          <img
            src={avatar}
            alt={username}
            className={`rounded-full object-cover flex-shrink-0 ${isLarge ? 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12' : 'w-8 h-8 sm:w-10 sm:h-10'}`}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className={`font-semibold text-card-foreground truncate ${isLarge ? 'text-xs sm:text-sm md:text-base' : 'text-xs sm:text-sm'}`}>{username}</p>
              <VerifiedBadge verified={isVerified} className={isLarge ? "h-4 w-4" : "h-3.5 w-3.5"} />
              {isSponsored && (
                <div className={`flex items-center gap-1 bg-accent/10 text-accent rounded ${isLarge ? 'px-1.5 sm:px-2 py-0.5 sm:py-1' : 'px-1.5 py-0.5'}`}>
                  <Sparkles className={`${isLarge ? 'w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4' : 'w-3 h-3'}`} />
                  <span className={`font-semibold uppercase ${isLarge ? 'text-[10px] sm:text-[10px] md:text-xs' : 'text-[10px]'}`}>Sponsorisé</span>
                </div>
              )}
            </div>
            <p className={`text-muted-foreground truncate ${isLarge ? 'text-[10px] sm:text-xs md:text-sm' : 'text-[10px] sm:text-xs'}`}>actif {timeAgo}</p>
          </div>
        </button>
        <button onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:opacity-70 transition-opacity">
          <MoreHorizontal className={`${isLarge ? 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6' : 'w-4 h-4 sm:w-5 sm:h-5'}`} />
        </button>
      </div>

      {/* Main Image */}
      <div className={`relative w-full overflow-hidden bg-background ${isSponsored ? 'aspect-[4/3]' : 'aspect-[4/3]'}`}>
        <RetryImage
          src={image}
          alt={title}
          wrapClassName="h-full w-full"
          className="w-full h-full object-cover"
        />
        {imageCount && imageCount > 1 && (
          <div className={`absolute bottom-2 left-2 bg-foreground/70 text-background font-semibold px-2 py-1 rounded ${isLarge ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'}`}>
            1/{imageCount}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={isLarge ? 'p-3 sm:p-4 md:p-5' : 'p-3 sm:p-4'}>
        {/* Location */}
        <div className="flex items-center gap-1 mb-2">
          <MapPin className={`text-muted-foreground flex-shrink-0 ${isLarge ? 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5' : 'w-3 h-3 sm:w-4 sm:h-4'}`} />
          <p className={`text-muted-foreground truncate ${isLarge ? 'text-[10px] sm:text-xs md:text-sm' : 'text-[10px] sm:text-xs'}`}>{location}</p>
        </div>

        {/* Title */}
        <h3 className={`font-bold text-card-foreground mb-2 sm:mb-3 line-clamp-2 ${isLarge ? 'text-sm sm:text-base md:text-lg min-h-[2.5rem] sm:min-h-[3rem]' : 'text-sm sm:text-base min-h-[2.5rem]'}`}>
          {title}
        </h3>

        {/* Details (if provided) */}
        {details && (details.beds || details.baths || details.area) && (
          <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3 text-xs sm:text-sm text-card-foreground">
            {details.beds !== undefined && (
              <span className="flex items-center gap-1">
                <span>🛏️</span>
                <span>{details.beds}</span>
              </span>
            )}
            {details.baths !== undefined && (
              <span className="flex items-center gap-1">
                <span>🚿</span>
                <span>{details.baths}</span>
              </span>
            )}
            {details.area && (
              <span className="flex items-center gap-1">
                <span>📐</span>
                <span>{details.area}</span>
              </span>
            )}
          </div>
        )}

        {/* Price and Action */}
        <div className={`flex items-center justify-between border-t border-border ${isLarge ? 'pt-2 sm:pt-3' : 'pt-2'}`}>
          <span className={`inline-flex items-center gap-1.5 font-bold text-card-foreground ${isLarge ? 'text-sm sm:text-base md:text-lg' : 'text-sm sm:text-base'}`}>
            <Banknote className={`shrink-0 text-muted-foreground ${isLarge ? 'h-4 w-4 sm:h-5 sm:w-5' : 'h-4 w-4'}`} />
            {listingBudgetLabel(priceRange)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveListing}
              className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                isSaved 
                  ? 'bg-accent/10 text-accent' 
                  : 'text-muted-foreground hover:text-accent hover:bg-accent/5'
              }`}
            >
              <Bookmark className={`${isLarge ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-4 h-4'} ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleViewJob}
              onMouseDown={(e) => e.preventDefault()}
              className={`bg-[#174f43] text-white font-semibold rounded-md hover:bg-[#123d34] transition-colors ${isLarge ? 'text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5' : 'text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2'}`}
            >
              Contacter
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ListingCard;

