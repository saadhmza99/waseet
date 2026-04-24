import { useState, useEffect } from "react";
import ListingCard from "@/components/ListingCard";
import FeedPost from "@/components/FeedPost";
import { CloudflareVideoPlayer } from "@/components/CloudflareVideoPlayer";
import { useAuth } from "@/contexts/AuthContext";
import { savedService } from "@/services/savedService";
import { moderationService } from "@/services/moderationService";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getDefaultAvatar } from "@/lib/avatar";

const tabs = ["Posts", "Annonces", "Reels"] as const;

const Saved = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Posts");
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
        const [posts, listings, reels, blockedIds] = await Promise.all([
          savedService.getSavedPosts(user.id),
          savedService.getSavedListings(user.id),
          savedService.getSavedReels(user.id),
          moderationService.getBlockedUserIds(user.id),
        ]);
        const blockedSet = new Set(blockedIds || []);
        setSavedPosts((posts || []).filter((item) => !blockedSet.has(item.posts?.user_id)));
        setSavedListings((listings || []).filter((item) => !blockedSet.has(item.listings?.user_id)));
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

  return (
    <div className="pb-20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-card-foreground mb-4 sm:mb-6">
          Enregistrés
        </h1>

        {/* Tab switcher */}
        <div className="bg-card rounded-lg border border-border mb-4 sm:mb-6">
          <div className="flex border-b border-border overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[120px] py-3 sm:py-4 text-sm sm:text-base font-semibold transition-colors border-b-2 ${
                  activeTab === tab
                    ? "text-accent border-accent"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : (
              <>
                {activeTab === "Posts" && (
                  <div className="space-y-4">
                    {savedPosts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">Aucun post enregistré</div>
                    ) : (
                      savedPosts.map((saved) => {
                        const post = saved.posts;
                        const profile = post?.profiles || {};
                        return (
                          <FeedPost
                            key={post.id}
                            postId={post.id}
                            postUserId={post.user_id}
                            avatar={profile.avatar_url || getDefaultAvatar("craftsman")}
                            username={profile.username || ""}
                            location={profile.location || ""}
                            timeAgo={formatTimeAgo(post.created_at)}
                            title={post.title}
                            description={post.description}
                            beforeImage={post.before_image_url}
                            afterImage={post.after_image_url}
                            singleImage={post.single_image_url}
                            images={post.images || []}
                            likes={post.likes_count || 0}
                            comments={post.comments_count || 0}
                            shares={post.shares_count || 0}
                          />
                        );
                      })
                    )}
                  </div>
                )}

                {activeTab === "Annonces" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {savedListings.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-muted-foreground">Aucune annonce enregistrée</div>
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

                {activeTab === "Reels" && (
                  <div>
                    {savedReels.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        Aucun reel enregistré pour le moment
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {savedReels.filter((saved) => saved.reels?.id).map((saved) => {
                          const reel = saved.reels;
                          const profile = reel.profiles || {};
                          return (
                            <div
                              key={saved.id ?? `${reel.id}-saved`}
                              className="overflow-hidden rounded-lg border border-border bg-card"
                            >
                              {reel.cloudflare_video_id ? (
                                <div className="relative aspect-[9/16] w-full max-h-[70vh] bg-black">
                                  <CloudflareVideoPlayer
                                    videoId={String(reel.cloudflare_video_id).trim()}
                                    className="h-full w-full"
                                    autoPlay={false}
                                    loop={true}
                                    muted={false}
                                    controls={true}
                                  />
                                </div>
                              ) : (
                                <div className="flex aspect-[9/16] max-h-[40vh] items-center justify-center bg-muted text-sm text-muted-foreground">
                                  Vidéo indisponible
                                </div>
                              )}
                              <div className="p-3">
                                <div className="mb-2 flex items-center gap-2">
                                  <img
                                    src={profile.avatar_url || getDefaultAvatar("craftsman")}
                                    alt=""
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                  <span className="text-sm font-medium text-card-foreground">
                                    {profile.username || "—"}
                                  </span>
                                </div>
                                <p className="font-semibold text-card-foreground">{reel.title || "Reel"}</p>
                                {reel.description ? (
                                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                    {reel.description}
                                  </p>
                                ) : null}
                                <p className="mt-2 text-xs text-muted-foreground">
                                  {formatTimeAgo(reel.created_at)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Saved;

