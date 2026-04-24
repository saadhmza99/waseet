import { useState } from "react";
import { ArrowLeft, Briefcase, Edit, Star, UserPlus, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InviteToJobModal from "./InviteToJobModal";

interface ProfileHeaderProps {
  profileId?: string;
  avatar: string;
  fullName?: string;
  username: string;
  profession: string;
  location: string;
  posts: number;
  followers: number;
  rating: number;
  coverPhoto?: string;
  bio?: string;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  onFollowersClick?: () => void;
  onEditProfile?: () => void;
}

const ProfileHeader = ({
  profileId,
  avatar,
  fullName,
  username,
  profession,
  location,
  posts,
  followers,
  rating,
  coverPhoto,
  bio,
  isOwnProfile = false,
  isFollowing = false,
  onToggleFollow,
  onFollowersClick,
  onEditProfile,
}: ProfileHeaderProps) => {
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <div className="bg-nav text-nav-foreground pb-6 sm:pb-8 relative">
      {/* Cover Photo */}
      {coverPhoto && (
        <div className="absolute inset-0 h-48 sm:h-64 md:h-80 overflow-hidden">
          <img
            src={coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-nav/50 to-nav" />
        </div>
      )}
      
      <div className="relative z-10">
        <div className="flex items-center px-4 sm:px-6 md:px-8 pt-3 sm:pt-4 pb-4 sm:pb-5">
        <button onClick={() => navigate(-1)} className="hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="font-bold text-lg sm:text-xl md:text-2xl">{fullName || username}</h1>
          <p className="text-sm sm:text-base opacity-80">
            {profession} • {location}
          </p>
        </div>
        <div className="w-5 sm:w-6" />
      </div>

      <div className="flex justify-center mb-4 sm:mb-6">
        <div className="flex flex-col items-center">
          <img
            src={avatar}
            alt={username}
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-nav-foreground/30 object-cover"
          />
          <p className="mt-2 text-sm sm:text-base opacity-90">@{username}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-center divide-x divide-nav-foreground/20">
        <div className="px-4 sm:px-6 md:px-8 text-center">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold">{posts}</p>
          <p className="text-xs sm:text-sm opacity-70">Posts</p>
        </div>
        <button
          className="px-4 sm:px-6 md:px-8 text-center hover:opacity-80 transition-opacity"
          onClick={onFollowersClick}
          type="button"
        >
          <p className="text-xl sm:text-2xl md:text-3xl font-bold">{followers}</p>
          <p className="text-xs sm:text-sm opacity-70">Followers</p>
        </button>
        <div className="px-4 sm:px-6 md:px-8 text-center flex flex-col items-center">
          <div className="flex items-center gap-1">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold">{rating}</p>
            <Star className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-star fill-star" />
          </div>
          <p className="text-xs sm:text-sm opacity-70">Rating</p>
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <div className="px-4 sm:px-6 md:px-8 mt-4 sm:mt-6 max-w-2xl mx-auto">
          <p className="text-sm sm:text-base text-nav-foreground/90 text-center leading-relaxed">
            {bio}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 sm:gap-4 px-4 sm:px-6 md:px-8 mt-4 sm:mt-6 max-w-md mx-auto">
        {isOwnProfile ? (
          <button
            onClick={onEditProfile}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 sm:py-3 rounded-lg text-sm sm:text-base hover:bg-primary/90 transition-colors"
          >
            <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
            Edit profile
          </button>
        ) : (
          <>
            <button
              onClick={onToggleFollow}
              className={`flex-1 flex items-center justify-center gap-2 font-semibold py-2.5 sm:py-3 rounded-lg text-sm sm:text-base transition-colors ${
                isFollowing
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  Suivi
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Suivre
                </>
              )}
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-card text-primary font-semibold py-2.5 sm:py-3 rounded-lg text-sm sm:text-base hover:bg-card/90 transition-colors"
            >
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              Invite to Job
            </button>
          </>
        )}
      </div>
      </div>

      {/* Invite to Job Modal */}
      <InviteToJobModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        professionalName={username}
        professionalUserId={profileId}
      />
    </div>
  );
};

export default ProfileHeader;
