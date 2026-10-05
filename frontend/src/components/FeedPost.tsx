import { useState, useRef, useEffect } from "react";
import { Ban, ChevronDown, ChevronLeft, ChevronRight, EyeOff, Flag, Globe, Heart, MoreVertical, Pencil, Settings2, Sparkles, Trash2, UserCheck, UserPlus, Users, X, XCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import CommentSection from "./CommentSection";
import { useAuth } from "@/contexts/AuthContext";
import { postService, type PostCommentPermission } from "@/services/postService";
import { savedService } from "@/services/savedService";
import { commentService } from "@/services/commentService";
import { moderationService, isBlockCooldownError } from "@/services/moderationService";
import { followService } from "@/services/followService";
import { notificationService } from "@/services/notificationService";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { savedToast } from "@/lib/savedToast";
import { getDefaultAvatar } from "@/lib/avatar";
import { profileHandle } from "@/lib/profileHandle";
import { blockedAccountsToast } from "@/lib/blockedAccountsToast";
import { RetryImage } from "@/components/RetryImage";
import ReportAbuseModal from "@/components/ReportAbuseModal";
import BlockMemberModal from "@/components/BlockMemberModal";
import { TaggedText } from "@/lib/mentions";
import VerifiedBadge from "@/components/VerifiedBadge";
import { IosShareIcon, RoundCommentIcon, WhatsAppIcon } from "@/components/PostActionIcons";
import { cityFromProfileLocation } from "@/lib/feedLocation";
import { postAbsoluteUrl, postPath } from "@/lib/postUrl";
import { useVisitorGate } from "@/contexts/VisitorGateContext";
import { markFollowedNow, useFollowFeedback } from "@/lib/followFeedback";
import PrivatePostThread from "@/components/PrivatePostThread";
import { toWhatsAppNumber } from "@/lib/propertyListing";

// Likes and comments are hidden for now; flip to bring the buttons back.
const SHOW_LIKES_AND_COMMENTS = false;

interface FeedPostProps {
  postId?: string;
  postUserId?: string;
  avatar: string;
  username: string;
  fullName?: string;
  isVerified?: boolean;
  location: string;
  city?: string;
  profession?: string;
  timeAgo: string;
  title?: string;
  description?: string;
  beforeImage?: string;
  afterImage?: string;
  singleImage?: string;
  images?: string[]; // New prop for multiple images
  likes: number;
  comments: number;
  shares: number;
  showLikeCount?: boolean;
  isSponsored?: boolean;
  postType?: "standard" | "property" | "project";
  price?: string | null;
  surface?: string | null;
  beds?: number | null;
  baths?: number | null;
  phone?: string | null;
}

const FeedPost = ({
  postId,
  postUserId,
  avatar,
  username,
  fullName,
  isVerified = false,
  location,
  city,
  profession,
  timeAgo,
  title,
  description,
  beforeImage,
  afterImage,
  singleImage,
  images,
  likes,
  comments,
  shares,
  showLikeCount = false,
  isSponsored = false,
  postType = "standard",
  price,
  surface,
  beds,
  baths,
  phone,
}: FeedPostProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, visitorUser } = useAuth();
  const { requestVisitor } = useVisitorGate();
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [commentCount, setCommentCount] = useState(comments);
  const [shareCount, setShareCount] = useState(shares);
  const [isSaved, setIsSaved] = useState(false);
  const saveVersionRef = useRef(0);
  const [replyOpen, setReplyOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [viewerCaptionExpanded, setViewerCaptionExpanded] = useState(false);
  const [viewerCaptionClamped, setViewerCaptionClamped] = useState(false);
  const viewerCaptionRef = useRef<HTMLParagraphElement>(null);
  const viewerImageRef = useRef<HTMLDivElement>(null);
  const pinchStartRef = useRef<{ distance: number; midX: number; midY: number } | null>(null);
  const [pinch, setPinch] = useState<{ scale: number; x: number; y: number } | null>(null);
  const [pinchOrigin, setPinchOrigin] = useState({ x: 0, y: 0 });
  const overlayFade = pinch ? "pointer-events-none opacity-0" : "opacity-100";

  const touchGeometry = (touches: React.TouchList) => {
    const [a, b] = [touches[0], touches[1]];
    return {
      distance: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
      midX: (a.clientX + b.clientX) / 2,
      midY: (a.clientY + b.clientY) / 2,
    };
  };

  const handleViewerTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length !== 2) return;
    const start = touchGeometry(event.touches);
    const rect = viewerImageRef.current?.getBoundingClientRect();
    pinchStartRef.current = start;
    if (rect) setPinchOrigin({ x: start.midX - rect.left, y: start.midY - rect.top });
    setPinch({ scale: 1, x: 0, y: 0 });
  };

  const handleViewerTouchMove = (event: React.TouchEvent) => {
    const start = pinchStartRef.current;
    if (!start || event.touches.length !== 2) return;
    const now = touchGeometry(event.touches);
    setPinch({
      scale: Math.min(4, Math.max(1, now.distance / start.distance)),
      x: now.midX - start.midX,
      y: now.midY - start.midY,
    });
  };

  const handleViewerTouchEnd = (event: React.TouchEvent) => {
    if (!pinchStartRef.current || event.touches.length >= 2) return;
    pinchStartRef.current = null;
    setPinch(null);
  };
  const [isHidden, setIsHidden] = useState(false);
  const [commentOverride, setCommentOverride] = useState<"default" | PostCommentPermission>("default");
  const [showCommentOptions, setShowCommentOptions] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [followKnown, setFollowKnown] = useState(false);
  const { followedNow, followedAuthorNow } = useFollowFeedback(postUserId, postId);
  const [displayDescription, setDisplayDescription] = useState(description || "");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockSubmitting, setBlockSubmitting] = useState(false);
  const commentsModalRef = useRef<HTMLDivElement>(null);
  const postPreviewRef = useRef<HTMLDivElement>(null);
  const isOwnPost = Boolean(user && postUserId && user.id === postUserId);
  const viewerId = user?.id ?? visitorUser?.id ?? null;
  const openReply = async () => {
    if (!viewerId) {
      const actor = await requestVisitor("comment");
      if (!actor) return;
    }
    setReplyOpen(true);
  };
  const postHref = postId ? postPath(postId) : "";
  const isStandalonePost = Boolean(postId && pathname === postHref);
  const displayName = (fullName || "").trim() || username;

  useEffect(() => {
    setDisplayDescription(description || "");
  }, [description]);

  const viewerOpen = selectedImageIndex !== null;

  useEffect(() => {
    if (!viewerOpen) {
      setViewerCaptionExpanded(false);
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [viewerOpen]);

  useEffect(() => {
    const el = viewerCaptionRef.current;
    if (!viewerOpen || !el || viewerCaptionExpanded) return;
    setViewerCaptionClamped(el.scrollHeight > el.clientHeight + 1);
  }, [viewerOpen, viewerCaptionExpanded, displayDescription]);

  // Check if post is liked/saved on mount
  useEffect(() => {
    if (!postId) return;
    const saverId = user?.id ?? visitorUser?.id;
    const version = saveVersionRef.current;
    if (saverId) {
      savedService.isPostSaved(saverId, postId).then((saved) => {
        if (saveVersionRef.current === version) setIsSaved(saved);
      });
    } else {
      setIsSaved(false);
    }
    if (user) postService.isPostLiked(postId, user.id).then(setLiked);
  }, [postId, user, visitorUser]);

  useEffect(() => {
    setLikeCount(likes);
    setCommentCount(comments);
    setShareCount(shares);
  }, [likes, comments, shares, postId]);

  useEffect(() => {
    if (!postId || !isOwnPost) return;
    postService
      .getPostCommentOverride(postId)
      .then((permission) => setCommentOverride(permission || "default"))
      .catch(console.error);
  }, [postId, isOwnPost]);

  const followerId = user?.id ?? visitorUser?.id;

  useEffect(() => {
    if (!followerId || !postUserId || isOwnPost) {
      setIsFollowingAuthor(false);
      setFollowKnown(true);
      return;
    }
    let cancelled = false;
    setFollowKnown(false);
    followService
      .isFollowing(followerId, postUserId)
      .then((following) => {
        if (!cancelled) setIsFollowingAuthor(following);
      })
      .catch(() => {
        if (!cancelled) setIsFollowingAuthor(false);
      })
      .finally(() => {
        if (!cancelled) setFollowKnown(true);
      });
    return () => {
      cancelled = true;
    };
  }, [followerId, postUserId, isOwnPost]);
  
  // Combine all image sources into one array
  const allImages: string[] = [];
  if (images && images.length > 0) {
    allImages.push(...images);
  } else if (beforeImage && afterImage) {
    allImages.push(beforeImage, afterImage);
  } else if (singleImage) {
    allImages.push(singleImage);
  }
  
  const hasMultipleImages = allImages.length > 1;
  const postCity = (city || "").trim() || cityFromProfileLocation(location);
  const businessLine = [profession?.trim(), postCity].filter(Boolean).join(" · ");

  const handleProfileClick = () => {
    const slug = (username || "").replace(/^@/, "").trim();
    navigate(`/profile/${encodeURIComponent(slug)}?tab=posts`);
  };

  const [postComments, setPostComments] = useState<any[]>([]);

  // Load comments when modal opens
  useEffect(() => {
    if (showComments && postId) {
      commentService.getPostComments(postId).then(setPostComments).catch(console.error);
    }
  }, [showComments, postId]);

  const handleLike = async () => {
    if (!postId || !user) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour aimer ce post." });
      return;
    }
    
    try {
      if (liked) {
        await postService.unlikePost(postId, user.id);
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      } else {
        const inserted = await postService.likePost(postId, user.id);
        if (!inserted) {
          setLiked(true);
          return;
        }
        setLiked(true);
        setLikeCount((c) => c + 1);
        if (postUserId && postUserId !== user.id) {
          await notificationService.createNotification({
            actorUserId: user.id,
            targetUserId: postUserId,
            type: "post_like",
            entityType: "post",
            entityId: postId,
            message: "a aimé votre post.",
          });
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleShare = async () => {
    if (!postId) return;

    const shareUrl = postAbsoluteUrl(postId);
    if (navigator.share) {
      void navigator.share({ title: "Sifarah", text: description, url: shareUrl }).catch(() => {});
    } else {
      void navigator.clipboard.writeText(shareUrl);
      toast({ title: "Lien copié", description: "Le lien de ce post a été copié." });
    }

    if (!user) return;
    try {
      const inserted = await postService.sharePost(postId, user.id);
      if (inserted) {
        setShareCount((c) => c + 1);
      }
      if (postUserId && postUserId !== user.id) {
        await notificationService.createNotification({
          actorUserId: user.id,
          targetUserId: postUserId,
          type: "post_share",
          entityType: "post",
          entityId: postId,
          message: "a partagé votre post.",
        });
      }
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  const handleSave = async () => {
    if (!postId) return;

    const saver = await requestVisitor();
    if (!saver) return;
    saveVersionRef.current += 1;

    try {
      if (isSaved) {
        await savedService.unsavePost(saver.id, postId);
        saveVersionRef.current += 1;
        setIsSaved(false);
      } else {
        await savedService.savePost(saver.id, postId);
        saveVersionRef.current += 1;
        setIsSaved(true);
        if (!user) {
          savedToast();
        } else if (postUserId && postUserId !== user.id) {
          await notificationService.createNotification({
            actorUserId: user.id,
            targetUserId: postUserId,
            type: "post_save",
            entityType: "post",
            entityId: postId,
            message: "a ajouté votre post aux favoris.",
          });
        }
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible d'ajouter ce post aux favoris." });
    }
  };

  const handleAddComment = async (content: string) => {
    if (!postId || !user) return;

    if (!isOwnPost && postUserId) {
      try {
        const permission = await postService.getCommentPermission(postId, postUserId);
        if (permission === "off") {
          toast({ title: "Commentaires désactivés", description: "Les commentaires sont désactivés pour ce post." });
          return;
        }
        if (permission === "followers") {
          const follows = await followService.isFollowing(user.id, postUserId);
          if (!follows) {
            toast({
              title: "Commentaire non autorisé",
              description: "Seuls vos abonnés peuvent commenter.",
            });
            return;
          }
        }
        if (permission === "follow_back") {
          const theyFollow = await followService.isFollowing(user.id, postUserId);
          const youFollow = await followService.isFollowing(postUserId, user.id);
          if (!theyFollow || !youFollow) {
            toast({
              title: "Commentaire non autorisé",
              description: "Seules les personnes suivies en retour peuvent commenter ce post.",
            });
            return;
          }
        }
      } catch (error) {
        console.error("Error checking comment permission:", error);
      }
    }
    
    try {
      const newComment = await commentService.createPostComment(postId, user.id, content);
      setPostComments((prev) => [...prev, newComment]);
      setCommentCount((c) => c + 1);
      if (postUserId && postUserId !== user.id) {
        await notificationService.createNotification({
          actorUserId: user.id,
          targetUserId: postUserId,
          type: "post_comment",
          entityType: "post",
          entityId: postId,
          message: "a commenté votre post.",
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeletePost = async () => {
    if (!postId || !user || !isOwnPost) return;
    if (!window.confirm("Supprimer ce post définitivement ?")) return;
    try {
      await postService.deletePost(postId, user.id);
      setIsHidden(true);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleHidePost = () => {
    setIsHidden(true);
  };

  const handleEditPost = () => {
    if (!postId || !user || !isOwnPost) return;
    const nextDescription = window.prompt("Modifier la description", displayDescription);
    if (nextDescription === null) return;
    postService
      .updatePost(postId, user.id, {
        description: nextDescription,
      })
      .then(() => {
        setDisplayDescription(nextDescription);
      })
      .catch((error) => {
        console.error("Error editing post:", error);
        toast({ title: "Erreur", description: "Impossible de modifier ce post." });
      });
  };

  const applyCommentOverride = async (value: string) => {
    if (!postId || !user || !isOwnPost) return;
    const next = value as "default" | PostCommentPermission;
    const previous = commentOverride;
    setCommentOverride(next);
    try {
      if (next === "default") {
        await postService.clearCommentPermission(postId, user.id);
      } else {
        await postService.setCommentPermission(postId, user.id, next);
      }
    } catch (error) {
      console.error("Error updating comment permission:", error);
      setCommentOverride(previous);
      toast({ title: "Erreur", description: "Impossible de mettre à jour cette option." });
    }
  };

  const handleReportPost = () => {
    if (!postId) return;
    setShowReportModal(true);
  };

  const submitPostReport = async (payload: { reason: string; details: string }) => {
    if (!user) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour signaler ce post." });
      return;
    }
    if (!postId) return;
    setReportSubmitting(true);
    try {
      await moderationService.reportPost(postId, user.id, payload.reason, payload.details);
      setShowReportModal(false);
      toast({ title: "Signalement envoyé", description: "Merci, le post a été signalé." });
    } catch (error) {
      console.error("Error reporting post:", error);
      toast({ title: "Erreur", description: "Impossible de signaler ce post pour le moment." });
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleBlockProfile = async () => {
    if (user && postUserId) {
      try {
        const until = await moderationService.getReblockBlockedUntil(user.id, postUserId);
        if (until) {
          toast({
            title: "You can't block this account again until after 48 hours.",
            description: `Available ${until.toLocaleString()}`,
          });
          return;
        }
      } catch (error) {
        console.error("Error checking block cooldown:", error);
      }
    }
    setShowBlockModal(true);
  };

  const confirmBlockProfile = async () => {
    if (!user || !postUserId) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour bloquer ce profil." });
      return;
    }
    setBlockSubmitting(true);
    try {
      await moderationService.blockUser(user.id, postUserId);
      setShowBlockModal(false);
      blockedAccountsToast(profileHandle(username));
      setIsHidden(true);
    } catch (error) {
      console.error("Error blocking profile:", error);
      toast({
        title: isBlockCooldownError(error)
          ? "You can't block this account again until after 48 hours."
          : "Erreur",
        description: isBlockCooldownError(error) ? undefined : "Impossible de bloquer ce profil pour le moment.",
      });
    } finally {
      setBlockSubmitting(false);
    }
  };

  const handleFollowAuthor = async () => {
    if (!postUserId || isOwnPost || isFollowingAuthor || followedNow) return;
    const actor = await requestVisitor();
    if (!actor) return;
    try {
      await followService.followUser(actor.id, postUserId);
      if (postId) markFollowedNow(postUserId, postId);
      setIsFollowingAuthor(true);
      if (user && user.id !== postUserId) {
        await notificationService.createNotification({
          actorUserId: user.id,
          targetUserId: postUserId,
          type: "follow",
          entityType: "profile",
          entityId: postUserId,
          message: "a commencé à vous suivre.",
        });
      }
    } catch (error) {
      console.error("Error following author:", error);
      toast({ title: "Erreur", description: "Impossible de suivre ce profil pour le moment." });
    }
  };

  // Auto-scroll to show bottom 1/5 of post and comments when modal opens
  useEffect(() => {
    if (showComments && commentsModalRef.current && postPreviewRef.current) {
      const postPreviewHeight = postPreviewRef.current.offsetHeight;
      const scrollPosition = postPreviewHeight * 0.8; // Show only bottom 20% (1/5) of post
      
      setTimeout(() => {
        if (commentsModalRef.current) {
          commentsModalRef.current.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [showComments]);

  if (isHidden) {
    return null;
  }

  return (
    <article className="mb-2 min-w-0 overflow-hidden border-b border-neutral-100 bg-white">
      {/* User Info */}
      <div className="flex items-center gap-2.5 pl-2.5 pr-3 pb-3 pt-4">
        <button onClick={handleProfileClick} className="shrink-0 hover:opacity-80 transition-opacity">
          <img src={avatar || getDefaultAvatar("individual")} alt={displayName} className="h-11 w-11 rounded-full object-cover" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1">
            <button onClick={handleProfileClick} className="min-w-0 truncate text-left text-lg font-semibold leading-tight text-neutral-950 transition-opacity hover:opacity-80">
              {displayName}
            </button>
            <VerifiedBadge verified={isVerified} className="h-[17px] w-[17px] shrink-0" />
            {isSponsored && (
              <div className="flex shrink-0 items-center gap-1 rounded bg-accent/10 px-1.5 py-0.5 text-accent">
                <Sparkles className="w-3 h-3" />
                <span className="text-sm font-semibold uppercase">Sponsorisé</span>
              </div>
            )}
          </div>
          {businessLine ? (
            <p className="truncate text-sm leading-tight text-neutral-500">{businessLine}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {!isOwnPost && followedNow ? (
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#174f43] text-white"
              aria-label="Suivi"
            >
              <UserCheck className="h-4 w-4" />
            </span>
          ) : !isOwnPost && followKnown && !isFollowingAuthor && !followedAuthorNow ? (
            <button
              type="button"
              onClick={handleFollowAuthor}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#174f43] text-white transition hover:bg-[#123d34]"
              aria-label="Suivre"
            >
              <UserPlus className="h-4 w-4" />
            </button>
          ) : null}
          <DropdownMenu onOpenChange={(open) => { if (!open) setShowCommentOptions(false); }}>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground hover:opacity-70 transition-opacity" aria-label="Plus d'options">
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" collisionPadding={12} className="w-[min(calc(100vw-1.5rem),16rem)] max-h-[min(70vh,28rem)] overflow-y-auto">
            {isOwnPost ? (
              <>
                <DropdownMenuItem onClick={handleEditPost}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier le post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeletePost} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer le post
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    setShowCommentOptions((open) => !open);
                  }}
                >
                  <Settings2 className="mr-2 h-4 w-4" />
                  Qui peut commenter
                  <ChevronDown className={`ml-auto h-4 w-4 transition ${showCommentOptions ? "rotate-180" : ""}`} />
                </DropdownMenuItem>
                {showCommentOptions ? (
                  <div className="px-1 pb-1">
                    <p className="px-2 pb-1 text-sm leading-snug text-muted-foreground">
                      This post only. 
                    </p>
                    <DropdownMenuRadioGroup value={commentOverride} onValueChange={(value) => void applyCommentOverride(value)}>
                      <DropdownMenuRadioItem value="default">
                        <Settings2 className="mr-2 h-4 w-4" />
                        Account setting
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="anyone">
                        <Globe className="mr-2 h-4 w-4" />
                        Anyone
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="followers">
                        <Users className="mr-2 h-4 w-4" />
                        Your followers
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="follow_back">
                        <UserCheck className="mr-2 h-4 w-4" />
                        Followers you follow back
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="off">
                        <XCircle className="mr-2 h-4 w-4" />
                        Off
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={handleHidePost}>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReportPost}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report post
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleBlockProfile}>
                  <Ban className="mr-2 h-4 w-4" />
                  Block profile
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>

      {postType && postType !== "standard" ? (
        <div className="px-2 sm:px-4 md:px-6 lg:px-8 pb-2">
          <span className="inline-block rounded bg-accent/10 px-2 py-0.5 text-sm font-semibold uppercase text-accent">
            {postType === "property" ? "Bien" : "Projet"}
          </span>
          {postType === "property" ? (
            <div className="mt-2 flex flex-wrap gap-3 text-base text-card-foreground">
              {price ? <span className="font-semibold">{price}</span> : null}
              {surface ? <span>{surface}{/\d/.test(surface) && !/m/i.test(surface) ? " m²" : ""}</span> : null}
              {beds != null ? <span>{beds} ch.</span> : null}
              {baths != null ? <span>{baths} sdb</span> : null}
          </div>
          ) : null}
        </div>
      ) : null}

      {displayDescription && (
        <div
            className={`min-w-0 px-2.5 pb-2 ${postId && !isStandalonePost ? "cursor-pointer" : ""}`}
          onClick={(event) => {
            if (!postId || isStandalonePost) return;
            if ((event.target as HTMLElement).closest("a,button")) return;
            navigate(postHref);
          }}
        >
          <p
            className={`text-base leading-5 text-neutral-800 whitespace-pre-wrap break-words overflow-hidden ${
              captionExpanded ? "" : "line-clamp-4"
            }`}
          >
            <TaggedText text={displayDescription} />
          </p>
          {displayDescription.length > 180 ? (
            <button
              type="button"
              onClick={() => setCaptionExpanded((v) => !v)}
              className="mt-1 text-base font-medium text-accent hover:underline"
            >
              {captionExpanded ? "Voir moins" : "Voir plus"}
            </button>
          ) : null}
        </div>
      )}

      {allImages.length > 0 && (
        <div
          className={`relative w-full gap-1 ${
            allImages.length >= 5
              ? "flex items-stretch"
              : allImages.length === 1
                ? ""
                : allImages.length === 2
                  ? "grid grid-cols-2"
                  : allImages.length === 4
                    ? "grid grid-cols-2 grid-rows-2"
                    : "grid aspect-[4/3] grid-cols-[1.6fr_1fr] grid-rows-2"
          }`}
        >
          {allImages.length >= 5 ? (
            <>
              <div className="grid aspect-[4/3] min-w-0 flex-1 grid-cols-[1.6fr_1fr] grid-rows-2 gap-1">
                {allImages.slice(0, 3).map((image, index) => (
                  <RetryImage
                    key={`${image}-${index}`}
                    src={image}
                    alt={`Photo ${index + 1}`}
                    wrapClassName={index === 0 ? "row-span-2 h-full min-h-0 w-full" : "h-full min-h-0 w-full"}
                    className="h-full w-full cursor-pointer object-cover"
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
              <div className="flex w-[26%] shrink-0 flex-col gap-1">
                {allImages.slice(3, 5).map((image, index) => (
                  <RetryImage
                    key={`${image}-${index + 3}`}
                    src={image}
                    alt={`Photo ${index + 4}`}
                    wrapClassName="min-h-0 w-full flex-1"
                    className="absolute inset-0 h-full w-full cursor-pointer object-cover"
                    onClick={() => setSelectedImageIndex(index + 3)}
                  />
                ))}
              </div>
            </>
          ) : (
            allImages.slice(0, allImages.length === 1 ? 1 : allImages.length).map((image, index) => (
              <RetryImage
                key={`${image}-${index}`}
                src={image}
                alt={`Photo ${index + 1}`}
                wrapClassName={
                  allImages.length >= 3 && allImages.length !== 4 && index === 0
                    ? "row-span-2 h-full min-h-0 w-full"
                    : allImages.length === 1
                      ? "aspect-[4/3] w-full"
                      : "aspect-[4/3] h-full min-h-0 w-full"
                }
                className="h-full w-full cursor-pointer object-cover"
                onClick={() => setSelectedImageIndex(index)}
              />
            ))
          )}
          {hasMultipleImages ? (
            <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/65 px-2 py-1 text-sm font-semibold text-white">
              1/{allImages.length}
            </span>
          ) : null}
          {beforeImage && afterImage ? (
            <span
              className="pointer-events-none absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-sm font-bold text-primary-foreground"
            >
              AVANT
            </span>
          ) : null}
        </div>
      )}

      {/* Image Modal */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black text-white">
          <div
            className="relative mx-auto flex h-full w-full max-w-2xl touch-pan-y items-center justify-center"
            onTouchStart={handleViewerTouchStart}
            onTouchMove={handleViewerTouchMove}
            onTouchEnd={handleViewerTouchEnd}
            onTouchCancel={handleViewerTouchEnd}
          >
            <div
              ref={viewerImageRef}
              className="w-full"
              style={{
                transform: pinch ? `translate(${pinch.x}px, ${pinch.y}px) scale(${pinch.scale})` : "none",
                transformOrigin: `${pinchOrigin.x}px ${pinchOrigin.y}px`,
                transition: pinch ? "none" : "transform 200ms ease-out",
              }}
            >
              <RetryImage
                src={allImages[selectedImageIndex]}
                alt={`${title} - Image ${selectedImageIndex + 1}`}
                wrapClassName="w-full"
                className="h-auto max-h-[80vh] w-full object-contain"
              />
            </div>

            <button
              type="button"
              onClick={() => setSelectedImageIndex(null)}
              className={`absolute left-4 top-[max(1rem,env(safe-area-inset-top))] z-30 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 ${overlayFade}`}
              aria-label="Fermer"
            >
              <X className="h-6 w-6" />
            </button>

            {hasMultipleImages ? (
              <span className={`absolute left-1/2 top-[max(1.25rem,env(safe-area-inset-top))] z-30 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold transition-opacity ${overlayFade}`}>
                {selectedImageIndex + 1}/{allImages.length}
              </span>
            ) : null}

            {hasMultipleImages && selectedImageIndex > 0 ? (
              <button
                type="button"
                onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
                className={`absolute left-3 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 ${overlayFade}`}
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : null}
            {hasMultipleImages && selectedImageIndex < allImages.length - 1 ? (
              <button
                type="button"
                onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
                className={`absolute right-3 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 ${overlayFade}`}
                aria-label="Image suivante"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            ) : null}

            <div className={`absolute bottom-0 left-0 z-20 max-w-[calc(100%-5rem)] bg-gradient-to-t from-black/60 to-transparent p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] transition-opacity ${overlayFade}`}>
              <div className="mb-2 flex items-center gap-3">
                <button type="button" onClick={handleProfileClick} className="shrink-0">
                  <img
                    src={avatar || getDefaultAvatar("individual")}
                    alt={displayName}
                    className="h-11 w-11 rounded-full border-2 border-white object-cover"
                  />
                </button>
                <div className="flex min-w-0 items-center gap-1">
                  <button type="button" onClick={handleProfileClick} className="truncate text-lg font-semibold">
                    {displayName}
                  </button>
                  <VerifiedBadge verified={isVerified} className="h-[17px] w-[17px]" />
                </div>
              </div>
              {displayDescription ? (
                <>
                  <p
                    ref={viewerCaptionRef}
                    className={`whitespace-pre-wrap break-words text-base leading-5 ${viewerCaptionExpanded ? "max-h-[40vh] overflow-y-auto" : "line-clamp-2"}`}
                  >
                    <TaggedText text={displayDescription} />
                  </p>
                  {viewerCaptionClamped || viewerCaptionExpanded ? (
                    <button
                      type="button"
                      onClick={() => setViewerCaptionExpanded((v) => !v)}
                      className="mt-1 text-base font-semibold text-white/80 hover:text-white"
                    >
                      {viewerCaptionExpanded ? "Voir moins" : "Voir plus"}
                    </button>
                  ) : null}
                </>
              ) : null}
            </div>

            <div className={`absolute bottom-0 right-0 z-20 flex flex-col items-center gap-5 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] transition-opacity ${overlayFade}`}>
              {SHOW_LIKES_AND_COMMENTS ? (
                <>
                  <button
                    type="button"
                    onClick={handleLike}
                    className="flex flex-col items-center gap-1 text-sm font-semibold transition-transform active:scale-90"
                    aria-label="J'aime"
                  >
                    <Heart className={`h-8 w-8 ${liked ? "fill-accent text-accent" : "text-white"}`} strokeWidth={1.8} />
                    {showLikeCount ? likeCount : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowComments(true)}
                    className="transition-transform active:scale-90"
                    aria-label="Commentaires"
                  >
                    <RoundCommentIcon className="h-8 w-8" />
                  </button>
                </>
              ) : null}
              {postUserId ? (
                <button
                  type="button"
                  onClick={() => void openReply()}
                  className="transition-transform active:scale-90"
                  aria-label="Commentaires"
                >
                  <RoundCommentIcon className="h-8 w-8" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleShare}
                className="transition-transform active:scale-90"
                aria-label="Partager"
              >
                <IosShareIcon className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="transition-transform active:scale-90"
                aria-label="Favoris"
              >
                <Heart className={`h-8 w-8 ${isSaved ? "fill-[#174f43] text-[#174f43]" : "text-white"}`} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5">
        <div className="flex items-center gap-2">
        {SHOW_LIKES_AND_COMMENTS ? (
          <>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-base font-medium transition-transform active:scale-90 ${
                liked ? "text-accent" : "text-neutral-700"
              }`}
            >
              <Heart className={`h-7 w-7 ${liked ? "fill-accent text-accent" : ""}`} strokeWidth={1.8} />
              {showLikeCount ? likeCount : null}
            </button>
            <button
              onClick={() => setShowComments(true)}
              className="flex items-center gap-1.5 text-base font-medium text-neutral-700 transition-transform active:scale-90"
            >
              <RoundCommentIcon className="h-7 w-7" />
            </button>
          </>
        ) : null}
        <button
          onClick={handleSave}
          className={`flex items-center text-base font-medium transition-colors active:scale-90 ${
            isSaved ? "text-[#174f43]" : "text-neutral-900"
          }`}
          aria-label="Favoris"
        >
          <Heart className={`h-7 w-7 ${isSaved ? "fill-[#174f43] text-[#174f43]" : ""}`} strokeWidth={1.8} />
        </button>
        {postUserId ? (
          <button
            type="button"
            onClick={() => void openReply()}
            className="text-neutral-700 transition-transform active:scale-90"
            aria-label="Commentaires"
          >
            <RoundCommentIcon className="h-7 w-7" />
          </button>
        ) : null}
        {postUserId && !isOwnPost ? (
          <button
            type="button"
            onClick={() => {
              const digits = (phone || "").replace(/\D/g, "");
              if (digits.length < 6) {
                toast({ title: "WhatsApp", description: "Ce profil n'a pas de numéro WhatsApp." });
                return;
              }
              window.open(`https://wa.me/${toWhatsAppNumber(phone || "")}`, "_blank", "noopener,noreferrer");
            }}
            className="text-neutral-900 transition-transform active:scale-90"
            aria-label="WhatsApp"
          >
            <WhatsAppIcon className="h-7 w-7" />
          </button>
        ) : null}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-muted-foreground sm:text-base">{timeAgo}</span>
          <button
            type="button"
            onClick={handleShare}
            className="text-neutral-700 transition-transform active:scale-90"
            aria-label="Partager"
          >
            <IosShareIcon className="h-7 w-7" />
          </button>
        </div>
      </div>

      <PrivatePostThread
        postId={postId}
        businessName={displayName}
        businessAvatar={avatar}
        businessPhone={phone}
        businessLine={businessLine}
        isVerified={isVerified}
        description={displayDescription}
        image={allImages[0]}
        viewerId={viewerId}
        isOwner={isOwnPost}
        open={replyOpen}
        onOpenChange={setReplyOpen}
      />

      {/* Comments Modal */}
      {showComments && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col"
          onClick={() => setShowComments(false)}
        >
          <div
            ref={commentsModalRef}
            className="flex-1 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-3xl mx-auto bg-card min-h-full">
              {/* Modal Header */}
              <div className="sticky top-0 bg-card border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-card-foreground">
                  Commentaires
                </h2>
                <button
                  onClick={() => setShowComments(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Post Preview */}
              <div ref={postPreviewRef} className="px-4 sm:px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={avatar || getDefaultAvatar("individual")}
                    alt={displayName}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-base sm:text-lg text-card-foreground">
                        {displayName}
                      </p>
                      <VerifiedBadge verified={isVerified} className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                    </div>
                    {businessLine ? (
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {businessLine}
                    </p>
                    ) : null}
                  </div>
                </div>
                {displayDescription && (
                  <p className="mb-3 text-lg leading-7 text-neutral-800 whitespace-pre-wrap break-words overflow-hidden line-clamp-6">
                    {displayDescription}
                  </p>
                )}
                {allImages.length > 0 && (
                  <div className="mb-3">
                    <RetryImage
                      src={allImages[0]}
                      alt=""
                      wrapClassName="rounded-lg"
                      className="w-full max-h-96 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <CommentSection 
                comments={postComments.map((c) => ({
                  id: c.id,
                  avatar: c.profiles?.avatar_url || getDefaultAvatar("individual"),
                  username: c.profiles?.username || "",
                  isVerified: Boolean(c.profiles?.is_verified),
                  text: c.content,
                  timeAgo: formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: fr }),
                }))}
                onAddComment={handleAddComment}
                postId={postId}
              />
            </div>
          </div>
        </div>
      )}

      <ReportAbuseModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report this post"
        submitting={reportSubmitting}
        onSubmit={submitPostReport}
      />
      <BlockMemberModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        message={`Bloquer ${profileHandle(username)} ? Vous ne verrez plus ce profil.`}
        submitting={blockSubmitting}
        onConfirm={confirmBlockProfile}
      />
    </article>
  );
};

export default FeedPost;
