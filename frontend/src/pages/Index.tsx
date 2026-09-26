import { useState, useEffect, useRef, type ReactElement } from "react";
import { Building2, LayoutGrid } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import FeedPost from "@/components/FeedPost";
import CreatePost from "@/components/CreatePost";
import SponsoredBanner from "@/components/SponsoredBanner";
import { postService } from "@/services/postService";
import { listingService } from "@/services/listingService";
import { followService } from "@/services/followService";
import { moderationService } from "@/services/moderationService";
import { muteService } from "@/services/muteService";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getDefaultAvatar } from "@/lib/avatar";
import { toast } from "@/components/ui/use-toast";

const RenovationIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.65"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <path d="M3 10.5 12 3l9 7.5-1.7 2L12 6.4l-7.3 6.1z" />
    <path d="M6.1 11.5V21h11.8v-7.2" />
    <path d="M15.4 5.8V3.2h2.7v4.9" />
    <path d="M7.3 14.6c1.1-.1 1.6-.5 1.9-1.3.4-1.1 1.4-1.8 2.5-1.8h2.5l.8.8-2.9 1.1-2.2 2.3-1 1z" />
    <path d="m11.9 14.1 1.5-1.5 7.2 7.2a1.05 1.05 0 0 1-1.5 1.5z" />
  </svg>
);

const HandGearIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path
      transform="translate(7 -1) scale(.64)"
      d="M19.43 12.98c.04-.32.07-.65.07-.98s-.03-.66-.08-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.3 7.3 0 0 0-1.69-.98L14.5 2.42A.49.49 0 0 0 14 2h-4a.49.49 0 0 0-.49.42L9.13 5.07c-.61.25-1.17.59-1.69.98l-2.49-1a.49.49 0 0 0-.61.22l-2 3.46a.49.49 0 0 0 .12.64l2.11 1.65c-.04.32-.08.66-.08.98s.03.66.08.98l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46c.12.22.38.31.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.04.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1c.23.08.49 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.64zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5"
    />
    <rect x="1.25" y="12.1" width="3.6" height="9.2" rx=".65" />
    <path d="M5.5 13.5h2.8c.8 0 1.5.2 2.2.6l2.1 1.2h3.2c1.1 0 2 .8 2.1 1.9h-6.2a.7.7 0 1 0 0 1.4h6.5l3.5-1.7c.8-.4 1.7-.1 2.1.7.4.8.1 1.7-.7 2.1l-7.5 3.7a2.8 2.8 0 0 1-2.5 0l-7.6-3.8z" />
  </svg>
);

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const openCreate = Boolean((location.state as { openCreate?: boolean } | null)?.openCreate);
  const [feedCategory, setFeedCategory] = useState<"all" | "immobilier" | "construction">("all");
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [followingPosts, setFollowingPosts] = useState<any[]>([]);
  const [sponsoredListings, setSponsoredListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 50;
  
  // Track which posts from following users we've already shown
  const shownFollowingPostsRef = useRef<Set<string>>(new Set());
  // Track current index for each followed user
  const userPostIndicesRef = useRef<Map<string, number>>(new Map());
  // Track which users we've already shown posts from in current cycle
  const currentCycleUsersRef = useRef<Set<string>>(new Set());

  // Load posts and sponsored listings
  useEffect(() => {
    if (authLoading) return;
    const loadData = async () => {
      try {
        setLoading(true);
        const [postsData, listingsData, followingData, blockedUserIds, mutedIds] = await Promise.all([
          postService.getPosts(limit, offset),
          listingService.getListings(10, 0, true), // Get sponsored listings
          user ? followService.getPostsFromFollowing(user.id, 100) : Promise.resolve([]),
          user ? moderationService.getBlockedUserIds(user.id) : Promise.resolve([]),
          user ? muteService.getMutedIds(user.id) : Promise.resolve({ posts: new Set<string>(), services: new Set<string>() }),
        ]);

        const blockedSet = new Set(blockedUserIds || []);
        const filteredPosts = (postsData || []).filter(
          (post) => !blockedSet.has(post.user_id) && !mutedIds.posts.has(post.user_id)
        );
        const filteredFollowingPosts = (followingData || []).filter(
          (post) => !blockedSet.has(post.user_id) && !mutedIds.posts.has(post.user_id)
        );
        const filteredListings = (listingsData || []).filter(
          (listing) => !blockedSet.has(listing.user_id) && !mutedIds.services.has(listing.user_id)
        );

        setAllPosts(filteredPosts);
        setSponsoredListings(filteredListings);
        setFollowingPosts(filteredFollowingPosts);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [offset, user, authLoading]);

  // Format time ago
  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
    } catch {
      return "récemment";
    }
  };

  // Get sponsored banners from listings
  const getSponsoredBanners = () => {
    return sponsoredListings.slice(0, 4).map((listing) => ({
      title: listing.title,
      location: listing.location,
      description: listing.description || "",
      image: listing.image_url || "",
      avatar: listing.profiles?.avatar_url || getDefaultAvatar("craftsman"),
      username: listing.profiles?.username || "",
      timeAgo: formatTimeAgo(listing.created_at),
      profession: listing.profession || "",
      priceRange: listing.price_range || "",
      jobId: listing.id,
    }));
  };

  // Handle post creation
  const handlePostCreated = async (postData: any) => {
    if (user) {
      try {
      await postService.createPost(user.id, {
        title: "",
        description: postData.text,
        before_image_url: postData.beforeImage,
        after_image_url: postData.afterImage,
        single_image_url: postData.singleImage,
        images: postData.images || [],
        post_type: postData.postType || "standard",
        price: postData.price || null,
        surface: postData.surface || null,
        beds: postData.beds ?? null,
        baths: postData.baths ?? null,
        property_details: postData.propertyDetails || {},
      });
      toast({
        title: "Post publié",
        description:
          postData.postType === "property" || postData.postType === "project"
            ? "Ajouté au fil et au portfolio."
            : "Votre post a été publié avec succès.",
      });
        // Reload posts
        const [postsData, followingData, blockedUserIds, mutedIds] = await Promise.all([
          postService.getPosts(limit, 0),
          user ? followService.getPostsFromFollowing(user.id, 100) : Promise.resolve([]),
          moderationService.getBlockedUserIds(user.id),
          muteService.getMutedIds(user.id),
        ]);
        const blockedSet = new Set(blockedUserIds || []);
        setAllPosts((postsData || []).filter((post) => !blockedSet.has(post.user_id) && !mutedIds.posts.has(post.user_id)));
        setFollowingPosts((followingData || []).filter((post) => !blockedSet.has(post.user_id) && !mutedIds.posts.has(post.user_id)));
        // Reset tracking when new posts are loaded
        shownFollowingPostsRef.current.clear();
        userPostIndicesRef.current.clear();
        currentCycleUsersRef.current.clear();
      } catch (error) {
        console.error("Error creating post:", error);
      }
    }
  };

  // Group following posts by user
  const getFollowingPostsByUser = () => {
    const postsByUser = new Map<string, any[]>();
    followingPosts.forEach((post) => {
      const userId = post.user_id;
      if (!postsByUser.has(userId)) {
        postsByUser.set(userId, []);
      }
      postsByUser.get(userId)!.push(post);
    });
    return postsByUser;
  };

  // Get next post from a followed user (different from last shown)
  const getNextFollowingPost = (): any | null => {
    if (followingPosts.length === 0) return null;

    const postsByUser = getFollowingPostsByUser();
    const userIds = Array.from(postsByUser.keys());
    
    if (userIds.length === 0) return null;

    // Find a user we haven't shown in this cycle
    let availableUserIds = userIds.filter(
      (userId) => !currentCycleUsersRef.current.has(userId)
    );

    // If we've shown all users in this cycle, reset and start new cycle
    if (availableUserIds.length === 0) {
      currentCycleUsersRef.current.clear();
      availableUserIds = userIds;
    }

    // Select a random user from available ones
    const selectedUserId = availableUserIds[Math.floor(Math.random() * availableUserIds.length)];
    currentCycleUsersRef.current.add(selectedUserId);

    const userPosts = postsByUser.get(selectedUserId) || [];
    if (userPosts.length === 0) return null;

    // Get current index for this user
    let currentIndex = userPostIndicesRef.current.get(selectedUserId) || 0;

    // Find a post we haven't shown yet from this user
    let attempts = 0;
    const userShownPosts = new Set<string>();
    
    // Track which posts from this user we've already shown
    followingPosts.forEach((post) => {
      if (post.user_id === selectedUserId && shownFollowingPostsRef.current.has(post.id)) {
        userShownPosts.add(post.id);
      }
    });

    while (attempts < userPosts.length) {
      const post = userPosts[currentIndex % userPosts.length];
      
      // If this post hasn't been shown, use it
      if (!shownFollowingPostsRef.current.has(post.id)) {
        shownFollowingPostsRef.current.add(post.id);
        userPostIndicesRef.current.set(selectedUserId, (currentIndex + 1) % userPosts.length);
        return post;
      }
      
      currentIndex++;
      attempts++;
    }

    // If all posts from this user are shown, reset index for this user only
    // and try to find any unshown post from this user (shouldn't happen, but safety check)
    userPostIndicesRef.current.set(selectedUserId, 0);
    
    // Try to find any unshown post from this user
    for (const post of userPosts) {
      if (!shownFollowingPostsRef.current.has(post.id)) {
        shownFollowingPostsRef.current.add(post.id);
        return post;
      }
    }

    // All posts from this user have been shown - return null to skip this user
    return null;
  };

  // Build feed with mixed posts: every 3 posts, insert one from following
  const buildFeed = (): ReactElement[] => {
    const feed: ReactElement[] = [];
    const banners = getSponsoredBanners();
    const posts = allPosts.filter((post) => {
      if (feedCategory === "all") return true;
      const hay = `${post.post_type || ""} ${post.profiles?.profession || ""} ${post.description || ""}`.toLowerCase();
      if (feedCategory === "immobilier") return post.post_type === "property";
      if (feedCategory === "construction") return /construct|bâtiment|batiment|chantier/.test(hay);
      return true;
    });
    let bannerIndex = 0;
    let generalPostIndex = 0;
    let feedItemCount = 0;
    let consecutiveNoFollowingPost = 0;
    const maxIterations = Math.max(posts.length * 2, 100); // Safety limit
    let iterations = 0;

    while (iterations < maxIterations && (generalPostIndex < posts.length || followingPosts.length > 0)) {
      iterations++;
      
      // Add 3 general posts
      let addedGeneralPosts = 0;
      for (let i = 0; i < 3 && generalPostIndex < posts.length; i++) {
        const post = posts[generalPostIndex];
        const profile = post.profiles || {};
        
        feed.push(
          <FeedPost
            key={`general-${post.id}`}
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
            isSponsored={post.is_sponsored || false}
            postType={post.post_type}
            price={post.price}
            surface={post.surface}
            beds={post.beds}
            baths={post.baths}
          />
        );
        
        generalPostIndex++;
        feedItemCount++;
        addedGeneralPosts++;

        // Add 2 sponsored banners after every 8 posts
        if (feedItemCount % 8 === 0 && banners.length >= 2) {
          const banner1 = banners[bannerIndex % banners.length];
          const banner2 = banners[(bannerIndex + 1) % banners.length];
          
          feed.push(
            <div key={`banners-${feedItemCount}`} className="my-4 sm:my-6 space-y-3 sm:space-y-4">
              <SponsoredBanner
                title={banner1.title}
                location={banner1.location}
                description={banner1.description}
                image={banner1.image}
                avatar={banner1.avatar}
                username={banner1.username}
                timeAgo={banner1.timeAgo}
                profession={banner1.profession}
                priceRange={banner1.priceRange}
                jobId={banner1.jobId}
              />
              <SponsoredBanner
                title={banner2.title}
                location={banner2.location}
                description={banner2.description}
                image={banner2.image}
                avatar={banner2.avatar}
                username={banner2.username}
                timeAgo={banner2.timeAgo}
                profession={banner2.profession}
                priceRange={banner2.priceRange}
                jobId={banner2.jobId}
              />
            </div>
          );
          
          bannerIndex += 2;
        }
      }

      // Add 1 post from following (if available) after every 3 general posts
        if (addedGeneralPosts === 3 || (generalPostIndex >= posts.length && addedGeneralPosts > 0)) {
        const followingPost = getNextFollowingPost();
        if (followingPost) {
          const profile = followingPost.profiles || {};
          
          feed.push(
            <FeedPost
              key={`following-${followingPost.id}`}
              postId={followingPost.id}
              postUserId={followingPost.user_id}
              avatar={profile.avatar_url || getDefaultAvatar("craftsman")}
              username={profile.username || ""}
              isVerified={Boolean(profile.is_verified)}
              location={profile.location || ""}
              profession={profile.profession || ""}
              timeAgo={formatTimeAgo(followingPost.created_at)}
              description={followingPost.description}
              beforeImage={followingPost.before_image_url}
              afterImage={followingPost.after_image_url}
              singleImage={followingPost.single_image_url}
              images={followingPost.images || []}
              likes={followingPost.likes_count || 0}
              comments={followingPost.comments_count || 0}
              shares={followingPost.shares_count || 0}
              isSponsored={followingPost.is_sponsored || false}
              postType={followingPost.post_type}
              price={followingPost.price}
              surface={followingPost.surface}
              beds={followingPost.beds}
              baths={followingPost.baths}
            />
          );
          feedItemCount++;
          consecutiveNoFollowingPost = 0;
        } else {
          consecutiveNoFollowingPost++;
        }
      }

      // Stop if we've processed all general posts and can't get more following posts
      if (generalPostIndex >= posts.length) {
        if (consecutiveNoFollowingPost >= 3 || followingPosts.length === 0) {
          break;
        }
      }
    }

    return feed;
  };

  return (
    <div
      className="min-h-screen bg-neutral-100 pb-4"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-2 grid grid-cols-4 border-b border-neutral-200 bg-white px-2 pb-4 pt-3">
          {[
            { id: "all" as const, label: "Tout", Icon: LayoutGrid, tone: "bg-[#174f43]" },
            { id: "immobilier" as const, label: "Immobilier", Icon: Building2, tone: "bg-[#eee9ec]" },
            { id: "construction" as const, label: "Construction", Icon: RenovationIcon, tone: "bg-[#eee9ec]" },
            { id: "services" as const, label: "Services", Icon: HandGearIcon, tone: "bg-[#eee9ec]" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "services") {
                  navigate("/explore");
                  return;
                }
                if (item.id === "all") {
                  setFeedCategory("all");
                  return;
                }
                setFeedCategory((prev) => (prev === item.id ? "all" : item.id));
              }}
              className="group flex min-w-0 flex-col items-center gap-2"
            >
              <span
                className={`inline-flex h-[52px] w-[52px] items-center justify-center rounded-full transition ${
                  item.id === "all"
                    ? `${item.tone} text-white ${feedCategory === "all" ? "scale-105 shadow-md" : "group-hover:shadow-sm"}`
                    : feedCategory === item.id
                    ? `${item.tone} scale-105 text-orange-600 shadow-md`
                    : `${item.tone} text-neutral-800 group-hover:shadow-sm`
                }`}
              >
                <item.Icon className="h-6 w-6" />
              </span>
              <span className="w-full text-center text-[13px] font-semibold leading-normal text-neutral-800">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <section className="relative mx-2 mb-3 min-h-[175px] overflow-hidden rounded-2xl bg-neutral-800 text-white">
          <img
            src="/agadir-welcome.png"
            alt="Vue panoramique d’Agadir"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
          <div className="relative flex min-h-[175px] max-w-full translate-y-4 flex-col justify-center px-4 py-4">
            <p className="relative -top-1 mt-1 text-xl font-medium">Bonjour !</p>
            <p className="mt-2 text-[14px] font-normal leading-relaxed text-white/95">
              <span className="block font-light">Découvrez les entreprises locales.</span>
              <span className="block whitespace-nowrap font-medium">Suivez vos préférées et rejoignez la communauté.</span>
            </p>
          </div>
        </section>

        {sponsoredListings.length >= 2 && (
          <div className="my-4 sm:my-6 space-y-3 sm:space-y-4">
            {sponsoredListings.slice(0, 2).map((listing) => {
              const profile = listing.profiles || {};
              return (
                <SponsoredBanner
                  key={listing.id}
                  title={listing.title}
                  location={listing.location}
                  description={listing.description || ""}
                  image={listing.image_url || ""}
                  avatar={profile.avatar_url || getDefaultAvatar("craftsman")}
                  username={profile.username || ""}
                  timeAgo={formatTimeAgo(listing.created_at)}
                  profession={listing.profession || ""}
                  priceRange={listing.price_range || ""}
                  jobId={listing.id}
                />
              );
            })}
          </div>
        )}

        {/* Create Post */}
        <CreatePost
          hideLauncher
          startOpen={openCreate}
          onPostCreated={async (postData) => {
            await handlePostCreated(postData);
            if (openCreate) navigate("/", { replace: true, state: {} });
          }}
        />
        
        {/* Feed with posts and sponsored banners */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : allPosts.length === 0 && followingPosts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Aucun post pour le moment</div>
        ) : (
          buildFeed()
        )}
      </div>
    </div>
  );
};

export default Index;

