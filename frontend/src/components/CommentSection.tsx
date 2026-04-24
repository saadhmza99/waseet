import { useState } from "react";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDefaultAvatar } from "@/lib/avatar";

interface Comment {
  id: string | number;
  avatar: string;
  username: string;
  text: string;
  timeAgo: string;
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment?: (content: string) => Promise<void>;
  postId?: string;
}

const CommentSection = ({ comments: initialComments, onAddComment }: CommentSectionProps) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (onAddComment) {
        await onAddComment(newComment.trim());
        setNewComment("");
        // Comments will be updated by parent component
      } else {
        // Fallback for local state
        setComments([
          ...comments,
          {
            id: Date.now(),
            avatar: "",
            username: "Vous",
            text: newComment.trim(),
            timeAgo: "À l'instant",
          },
        ]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-300px)] sm:h-[calc(100vh-350px)]">
      {/* Comments List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3 py-3 border-b border-border last:border-b-0">
            <button
              onClick={() => handleProfileClick(c.username)}
              className="flex-shrink-0 mt-0.5 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img 
                src={c.avatar || getDefaultAvatar("craftsman")} 
                alt={c.username} 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" 
              />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <button
                  onClick={() => handleProfileClick(c.username)}
                  className="font-semibold text-sm sm:text-base text-card-foreground hover:opacity-80 transition-opacity text-left"
                >
                  {c.username}
                </button>
                <span className="text-xs sm:text-sm text-muted-foreground">{c.timeAgo}</span>
              </div>
              <p className="text-sm sm:text-base text-card-foreground leading-relaxed">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment Input - Sticky at bottom */}
      <div className="sticky bottom-0 bg-card border-t border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Ajouter un commentaire..."
            className="flex-1 bg-secondary text-card-foreground placeholder:text-muted-foreground text-sm sm:text-base px-4 py-2.5 sm:py-3 rounded-full outline-none focus:ring-2 focus:ring-accent"
            autoFocus
        />
          <button
            onClick={handleSubmit}
            className="text-accent hover:opacity-70 transition-opacity p-2 disabled:opacity-50"
            disabled={!newComment.trim() || isSubmitting}
          >
            <Send className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
