import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import ProfileHeader from "@/components/ProfileHeader";
import ReviewCard from "@/components/ReviewCard";
import FeedPost from "@/components/FeedPost";
import ListingCard from "@/components/ListingCard";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { profileService } from "@/services/profileService";
import { postService } from "@/services/postService";
import { listingService } from "@/services/listingService";
import { reviewService } from "@/services/reviewService";
import { moderationService } from "@/services/moderationService";

const tabs = ["Portfolio", "Posts", "Annonces", "Avis"] as const;

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { profile: currentProfile } = useProfile();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Portfolio");
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBlockedProfile, setIsBlockedProfile] = useState(false);
  const tabsContentRef = useRef<HTMLDivElement>(null);
  const previousTabRef = useRef<(typeof tabs)[number]>("Portfolio");

  useEffect(() => {
    if (activeTab !== previousTabRef.current && tabsContentRef.current) {
      const scrollY = window.scrollY;
      window.scrollTo(0, scrollY);
      previousTabRef.current = activeTab;
    }
  }, [activeTab]);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);

        let profileData = null;
        if (id) {
          profileData = await profileService.getProfileByUsername(id).catch(() => null);
        }
        if (!profileData && user?.id) {
          profileData = await profileService.getProfile(user.id).catch(() => null);
        }
        if (!profileData) {
          setProfile(null);
          return;
        }

        const [postsData, listingsData, reviewsData, blockedIds] = await Promise.all([
          postService.getPostsByUser(profileData.id),
          listingService.getListingsByUser(profileData.id),
          reviewService.getReviewsByUser(profileData.id),
          user ? moderationService.getBlockedUserIds(user.id) : Promise.resolve([]),
        ]);
        const blockedSet = new Set(blockedIds || []);
        setIsBlockedProfile(blockedSet.has(profileData.id));

        setProfile(profileData);
        setPosts(postsData || []);
        setListings(listingsData || []);
        setReviews(reviewsData || []);
      } catch (error) {
        console.error("Error loading profile:", error);
        setProfile(null);
        setIsBlockedProfile(false);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [id, user?.id, currentProfile?.id]);

  const rating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return Number((total / reviews.length).toFixed(1));
  }, [reviews]);

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
    } catch {
      return "récemment";
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-muted-foreground">Chargement du profil...</div>;
  }

  if (!profile) {
    return <div className="py-10 text-center text-muted-foreground">Profil introuvable.</div>;
  }

  if (isBlockedProfile) {
    return <div className="py-10 text-center text-muted-foreground">Ce profil est bloqué.</div>;
  }

  return (
    <div className="pb-10 sm:pb-20">
      <ProfileHeader
        avatar={profile.avatar_url || "/default-avatar.png"}
        username={profile.username || "Utilisateur"}
        profession={profile.profession || "Profession non définie"}
        location={profile.location || "Localisation non définie"}
        posts={posts.length}
        followers="0"
        rating={rating}
        bio={profile.bio}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div ref={tabsContentRef} className="bg-card rounded-lg border border-border mt-4">
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

          {activeTab === "Portfolio" && (
            <div className="px-4 sm:px-6 md:px-8 py-8 text-center text-muted-foreground">
              Le portfolio sera rempli avec les données réelles de vos projets.
            </div>
          )}

          {activeTab === "Posts" && (
            <div className="divide-y divide-border">
              {posts.length === 0 ? (
                <div className="px-4 sm:px-6 md:px-8 py-8 text-center text-muted-foreground">Aucun post publié.</div>
              ) : (
                posts.map((post) => (
                  <FeedPost
                    key={post.id}
                    postId={post.id}
                    postUserId={post.user_id}
                    avatar={profile.avatar_url || "/default-avatar.png"}
                    username={profile.username || "Utilisateur"}
                    location={profile.location || ""}
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
                  />
                ))
              )}
            </div>
          )}

          {activeTab === "Annonces" && (
            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
              {listings.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">Aucune annonce publiée.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      avatar={profile.avatar_url || "/default-avatar.png"}
                      username={profile.username || "Utilisateur"}
                      timeAgo={formatTimeAgo(listing.created_at)}
                      image={listing.image_url || ""}
                      imageCount={listing.image_count || 1}
                      location={listing.location || ""}
                      title={listing.title || "Annonce"}
                      profession={listing.profession}
                      priceRange={listing.price_range || "Prix sur demande"}
                      isSponsored={Boolean(listing.is_sponsored)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "Avis" && (
            <div>
              {reviews.length === 0 ? (
                <div className="px-4 sm:px-6 md:px-8 py-8 text-center text-muted-foreground">Aucun avis pour le moment.</div>
              ) : (
                reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    avatar={review.reviewer?.avatar_url || "/default-avatar.png"}
                    username={review.reviewer?.username || "Utilisateur"}
                    timeAgo={formatTimeAgo(review.created_at)}
                    rating={review.rating || 0}
                    text={review.text || ""}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
