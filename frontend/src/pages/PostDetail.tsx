import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import FeedPost from "@/components/FeedPost";
import { postService } from "@/services/postService";
import { getDefaultAvatar } from "@/lib/avatar";
import { Button } from "@/components/ui/button";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  useEffect(() => {
    if (!id) {
      setMissing(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setMissing(false);
    postService
      .getPostById(id)
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch(() => {
        if (!cancelled) {
          setPost(null);
          setMissing(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
    } catch {
      return "récemment";
    }
  };

  return (
    <div className="pb-20">
      <div className="sticky top-[57px] sm:top-[60px] z-40 flex items-center gap-3 border-b border-border bg-background px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => {
            const idx = typeof window.history.state?.idx === "number" ? window.history.state.idx : 0;
            if (idx > 0) {
              navigate(-1);
              return;
            }
            navigate("/");
          }}
          className="rounded-full p-2 text-card-foreground hover:bg-secondary"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-card-foreground">Post</h1>
      </div>

      <div className="mx-auto max-w-2xl px-0 sm:px-4 py-4">
        {loading ? (
          <div className="py-10 text-center text-muted-foreground">Chargement du post...</div>
        ) : missing || !post ? (
          <div className="px-4 py-10 text-center">
            <p className="mb-4 text-muted-foreground">Ce post est introuvable.</p>
            <Button onClick={() => navigate("/")}>Retour au fil</Button>
          </div>
        ) : (
          <FeedPost
            postId={post.id}
            postUserId={post.user_id}
            avatar={post.profiles?.avatar_url || getDefaultAvatar("craftsman")}
            username={post.profiles?.username || "Utilisateur"}
            location={post.profiles?.location || ""}
            timeAgo={formatTimeAgo(post.created_at)}
            title={post.title || "Post"}
            description={post.description}
            beforeImage={post.before_image_url}
            afterImage={post.after_image_url}
            singleImage={post.single_image_url}
            images={post.images || []}
            likes={post.likes_count || 0}
            comments={post.comments_count || 0}
            shares={post.shares_count || 0}
            isSponsored={post.is_sponsored || false}
            postType={post.post_type}
            price={post.price}
            surface={post.surface}
            beds={post.beds}
            baths={post.baths}
          />
        )}
      </div>
    </div>
  );
};

export default PostDetail;
