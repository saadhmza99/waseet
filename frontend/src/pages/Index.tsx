import { useState, useEffect, useRef } from "react";
import FeedPost from "@/components/FeedPost";
import CreatePost from "@/components/CreatePost";
import SponsoredBanner from "@/components/SponsoredBanner";
import { postService } from "@/services/postService";
import { listingService } from "@/services/listingService";
import { followService } from "@/services/followService";
import { useAuth } from "@/contexts/AuthContext";
import { ReactElement } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const Index = () => {
  const { user } = useAuth();
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
    const loadData = async () => {
      try {
        setLoading(true);
        const [postsData, listingsData, followingData] = await Promise.all([
          postService.getPosts(limit, offset),
          listingService.getListings(10, 0, true), // Get sponsored listings
          user ? followService.getPostsFromFollowing(user.id, 100) : Promise.resolve([]),
        ]);
        setAllPosts(postsData || []);
        setSponsoredListings(listingsData || []);
        setFollowingPosts(followingData || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [offset, user]);

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
      avatar: listing.profiles?.avatar_url || "",
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
      const newPost = await postService.createPost(user.id, {
        title: postData.text?.split('\n')[0] || "Nouveau post",
        description: postData.text,
        before_image_url: postData.beforeImage,
        after_image_url: postData.afterImage,
        single_image_url: postData.singleImage,
        images: postData.images || [],
      });
        // Reload posts
        const [postsData, followingData] = await Promise.all([
          postService.getPosts(limit, 0),
          user ? followService.getPostsFromFollowing(user.id, 100) : Promise.resolve([]),
        ]);
        setAllPosts(postsData || []);
        setFollowingPosts(followingData || []);
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
    let bannerIndex = 0;
    let generalPostIndex = 0;
    let feedItemCount = 0;
    let consecutiveNoFollowingPost = 0;
    const maxIterations = Math.max(allPosts.length * 2, 100); // Safety limit
    let iterations = 0;

    while (iterations < maxIterations && (generalPostIndex < allPosts.length || followingPosts.length > 0)) {
      iterations++;
      
      // Add 3 general posts
      let addedGeneralPosts = 0;
      for (let i = 0; i < 3 && generalPostIndex < allPosts.length; i++) {
        const post = allPosts[generalPostIndex];
        const profile = post.profiles || {};
        
        feed.push(
          <FeedPost
            key={`general-${post.id}`}
            postId={post.id}
            avatar={profile.avatar_url || ""}
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
            isSponsored={post.is_sponsored || false}
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
      if (addedGeneralPosts === 3 || (generalPostIndex >= allPosts.length && addedGeneralPosts > 0)) {
        const followingPost = getNextFollowingPost();
        if (followingPost) {
          const profile = followingPost.profiles || {};
          
          feed.push(
            <FeedPost
              key={`following-${followingPost.id}`}
              postId={followingPost.id}
              avatar={profile.avatar_url || ""}
              username={profile.username || ""}
              location={profile.location || ""}
              timeAgo={formatTimeAgo(followingPost.created_at)}
              title={followingPost.title}
              description={followingPost.description}
              beforeImage={followingPost.before_image_url}
              afterImage={followingPost.after_image_url}
              singleImage={followingPost.single_image_url}
              images={followingPost.images || []}
              likes={followingPost.likes_count || 0}
              comments={followingPost.comments_count || 0}
              shares={followingPost.shares_count || 0}
              isSponsored={followingPost.is_sponsored || false}
            />
          );
          feedItemCount++;
          consecutiveNoFollowingPost = 0;
        } else {
          consecutiveNoFollowingPost++;
        }
      }

      // Stop if we've processed all general posts and can't get more following posts
      if (generalPostIndex >= allPosts.length) {
        if (consecutiveNoFollowingPost >= 3 || followingPosts.length === 0) {
          break;
        }
      }
    }

    return feed;
  };

  return (
    <div className="pb-20">
      {/* Normal Feed */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Initial Sponsored Banners */}
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
                  avatar={profile.avatar_url || ""}
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
        <CreatePost onPostCreated={handlePostCreated} />
        
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

