import { useState, useRef, useEffect } from "react";
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Sparkles, X, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CommentSection from "./CommentSection";
import { useAuth } from "@/contexts/AuthContext";
import { postService } from "@/services/postService";
import { savedService } from "@/services/savedService";
import { commentService } from "@/services/commentService";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface FeedPostProps {
  postId?: string;
  avatar: string;
  username: string;
  location: string;
  timeAgo: string;
  title: string;
  description?: string;
  beforeImage?: string;
  afterImage?: string;
  singleImage?: string;
  images?: string[]; // New prop for multiple images
  likes: number;
  comments: number;
  shares: number;
  isSponsored?: boolean;
}

const FeedPost = ({
  postId,
  avatar,
  username,
  location,
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
  isSponsored = false,
}: FeedPostProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [commentCount, setCommentCount] = useState(comments);
  const [shareCount, setShareCount] = useState(shares);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const commentsModalRef = useRef<HTMLDivElement>(null);
  const postPreviewRef = useRef<HTMLDivElement>(null);

  // Check if post is liked/saved on mount
  useEffect(() => {
    if (postId && user) {
      // Check saved status
      savedService.isPostSaved(user.id, postId).then(setIsSaved);
      // TODO: Check liked status from post_likes table
    }
  }, [postId, user]);
  
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
  const hasMoreThanTwoImages = allImages.length > 2;
  const displayedImages = hasMoreThanTwoImages && !showAllImages ? allImages.slice(0, 2) : allImages;

  const handleProfileClick = () => {
    navigate(`/profile/${username}`);
  };

  const [postComments, setPostComments] = useState<any[]>([]);

  // Load comments when modal opens
  useEffect(() => {
    if (showComments && postId) {
      commentService.getPostComments(postId).then(setPostComments).catch(console.error);
    }
  }, [showComments, postId]);

  const handleLike = async () => {
    if (!postId || !user) return;
    
    try {
      if (liked) {
        await postService.unlikePost(postId, user.id);
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      } else {
        await postService.likePost(postId, user.id);
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleShare = async () => {
    if (!postId || !user) return;
    
    try {
      await postService.sharePost(postId, user.id);
      setShareCount((c) => c + 1);
      
      // Also try native share
      if (navigator.share) {
        navigator.share({
          title: title,
          text: description,
          url: window.location.href,
        });
      }
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  const handleSave = async () => {
    if (!postId || !user) return;
    
    try {
      if (isSaved) {
        await savedService.unsavePost(user.id, postId);
        setIsSaved(false);
      } else {
        await savedService.savePost(user.id, postId);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!postId || !user) return;
    
    try {
      const newComment = await commentService.createPostComment(postId, user.id, content);
      setPostComments((prev) => [...prev, newComment]);
      setCommentCount((c) => c + 1);
    } catch (error) {
      console.error("Error adding comment:", error);
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

  return (
    <article className="bg-card border-b border-border mb-4 sm:mb-6">
      {/* User Info */}
      <div className="flex items-center justify-between px-2 sm:px-4 md:px-6 lg:px-8 pt-3 pb-2">
        <button 
          onClick={handleProfileClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0"
        >
          <img src={avatar} alt={username} className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm sm:text-base md:text-lg text-card-foreground truncate">{username}</p>
              {isSponsored && (
                <div className="flex items-center gap-1 bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[10px] font-semibold uppercase">Sponsorisé</span>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{location} · actif {timeAgo}</p>
          </div>
        </button>
        <button className="text-muted-foreground hover:opacity-70 transition-opacity ml-2">
          <MoreHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <h3 className="px-2 sm:px-4 md:px-6 lg:px-8 pb-2 font-bold text-base sm:text-lg md:text-xl text-card-foreground">{title}</h3>

      {description && (
        <div className="px-2 sm:px-4 md:px-6 lg:px-8 pb-3">
          <p className="text-sm sm:text-base text-card-foreground leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>
      )}

      {allImages.length > 0 && (
        <div className="px-2 sm:px-4 md:px-6 lg:px-8 pb-3">
          <div
            className={`flex gap-1 sm:gap-2 ${
              hasMultipleImages && allImages.length === 2
                ? "flex-row"
                : hasMultipleImages && allImages.length > 2 && !showAllImages
                ? "flex-row"
                : hasMultipleImages && showAllImages
                ? "flex-row overflow-x-auto cursor-grab active:cursor-grabbing"
                : "flex-col"
            }`}
            style={hasMultipleImages && showAllImages ? { scrollSnapType: "x mandatory" } : {}}
          >
            {displayedImages.map((image, index) => (
              <div
                key={index}
                className={`relative ${
                  hasMultipleImages && allImages.length === 2
                    ? "w-1/2"
                    : hasMultipleImages && allImages.length > 2 && !showAllImages
                    ? "w-1/2"
                    : hasMultipleImages && showAllImages
                    ? "flex-shrink-0 w-full sm:w-[80%] md:w-[70%] lg:w-[60%]"
                    : "w-full"
                }`}
                style={hasMultipleImages && showAllImages ? { scrollSnapAlign: "start" } : {}}
              >
                <img
                  src={image}
                  alt={`${title} - Image ${index + 1}`}
                  className={`w-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${
                    hasMultipleImages && allImages.length === 2
                      ? "h-64 sm:h-80 md:h-96 lg:h-[500px]"
                      : hasMultipleImages && allImages.length > 2 && !showAllImages
                      ? "h-64 sm:h-80 md:h-96 lg:h-[500px]"
                      : hasMultipleImages && showAllImages
                      ? "h-56 sm:h-64 md:h-72 lg:h-80"
                      : "h-64 sm:h-80 md:h-96 lg:h-[500px]"
                  }`}
                  onClick={() => {
                    if (hasMoreThanTwoImages && !showAllImages) {
                      setShowAllImages(true);
                    } else {
                      setSelectedImageIndex(index);
                    }
                  }}
                />
                {beforeImage && afterImage && index < 2 && (
                  <span
                    className={`absolute top-2 left-2 text-xs sm:text-sm font-bold px-2 py-0.5 rounded ${
                      index === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground"
                    }`}
                  >
                    {index === 0 ? "AVANT" : "APRÈS"}
                  </span>
                )}
                {hasMultipleImages && showAllImages && (
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}/{allImages.length}
                  </div>
                )}
              </div>
            ))}
            {hasMoreThanTwoImages && !showAllImages && (
              <div className="relative w-1/2">
                <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] bg-background/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-background/70 transition-colors border-2 border-dashed border-border"
                  onClick={() => setShowAllImages(true)}
                >
                  <div className="text-center">
                    <p className="text-sm sm:text-base font-semibold text-card-foreground mb-1">
                      +{allImages.length - 2}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Montrer plus
                    </p>
                  </div>
                </div>
          </div>
            )}
          </div>
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
            <img
              src={allImages[selectedImageIndex]}
              alt={`${title} - Image ${selectedImageIndex + 1}`}
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
      <div className="flex items-center gap-4 sm:gap-6 md:gap-8 px-2 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3 border-t border-border">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-medium ${liked ? "text-accent" : "text-like"}`}
        >
          <ThumbsUp className={`w-4 h-4 sm:w-5 sm:h-5 ${liked ? "fill-accent" : ""}`} />
          {likeCount}
        </button>
        <button
          onClick={() => setShowComments(true)}
          className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-sm sm:text-base"
        >
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">{comments} Commentaires</span>
          <span className="sm:hidden">{comments}</span>
        </button>
        <button 
          onClick={handleShare}
          className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-sm sm:text-base"
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">{shareCount} Partages</span>
          <span className="sm:hidden">{shareCount}</span>
        </button>
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-medium transition-colors ${
            isSaved ? "text-accent" : "text-muted-foreground"
          }`}
        >
          <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? "fill-accent" : ""}`} />
          <span className="hidden sm:inline">Enregistrer</span>
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
                    src={avatar}
                    alt={username}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm sm:text-base text-card-foreground">
                      {username}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {location} · actif {timeAgo}
                    </p>
                  </div>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-card-foreground mb-2">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm sm:text-base text-card-foreground leading-relaxed whitespace-pre-line mb-3">
                    {description}
                  </p>
                )}
                {allImages.length > 0 && (
                  <div className="mb-3">
                    <img
                      src={allImages[0]}
                      alt={title}
                      className="w-full max-h-96 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <CommentSection 
                comments={postComments.map((c) => ({
                  id: c.id,
                  avatar: c.profiles?.avatar_url || "",
                  username: c.profiles?.username || "",
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
    </article>
  );
};

export default FeedPost;
