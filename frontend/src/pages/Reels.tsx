import { useState, useRef, useEffect } from "react";
import { MessageCircle, Share2, Heart, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { reelService } from "@/services/reelService";
import { savedService } from "@/services/savedService";
import { CloudflareVideoPlayer } from "@/components/CloudflareVideoPlayer";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getDefaultAvatar } from "@/lib/avatar";
import { streamService } from "@/services/streamService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const Reels = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reels, setReels] = useState<any[]>([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [savedReels, setSavedReels] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load reels from Supabase
  useEffect(() => {
    const loadReels = async () => {
      try {
        setLoading(true);
        const reelsData = await reelService.getReels(50, 0);
        setReels(reelsData || []);
        
        // Check liked and saved status
        if (user && reelsData) {
          const likedPromises = reelsData.map((reel) => 
            // TODO: Check if reel is liked
            Promise.resolve(false)
          );
          const savedPromises = reelsData.map((reel) => 
            savedService.isReelSaved(user.id, reel.id)
          );
          
          const [likedResults, savedResults] = await Promise.all([
            Promise.all(likedPromises),
            Promise.all(savedPromises),
          ]);
          
          const likedSet = new Set<string>();
          const savedSet = new Set<string>();
          reelsData.forEach((reel, index) => {
            if (likedResults[index]) likedSet.add(reel.id);
            if (savedResults[index]) savedSet.add(reel.id);
          });
          setLikedReels(likedSet);
          setSavedReels(savedSet);
        }
      } catch (error) {
        console.error("Error loading reels:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReels();
  }, [user]);

  const handleLike = async (reelId: string) => {
    if (!user) return;
    
    try {
      if (likedReels.has(reelId)) {
        await reelService.unlikeReel(reelId, user.id);
        setLikedReels((prev) => {
          const newSet = new Set(prev);
          newSet.delete(reelId);
          return newSet;
        });
      } else {
        await reelService.likeReel(reelId, user.id);
        setLikedReels((prev) => new Set(prev).add(reelId));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleSave = async (reelId: string) => {
    if (!user) return;
    
    try {
      if (savedReels.has(reelId)) {
        await savedService.unsaveReel(user.id, reelId);
        setSavedReels((prev) => {
          const newSet = new Set(prev);
          newSet.delete(reelId);
          return newSet;
        });
      } else {
        await savedService.saveReel(user.id, reelId);
        setSavedReels((prev) => new Set(prev).add(reelId));
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const handleShare = async (reelId: string) => {
    if (!user) return;
    
    try {
      await reelService.shareReel(reelId, user.id);
      
      // Also try native share
      if (navigator.share && currentReel) {
        navigator.share({
          title: currentReel.title || currentReel.description,
          text: currentReel.description,
          url: window.location.href,
        });
      }
    } catch (error) {
      console.error("Error sharing reel:", error);
    }
  };

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
    } catch {
      return "récemment";
    }
  };

  const handleScroll = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY;
    
    if (delta > 0 && currentReelIndex < playableReels.length - 1) {
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
      if (diff > 0 && currentReelIndex < playableReels.length - 1) {
        setCurrentReelIndex(currentReelIndex + 1);
      } else if (diff < 0 && currentReelIndex > 0) {
        setCurrentReelIndex(currentReelIndex - 1);
      }
    }
  };

  const playableReels = reels.filter((reel) => Boolean(reel.cloudflare_video_id));

  const handleUploadReel = async () => {
    if (!user || !videoFile) return;
    setUploading(true);
    try {
      const uploaded = await streamService.uploadVideo(videoFile, { title, description });
      const videoId = uploaded?.result?.uid || uploaded?.uid;
      if (!videoId) throw new Error("Upload failed");
      await reelService.createReel(user.id, {
        cloudflare_video_id: videoId,
        title,
        description,
      });
      const reelsData = await reelService.getReels(50, 0);
      setReels(reelsData || []);
      setVideoFile(null);
      setTitle("");
      setDescription("");
      toast({ title: "Reel ajoute", description: "Votre reel est maintenant publie." });
    } catch (error) {
      console.error("Error uploading reel:", error);
      toast({ title: "Erreur", description: "Impossible d'ajouter ce reel." });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Chargement des reels...</div>
      </div>
    );
  }

  if (playableReels.length === 0) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Aucun reel disponible</div>
      </div>
    );
  }

  const safeCurrentIndex = Math.min(currentReelIndex, playableReels.length - 1);
  const currentReel = playableReels[safeCurrentIndex];
  const profile = currentReel?.profiles || {};
  const isLiked = currentReel ? likedReels.has(currentReel.id) : false;
  const isSaved = currentReel ? savedReels.has(currentReel.id) : false;
  const likeCount = currentReel?.likes_count || 0;

  return (
    <div 
      className="fixed inset-0 bg-background overflow-hidden"
      onWheel={handleScroll}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      ref={containerRef}
    >
      <div className="relative w-full h-full">
        {user && (
          <div className="absolute top-4 left-4 z-20 w-[320px] max-w-[90vw] rounded-lg bg-black/40 backdrop-blur-md p-3 space-y-2">
            <p className="text-white text-sm font-semibold">Ajouter un reel</p>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre"
              className="bg-black/40 text-white border-white/20"
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="bg-black/40 text-white border-white/20"
              rows={2}
            />
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="bg-black/40 text-white border-white/20"
            />
            <Button
              onClick={handleUploadReel}
              disabled={!videoFile || uploading}
              className="w-full"
            >
              {uploading ? "Upload..." : "Publier reel"}
            </Button>
          </div>
        )}
        {playableReels.map((reel, index) => (
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
              {/* Video - Cloudflare Stream */}
              {reel.cloudflare_video_id ? (
                <CloudflareVideoPlayer
                  videoId={reel.cloudflare_video_id}
                  className="w-full h-full"
                  autoPlay={index === safeCurrentIndex}
                  loop={true}
                  muted={true}
                  controls={false}
                />
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center text-white">
                  Vidéo non disponible
                </div>
              )}

              {/* Overlay Content */}
              <div className="absolute inset-0 flex">
                {/* Left Side - User Info */}
                <div className="flex-1 flex flex-col justify-end p-4 sm:p-6 pb-20 sm:pb-24">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={profile.avatar_url || getDefaultAvatar(profile.profile_type)}
                      alt={profile.username || ""}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white object-cover cursor-pointer"
                      onClick={() => navigate(`/profile/${profile.username || ""}`)}
                    />
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">
                        {profile.username || ""}
                      </p>
                    </div>
                  </div>
                  <p className="text-white text-sm sm:text-base max-w-md">
                    {reel.description || reel.title || ""}
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
                        // TODO: Open comment modal
                        console.log("Open comments for reel", reel.id);
                      }}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
                    >
                      <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </button>
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {(reel.comments_count || 0) >= 1000 ? `${((reel.comments_count || 0) / 1000).toFixed(1)}k` : (reel.comments_count || 0)}
                    </span>
                  </div>

                  {/* Share */}
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => handleShare(reel.id)}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
                    >
                      <Share2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </button>
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {(reel.shares_count || 0) >= 1000 ? `${((reel.shares_count || 0) / 1000).toFixed(1)}k` : (reel.shares_count || 0)}
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
        {playableReels.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-all ${
              index === safeCurrentIndex
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
