import { useState, useRef, useEffect } from "react";
import {
  Heart,
  Bookmark,
  Pause,
  Play,
  ChevronLeft,
  Loader2,
  MoreVertical,
  Download,
  Flag,
  Trash2,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { reelService } from "@/services/reelService";
import { savedService } from "@/services/savedService";
import CommentSection from "@/components/CommentSection";
import {
  CloudflareHLSPlayer,
  streamHtmlVideoCommand,
} from "@/components/CloudflareVideoPlayer";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getDefaultAvatar } from "@/lib/avatar";
import { REEL_MAX_DURATION_SECONDS } from "@/services/streamService";
import { Button } from "@/components/ui/button";
import ReportAbuseModal from "@/components/ReportAbuseModal";
import { toast } from "@/components/ui/use-toast";
import VerifiedBadge from "@/components/VerifiedBadge";
import { IosShareIcon, RoundCommentIcon } from "@/components/PostActionIcons";
import { followService } from "@/services/followService";
import { moderationService } from "@/services/moderationService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
const Reels = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const feedFrom = searchParams.get("from");
  const feedProfileId = searchParams.get("profileId");
  const isSubFeed = feedFrom === "profile" || feedFrom === "saved";
  const [reels, setReels] = useState<any[]>([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [savedReels, setSavedReels] = useState<Set<string>>(new Set());
  const [feedTab, setFeedTab] = useState<"following" | "for-you">("for-you");
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [commentsReelId, setCommentsReelId] = useState<string | null>(null);
  const [commentRows, setCommentRows] = useState<
    { id: string; avatar: string; username: string; isVerified?: boolean; text: string; timeAgo: string }[]
  >([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [reportReelId, setReportReelId] = useState<string | null>(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [deletingReelId, setDeletingReelId] = useState<string | null>(null);
  const [pausedByUser, setPausedByUser] = useState<Record<string, boolean>>({});
  /** Play/Pause badge: hidden until user taps the reel; then shown briefly. */
  const [playbackUiVisible, setPlaybackUiVisible] = useState(false);
  const playbackUiHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoLoadStateByReel, setVideoLoadStateByReel] = useState<Record<string, "loading" | "ready" | "error">>({});

  const feedQueryKey = `${feedFrom || "all"}:${feedProfileId || "none"}:${user?.id || "anon"}`;

  // Load reels: global feed, or profile user's reels, or current user's saved reels (from URL)
  useEffect(() => {
    const loadReels = async () => {
      try {
        setLoading(true);
        let reelsData: any[] = [];

        if (feedFrom === "saved") {
          if (!user) {
            setReels([]);
            setLikedReels(new Set());
            setSavedReels(new Set());
            toast({
              title: "Connexion requise",
              description: "Connecte-toi pour voir tes reels enregistrés.",
            });
            navigate("/login", { replace: true });
            return;
          }
          const savedRows = await savedService.getSavedReels(user.id);
          reelsData = (savedRows || [])
            .map((row: { reels?: any }) => row.reels)
            .filter(Boolean);
        } else if (feedFrom === "profile" && feedProfileId) {
          reelsData = (await reelService.getReelsByUser(feedProfileId)) || [];
        } else {
          reelsData = (await reelService.getReels(50, 0)) || [];
          reelsData = reelsData
            .slice()
            .sort((a, b) => {
              const score = (r: any) => {
                const likes = Number(r.likes_count || 0);
                const comments = Number(r.comments_count || 0);
                const shares = Number(r.shares_count || 0);
                const ageHours = Math.max(
                  0,
                  (Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60)
                );
                return likes * 1 + comments * 1.8 + shares * 2.4 - ageHours * 0.05;
              };
              return score(b) - score(a);
            });
        }

        setReels(reelsData);

        const playable = reelsData.filter((r) => Boolean(String(r.cloudflare_video_id || "").trim()));
        const deepLinkedReelId = searchParams.get("reelId") || searchParams.get("reel");
        if (deepLinkedReelId && playable.length) {
          const pIdx = playable.findIndex((r) => r.id === deepLinkedReelId);
          setCurrentReelIndex(pIdx >= 0 ? pIdx : 0);
        } else {
          setCurrentReelIndex(0);
        }

        if (user && reelsData.length) {
          const likedPromises = reelsData.map((reel) => reelService.isReelLiked(user.id, reel.id));
          const savedPromises = reelsData.map((reel) => savedService.isReelSaved(user.id, reel.id));
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
        } else {
          setLikedReels(new Set());
          setSavedReels(new Set());
        }
      } catch (error) {
        console.error("Error loading reels:", error);
        toast({ title: "Erreur", description: "Impossible de charger les reels." });
      } finally {
        setLoading(false);
      }
    };

    void loadReels();
  }, [user, feedQueryKey, navigate]);

  useEffect(() => {
    if (!user) {
      setFollowingIds(new Set());
      return;
    }
    followService
      .getFollowing(user.id)
      .then((rows) => setFollowingIds(new Set((rows || []).map((row: any) => String(row.following_id)))))
      .catch(() => setFollowingIds(new Set()));
  }, [user]);

  useEffect(() => {
    const n = reels.filter((r) => Boolean(String(r.cloudflare_video_id || "").trim())).length;
    setCurrentReelIndex((i) => {
      if (n === 0) return 0;
      return i >= n ? 0 : i;
    });
  }, [reels]);

  const loadCommentsForReel = async (reelId: string) => {
    setCommentsLoading(true);
    try {
      const rows = await reelService.getReelComments(reelId);
      setCommentRows(
        (rows || []).map((c: any) => ({
          id: String(c.id),
          avatar: c.profiles?.avatar_url || "",
          username: c.profiles?.username || "Utilisateur",
          isVerified: Boolean(c.profiles?.is_verified),
          text: c.content || "",
          timeAgo: formatDistanceToNow(new Date(c.created_at), {
            addSuffix: true,
            locale: fr,
          }),
        }))
      );
    } catch (e) {
      console.error(e);
      toast({ title: "Erreur", description: "Impossible de charger les commentaires." });
    } finally {
      setCommentsLoading(false);
    }
  };

  const openComments = (reelId: string) => {
    setCommentsReelId(reelId);
    void loadCommentsForReel(reelId);
  };

  const handleAddReelComment = async (content: string) => {
    if (!user || !commentsReelId) return;
    await reelService.createReelComment(commentsReelId, user.id, content);
    setReels((prev) =>
      prev.map((r) =>
        r.id === commentsReelId
          ? { ...r, comments_count: (r.comments_count || 0) + 1 }
          : r
      )
    );
    await loadCommentsForReel(commentsReelId);
  };

  const handleLike = async (reelId: string) => {
    if (!user) {
      toast({ title: "Connexion requise", description: "Connecte-toi pour aimer ce reel." });
      return;
    }

    const wasLiked = likedReels.has(reelId);
    try {
      if (wasLiked) {
        await reelService.unlikeReel(reelId, user.id);
        setLikedReels((prev) => {
          const next = new Set(prev);
          next.delete(reelId);
          return next;
        });
        setReels((prev) =>
          prev.map((r) =>
            r.id === reelId
              ? { ...r, likes_count: Math.max(0, (r.likes_count || 0) - 1) }
              : r
          )
        );
      } else {
        await reelService.likeReel(reelId, user.id);
        setLikedReels((prev) => new Set(prev).add(reelId));
        setReels((prev) =>
          prev.map((r) =>
            r.id === reelId ? { ...r, likes_count: (r.likes_count || 0) + 1 } : r
          )
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour le j'aime." });
    }
  };

  const handleSave = async (reelId: string) => {
    if (!user) {
      toast({ title: "Connexion requise", description: "Connecte-toi pour enregistrer ce reel." });
      return;
    }

    try {
      if (savedReels.has(reelId)) {
        await savedService.unsaveReel(user.id, reelId);
        setSavedReels((prev) => {
          const next = new Set(prev);
          next.delete(reelId);
          return next;
        });
        toast({ title: "Retiré", description: "Reel retiré des enregistrements." });
      } else {
        await savedService.saveReel(user.id, reelId);
        setSavedReels((prev) => new Set(prev).add(reelId));
        toast({ title: "Enregistré", description: "Reel ajouté à tes enregistrements." });
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer ce reel." });
    }
  };

  const handleShare = async (reelId: string) => {
    const reel = reels.find((r) => r.id === reelId);
    const shareUrl = `${window.location.origin}/reels?reel=${reelId}`;

    if (user) {
      try {
        await reelService.shareReel(reelId, user.id);
      } catch (e) {
        console.error(e);
      }
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: reel?.title || "Reel",
          text: reel?.description || "",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Lien copié", description: "Le lien du reel est dans le presse-papiers." });
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") {
        console.error(e);
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast({ title: "Lien copié", description: "Le lien du reel est dans le presse-papiers." });
        } catch {
          toast({ title: "Partage", description: shareUrl });
        }
      }
    }
  };

  const togglePlayback = (reelId: string) => {
    const el = document.getElementById(`cf-reel-video-${reelId}`) as HTMLVideoElement | null;
    const currentlyPaused = el ? el.paused : Boolean(pausedByUser[reelId]);
    streamHtmlVideoCommand(el, currentlyPaused ? "play" : "pause");
    setPausedByUser((prev) => ({ ...prev, [reelId]: !currentlyPaused }));
  };

  const revealPlaybackUi = () => {
    if (playbackUiHideTimerRef.current) {
      clearTimeout(playbackUiHideTimerRef.current);
      playbackUiHideTimerRef.current = null;
    }
    setPlaybackUiVisible(true);
    playbackUiHideTimerRef.current = setTimeout(() => {
      setPlaybackUiVisible(false);
      playbackUiHideTimerRef.current = null;
    }, 2200);
  };

  const handleReelVideoTap = (reelId: string) => {
    togglePlayback(reelId);
    revealPlaybackUi();
  };

  const handleDownloadReel = (cloudflareVideoId: string) => {
    const id = String(cloudflareVideoId || "").trim();
    if (!id) return;
    window.open(`https://videodelivery.net/${id}/downloads/default.mp4`, "_blank", "noopener,noreferrer");
    toast({
      title: "Téléchargement",
      description: "Si rien ne s’ouvre, les téléchargements peuvent être désactivés pour cette vidéo.",
    });
  };

  const handleDeleteReel = async (reelId: string) => {
    if (!user) return;
    if (!window.confirm("Supprimer ce reel définitivement ?")) return;
    if (deletingReelId) return;
    setDeletingReelId(reelId);
    try {
      await reelService.deleteReel(reelId, user.id);
      const next = reels.filter((r) => r.id !== reelId);
      const playableCount = next.filter((r) => Boolean(String(r.cloudflare_video_id || "").trim())).length;
      setReels(next);
      setCurrentReelIndex((idx) => (playableCount === 0 ? 0 : Math.min(idx, playableCount - 1)));
      setLikedReels((s) => {
        const n = new Set(s);
        n.delete(reelId);
        return n;
      });
      setSavedReels((s) => {
        const n = new Set(s);
        n.delete(reelId);
        return n;
      });
      toast({ title: "Reel supprimé", description: "Le reel a été supprimé." });
    } catch (e) {
      console.error(e);
      toast({ title: "Erreur", description: "Impossible de supprimer ce reel." });
    } finally {
      setDeletingReelId(null);
    }
  };

  const submitReelReport = async (payload: { reason: string; details: string }) => {
    if (!reportReelId) return;
    if (!user) {
      toast({ title: "Connexion requise", description: "Connecte-toi pour signaler un contenu." });
      return;
    }
    setReportSubmitting(true);
    try {
      await moderationService.reportReel(reportReelId, user.id, payload.reason, payload.details);
      setReportReelId(null);
      toast({ title: "Signalement envoyé", description: "Merci, nous examinerons ce contenu." });
    } catch (e) {
      console.error(e);
      toast({ title: "Erreur", description: "Impossible d’envoyer le signalement." });
    } finally {
      setReportSubmitting(false);
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

  const visibleReels =
    !isSubFeed && feedTab === "following"
      ? reels.filter((reel) => followingIds.has(String(reel.user_id)))
      : reels;
  const playableReels = visibleReels.filter((reel) => Boolean(String(reel.cloudflare_video_id || "").trim()));
  useEffect(() => {
    setCurrentReelIndex(0);
  }, [feedTab]);

  const subFeedTitle =
    feedFrom === "saved"
      ? "Reels enregistrés"
      : feedFrom === "profile"
      ? `Reels de ${playableReels[0]?.profiles?.username ? `@${playableReels[0].profiles.username}` : "ce profil"}`
      : "";

  const activePlayableReelId =
    playableReels.length > 0
      ? playableReels[Math.min(currentReelIndex, playableReels.length - 1)]?.id
      : undefined;

  useEffect(() => {
    const activeReelId = activePlayableReelId;
    if (!activeReelId) return;
    const current = searchParams.get("reelId") || searchParams.get("reel");
    if (current === activeReelId) return;
    const next = new URLSearchParams(searchParams);
    next.set("reelId", activeReelId);
    if (next.has("reel")) next.delete("reel");
    setSearchParams(next, { replace: true });
  }, [activePlayableReelId, searchParams, setSearchParams]);

  useEffect(() => {
    setPlaybackUiVisible(false);
    if (playbackUiHideTimerRef.current) {
      clearTimeout(playbackUiHideTimerRef.current);
      playbackUiHideTimerRef.current = null;
    }
  }, [activePlayableReelId]);

  useEffect(
    () => () => {
      if (playbackUiHideTimerRef.current) {
        clearTimeout(playbackUiHideTimerRef.current);
        playbackUiHideTimerRef.current = null;
      }
    },
    []
  );

  useEffect(() => {
    const list = reels.filter((r) => Boolean(String(r.cloudflare_video_id || "").trim()));
    if (!list.length) return;
    const idx = Math.min(currentReelIndex, list.length - 1);
    list.forEach((r, i) => {
      if (i === idx) return;
      const el = document.getElementById(`cf-reel-video-${r.id}`) as HTMLVideoElement | null;
      streamHtmlVideoCommand(el, "pause");
    });
  }, [currentReelIndex, reels]);

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
        {!isSubFeed ? (
          <div className="absolute left-1/2 top-4 z-30 flex -translate-x-1/2 items-center gap-2 text-[15px] font-semibold">
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  navigate("/login");
                  return;
                }
                setFeedTab("following");
              }}
              className={`rounded-full border-2 px-4 py-1.5 transition ${
                feedTab === "following"
                  ? "border-white bg-white text-black"
                  : "border-white bg-transparent text-white"
              }`}
            >
              Suivis
            </button>
            <button
              type="button"
              onClick={() => setFeedTab("for-you")}
              className={`rounded-full border-2 px-4 py-1.5 transition ${
                feedTab === "for-you"
                  ? "border-white bg-white text-black"
                  : "border-white bg-transparent text-white"
              }`}
            >
              Pour toi
            </button>
          </div>
        ) : null}
        {isSubFeed ? (
          <div className="absolute left-4 top-4 z-30">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full shadow-md"
              onClick={() => navigate(-1)}
              aria-label="Retour"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        ) : null}
        {isSubFeed && subFeedTitle ? (
          <div className="pointer-events-none absolute top-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {subFeedTitle}
          </div>
        ) : null}
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
            return (
          <div
            key={reel.id}
            className={`absolute inset-0 bg-background transition-transform duration-500 ${
              index === currentReelIndex
                ? "translate-y-0"
                : index < currentReelIndex
                ? "-translate-y-full"
                : "translate-y-full"
            }`}
          >
            <div className="relative mx-auto h-full min-h-0 w-full max-w-[420px] bg-black sm:max-w-[440px] md:max-w-[min(480px,100%)] lg:max-w-[520px] lg:shadow-2xl">
              {reel.cloudflare_video_id ? (
                <div className="absolute inset-0 min-h-0">
                  <CloudflareHLSPlayer
                    key={`reel-${reel.id}`}
                    videoDomId={`cf-reel-video-${reel.id}`}
                    videoId={String(reel.cloudflare_video_id).trim()}
                    className="h-full w-full min-h-0"
                    autoPlay={index === safeCurrentIndex}
                    loop={true}
                    muted={true}
                    controls={false}
                    objectFit="cover"
                    clipEndSeconds={REEL_MAX_DURATION_SECONDS}
                    onLoadStateChange={(state) =>
                      setVideoLoadStateByReel((prev) =>
                        prev[reel.id] === state ? prev : { ...prev, [reel.id]: state }
                      )
                    }
                  />
                  {videoLoadStateByReel[reel.id] !== "ready" &&
                  videoLoadStateByReel[reel.id] !== "error" ? (
                    <div className="pointer-events-none absolute inset-0 z-[14] flex items-center justify-center bg-black/25">
                      <Loader2 className="h-7 w-7 animate-spin text-white" />
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-black text-white">
                  Vidéo non disponible
                </div>
              )}

              {index === safeCurrentIndex && reel.cloudflare_video_id ? (
                <>
                  {/* Full-area tap (padding reserves right rail + bottom); sits under UI chrome z-20 */}
                  <div className="pointer-events-none absolute inset-0 z-[15] pr-[4.5rem] pb-24 pt-12 sm:pr-24 sm:pb-28 sm:pt-14">
                    <button
                      type="button"
                      aria-label={pausedByUser[reel.id] ? "Lecture" : "Pause"}
                      className="pointer-events-auto h-full w-full cursor-pointer border-0 bg-transparent touch-manipulation"
                      onClick={() => handleReelVideoTap(reel.id)}
                    />
                  </div>
                  {playbackUiVisible ? (
                    <div
                      className="pointer-events-none absolute inset-0 z-[35] flex items-center justify-center"
                      aria-hidden
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm transition-opacity duration-200">
                        {pausedByUser[reel.id] ? (
                          <Play className="h-7 w-7 fill-white" />
                        ) : (
                          <Pause className="h-7 w-7" />
                        )}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}

              {/* Profile + actions: absolute strips so they don’t cover the whole reel (tap layer stays usable) */}
              <div className="pointer-events-none absolute inset-0 z-[20]">
                <div className="pointer-events-auto absolute bottom-0 left-0 z-[21] max-w-[min(calc(100%-5.5rem),24rem)] p-4 pb-20 sm:p-6 sm:pb-24">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={reelProfile.avatar_url || getDefaultAvatar(reelProfile.profile_type)}
                      alt={reelProfile.username || ""}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white object-cover cursor-pointer"
                      onClick={() => navigate(`/profile/${reelProfile.username || ""}`)}
                    />
                    <div className="flex min-w-0 items-center gap-1">
                      <p className="truncate text-sm font-semibold text-white sm:text-base">
                        {reelProfile.username || ""}
                      </p>
                      <VerifiedBadge verified={reelProfile.is_verified} className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                            aria-label="Plus d'options"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          {!(user && reel.user_id === user.id) ? (
                            <DropdownMenuItem onClick={() => setReportReelId(reel.id)}>
                              <Flag className="mr-2 h-4 w-4" />
                              Signaler
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem onClick={() => handleDownloadReel(String(reel.cloudflare_video_id))}>
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </DropdownMenuItem>
                          {user && reel.user_id === user.id ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                disabled={deletingReelId === reel.id}
                                className="text-destructive focus:text-destructive"
                                onClick={() => void handleDeleteReel(reel.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {deletingReelId === reel.id ? "Suppression..." : "Supprimer"}
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="text-white text-sm sm:text-base max-w-md">
                    {reel.description || reel.title || ""}
                  </p>
                </div>

                <div className="pointer-events-auto absolute bottom-0 right-0 z-[21] flex flex-col items-center justify-end gap-4 p-4 pb-20 sm:gap-6 sm:p-6 sm:pb-24">
                  {/* Like */}
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => handleLike(reel.id)}
                      className="flex items-center justify-center p-1 text-white transition-transform active:scale-90"
                    >
                      <Heart
                        className={`h-7 w-7 transition-all sm:h-8 sm:w-8 ${
                          reelLiked
                            ? "text-red-500 fill-red-500 scale-110"
                            : "text-white"
                        }`}
                        strokeWidth={1.8}
                      />
                    </button>
                  </div>

                  {/* Comment */}
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => openComments(reel.id)}
                      className="flex items-center justify-center p-1 text-white transition-transform active:scale-90"
                    >
                      <RoundCommentIcon className="h-7 w-7 sm:h-8 sm:w-8" />
                    </button>
                  </div>

                  {/* Share */}
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => handleShare(reel.id)}
                      className="flex items-center justify-center p-1 text-white transition-transform active:scale-90"
                    >
                      <IosShareIcon className="h-7 w-7 sm:h-8 sm:w-8" />
                    </button>
                  </div>

                  {/* Save */}
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => handleSave(reel.id)}
                      className="flex items-center justify-center p-1 text-white transition-transform active:scale-90"
                    >
                      <Bookmark
                        className={`h-7 w-7 sm:h-8 sm:w-8 ${
                          reelSaved ? "text-primary fill-primary" : "text-white"
                        }`}
                        strokeWidth={1.8}
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

      <Dialog
        open={Boolean(commentsReelId)}
        onOpenChange={(open) => {
          if (!open) {
            setCommentsReelId(null);
            setCommentRows([]);
          }
        }}
      >
        <DialogContent className="flex max-h-[90dvh] flex-col gap-0 p-0 sm:max-w-lg">
          <DialogHeader className="border-b border-border px-4 py-3 text-left">
            <DialogTitle>Commentaires</DialogTitle>
          </DialogHeader>
          {!user ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              Connecte-toi pour laisser un commentaire.
            </p>
          ) : commentsLoading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">Chargement…</div>
          ) : (
            <CommentSection comments={commentRows} onAddComment={handleAddReelComment} />
          )}
        </DialogContent>
      </Dialog>

      <ReportAbuseModal
        isOpen={Boolean(reportReelId)}
        onClose={() => setReportReelId(null)}
        title="Report this post"
        submitting={reportSubmitting}
        onSubmit={submitReelReport}
      />
    </div>
  );
};

export default Reels;
