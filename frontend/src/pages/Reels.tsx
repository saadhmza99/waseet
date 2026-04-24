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
import {
  REEL_MAX_DURATION_SECONDS,
  REEL_MAX_PER_USER_PER_MONTH,
  REEL_UPLOAD_MAX_BYTES,
  streamService,
} from "@/services/streamService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [publishFormOpen, setPublishFormOpen] = useState(false);
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

  useEffect(() => {
    const n = reels.filter((r) => Boolean(String(r.cloudflare_video_id || "").trim())).length;
    setCurrentReelIndex((i) => {
      if (n === 0) return 0;
      return i >= n ? 0 : i;
    });
  }, [reels]);

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
      
      const reel = reels.find((r) => r.id === reelId);
      if (navigator.share && reel) {
        navigator.share({
          title: reel.title || reel.description,
          text: reel.description,
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

  const playableReels = reels.filter((reel) => Boolean(String(reel.cloudflare_video_id || "").trim()));

  const handleUploadReel = async () => {
    if (!user || !videoFile) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await streamService.uploadVideo(
        videoFile,
        { title, description },
        { onUploadProgress: setUploadProgress }
      );
      const videoId = uploaded?.video?.id;
      if (!videoId) throw new Error("Réponse upload invalide (pas d’identifiant vidéo).");
      await reelService.createReel(user.id, {
        cloudflare_video_id: videoId,
        title,
        description,
        duration_seconds: uploaded?.video?.durationSeconds ?? null,
      });
      const reelsData = await reelService.getReels(50, 0);
      setReels(reelsData || []);
      setVideoFile(null);
      setTitle("");
      setDescription("");
      setPublishFormOpen(false);
      toast({ title: "Reel ajoute", description: "Votre reel est maintenant publie." });
    } catch (error) {
      console.error("Error uploading reel:", error);
      const msg = error instanceof Error ? error.message : "Impossible d'ajouter ce reel.";
      toast({ title: "Erreur", description: msg });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const reelPublishCollapsible = user ? (
    <Collapsible open={publishFormOpen} onOpenChange={setPublishFormOpen}>
      <CollapsibleTrigger asChild>
        <Button type="button" variant="secondary" size="sm" className="shadow-md">
          Publier un reel
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 w-[min(100vw-2rem,360px)] rounded-lg border border-border bg-card p-3 text-card-foreground shadow-lg space-y-2">
        <p className="text-xs text-muted-foreground leading-snug">
          Actuellement, chaque utilisateur ne peut publier que {REEL_MAX_PER_USER_PER_MONTH} reels d’au plus{" "}
          {REEL_MAX_DURATION_SECONDS} secondes par mois (mois calendaire UTC).
        </p>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows={2}
        />
        <Input
          type="file"
          accept="video/*"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            if (f && f.size > REEL_UPLOAD_MAX_BYTES) {
              const maxMb = Math.round(REEL_UPLOAD_MAX_BYTES / (1024 * 1024));
              toast({
                title: "Fichier trop grand",
                description: `Maximum ${maxMb} Mo pour un reel.`,
              });
              e.target.value = "";
              setVideoFile(null);
              return;
            }
            setVideoFile(f);
          }}
        />
        {uploading && uploadProgress > 0 && (
          <p className="text-xs text-muted-foreground">Envoi vers Cloudflare : {uploadProgress}%</p>
        )}
        <Button onClick={handleUploadReel} disabled={!videoFile || uploading} className="w-full">
          {uploading ? (uploadProgress > 0 ? `Envoi ${uploadProgress}%` : "Préparation…") : "Envoyer le reel"}
        </Button>
      </CollapsibleContent>
    </Collapsible>
  ) : null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Chargement des reels...</div>
      </div>
    );
  }

  const hasPlayable = playableReels.length > 0;
  const safeCurrentIndex = hasPlayable ? Math.min(currentReelIndex, playableReels.length - 1) : 0;

  return (
    <div
      className="fixed inset-0 bg-background overflow-hidden"
      onWheel={hasPlayable ? handleScroll : undefined}
      onTouchStart={hasPlayable ? onTouchStart : undefined}
      onTouchEnd={hasPlayable ? onTouchEnd : undefined}
      ref={containerRef}
    >
      <div className="relative h-full w-full">
        {user && (
          <div className="absolute right-4 top-4 z-30 flex flex-col items-end">{reelPublishCollapsible}</div>
        )}

        {!hasPlayable ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-4 py-8 text-center">
            <p className="text-muted-foreground">Aucun reel disponible</p>
            {!user && (
              <p className="max-w-sm text-sm text-muted-foreground">
                Connecte-toi pour publier un reel.
              </p>
            )}
          </div>
        ) : (
          playableReels.map((reel, index) => {
            const reelProfile = reel.profiles || {};
            const reelLiked = likedReels.has(reel.id);
            const reelSaved = savedReels.has(reel.id);
            const reelLikes = reel.likes_count || 0;
            return (
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
            <div className="relative h-full w-full min-h-0 bg-black">
              {reel.cloudflare_video_id ? (
                <div className="absolute inset-0 min-h-0">
                  <CloudflareVideoPlayer
                    videoId={String(reel.cloudflare_video_id).trim()}
                    className="h-full w-full min-h-0"
                    autoPlay={index === safeCurrentIndex}
                    loop={true}
                    muted={true}
                    controls={true}
                  />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-black text-white">
                  Vidéo non disponible
                </div>
              )}

              {/* Overlay Content */}
              <div className="pointer-events-none absolute inset-0 flex">
                {/* Left Side - User Info */}
                <div className="pointer-events-auto flex flex-1 flex-col justify-end p-4 sm:p-6 pb-20 sm:pb-24">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={reelProfile.avatar_url || getDefaultAvatar(reelProfile.profile_type)}
                      alt={reelProfile.username || ""}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white object-cover cursor-pointer"
                      onClick={() => navigate(`/profile/${reelProfile.username || ""}`)}
                    />
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">
                        {reelProfile.username || ""}
                      </p>
                    </div>
                  </div>
                  <p className="text-white text-sm sm:text-base max-w-md">
                    {reel.description || reel.title || ""}
                  </p>
                </div>

                {/* Right Side - Action Buttons */}
                <div className="pointer-events-auto flex flex-col items-center justify-end gap-4 sm:gap-6 p-4 sm:p-6 pb-20 sm:pb-24">
                  {/* Like */}
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => handleLike(reel.id)}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
                    >
                      <Heart
                        className={`w-6 h-6 sm:w-7 sm:h-7 transition-all ${
                          reelLiked
                            ? "text-red-500 fill-red-500 scale-110"
                            : "text-white"
                        }`}
                      />
                    </button>
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {reelLikes >= 1000 ? `${(reelLikes / 1000).toFixed(1)}k` : reelLikes}
                    </span>
                  </div>

                  {/* Comment */}
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <button
                      type="button"
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
                      type="button"
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
                      type="button"
                      onClick={() => handleSave(reel.id)}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
                    >
                      <Bookmark
                        className={`w-6 h-6 sm:w-7 sm:h-7 ${
                          reelSaved ? "text-primary fill-primary" : "text-white"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
            );
          })
        )}
      </div>

      {hasPlayable && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {playableReels.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all ${
                index === safeCurrentIndex ? "w-8 bg-white" : "w-1 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Reels;
