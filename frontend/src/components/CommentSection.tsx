import { useState } from "react";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import avatarTony from "@/assets/avatar-tony.jpg";

interface Comment {
  id: number;
  avatar: string;
  username: string;
  text: string;
  timeAgo: string;
}

interface CommentSectionProps {
  comments: Comment[];
}

const CommentSection = ({ comments: initialComments }: CommentSectionProps) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");

  const handleProfileClick = (username: string) => {
    if (username !== "Vous") {
      navigate(`/profile/${username}`);
    }
  };

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      {
        id: Date.now(),
        avatar: avatarTony,
        username: "Vous",
        text: newComment.trim(),
        timeAgo: "À l'instant",
      },
    ]);
    setNewComment("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-300px)] sm:h-[calc(100vh-350px)]">
      {/* Comments List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3 py-3 border-b border-border last:border-b-0">
            <button
              onClick={() => handleProfileClick(c.username)}
              disabled={c.username === "Vous"}
              className={`flex-shrink-0 mt-0.5 ${c.username !== "Vous" ? "hover:opacity-80 transition-opacity cursor-pointer" : "cursor-default"}`}
            >
              <img src={c.avatar} alt={c.username} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                {c.username !== "Vous" ? (
                  <button
                    onClick={() => handleProfileClick(c.username)}
                    className="font-semibold text-sm sm:text-base text-card-foreground hover:opacity-80 transition-opacity text-left"
                  >
                    {c.username}
                  </button>
                ) : (
                  <span className="font-semibold text-sm sm:text-base text-card-foreground">{c.username}</span>
                )}
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
            className="text-accent hover:opacity-70 transition-opacity p-2"
            disabled={!newComment.trim()}
          >
            <Send className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
