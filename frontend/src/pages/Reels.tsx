import { useState, useRef, useEffect } from "react";
import { MessageCircle, Share2, Heart, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import avatarAnna from "@/assets/avatar-anna.jpg";
import avatarMike from "@/assets/avatar-mike.jpg";
import avatarTony from "@/assets/avatar-tony.jpg";

interface Reel {
  id: number;
  video: string;
  username: string;
  avatar: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
}

const reels: Reel[] = [
  {
    id: 1,
    video: "/reels/ssstik.io_@proeraplumbing_1771211708102.mp4",
    username: "proeraplumbing",
    avatar: avatarMike,
    description: "Plumbing work in progress 🔧",
    likes: 1250,
    comments: 89,
    shares: 45,
  },
  {
    id: 2,
    video: "/reels/ssstik.io_@svd_cabinets_1771211805783.mp4",
    username: "svd_cabinets",
    avatar: avatarAnna,
    description: "Custom cabinet installation ✨",
    likes: 2100,
    comments: 156,
    shares: 78,
  },
  {
    id: 3,
    video: "/reels/ssstik.io_@svd_cabinets_1771211836066.mp4",
    username: "svd_cabinets",
    avatar: avatarAnna,
    description: "Beautiful kitchen transformation 🏠",
    likes: 3400,
    comments: 234,
    shares: 120,
  },
];

const Reels = () => {
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());
  const [savedReels, setSavedReels] = useState<Set<number>>(new Set());
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const currentReel = reels[currentReelIndex];

  // Auto-play current video
  useEffect(() => {
    const currentVideo = videoRefs.current[currentReelIndex];
    if (currentVideo) {
      currentVideo.play().catch(() => {
        // Auto-play might be blocked by browser
      });
    }

    // Pause other videos
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentReelIndex) {
        video.pause();
      }
    });
  }, [currentReelIndex]);

  const handleLike = (reelId: number) => {
    setLikedReels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reelId)) {
        newSet.delete(reelId);
      } else {
        newSet.add(reelId);
      }
      return newSet;
    });
  };

  const handleSave = (reelId: number) => {
    setSavedReels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reelId)) {
        newSet.delete(reelId);
      } else {
        newSet.add(reelId);
      }
      return newSet;
    });
  };

  const handleScroll = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY;
    
    if (delta > 0 && currentReelIndex < reels.length - 1) {
      setCurrentReelIndex(currentReelIndex + 1);
    } else if (delta < 0 && currentReelIndex > 0) {
      setCurrentReelIndex(currentReelIndex - 1);
    }
  };

  const handleTouchStart = useRef<number | null>(null);
  const handleTouchMove = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    handleTouchStart.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (handleTouchStart.current === null) return;
    handleTouchMove.current = e.changedTouches[0].clientY;
    const diff = handleTouchStart.current - handleTouchMove.current;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentReelIndex < reels.length - 1) {
        setCurrentReelIndex(currentReelIndex + 1);
      } else if (diff < 0 && currentReelIndex > 0) {
        setCurrentReelIndex(currentReelIndex - 1);
      }
    }
  };

  const isLiked = likedReels.has(currentReel.id);
  const isSaved = savedReels.has(currentReel.id);
  const likeCount = isLiked ? currentReel.likes + 1 : currentReel.likes;

  return (
    <div 
      className="fixed inset-0 bg-background overflow-hidden"
      onWheel={handleScroll}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      ref={containerRef}
    >
      <div className="relative w-full h-full">
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className={`absolute inset-0 transition-transform duration-500 ${
              index === currentReelIndex
                ? "translate-y-0"
                : index < currentReelIndex
                ? "-translate-y-full"
                : "translate-y-full"
            }`}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Video */}
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={reel.video}
                className="w-full h-full object-contain bg-black"
                loop
                muted
                playsInline
              />

              {/* Overlay Content */}
              <div className="absolute inset-0 flex">
                {/* Left Side - User Info */}
                <div className="flex-1 flex flex-col justify-end p-4 sm:p-6 pb-20 sm:pb-24">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={reel.avatar}
                      alt={reel.username}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white object-cover cursor-pointer"
                      onClick={() => navigate(`/profile/${reel.username}`)}
                    />
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">
                        {reel.username}
                      </p>
                    </div>
                  </div>
                  <p className="text-white text-sm sm:text-base max-w-md">
                    {reel.description}
                  </p>
                </div>

                {/* Right Side - Action Buttons */}
                <div className="flex flex-col items-center justify-end gap-4 sm:gap-6 p-4 sm:p-6 pb-20 sm:pb-24">
                  {/* Like */}
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => handleLike(reel.id)}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
                    >
                      <Heart
                        className={`w-6 h-6 sm:w-7 sm:h-7 transition-all ${
                          isLiked
                            ? "text-red-500 fill-red-500 scale-110"
                            : "text-white"
                        }`}
                      />
                    </button>
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
                    </span>
                  </div>

                  {/* Comment */}
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => {
                        // Navigate to comments or open comment modal
                        console.log("Open comments");
                      }}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
                    >
                      <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </button>
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {reel.comments >= 1000 ? `${(reel.comments / 1000).toFixed(1)}k` : reel.comments}
                    </span>
                  </div>

                  {/* Share */}
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: reel.description,
                            url: window.location.href,
                          });
                        }
                      }}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
                    >
                      <Share2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </button>
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {reel.shares >= 1000 ? `${(reel.shares / 1000).toFixed(1)}k` : reel.shares}
                    </span>
                  </div>

                  {/* Save */}
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => handleSave(reel.id)}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
                    >
                      <Bookmark
                        className={`w-6 h-6 sm:w-7 sm:h-7 ${
                          isSaved ? "text-primary fill-primary" : "text-white"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reel Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {reels.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-all ${
              index === currentReelIndex
                ? "w-8 bg-white"
                : "w-1 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Reels;
