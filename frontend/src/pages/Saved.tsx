import { useState, useEffect, useMemo, useRef } from "react";
import { Heart, LayoutGrid, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useVisitorGate } from "@/contexts/VisitorGateContext";
import { DesktopRailFrame } from "@/components/FeedDesktopRail";
import ListingCard from "@/components/ListingCard";
import FeedPost from "@/components/FeedPost";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProductCard } from "@/components/product/ProductCard";
import { savedService } from "@/services/savedService";
import { moderationService } from "@/services/moderationService";
import { muteService } from "@/services/muteService";
import { streamService } from "@/services/streamService";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getDefaultAvatar } from "@/lib/avatar";
import { cityFromPost } from "@/lib/feedLocation";
import { contactPhone } from "@/lib/propertyListing";
import { RetryImage } from "@/components/RetryImage";
import InfiniteScrollSentinel, { PAGE_SIZE } from "@/components/InfiniteScrollSentinel";
import type { ProductRow } from "@/services/productService";

const tabs = [
  { id: "posts", label: "Publications" },
  { id: "biens", label: "Biens" },
  { id: "projets", label: "Projets" },
  { id: "services", label: "Services" },
  { id: "produits", label: "Produits" },
] as const;

type SavedTab = (typeof tabs)[number]["id"];
type PostsView = "grid" | "reels";

const isBienPost = (post: any) =>
  post?.post_type === "property" || post?.post_type === "project";

const Saved = () => {
  const navigate = useNavigate();
  const { user, visitorUser, loading: authLoading } = useAuth();
  const { requestVisitor } = useVisitorGate();
  const [activeTab, setActiveTab] = useState<SavedTab>("posts");
  const [postsView, setPostsView] = useState<PostsView>("grid");
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [savedReels, setSavedReels] = useState<any[]>([]);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  const [savedProducts, setSavedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSaved = async () => {
      if (authLoading) return;

      const settleList = async <T,>(promise: Promise<T[] | null | undefined>, label: string) => {
        try {
          return (await promise) || [];
        } catch (error) {
          console.warn(`Favoris: ${label} unavailable`, error);
          return [] as T[];
        }
      };

      if (!user && visitorUser) {
        try {
          setLoading(true);
          const [posts, listings, reels, projects, products] = await Promise.all([
            settleList(savedService.getSavedPosts(visitorUser.id), "posts"),
            settleList(savedService.getSavedListings(visitorUser.id), "services"),
            settleList(savedService.getSavedReels(visitorUser.id), "reels"),
            settleList(savedService.getSavedProjects(visitorUser.id), "projets"),
            settleList(savedService.getSavedProducts(visitorUser.id), "produits"),
          ]);
          setSavedPosts(posts);
          setSavedListings(listings);
          setSavedReels(reels);
          setSavedProjects(projects);
          setSavedProducts(products);
        } catch (error) {
          console.error("Error loading saved items:", error);
        } finally {
          setLoading(false);
        }
        return;
      }

      if (!user) {
        setSavedPosts([]);
        setSavedListings([]);
        setSavedReels([]);
        setSavedProjects([]);
        setSavedProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [posts, listings, reels, projects, products, blockedIds, mutedIds] = await Promise.all([
          settleList(savedService.getSavedPosts(user.id), "posts"),
          settleList(savedService.getSavedListings(user.id), "services"),
          settleList(savedService.getSavedReels(user.id), "reels"),
          settleList(savedService.getSavedProjects(user.id), "projets"),
          settleList(savedService.getSavedProducts(user.id), "produits"),
          moderationService.getBlockedUserIds(user.id).catch(() => [] as string[]),
          muteService.getMutedIds(user.id).catch(() => ({ posts: new Set<string>(), services: new Set<string>() })),
        ]);
        const blockedSet = new Set(blockedIds || []);
        setSavedPosts(
          posts.filter(
            (item) => !blockedSet.has(item.posts?.user_id) && !mutedIds.posts.has(item.posts?.user_id)
          )
        );
        setSavedListings(
          listings.filter(
            (item) => !blockedSet.has(item.listings?.user_id) && !mutedIds.services.has(item.listings?.user_id)
          )
        );
        setSavedReels(reels.filter((item) => !blockedSet.has(item.reels?.user_id)));
        setSavedProjects(projects.filter((item) => !blockedSet.has(item.projects?.user_id)));
        setSavedProducts(
          products.filter(
            (item) => !blockedSet.has(item.products?.user_id) && !mutedIds.services.has(item.products?.user_id)
          )
        );
      } catch (error) {
        console.error("Error loading saved items:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSaved();
  }, [user, visitorUser, authLoading]);

  const needsVisitorForm = !authLoading && !user && !visitorUser;
  const promptedRef = useRef(false);

  useEffect(() => {
    if (!needsVisitorForm || promptedRef.current) return;
    promptedRef.current = true;
    void requestVisitor();
  }, [needsVisitorForm, requestVisitor]);

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
  const projectRows = useMemo(
    () => savedProjects.map((saved) => saved.projects).filter(Boolean),
    [savedProjects]
  );
  const productRows = useMemo(
    () => savedProducts.map((saved) => saved.products).filter(Boolean) as ProductRow[],
    [savedProducts]
  );

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab, postsView]);

  const activeTotal =
    activeTab === "posts"
      ? postsView === "reels"
        ? savedReels.length
        : regularPosts.length
      : activeTab === "biens"
        ? bienPosts.length
        : activeTab === "projets"
          ? projectRows.length
          : activeTab === "produits"
            ? productRows.length
            : savedListings.length;

  const revealMore = () => {
    if (revealing) return;
    setRevealing(true);
    window.setTimeout(() => {
      setVisibleCount((count) => count + PAGE_SIZE);
      setRevealing(false);
    }, 400);
  };

  const tabCounts: Record<SavedTab, number> = {
    posts: regularPosts.length,
    biens: bienPosts.length,
    projets: projectRows.length,
    services: savedListings.length,
    produits: productRows.length,
  };

  const renderFeedPost = (saved: any) => {
    const post = saved.posts;
    const profile = post?.profiles || {};
    return (
      <FeedPost
        key={post.id}
        postId={post.id}
        postUserId={post.user_id}
        avatar={profile.avatar_url || getDefaultAvatar("individual")}
        username={profile.username || ""}
        fullName={profile.full_name || ""}
        isVerified={Boolean(profile.is_verified)}
        profileType={profile.profile_type}
        location={profile.location || ""}
        city={cityFromPost(post)}
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
        phone={contactPhone(post.property_details, profile.phone)}
      />
    );
  };

  const renderServiceCard = (saved: any, compact: boolean) => {
    const listing = saved.listings;
    const profile = listing?.profiles || {};
    return (
      <ListingCard
        key={listing.id}
        id={listing.id}
        userId={listing.user_id}
        avatar={profile.avatar_url || getDefaultAvatar("individual")}
        username={profile.username || ""}
        fullName={profile.full_name || ""}
        isVerified={Boolean(profile.is_verified)}
        timeAgo={formatTimeAgo(listing.created_at)}
        image={listing.image_url || ""}
        location={listing.location}
        title={listing.title}
        profession={listing.profession}
        priceRange={listing.price_range || ""}
        compact={compact}
        initialSaved
      />
    );
  };

  if (needsVisitorForm) {
    return (
      <DesktopRailFrame className="pb-20 lg:pb-0">
      <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-16 text-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#174f43]/10">
          <Heart className="h-8 w-8 fill-[#174f43] text-[#174f43]" />
        </span>
        <h1 className="text-xl font-semibold">Vos favoris</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Laissez vos coordonnées pour ajouter des biens, projets, produits et services à vos favoris et les retrouver ici.
        </p>
        <button
          type="button"
          onClick={() => void requestVisitor()}
          className="mt-6 rounded-xl bg-[#174f43] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#123d34] active:scale-[0.98]"
        >
          Continuer
        </button>
      </div>
      </DesktopRailFrame>
    );
  }

  return (
    <DesktopRailFrame className="pb-20 lg:pb-0">
      <div className="mx-auto max-w-2xl px-2 sm:px-4 lg:mx-0 lg:max-w-none lg:px-0">
        <div className="flex min-w-0 touch-pan-x snap-x snap-mandatory overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "posts") setPostsView("grid");
              }}
              className={`inline-flex shrink-0 snap-center items-center justify-center gap-1.5 border-b-2 px-3 py-2.5 text-center transition-colors sm:flex-1 sm:px-1 ${
                activeTab === tab.id
                  ? "-mb-px border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-base font-medium tabular-nums sm:text-lg">{tabCounts[tab.id]}</span>
              <span className="whitespace-nowrap text-base font-semibold sm:text-lg">{tab.label}</span>
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
                    <div className="py-8 text-center text-muted-foreground">Aucune publication dans vos favoris</div>
                  ) : (
                    regularPosts.slice(0, visibleCount).map(renderFeedPost)
                  )}
                </div>
              )}

              {activeTab === "posts" && postsView === "reels" && (
                <div>
                  {savedReels.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">Aucune vidéo dans vos favoris</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-0.5">
                      {savedReels
                        .slice(0, visibleCount)
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
                              aria-label={reel.title || "Voir la vidéo"}
                              onClick={openInReelsViewer}
                              className="relative aspect-[3/4] overflow-hidden bg-black"
                            >
                              {reel.cloudflare_video_id ? (
                                <RetryImage
                                  src={streamService.getVideoThumbnailUrl(String(reel.cloudflare_video_id).trim())}
                                  alt={reel.title || "Vidéo"}
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
                    <div className="py-8 text-center text-muted-foreground">Aucun bien dans vos favoris</div>
                  ) : (
                    bienPosts.slice(0, visibleCount).map(renderFeedPost)
                  )}
                </div>
              )}

              {activeTab === "projets" && (
                projectRows.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">Aucun projet dans vos favoris</div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {projectRows.slice(0, visibleCount).map((row) => (
                      <ProjectCard key={row.id} row={row} />
                    ))}
                  </div>
                )
              )}

              {activeTab === "services" && (
                savedListings.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">Aucun service dans vos favoris</div>
                ) : (
                  <>
                    <div className="mx-auto flex w-[92%] max-w-[22rem] flex-col gap-2 sm:hidden">
                      {savedListings.slice(0, visibleCount).map((saved) => renderServiceCard(saved, true))}
                    </div>
                    <div className="hidden grid-cols-2 justify-items-center gap-4 sm:grid">
                      {savedListings.slice(0, visibleCount).map((saved) => renderServiceCard(saved, false))}
                    </div>
                  </>
                )
              )}

              {activeTab === "produits" && (
                productRows.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">Aucun produit dans vos favoris</div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {productRows.slice(0, visibleCount).map((row) => (
                      <ProductCard key={row.id} row={row} />
                    ))}
                  </div>
                )
              )}
              <InfiniteScrollSentinel
                hasMore={visibleCount < activeTotal}
                loading={revealing}
                onLoadMore={revealMore}
              />
            </>
          )}
        </div>
      </div>
    </DesktopRailFrame>
  );
};

export default Saved;
