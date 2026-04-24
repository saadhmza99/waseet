import { useState } from "react";
import { X, ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import CommentSection from "./CommentSection";

interface PortfolioModalProps {
  image: string;
  label: string;
  username: string;
  avatar: string;
  isOpen: boolean;
  onClose: () => void;
}

const PortfolioModal = ({ image, label, username, avatar, isOpen, onClose }: PortfolioModalProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentCount] = useState(0);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: label,
        text: `Check out this ${label} by ${username}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-card rounded-none sm:rounded-lg w-full h-full sm:w-full sm:max-w-6xl sm:max-h-[90vh] sm:mx-4 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-card/90 hover:bg-card rounded-full p-2 text-card-foreground hover:opacity-80 transition-opacity"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Section */}
        <div className="flex-1 min-h-0 overflow-hidden bg-background flex items-center justify-center">
          <img
            src={image}
            alt={label}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Info Section */}
        <div className="bg-card border-t border-border">
          {/* User Info */}
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border">
            <img
              src={avatar}
              alt={username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-sm text-card-foreground">{username}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 py-3 border-b border-border">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 text-sm font-medium ${liked ? "text-accent" : "text-like"}`}
            >
              <ThumbsUp className={`w-5 h-5 ${liked ? "fill-accent" : ""}`} />
              {likeCount}
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-sm font-medium text-card-foreground"
            >
              <MessageCircle className="w-5 h-5" />
              {commentCount}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-sm font-medium text-card-foreground"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="max-h-64 overflow-y-auto">
              <CommentSection comments={[]} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioModal;

