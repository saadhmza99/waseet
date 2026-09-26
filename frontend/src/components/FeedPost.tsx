import { useState, useRef, useEffect } from "react";
import { Ban, Bookmark, ChevronDown, ChevronLeft, ChevronRight, EyeOff, Flag, Globe, Heart, MoreHorizontal, Pencil, Settings2, Sparkles, Trash2, UserCheck, Users, X, XCircle } from "lucide-react";
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
import { getDefaultAvatar } from "@/lib/avatar";
import { profileHandle } from "@/lib/profileHandle";
import { blockedAccountsToast } from "@/lib/blockedAccountsToast";
import { RetryImage } from "@/components/RetryImage";
import ReportAbuseModal from "@/components/ReportAbuseModal";
import BlockMemberModal from "@/components/BlockMemberModal";
import { TaggedText } from "@/lib/mentions";
import VerifiedBadge from "@/components/VerifiedBadge";
import { IosShareIcon, RoundCommentIcon } from "@/components/PostActionIcons";
import { cityFromProfileLocation } from "@/lib/feedLocation";
import { postAbsoluteUrl, postPath } from "@/lib/postUrl";

interface FeedPostProps {
  postId?: string;
  postUserId?: string;
  avatar: string;
  username: string;
  isVerified?: boolean;
  location: string;
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
}

const FeedPost = ({
  postId,
  postUserId,
  avatar,
  username,
  isVerified = false,
  location,
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
}: FeedPostProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [commentCount, setCommentCount] = useState(comments);
  const [shareCount, setShareCount] = useState(shares);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [commentOverride, setCommentOverride] = useState<"default" | PostCommentPermission>("default");
  const [showCommentOptions, setShowCommentOptions] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [displayDescription, setDisplayDescription] = useState(description || "");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockSubmitting, setBlockSubmitting] = useState(false);
  const commentsModalRef = useRef<HTMLDivElement>(null);
  const postPreviewRef = useRef<HTMLDivElement>(null);
  const isOwnPost = Boolean(user && postUserId && user.id === postUserId);
  const postHref = postId ? postPath(postId) : "";
  const isStandalonePost = Boolean(postId && pathname === postHref);

  useEffect(() => {
    setDisplayDescription(description || "");
  }, [description]);

  // Check if post is liked/saved on mount
  useEffect(() => {
    if (postId && user) {
      savedService.isPostSaved(user.id, postId).then(setIsSaved);
      postService.isPostLiked(postId, user.id).then(setLiked);
    }
  }, [postId, user]);

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

  useEffect(() => {
    if (!user || !postUserId || isOwnPost) return;
    followService
      .isFollowing(user.id, postUserId)
      .then(setIsFollowingAuthor)
      .catch(() => setIsFollowingAuthor(false));
  }, [user?.id, postUserId, isOwnPost]);
  
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
  const businessLine = [profession?.trim(), cityFromProfileLocation(location)].filter(Boolean).join(" · ");

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
    if (!postId || !user) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour partager ce post." });
      return;
    }
    
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
      
      // Also try native share of this post's unique URL
      if (postId) {
        const shareUrl = postAbsoluteUrl(postId);
        if (navigator.share) {
          void navigator.share({
            title: "Sifarah",
            text: description,
            url: shareUrl,
          });
        } else {
          void navigator.clipboard.writeText(shareUrl);
          toast({ title: "Lien copié", description: "Le lien de ce post a été copié." });
        }
      }
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  const handleSave = async () => {
    if (!postId || !user) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour enregistrer ce post." });
      return;
    }
    
    try {
      if (isSaved) {
        await savedService.unsavePost(user.id, postId);
        setIsSaved(false);
      } else {
        await savedService.savePost(user.id, postId);
        setIsSaved(true);
        if (postUserId && postUserId !== user.id) {
          await notificationService.createNotification({
            actorUserId: user.id,
            targetUserId: postUserId,
            type: "post_save",
            entityType: "post",
            entityId: postId,
            message: "a enregistré votre post.",
          });
        }
      }
    } catch (error) {
      console.error("Error toggling save:", error);
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
    if (!user || !postUserId || isOwnPost || isFollowingAuthor) return;
    try {
      await followService.followUser(user.id, postUserId);
      setIsFollowingAuthor(true);
      await notificationService.createNotification({
        actorUserId: user.id,
        targetUserId: postUserId,
        type: "follow",
        entityType: "profile",
        entityId: postUserId,
        message: "a commencé à vous suivre.",
      });
      toast({ title: "Suivi activé", description: `Vous suivez désormais ${username}.` });
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
    <article className="mx-2 mb-3 min-w-0 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* User Info */}
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button onClick={handleProfileClick} className="hover:opacity-80 transition-opacity">
            <img src={avatar || getDefaultAvatar("craftsman")} alt={username} className="h-11 w-11 flex-shrink-0 rounded-full object-cover" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <button onClick={handleProfileClick} className="truncate text-left text-[15px] font-semibold text-neutral-950 transition-opacity hover:opacity-80">
                {username}
              </button>
              <VerifiedBadge verified={isVerified} className="h-[17px] w-[17px]" />
              {isSponsored && (
                <div className="flex items-center gap-1 bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[10px] font-semibold uppercase">Sponsorisé</span>
                </div>
              )}
            </div>
            {businessLine ? (
              <p className="truncate text-xs text-neutral-500">{businessLine}</p>
            ) : null}
          </div>
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-2">
          {user && !isOwnPost && !isFollowingAuthor ? (
            <button
              type="button"
              onClick={handleFollowAuthor}
              className="rounded-full border border-neutral-200 bg-transparent px-3.5 py-1.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
            >
              Suivre
            </button>
          ) : null}
          <DropdownMenu onOpenChange={(open) => { if (!open) setShowCommentOptions(false); }}>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground hover:opacity-70 transition-opacity ml-2">
              <MoreHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
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
                    <p className="px-2 pb-1 text-[11px] leading-snug text-muted-foreground">
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
          <span className="inline-block rounded bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-accent">
            {postType === "property" ? "Bien" : "Projet"}
          </span>
          {postType === "property" ? (
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-card-foreground">
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
            className={`min-w-0 px-4 pb-2 ${postId && !isStandalonePost ? "cursor-pointer" : ""}`}
          onClick={(event) => {
            if (!postId || isStandalonePost) return;
            if ((event.target as HTMLElement).closest("a,button")) return;
            navigate(postHref);
          }}
        >
          <p
            className={`text-[15px] leading-6 text-neutral-800 whitespace-pre-wrap break-words overflow-hidden ${
              captionExpanded ? "" : "line-clamp-4"
            }`}
          >
            <TaggedText text={displayDescription} />
          </p>
          {displayDescription.length > 180 ? (
            <button
              type="button"
              onClick={() => setCaptionExpanded((v) => !v)}
              className="mt-1 text-sm font-medium text-accent hover:underline"
            >
              {captionExpanded ? "Voir moins" : "Voir plus"}
            </button>
          ) : null}
        </div>
      )}

      {allImages.length > 0 && (
        <div
          className={`relative mx-3 overflow-hidden rounded-lg ${
            allImages.length === 1
              ? ""
              : allImages.length === 2
                ? "grid grid-cols-2 gap-1"
                : "grid h-56 grid-cols-[1.6fr_1fr] grid-rows-2 gap-1 sm:h-80"
          }`}
        >
          {allImages.slice(0, allImages.length >= 3 ? 3 : 2).map((image, index) => (
            <RetryImage
              key={`${image}-${index}`}
              src={image}
              alt={`Photo ${index + 1}`}
              wrapClassName={
                allImages.length >= 3 && index === 0
                  ? "row-span-2 h-full"
                  : allImages.length === 2
                    ? "h-52 sm:h-72"
                    : "h-full"
              }
              className={
                allImages.length === 1
                  ? "max-h-[68vh] w-full cursor-pointer object-cover sm:max-h-[620px]"
                  : "h-full w-full cursor-pointer object-cover"
              }
              onClick={() => setSelectedImageIndex(index)}
            />
          ))}
          {hasMultipleImages ? (
            <span className="absolute right-2 top-2 rounded-full bg-black/65 px-2 py-1 text-[11px] font-semibold text-white">
              1/{allImages.length}
            </span>
          ) : null}
          {beforeImage && afterImage ? (
            <span
              className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground"
            >
              AVANT
            </span>
          ) : null}
        </div>
      )}

      {/* Image Modal */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 text-white hover:opacity-70 transition-opacity z-10"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {hasMultipleImages && selectedImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(selectedImageIndex - 1);
              }}
              className="absolute left-4 text-white hover:opacity-70 transition-opacity z-10 bg-black/50 rounded-full p-2"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}

          {hasMultipleImages && selectedImageIndex < allImages.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(selectedImageIndex + 1);
              }}
              className="absolute right-4 text-white hover:opacity-70 transition-opacity z-10 bg-black/50 rounded-full p-2"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}

          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <RetryImage
              src={allImages[selectedImageIndex]}
              alt={`${title} - Image ${selectedImageIndex + 1}`}
              wrapClassName="max-w-full max-h-full"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-4 py-2 rounded">
                {selectedImageIndex + 1} / {allImages.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center px-4 py-2.5">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-transform active:scale-90 ${
            liked ? "text-accent" : "text-neutral-700"
          }`}
        >
          <Heart className={`h-7 w-7 ${liked ? "fill-accent text-accent" : ""}`} strokeWidth={1.8} />
          {showLikeCount ? likeCount : null}
        </button>
        <button
          onClick={() => setShowComments(true)}
          className="ml-4 flex items-center gap-1.5 text-sm font-medium text-neutral-700 transition-transform active:scale-90"
        >
          <RoundCommentIcon className="h-7 w-7" />
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="ml-4 text-neutral-700 transition-transform active:scale-90"
          aria-label="Partager"
        >
          <IosShareIcon className="h-7 w-7" />
        </button>
        <span className="ml-auto mr-3 text-xs text-muted-foreground sm:text-sm">{timeAgo}</span>
        <button
          onClick={handleSave}
          className={`flex items-center text-sm font-medium transition-colors active:scale-90 ${
            isSaved ? "text-accent" : "text-neutral-900"
          }`}
          aria-label="Enregistrer"
        >
          <Bookmark className={`h-7 w-7 ${isSaved ? "fill-accent" : ""}`} strokeWidth={1.8} />
        </button>
      </div>

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
                <h2 className="text-lg sm:text-xl font-bold text-card-foreground">
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
                    src={avatar || getDefaultAvatar("craftsman")}
                    alt={username}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-sm sm:text-base text-card-foreground">
                        {username}
                      </p>
                      <VerifiedBadge verified={isVerified} className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                    </div>
                    {businessLine ? (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {businessLine}
                    </p>
                    ) : null}
                  </div>
                </div>
                {displayDescription && (
                  <p className="mb-3 text-[15px] leading-7 text-neutral-800 whitespace-pre-wrap break-words overflow-hidden line-clamp-6">
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
                  avatar: c.profiles?.avatar_url || getDefaultAvatar("craftsman"),
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
