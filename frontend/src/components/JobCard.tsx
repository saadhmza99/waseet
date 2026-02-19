import { MapPin, User, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JobCardProps {
  avatar: string;
  username: string;
  location: string;
  timeAgo: string;
  title: string;
  image: string;
  budgetRange: string;
  profession: string;
  jobLocation: string;
  priceRange: string;
}

const JobCard = ({
  avatar,
  username,
  location,
  timeAgo,
  title,
  image,
  budgetRange,
  profession,
  jobLocation,
  priceRange,
}: JobCardProps) => {
  const navigate = useNavigate();

  const handleViewJob = () => {
    navigate("/job/" + encodeURIComponent(title), {
      state: { avatar, username, location, timeAgo, title, image, budgetRange, profession, jobLocation, priceRange },
    });
  };

  const handleProfileClick = () => {
    navigate(`/profile/${username}`);
  };

  return (
    <article className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-2 sm:px-4 md:px-6 lg:px-8 pt-3 pb-2">
        <button 
          onClick={handleProfileClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0"
        >
          <img src={avatar} alt={username} className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-sm sm:text-base md:text-lg text-card-foreground truncate">{username}</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{location}, {timeAgo}</p>
          </div>
        </button>
        <button className="text-muted-foreground hover:opacity-70 transition-opacity ml-2">
          <MoreHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <h3 className="px-2 sm:px-4 md:px-6 lg:px-8 pb-2 font-bold text-base sm:text-lg md:text-xl text-card-foreground">{title}</h3>

      <div className="px-2 sm:px-4 md:px-6 lg:px-8 pb-3 flex gap-3 sm:gap-4 md:gap-6">
        <img src={image} alt={title} className="w-28 h-24 sm:w-36 sm:h-28 md:w-44 md:h-32 object-cover rounded-lg flex-shrink-0" />
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div className="space-y-1 sm:space-y-2">
            <p className="text-sm sm:text-base text-card-foreground font-medium">{profession}</p>
            <div className="flex items-center gap-1 text-sm sm:text-base text-accent">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{jobLocation}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <span className="text-sm sm:text-base font-semibold text-card-foreground">{priceRange}</span>
            <button
              onClick={handleViewJob}
              className="bg-primary text-primary-foreground text-xs sm:text-sm font-semibold px-4 sm:px-6 py-1.5 sm:py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Contacter
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default JobCard;
