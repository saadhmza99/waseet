import { useState, useEffect, useMemo } from "react";
import { LayoutGrid, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ListingCard from "@/components/ListingCard";
import FeedPost from "@/components/FeedPost";
import { savedService } from "@/services/savedService";
import { moderationService } from "@/services/moderationService";
import { muteService } from "@/services/muteService";
import { streamService } from "@/services/streamService";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getDefaultAvatar } from "@/lib/avatar";
import { RetryImage } from "@/components/RetryImage";

const tabs = [
  { id: "posts", label: "Posts" },
  { id: "biens", label: "Biens" },
  { id: "services", label: "Services" },
] as const;

type SavedTab = (typeof tabs)[number]["id"];
type PostsView = "grid" | "reels";

const isBienPost = (post: any) =>
  post?.post_type === "property" || post?.post_type === "project";

const Saved = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SavedTab>("posts");
  const [postsView, setPostsView] = useState<PostsView>("grid");
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [savedReels, setSavedReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSaved = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [posts, listings, reels, blockedIds, mutedIds] = await Promise.all([
          savedService.getSavedPosts(user.id),
          savedService.getSavedListings(user.id),
          savedService.getSavedReels(user.id),
          moderationService.getBlockedUserIds(user.id),
          muteService.getMutedIds(user.id),
        ]);
        const blockedSet = new Set(blockedIds || []);
        setSavedPosts(
          (posts || []).filter(
            (item) => !blockedSet.has(item.posts?.user_id) && !mutedIds.posts.has(item.posts?.user_id)
          )
        );
        setSavedListings(
          (listings || []).filter(
            (item) => !blockedSet.has(item.listings?.user_id) && !mutedIds.services.has(item.listings?.user_id)
          )
        );
        setSavedReels((reels || []).filter((item) => !blockedSet.has(item.reels?.user_id)));
      } catch (error) {
        console.error("Error loading saved items:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSaved();
  }, [user]);

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
    } catch {
      return "récemment";
    }
  };

  const regularPosts = useMemo(
    () => savedPosts.filter((saved) => saved.posts && !isBienPost(saved.posts)),
    [savedPosts]
  );
  const bienPosts = useMemo(
    () => savedPosts.filter((saved) => saved.posts && isBienPost(saved.posts)),
    [savedPosts]
  );

  const tabCounts: Record<SavedTab, number> = {
    posts: regularPosts.length,
    biens: bienPosts.length,
    services: savedListings.length,
  };

  const renderFeedPost = (saved: any) => {
    const post = saved.posts;
    const profile = post?.profiles || {};
    return (
      <FeedPost
        key={post.id}
        postId={post.id}
        postUserId={post.user_id}
        avatar={profile.avatar_url || getDefaultAvatar("craftsman")}
        username={profile.username || ""}
        isVerified={Boolean(profile.is_verified)}
        location={profile.location || ""}
        profession={profile.profession || ""}
        timeAgo={formatTimeAgo(post.created_at)}
        description={post.description}
        beforeImage={post.before_image_url}
        afterImage={post.after_image_url}
        singleImage={post.single_image_url}
        images={post.images || []}
        likes={post.likes_count || 0}
        comments={post.comments_count || 0}
        shares={post.shares_count || 0}
        postType={post.post_type}
        price={post.price}
        surface={post.surface}
        beds={post.beds}
        baths={post.baths}
      />
    );
  };

  return (
    <div className="pb-20">
      <div className="mx-auto max-w-2xl px-2 sm:px-4">
        <div className="flex min-w-0 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "posts") setPostsView("grid");
              }}
              className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 border-b-2 px-1 py-2.5 text-center transition-colors ${
                activeTab === tab.id
                  ? "-mb-px border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-base font-medium tabular-nums sm:text-lg">{tabCounts[tab.id]}</span>
              <span className="truncate text-base font-semibold sm:text-lg">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === "posts" ? (
          <div className="mb-1 flex items-center justify-center border-b border-border px-1 py-1">
            <div className="inline-flex rounded-md border border-border p-0.5">
              <button
                type="button"
                aria-label="Publications"
                onClick={() => setPostsView("grid")}
                className={`inline-flex h-7 w-8 items-center justify-center rounded-sm transition-colors ${
                  postsView === "grid"
                    ? "bg-accent/15 text-accent"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Réels"
                onClick={() => setPostsView("reels")}
                className={`inline-flex h-7 w-8 items-center justify-center rounded-sm transition-colors ${
                  postsView === "reels"
                    ? "bg-accent/15 text-accent"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Video className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : null}

        <div className="pt-3">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Chargement...</div>
          ) : (
            <>
              {activeTab === "posts" && postsView === "grid" && (
                <div className="space-y-4">
                  {regularPosts.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">Aucun post enregistré</div>
                  ) : (
                    regularPosts.map(renderFeedPost)
                  )}
                </div>
              )}

              {activeTab === "posts" && postsView === "reels" && (
                <div>
                  {savedReels.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">Aucun reel enregistré</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-0.5">
                      {savedReels
                        .filter((saved) => saved.reels?.id)
                        .map((saved) => {
                          const reel = saved.reels;
                          const openInReelsViewer = () => {
                            navigate(`/reels?from=saved&reelId=${reel.id}`);
                          };
                          return (
                            <button
                              key={saved.id ?? `${reel.id}-saved`}
                              type="button"
                              aria-label={reel.title || "Voir le reel"}
                              onClick={openInReelsViewer}
                              className="relative aspect-[3/4] overflow-hidden bg-black"
                            >
                              {reel.cloudflare_video_id ? (
                                <RetryImage
                                  src={streamService.getVideoThumbnailUrl(String(reel.cloudflare_video_id).trim())}
                                  alt={reel.title || "Reel"}
                                  compact
                                  wrapClassName="h-full w-full"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                                  Indisponible
                                </div>
                              )}
                              <span className="absolute bottom-1.5 right-1.5 text-white drop-shadow">
                                <Video className="h-4 w-4" />
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "biens" && (
                <div className="space-y-4">
                  {bienPosts.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">Aucun bien enregistré</div>
                  ) : (
                    bienPosts.map(renderFeedPost)
                  )}
                </div>
              )}

              {activeTab === "services" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {savedListings.length === 0 ? (
                    <div className="col-span-full py-8 text-center text-muted-foreground">
                      Aucun service enregistré
                    </div>
                  ) : (
                    savedListings.map((saved) => {
                      const listing = saved.listings;
                      const profile = listing?.profiles || {};
                      return (
                        <ListingCard
                          key={listing.id}
                          id={listing.id}
                          userId={listing.user_id}
                          avatar={profile.avatar_url || getDefaultAvatar("craftsman")}
                          username={profile.username || ""}
                          isVerified={Boolean(profile.is_verified)}
                          timeAgo={formatTimeAgo(listing.created_at)}
                          image={listing.image_url || ""}
                          location={listing.location}
                          title={listing.title}
                          profession={listing.profession}
                          priceRange={listing.price_range || ""}
                        />
                      );
                    })
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Saved;
