import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import ProfileHeader from "@/components/ProfileHeader";
import ReviewCard from "@/components/ReviewCard";
import FeedPost from "@/components/FeedPost";
import ListingCard from "@/components/ListingCard";
import CreatePost from "@/components/CreatePost";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { profileService } from "@/services/profileService";
import { postService } from "@/services/postService";
import { listingService } from "@/services/listingService";
import { reviewService } from "@/services/reviewService";
import { moderationService } from "@/services/moderationService";
import { followService } from "@/services/followService";
import { storageService } from "@/services/storageService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { getDefaultAvatar } from "@/lib/avatar";

const tabs = ["Portfolio", "Posts", "Annonces", "Avis"] as const;

const Profile = () => {
  const navigate = useNavigate();
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
  const [followers, setFollowers] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showCreateListingForm, setShowCreateListingForm] = useState(false);
  const [listingForm, setListingForm] = useState({
    title: "",
    description: "",
    profession: "",
    location: "",
    priceRange: "",
  });
  const [listingImageFile, setListingImageFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
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

        const [postsData, listingsData, reviewsData, blockedIds, followersData] = await Promise.all([
          postService.getPostsByUser(profileData.id),
          listingService.getListingsByUser(profileData.id),
          reviewService.getReviewsByUser(profileData.id),
          user ? moderationService.getBlockedUserIds(user.id) : Promise.resolve([]),
          followService.getFollowers(profileData.id),
        ]);
        const blockedSet = new Set(blockedIds || []);
        setIsBlockedProfile(blockedSet.has(profileData.id));

        setProfile(profileData);
        setEditForm({
          username: profileData.username || "",
          bio: profileData.bio || "",
        });
        setPosts(postsData || []);
        setListings(listingsData || []);
        setReviews(reviewsData || []);
        setFollowers(followersData || []);
        if (user && user.id !== profileData.id) {
          const following = await followService.isFollowing(user.id, profileData.id);
          setIsFollowing(following);
        } else {
          setIsFollowing(false);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setProfile(null);
        setIsBlockedProfile(false);
        setFollowers([]);
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

  const isOwnProfile = Boolean(user && profile && user.id === profile.id);
  const profileAvatar = profile?.avatar_url || getDefaultAvatar(profile?.profile_type);

  const handleToggleFollow = async () => {
    if (!user || !profile || isOwnProfile) return;
    try {
      if (isFollowing) {
        await followService.unfollowUser(user.id, profile.id);
        setIsFollowing(false);
      } else {
        await followService.followUser(user.id, profile.id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour le suivi." });
    }
  };

  const handlePostCreated = async (postData: any) => {
    if (!user || !isOwnProfile) return;
    try {
      await postService.createPost(user.id, {
        title: postData.text?.split("\n")[0] || "Nouveau post",
        description: postData.text,
        before_image_url: postData.beforeImage,
        after_image_url: postData.afterImage,
        single_image_url: postData.singleImage,
        images: postData.images || [],
      });
      const postsData = await postService.getPostsByUser(user.id);
      setPosts(postsData || []);
      toast({ title: "Post publié", description: "Votre post a été publié avec succès." });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ title: "Erreur", description: "Impossible de publier le post." });
    }
  };

  const handleCreateListing = async () => {
    if (!user || !isOwnProfile) return;
    if (!listingForm.title.trim() || !listingForm.location.trim()) {
      toast({ title: "Champs requis", description: "Le titre et la localisation sont obligatoires." });
      return;
    }
    try {
      let imageUrl: string | undefined;
      if (listingImageFile) {
        imageUrl = await storageService.uploadImage(listingImageFile, "listings");
      }
      await listingService.createListing(user.id, {
        title: listingForm.title.trim(),
        description: listingForm.description.trim(),
        profession: listingForm.profession.trim() || profile.profession || "Service",
        location: listingForm.location.trim(),
        price_range: listingForm.priceRange.trim(),
        image_url: imageUrl,
        image_count: imageUrl ? 1 : 0,
      });
      const listingsData = await listingService.getListingsByUser(user.id);
      setListings(listingsData || []);
      setListingForm({ title: "", description: "", profession: "", location: "", priceRange: "" });
      setListingImageFile(null);
      setShowCreateListingForm(false);
      toast({ title: "Annonce créée", description: "Votre annonce a été publiée." });
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({ title: "Erreur", description: "Impossible de créer l'annonce." });
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !isOwnProfile) return;
    setSavingProfile(true);
    try {
      let avatarUrl = profile.avatar_url;
      if (profileImageFile) {
        avatarUrl = await storageService.uploadImage(profileImageFile, "avatars");
      }
      const updated = await profileService.updateProfile(user.id, {
        username: editForm.username.trim() || profile.username,
        bio: editForm.bio.slice(0, 165),
        profession: profile.profession,
        location: profile.location,
        full_name: profile.full_name,
        phone: profile.phone,
        profile_type: profile.profile_type,
        avatar_url: avatarUrl,
      });
      setProfile(updated);
      setShowEditProfileModal(false);
      setProfileImageFile(null);
      toast({ title: "Profil mis à jour", description: "Vos informations ont été enregistrées." });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour le profil." });
    } finally {
      setSavingProfile(false);
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
        avatar={profileAvatar}
        username={profile.username || "Utilisateur"}
        profession={profile.profession || "Profession non définie"}
        location={profile.location || "Localisation non définie"}
        posts={posts.length}
        followers={followers.length}
        rating={rating}
        bio={profile.bio}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onToggleFollow={handleToggleFollow}
        onFollowersClick={() => setShowFollowersModal(true)}
        onEditProfile={() => setShowEditProfileModal(true)}
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
              {isOwnProfile && (
                <div className="px-4 sm:px-6 md:px-8 py-4 border-b border-border">
                  <CreatePost onPostCreated={handlePostCreated} />
                </div>
              )}
              {posts.length === 0 ? (
                <div className="px-4 sm:px-6 md:px-8 py-8 text-center text-muted-foreground">Aucun post publié.</div>
              ) : (
                posts.map((post) => (
                  <FeedPost
                    key={post.id}
                    postId={post.id}
                    postUserId={post.user_id}
                    avatar={profileAvatar}
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
              {isOwnProfile && (
                <div className="mb-4">
                  <Button
                    onClick={() => setShowCreateListingForm((prev) => !prev)}
                    className="mb-3"
                  >
                    {showCreateListingForm ? "Annuler" : "Créer nouvelle annonce"}
                  </Button>
                  {showCreateListingForm && (
                    <div className="grid gap-3 rounded-lg border border-border p-4 bg-card">
                      <Input
                        placeholder="Titre de l'annonce"
                        value={listingForm.title}
                        onChange={(e) => setListingForm((prev) => ({ ...prev, title: e.target.value }))}
                      />
                      <Textarea
                        placeholder="Description"
                        value={listingForm.description}
                        onChange={(e) => setListingForm((prev) => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          placeholder="Profession"
                          value={listingForm.profession}
                          onChange={(e) => setListingForm((prev) => ({ ...prev, profession: e.target.value }))}
                        />
                        <Input
                          placeholder="Localisation"
                          value={listingForm.location}
                          onChange={(e) => setListingForm((prev) => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                      <Input
                        placeholder="Prix (ex: 1000 - 2500 DH)"
                        value={listingForm.priceRange}
                        onChange={(e) => setListingForm((prev) => ({ ...prev, priceRange: e.target.value }))}
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setListingImageFile(e.target.files?.[0] || null)}
                      />
                      <div className="flex justify-end">
                        <Button onClick={handleCreateListing}>Publier l'annonce</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {listings.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">Aucune annonce publiée.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      avatar={profileAvatar}
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
                    avatar={review.reviewer?.avatar_url || getDefaultAvatar("craftsman")}
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

      <Dialog open={showFollowersModal} onOpenChange={setShowFollowersModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Followers</DialogTitle>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto space-y-3">
            {followers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun follower pour le moment.</p>
            ) : (
              followers.map((follower) => (
                <button
                  key={follower.follower_id}
                  className="w-full flex items-center gap-3 text-left hover:bg-secondary/60 rounded-md p-2 transition-colors"
                  onClick={() => {
                    setShowFollowersModal(false);
                    navigate(`/profile/${follower.profiles?.username || follower.follower_id}`);
                  }}
                >
                  <img
                    src={follower.profiles?.avatar_url || getDefaultAvatar("craftsman")}
                    alt={follower.profiles?.username || "Follower"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <p className="font-medium text-card-foreground">@{follower.profiles?.username || "utilisateur"}</p>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditProfileModal} onOpenChange={setShowEditProfileModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={profileImageFile ? URL.createObjectURL(profileImageFile) : profileAvatar}
                alt="Profile preview"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
                  />
                  <span className="inline-flex h-9 items-center rounded-md bg-secondary px-3 text-sm font-medium">
                    Take photo
                  </span>
                </label>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
                  />
                  <span className="inline-flex h-9 items-center rounded-md bg-secondary px-3 text-sm font-medium">
                    Upload photo
                  </span>
                </label>
              </div>
            </div>

            <Input
              value={editForm.username}
              onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="Nom d'utilisateur"
            />
            <Textarea
              value={editForm.bio}
              onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value.slice(0, 165) }))}
              rows={4}
              placeholder="Bio"
            />
            <p className="text-xs text-muted-foreground text-right">{editForm.bio.length}/165</p>

            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
