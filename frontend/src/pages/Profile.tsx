import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { reelService } from "@/services/reelService";
import { portfolioService } from "@/services/portfolioService";
import { streamService } from "@/services/streamService";
import { moderationService } from "@/services/moderationService";
import { followService } from "@/services/followService";
import { storageService } from "@/services/storageService";
import { notificationService } from "@/services/notificationService";
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
import PortfolioGrid from "@/components/PortfolioGrid";

const tabs = ["Portfolio", "Posts", "Annonces", "Reels", "Avis"] as const;
const tabToQuery: Record<(typeof tabs)[number], string> = {
  Portfolio: "portfolio",
  Posts: "posts",
  Annonces: "annonces",
  Reels: "reels",
  Avis: "avis",
};

const queryToTab: Record<string, (typeof tabs)[number]> = {
  portfolio: "Portfolio",
  posts: "Posts",
  annonces: "Annonces",
  reels: "Reels",
  avis: "Avis",
};

const Profile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { profile: currentProfile } = useProfile();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(
    queryToTab[searchParams.get("tab") || ""] || "Portfolio"
  );
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
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
    fullName: "",
    username: "",
    bio: "",
  });
  const [reelVideoFile, setReelVideoFile] = useState<File | null>(null);
  const [reelTitle, setReelTitle] = useState("");
  const [reelDescription, setReelDescription] = useState("");
  const [uploadingReel, setUploadingReel] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const tabsContentRef = useRef<HTMLDivElement>(null);
  const portfolioFileInputRef = useRef<HTMLInputElement>(null);
  const previousTabRef = useRef<(typeof tabs)[number]>("Portfolio");

  useEffect(() => {
    const fromQuery = queryToTab[searchParams.get("tab") || ""];
    if (fromQuery && fromQuery !== activeTab) {
      setActiveTab(fromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab !== previousTabRef.current && tabsContentRef.current) {
      const scrollY = window.scrollY;
      window.scrollTo(0, scrollY);
      previousTabRef.current = activeTab;
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", tabToQuery[activeTab]);
        return next;
      });
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

        const [postsData, listingsData, reviewsData, reelsData, portfolioData, blockedIds, followersData] = await Promise.all([
          postService.getPostsByUser(profileData.id),
          listingService.getListingsByUser(profileData.id),
          reviewService.getReviewsByUser(profileData.id),
          reelService.getReelsByUser(profileData.id),
          portfolioService.getPortfolioItemsByUser(profileData.id),
          user ? moderationService.getBlockedUserIds(user.id) : Promise.resolve([]),
          followService.getFollowers(profileData.id),
        ]);
        const blockedSet = new Set(blockedIds || []);
        setIsBlockedProfile(blockedSet.has(profileData.id));

        setProfile(profileData);
        setEditForm({
          fullName: profileData.full_name || "",
          username: profileData.username || "",
          bio: profileData.bio || "",
        });
        setPosts(postsData || []);
        setListings(listingsData || []);
        setReviews(reviewsData || []);
        setReels(reelsData || []);
        setPortfolioItems(portfolioData || []);
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
        await notificationService.createNotification({
          actorUserId: user.id,
          targetUserId: profile.id,
          type: "follow",
          entityType: "profile",
          entityId: profile.id,
          message: "a commencé à vous suivre.",
        });
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
      if (postData.portfolioImageUrls?.length) {
        await portfolioService.addPortfolioItems(
          user.id,
          postData.portfolioImageUrls,
          postData.text?.split("\n")[0] || "Portfolio"
        );
      }
      const postsData = await postService.getPostsByUser(user.id);
      const portfolioData = await portfolioService.getPortfolioItemsByUser(user.id);
      setPosts(postsData || []);
      setPortfolioItems(portfolioData || []);
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
      const nextUsername = editForm.username.trim().toLowerCase();
      if (nextUsername && nextUsername !== (profile.username || "").toLowerCase()) {
        const existingProfile = await profileService.getProfileByUsername(nextUsername).catch(() => null);
        if (existingProfile && existingProfile.id !== user.id) {
          toast({ title: "Username indisponible", description: "Ce username est deja pris." });
          setSavingProfile(false);
          return;
        }
      }
      let avatarUrl = profile.avatar_url;
      if (profileImageFile) {
        avatarUrl = await storageService.uploadImage(profileImageFile, "avatars");
      }
      const updated = await profileService.updateProfile(user.id, {
        username: nextUsername || profile.username,
        full_name: editForm.fullName.trim() || profile.full_name,
        bio: editForm.bio.slice(0, 165),
        profession: profile.profession,
        location: profile.location,
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

  const handleCreateReel = async () => {
    if (!user || !isOwnProfile || !reelVideoFile) return;
    setUploadingReel(true);
    try {
      const uploadResult = await streamService.uploadVideo(reelVideoFile, {
        title: reelTitle,
        description: reelDescription,
      });
      const videoId = uploadResult?.result?.uid || uploadResult?.uid;
      if (!videoId) {
        throw new Error("Video upload failed");
      }
      await reelService.createReel(user.id, {
        cloudflare_video_id: videoId,
        title: reelTitle.trim(),
        description: reelDescription.trim(),
      });
      const reelsData = await reelService.getReelsByUser(user.id);
      setReels(reelsData || []);
      setReelVideoFile(null);
      setReelTitle("");
      setReelDescription("");
      toast({ title: "Reel publie", description: "Votre reel a ete ajoute." });
    } catch (error) {
      console.error("Error creating reel:", error);
      toast({ title: "Erreur", description: "Impossible d'ajouter ce reel." });
    } finally {
      setUploadingReel(false);
    }
  };

  const buildSectionLink = (section: (typeof tabs)[number]) => {
    const usernameOrId = profile?.username || profile?.id;
    return `${window.location.origin}/profile/${encodeURIComponent(usernameOrId)}?tab=${tabToQuery[section]}`;
  };

  const copySectionLink = async (section: (typeof tabs)[number], title: string) => {
    try {
      await navigator.clipboard.writeText(buildSectionLink(section));
      toast({ title: "Lien copié", description: `Lien de la section ${title} copié.` });
    } catch {
      toast({ title: "Erreur", description: "Impossible de copier le lien." });
    }
  };

  const handleUploadPortfolioImages = async (files: FileList | null) => {
    if (!files || !files.length || !user || !isOwnProfile) return;
    setUploadingPortfolio(true);
    try {
      const urls = await storageService.uploadImages(Array.from(files), "portfolio");
      await portfolioService.addPortfolioItems(user.id, urls, "Portfolio");
      const portfolioData = await portfolioService.getPortfolioItemsByUser(user.id);
      setPortfolioItems(portfolioData || []);
      toast({ title: "Portfolio mis à jour", description: "Images ajoutées au portfolio." });
    } catch (error) {
      console.error("Error uploading portfolio images:", error);
      toast({ title: "Erreur", description: "Impossible d'ajouter les images au portfolio." });
    } finally {
      setUploadingPortfolio(false);
      if (portfolioFileInputRef.current) {
        portfolioFileInputRef.current.value = "";
      }
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
        profileId={profile.id}
        avatar={profileAvatar}
        fullName={profile.full_name || profile.username}
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
          <div className="flex items-center justify-between border-b border-border px-2 sm:px-4">
            <div className="flex overflow-x-auto flex-1">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => copySectionLink(activeTab, activeTab)}
              className="ml-2 whitespace-nowrap"
            >
              Share section
            </Button>
          </div>

          {activeTab === "Portfolio" && (
            <div className="px-4 sm:px-6 md:px-8 py-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {isOwnProfile && (
                  <>
                    <input
                      ref={portfolioFileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleUploadPortfolioImages(e.target.files)}
                    />
                    <Button
                      onClick={() => portfolioFileInputRef.current?.click()}
                      disabled={uploadingPortfolio}
                    >
                      {uploadingPortfolio ? "Upload..." : "Upload images to portfolio"}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => copySectionLink("Portfolio", "Portfolio")}
                >
                  Share portfolio
                </Button>
              </div>
              {portfolioItems.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  Aucune photo dans le portfolio pour le moment.
                </div>
              ) : (
                <PortfolioGrid
                  items={portfolioItems.map((item) => ({
                    image: item.image_url,
                    label: item.label || "Portfolio",
                  }))}
                  username={profile.username || "Utilisateur"}
                  avatar={profileAvatar}
                />
              )}
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
                      id={listing.id}
                      userId={listing.user_id}
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

          {activeTab === "Reels" && (
            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
              {isOwnProfile && (
                <div className="grid gap-3 rounded-lg border border-border p-4 bg-card mb-4">
                  <h3 className="font-semibold text-card-foreground">Ajouter un reel</h3>
                  <Input
                    placeholder="Titre du reel (optionnel)"
                    value={reelTitle}
                    onChange={(e) => setReelTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Description"
                    value={reelDescription}
                    onChange={(e) => setReelDescription(e.target.value)}
                    rows={3}
                  />
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setReelVideoFile(e.target.files?.[0] || null)}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleCreateReel} disabled={!reelVideoFile || uploadingReel}>
                      {uploadingReel ? "Upload..." : "Publier reel"}
                    </Button>
                  </div>
                </div>
              )}
              {reels.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">Aucun reel publie.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {reels.map((reel) => (
                    <div key={reel.id} className="rounded-lg border border-border p-3">
                      <p className="font-semibold text-card-foreground mb-1">{reel.title || "Reel"}</p>
                      <p className="text-sm text-muted-foreground mb-2">{reel.description || ""}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(reel.created_at)}</p>
                    </div>
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
              value={editForm.fullName}
              onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
              placeholder="Nom complet"
            />
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
