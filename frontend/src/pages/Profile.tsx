import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams, Navigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import ProfileHeader from "@/components/ProfileHeader";
import ProfilePageSkeleton, { ProfileMediaGridSkeleton } from "@/components/ProfilePageSkeleton";
import { CloudflareVideoPlayer } from "@/components/CloudflareVideoPlayer";
import ReviewCard from "@/components/ReviewCard";
import FeedPost from "@/components/FeedPost";
import ListingCard from "@/components/ListingCard";
import CreatePost from "@/components/CreatePost";
import PropertyListingWizard from "@/components/PropertyListingWizard";
import FullScreenPopup from "@/components/FullScreenPopup";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { profileBuffer, type ProfileBufferBundle } from "@/lib/profileBuffer";
import { profileService } from "@/services/profileService";
import { postService } from "@/services/postService";
import { listingService } from "@/services/listingService";
import { reviewService } from "@/services/reviewService";
import { reelService } from "@/services/reelService";
import {
  getBrowserVideoDurationSeconds,
  REEL_MAX_DURATION_SECONDS,
  REEL_MAX_PER_USER_PER_MONTH,
  REEL_UPLOAD_MAX_BYTES,
  streamService,
} from "@/services/streamService";
import { moderationService, isBlockCooldownError } from "@/services/moderationService";
import { followService } from "@/services/followService";
import { storageService } from "@/services/storageService";
import { notificationService } from "@/services/notificationService";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { getDefaultAvatar } from "@/lib/avatar";
import { profileHandle } from "@/lib/profileHandle";
import AboutRichEditor from "@/components/AboutRichEditor";
import { aboutHtmlIsEmpty, sanitizeAboutHtml, toAboutHtml } from "@/lib/aboutHtml";
import PortfolioGrid from "@/components/PortfolioGrid";
import ProfileInfosCard, { locationsFrom, ProfileDetailsFields, type InfosField } from "@/components/ProfileInfosCard";
import UploadProgressRing from "@/components/UploadProgressRing";
import ReportAbuseModal from "@/components/ReportAbuseModal";
import BlockMemberModal from "@/components/BlockMemberModal";
import MuteProfileModal from "@/components/MuteProfileModal";
import AboutThisMemberSheet from "@/components/AboutThisMemberSheet";
import { muteService, type MuteScope } from "@/services/muteService";
import { blockedAccountsToast } from "@/lib/blockedAccountsToast";
import { ArrowLeft, Camera, Heart, ImagePlus, LayoutGrid, MessageCircle, Pencil, Plus, Share2, Trash2, Video } from "lucide-react";

const tabs = ["Posts", "Portfolio", "Services"] as const;
type PostsView = "grid" | "reels";
const MAX_ABOUT_LENGTH = 50000;
const ABOUT_QUERY_TABS = new Set(["about", "details", "apropos"]);
const tabToQuery: Record<(typeof tabs)[number], string> = {
  Posts: "posts",
  Portfolio: "portfolio",
  Services: "services",
};

const queryToTab: Record<string, (typeof tabs)[number]> = {
  posts: "Posts",
  portfolio: "Portfolio",
  services: "Services",
  reels: "Posts",
};

const PAGE = {
  posts: 12,
  reels: 9,
  listings: 12,
  properties: 12,
  projects: 10,
} as const;
const PROPERTY_POST_TYPES = ["property", "bien", "propriete", "propriété"];
const PROJECT_POST_TYPES = ["project"];

const takePage = <T,>(rows: T[] | null | undefined, limit: number) => {
  const list = rows || [];
  return { items: list.slice(0, limit), hasMore: list.length > limit };
};

const forgetBufferedProfile = (
  profileLike: { id?: string; username?: string } | null | undefined,
  viewerId?: string | null
) => {
  if (!profileLike) return;
  if (profileLike.id) profileBuffer.invalidate(profileLike.id, viewerId);
  if (profileLike.username) profileBuffer.invalidate(profileLike.username, viewerId);
};

const LoadMoreButton = ({
  hasMore,
  loading,
  onClick,
  label = "Charger plus",
}: {
  hasMore: boolean;
  loading: boolean;
  onClick: () => void;
  label?: string;
}) => {
  if (!hasMore) return null;
  return (
    <div className="flex justify-center py-4">
      <Button type="button" variant="outline" size="sm" onClick={onClick} disabled={loading}>
        {loading ? "Chargement…" : label}
      </Button>
    </div>
  );
};

const coverOfPost = (post: any) => {
  const images = Array.isArray(post?.images) ? post.images.filter(Boolean) : [];
  return (
    images[0] ||
    post?.single_image_url ||
    post?.after_image_url ||
    post?.before_image_url ||
    ""
  );
};

const postsViewFromQuery = (tabParam: string, viewParam: string | null): PostsView => {
  if (tabParam === "reels" || viewParam === "reels") return "reels";
  return "grid";
};

const PhotoEditControl = ({
  label,
  previewSrc,
  layout,
  canRemove,
  onTake,
  onLibrary,
  onRemove,
}: {
  label: string;
  previewSrc: string;
  layout: "cover" | "avatar";
  canRemove: boolean;
  onTake: (file: File) => void;
  onLibrary: (file: File) => void;
  onRemove: () => void;
}) => {
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const isCover = layout === "cover";

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="secondary" size="sm" className="shadow-md">
          Modifier la photo
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            window.setTimeout(() => cameraRef.current?.click(), 0);
          }}
        >
          <Camera className="mr-2 h-4 w-4" />
          Prendre une photo
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            window.setTimeout(() => libraryRef.current?.click(), 0);
          }}
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          Choisir dans la galerie
        </DropdownMenuItem>
        {canRemove ? (
          <DropdownMenuItem onSelect={onRemove} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer la photo actuelle
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onTake(file);
          e.target.value = "";
        }}
      />
      <input
        ref={libraryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onLibrary(file);
          e.target.value = "";
        }}
      />
      {isCover ? (
        <div className="relative h-32 w-full overflow-hidden rounded-md bg-muted">
          {previewSrc ? (
            <img src={previewSrc} alt="" className="h-full w-full object-cover grayscale" />
          ) : null}
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 flex items-center justify-center">{menu}</div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {previewSrc ? (
            <img src={previewSrc} alt="" className="h-20 w-20 rounded-full object-cover bg-muted" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-muted" />
          )}
          {menu}
        </div>
      )}
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { profile: currentProfile } = useProfile();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(
    queryToTab[searchParams.get("tab") || ""] || "Posts"
  );
  const [showReviews, setShowReviews] = useState(searchParams.get("tab") === "avis");
  const [showAbout, setShowAbout] = useState(ABOUT_QUERY_TABS.has(searchParams.get("tab") || ""));
  const [feedPostId, setFeedPostId] = useState<string | null>(null);
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);
  const [postsView, setPostsView] = useState<PostsView>(
    postsViewFromQuery(searchParams.get("tab") || "", searchParams.get("view"))
  );
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsHasMore, setPostsHasMore] = useState(false);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [listingsHasMore, setListingsHasMore] = useState(false);
  const [loadingMoreListings, setLoadingMoreListings] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [reelsHasMore, setReelsHasMore] = useState(false);
  const [loadingMoreReels, setLoadingMoreReels] = useState(false);
  const [propertyItems, setPropertyItems] = useState<any[]>([]);
  const [propertiesHasMore, setPropertiesHasMore] = useState(false);
  const [loadingMoreProperties, setLoadingMoreProperties] = useState(false);
  const [projectItems, setProjectItems] = useState<any[]>([]);
  const [projectsHasMore, setProjectsHasMore] = useState(false);
  const [loadingMoreProjects, setLoadingMoreProjects] = useState(false);
  const [postsCount, setPostsCount] = useState(0);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [listingsCount, setListingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [isBlockedProfile, setIsBlockedProfile] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockSubmitting, setBlockSubmitting] = useState(false);
  const [showAboutMember, setShowAboutMember] = useState(false);
  const [showMuteModal, setShowMuteModal] = useState(false);
  const [muteSubmitting, setMuteSubmitting] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEditInfosModal, setShowEditInfosModal] = useState(false);
  const [infosEditField, setInfosEditField] = useState<InfosField | "all">("all");
  const [showCreateListingForm, setShowCreateListingForm] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    username: "",
    bio: "",
    about: "",
    profession: "",
    location: "",
    phone: "",
    email: "",
    website: "",
  });
  const [editingAbout, setEditingAbout] = useState(false);
  const [reelVideoFile, setReelVideoFile] = useState<File | null>(null);
  const [reelTitle, setReelTitle] = useState("");
  const [reelDescription, setReelDescription] = useState("");
  const [uploadingReel, setUploadingReel] = useState(false);
  const [reelUploadProgress, setReelUploadProgress] = useState(0);
  const [reelPublishFormOpen, setReelPublishFormOpen] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const tabsContentRef = useRef<HTMLDivElement>(null);

  const revealTabs = () => {
    requestAnimationFrame(() => {
      const node = tabsContentRef.current;
      if (!node) return;
      const top = node.getBoundingClientRect().top + window.scrollY - 8;
      window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
    });
  };

  const goToTab = (tab: (typeof tabs)[number]) => {
    setShowReviews(false);
    setShowAbout(false);
    setEditingAbout(false);
    if (tab !== "Posts") setFeedPostId(null);
    setActiveTab(tab);
    revealTabs();
  };

  useEffect(() => {
    if (activeTab !== "Posts" || postsView !== "grid" || feedPostId) {
      setHoveredPostId(null);
      return;
    }
    const syncHover = (x: number, y: number) => {
      const hit = document.elementFromPoint(x, y);
      const thumb = hit?.closest("[data-post-id]") as HTMLElement | null;
      const next = thumb?.getAttribute("data-post-id") ?? null;
      setHoveredPostId((current) => (current === next ? current : next));
    };
    const onMove = (event: MouseEvent | PointerEvent) => {
      syncHover(event.clientX, event.clientY);
    };
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("pointermove", onMove, true);
    return () => {
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("pointermove", onMove, true);
    };
  }, [activeTab, postsView, feedPostId]);

  useEffect(() => {
    if (!feedPostId) return;
    const node = document.getElementById(`profile-post-${feedPostId}`);
    if (!node) return;
    requestAnimationFrame(() => {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [feedPostId, postsView]);

  useEffect(() => {
    const tabParam = searchParams.get("tab") || "";
    if (tabParam === "avis") {
      setShowReviews(true);
      setShowAbout(false);
      return;
    }
    if (ABOUT_QUERY_TABS.has(tabParam)) {
      setShowAbout(true);
      setShowReviews(false);
      return;
    }
    setShowReviews(false);
    setShowAbout(false);
    const viewParam = searchParams.get("view");
    const fromQuery = queryToTab[tabParam];
    if (fromQuery && fromQuery !== activeTab) {
      setActiveTab(fromQuery);
    }
    if (fromQuery === "Posts" || tabParam === "reels") {
      const nextView = postsViewFromQuery(tabParam, viewParam);
      setPostsView((current) => (current === nextView ? current : nextView));
    }
  }, [searchParams]);

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (showReviews) {
        next.set("tab", "avis");
        next.delete("view");
      } else if (showAbout) {
        next.set("tab", "about");
        next.delete("view");
      } else {
        next.set("tab", tabToQuery[activeTab]);
        if (activeTab === "Posts" && postsView !== "grid") next.set("view", postsView);
        else next.delete("view");
      }
      return next.toString() === prev.toString() ? prev : next;
    }, { replace: true });
  }, [activeTab, postsView, showReviews, showAbout]);

  useEffect(() => {
    const applyBundle = (bundle: ProfileBufferBundle) => {
      const profileData = bundle.profile;
      setProfile(profileData);
      setEditForm({
        fullName: profileData.full_name || "",
        username: profileData.username || "",
        bio: profileData.bio || "",
        about: profileData.about_text || "",
        profession: profileData.profession || "",
        location: profileData.location || "",
        phone: profileData.phone || "",
        email: profileData.email || (user?.id === profileData.id ? user.email : "") || "",
        website: profileData.website_url || "",
      });
      setEditingAbout(false);
      setPosts(bundle.posts);
      setPostsHasMore(bundle.postsHasMore);
      setListings(bundle.listings);
      setListingsHasMore(bundle.listingsHasMore);
      setReviews(bundle.reviews);
      setReels(bundle.reels);
      setReelsHasMore(bundle.reelsHasMore);
      setPropertyItems(bundle.propertyItems);
      setPropertiesHasMore(bundle.propertiesHasMore);
      setProjectItems(bundle.projectItems);
      setProjectsHasMore(bundle.projectsHasMore);
      setPostsCount(bundle.postsCount);
      setPortfolioCount(bundle.portfolioCount);
      setListingsCount(bundle.listingsCount);
      setFollowers(bundle.followers);
      setIsBlockedProfile(bundle.isBlockedProfile);
      setIsFollowing(bundle.isFollowing);
      setLoading(false);
      setContentLoading(false);
    };

    const loadProfileData = async () => {
      const slug = id ? decodeURIComponent(id).replace(/^@/, "").trim() : "";
      const cached = profileBuffer.read([slug, user?.id], user?.id);
      if (cached) {
        applyBundle(cached);
        return;
      }

      try {
        setLoading(true);
        setContentLoading(true);
        setProfile(null);
        setPosts([]);
        setPropertyItems([]);
        setProjectItems([]);
        setListings([]);
        setReels([]);
        setPostsCount(0);
        setPortfolioCount(0);
        setListingsCount(0);

        let profileData = null;
        if (slug) {
          const looksLikeId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
          if (looksLikeId) {
            profileData = await profileService.getProfile(slug).catch(() => null);
          } else {
            profileData = await profileService.getProfileByUsername(slug).catch(() => null);
          }
        }
        if (!profileData && user?.id) {
          profileData = await profileService.getProfile(user.id).catch(() => null);
        }
        if (!profileData) {
          setProfile(null);
          setContentLoading(false);
          return;
        }

        setProfile(profileData);
        setEditForm({
          fullName: profileData.full_name || "",
          username: profileData.username || "",
          bio: profileData.bio || "",
          about: profileData.about_text || "",
          profession: profileData.profession || "",
          location: profileData.location || "",
          phone: profileData.phone || "",
          email: profileData.email || (user?.id === profileData.id ? user.email : "") || "",
          website: profileData.website_url || "",
        });
        setEditingAbout(false);
        setLoading(false);

        const [postsData, listingsData, reviewsData, reelsData, propertiesData, projectsData, blockedIds, followersData, postsTotal, propertiesTotal, projectsTotal, listingsTotal] = await Promise.all([
          postService.getPostsByUser(profileData.id, PAGE.posts, 0),
          listingService.getListingsByUser(profileData.id, PAGE.listings, 0),
          reviewService.getReviewsByUser(profileData.id),
          reelService.getReelsByUser(profileData.id, PAGE.reels, 0),
          postService.getPortfolioPostsByUser(profileData.id, {
            types: PROPERTY_POST_TYPES,
            limit: PAGE.properties,
            offset: 0,
          }),
          postService.getPortfolioPostsByUser(profileData.id, {
            types: PROJECT_POST_TYPES,
            limit: PAGE.projects,
            offset: 0,
          }),
          user ? moderationService.getBlockedUserIds(user.id) : Promise.resolve([]),
          followService.getFollowers(profileData.id),
          postService.countPostsByUser(profileData.id),
          postService.countPostsByUser(profileData.id, PROPERTY_POST_TYPES),
          postService.countPostsByUser(profileData.id, PROJECT_POST_TYPES),
          listingService.countListingsByUser(profileData.id),
        ]);
        const blockedSet = new Set(blockedIds || []);
        const isBlocked = blockedSet.has(profileData.id);
        setIsBlockedProfile(isBlocked);

        const postsPage = takePage(postsData, PAGE.posts);
        const listingsPage = takePage(listingsData, PAGE.listings);
        const reelsPage = takePage(reelsData, PAGE.reels);
        const propertiesPage = takePage(propertiesData, PAGE.properties);
        const projectsPage = takePage(projectsData, PAGE.projects);
        const following =
          user && user.id !== profileData.id
            ? await followService.isFollowing(user.id, profileData.id)
            : false;

        const bundle: ProfileBufferBundle = {
          profile: profileData,
          posts: postsPage.items,
          postsHasMore: postsPage.hasMore,
          listings: listingsPage.items,
          listingsHasMore: listingsPage.hasMore,
          reviews: reviewsData || [],
          reels: reelsPage.items,
          reelsHasMore: reelsPage.hasMore,
          propertyItems: propertiesPage.items,
          propertiesHasMore: propertiesPage.hasMore,
          projectItems: projectsPage.items,
          projectsHasMore: projectsPage.hasMore,
          postsCount: postsTotal || 0,
          portfolioCount: (propertiesTotal || 0) + (projectsTotal || 0),
          listingsCount: listingsTotal || 0,
          followers: followersData || [],
          isBlockedProfile: isBlocked,
          isFollowing: following,
        };
        applyBundle(bundle);
        profileBuffer.write(
          [slug, profileData.id, profileData.username, user?.id === profileData.id ? user.id : null],
          user?.id,
          bundle
        );
      } catch (error) {
        console.error("Error loading profile:", error);
        setProfile(null);
        setIsBlockedProfile(false);
        setFollowers([]);
      } finally {
        setLoading(false);
        setContentLoading(false);
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

  const portfolioItems = useMemo(
    () =>
      [...propertyItems, ...projectItems].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [propertyItems, projectItems]
  );

  const isOwnProfile = Boolean(
    user &&
      profile &&
      (String(user.id) === String(profile.id) ||
        (currentProfile?.id && String(currentProfile.id) === String(profile.id)) ||
        (currentProfile?.username &&
          profile.username &&
          String(currentProfile.username).toLowerCase() === String(profile.username).toLowerCase()))
  );
  const profileAvatar = profile?.avatar_url || getDefaultAvatar(profile?.profile_type);
  const memberLabel = profileHandle(profile?.username);

  const loadMorePosts = async () => {
    if (!profile?.id || loadingMorePosts || !postsHasMore) return;
    setLoadingMorePosts(true);
    try {
      const page = takePage(
        await postService.getPostsByUser(profile.id, PAGE.posts, posts.length),
        PAGE.posts
      );
      setPosts((prev) => [...prev, ...page.items]);
      setPostsHasMore(page.hasMore);
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoadingMorePosts(false);
    }
  };

  const loadMoreReels = async () => {
    if (!profile?.id || loadingMoreReels || !reelsHasMore) return;
    setLoadingMoreReels(true);
    try {
      const page = takePage(
        await reelService.getReelsByUser(profile.id, PAGE.reels, reels.length),
        PAGE.reels
      );
      setReels((prev) => [...prev, ...page.items]);
      setReelsHasMore(page.hasMore);
    } catch (error) {
      console.error("Error loading more reels:", error);
    } finally {
      setLoadingMoreReels(false);
    }
  };

  const loadMoreListings = async () => {
    if (!profile?.id || loadingMoreListings || !listingsHasMore) return;
    setLoadingMoreListings(true);
    try {
      const page = takePage(
        await listingService.getListingsByUser(profile.id, PAGE.listings, listings.length),
        PAGE.listings
      );
      setListings((prev) => [...prev, ...page.items]);
      setListingsHasMore(page.hasMore);
    } catch (error) {
      console.error("Error loading more listings:", error);
    } finally {
      setLoadingMoreListings(false);
    }
  };

  const loadMoreProperties = async () => {
    if (!profile?.id || loadingMoreProperties || !propertiesHasMore) return;
    setLoadingMoreProperties(true);
    try {
      const page = takePage(
        await postService.getPortfolioPostsByUser(profile.id, {
          types: PROPERTY_POST_TYPES,
          limit: PAGE.properties,
          offset: propertyItems.length,
        }),
        PAGE.properties
      );
      setPropertyItems((prev) => [...prev, ...page.items]);
      setPropertiesHasMore(page.hasMore);
    } catch (error) {
      console.error("Error loading more properties:", error);
    } finally {
      setLoadingMoreProperties(false);
    }
  };

  const loadMoreProjects = async () => {
    if (!profile?.id || loadingMoreProjects || !projectsHasMore) return;
    setLoadingMoreProjects(true);
    try {
      const page = takePage(
        await postService.getPortfolioPostsByUser(profile.id, {
          types: PROJECT_POST_TYPES,
          limit: PAGE.projects,
          offset: projectItems.length,
        }),
        PAGE.projects
      );
      setProjectItems((prev) => [...prev, ...page.items]);
      setProjectsHasMore(page.hasMore);
    } catch (error) {
      console.error("Error loading more projects:", error);
    } finally {
      setLoadingMoreProjects(false);
    }
  };

  const openAvis = () => {
    setShowAbout(false);
    setEditingAbout(false);
    setShowReviews(true);
    revealTabs();
  };

  const closeAvis = () => {
    setShowReviews(false);
    revealTabs();
  };

  const openAbout = () => {
    setShowReviews(false);
    setShowAbout(true);
    revealTabs();
  };

  const closeAbout = () => {
    setShowAbout(false);
    setEditingAbout(false);
    revealTabs();
  };

  const openInfosEditor = (field?: InfosField) => {
    setInfosEditField(field ?? "all");
    if (field === "location") {
      setEditForm((prev) => {
        const rows = prev.location.length ? prev.location.split("\n") : [];
        if (!rows.length || rows[rows.length - 1].trim()) {
          return { ...prev, location: [...rows, ""].join("\n") };
        }
        return prev;
      });
    }
    setShowEditInfosModal(true);
  };

  const renderFeedPost = (post: any) => (
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
      postType={post.post_type}
      price={post.price}
      surface={post.surface}
      beds={post.beds}
      baths={post.baths}
    />
  );

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
      forgetBufferedProfile(profile, user.id);
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour le suivi." });
    }
  };

  const handleReportMember = async () => {
    if (!profile) return;
    setShowReportModal(true);
  };

  const submitProfileReport = async (payload: { reason: string; details: string }) => {
    if (!user || !profile) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour signaler ce profil." });
      return;
    }
    setReportSubmitting(true);
    try {
      await moderationService.reportProfile(profile.id, user.id, payload.reason, payload.details);
      setShowReportModal(false);
      toast({ title: "Report submitted" });
    } catch (error) {
      console.error("Error reporting profile:", error);
      toast({ title: "Erreur", description: "Impossible de signaler ce profil pour le moment." });
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleBlockMember = async () => {
    if (user && profile) {
      try {
        const until = await moderationService.getReblockBlockedUntil(user.id, profile.id);
        if (until) {
          toast({
            title: "You can't block this account again until after 48 hours.",
            description: `Available ${until.toLocaleString()}`,
          });
          return;
        }
      } catch (error) {
        console.error("Error checking block cooldown:", error);
      }
    }
    setShowBlockModal(true);
  };

  const confirmBlockMember = async () => {
    if (!user || !profile) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour bloquer ce profil." });
      return;
    }
    setBlockSubmitting(true);
    try {
      await moderationService.blockUser(user.id, profile.id);
      setShowBlockModal(false);
      blockedAccountsToast(memberLabel);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error blocking profile:", error);
      toast({
        title: isBlockCooldownError(error)
          ? "You can't block this account again until after 48 hours."
          : "Erreur",
        description: isBlockCooldownError(error) ? undefined : "Impossible de bloquer ce profil.",
      });
    } finally {
      setBlockSubmitting(false);
    }
  };

  const handlePostCreated = async (postData: any) => {
    if (!user || !isOwnProfile) return;
    try {
      await postService.createPost(user.id, {
        title: postData.title || postData.text?.split("\n")[0] || (postData.postType === "property" ? "Bien" : "Nouveau post"),
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
      const postsPage = takePage(await postService.getPostsByUser(user.id, PAGE.posts, 0), PAGE.posts);
      const propertiesPage = takePage(
        await postService.getPortfolioPostsByUser(user.id, {
          types: PROPERTY_POST_TYPES,
          limit: PAGE.properties,
          offset: 0,
        }),
        PAGE.properties
      );
      const projectsPage = takePage(
        await postService.getPortfolioPostsByUser(user.id, {
          types: PROJECT_POST_TYPES,
          limit: PAGE.projects,
          offset: 0,
        }),
        PAGE.projects
      );
      setPosts(postsPage.items);
      setPostsHasMore(postsPage.hasMore);
      setPropertyItems(propertiesPage.items);
      setPropertiesHasMore(propertiesPage.hasMore);
      setProjectItems(projectsPage.items);
      setProjectsHasMore(projectsPage.hasMore);
      setPostsCount(await postService.countPostsByUser(user.id));
      const [propertiesTotal, projectsTotal] = await Promise.all([
        postService.countPostsByUser(user.id, PROPERTY_POST_TYPES),
        postService.countPostsByUser(user.id, PROJECT_POST_TYPES),
      ]);
      setPortfolioCount(propertiesTotal + projectsTotal);
      forgetBufferedProfile({ id: user.id, username: profile?.username }, user.id);
      toast({
        title: "Post publié",
        description:
          postData.postType === "property" || postData.postType === "project"
            ? "Ajouté au fil et au portfolio."
            : "Votre post a été publié avec succès.",
      });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ title: "Erreur", description: "Impossible de publier le post." });
    }
  };

  const handleCreateListingFromWizard = async ({
    details,
    files,
  }: {
    details: import("@/lib/propertyListing").PropertyDetails;
    files: File[];
  }) => {
    if (!user || !isOwnProfile) return;
    try {
    const uploaded = await storageService.uploadImages(files, "listings");
    const location = [details.address, details.city, details.region].filter(Boolean).join(", ");
    await listingService.createListing(user.id, {
      title: details.title.trim(),
      description: details.description.trim(),
      profession: details.propertyKind || profile.profession || "Immobilier",
      location,
      price_range: `${details.priceDh} DH`,
      image_url: uploaded[0],
      image_count: uploaded.length,
      images: uploaded,
      property_details: details,
      contact_phone: details.phones[0] || null,
    });
    const listingsPage = takePage(
      await listingService.getListingsByUser(user.id, PAGE.listings, 0),
      PAGE.listings
    );
    setListings(listingsPage.items);
    setListingsHasMore(listingsPage.hasMore);
    setListingsCount(await listingService.countListingsByUser(user.id));
    setShowCreateListingForm(false);
    forgetBufferedProfile({ id: user.id, username: profile?.username }, user.id);
    toast({ title: "Service créé", description: "Votre service a été publié." });
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({ title: "Erreur", description: "Impossible de créer le service." });
      throw error;
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
      let avatarUrl: string | null = profile.avatar_url || null;
      if (removeAvatar) {
        avatarUrl = null;
      } else if (profileImageFile) {
        avatarUrl = await storageService.uploadImage(profileImageFile, "avatars");
      }
      let coverPhotoUrl: string | null = profile.cover_photo_url || null;
      if (removeCover) {
        coverPhotoUrl = null;
      } else if (coverImageFile) {
        coverPhotoUrl = await storageService.uploadImage(coverImageFile, "covers");
      }
      const updated = await profileService.updateProfile(user.id, {
        username: nextUsername || profile.username,
        full_name: editForm.fullName.trim() || profile.full_name,
        bio: editForm.bio.slice(0, 165),
        profile_type: profile.profile_type,
        avatar_url: avatarUrl,
        cover_photo_url: coverPhotoUrl,
      });
      setProfile(updated);
      setEditingAbout(false);
      setShowEditProfileModal(false);
      setProfileImageFile(null);
      setCoverImageFile(null);
      setRemoveCover(false);
      setRemoveAvatar(false);
      forgetBufferedProfile(updated, user.id);
      toast({ title: "Profil mis à jour", description: "Vos informations ont été enregistrées." });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour le profil." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveInfos = async () => {
    if (!user || !isOwnProfile) return;
    setSavingProfile(true);
    try {
      const updated = await profileService.updateProfile(user.id, {
        profession: editForm.profession.trim() || null,
        location: locationsFrom(editForm.location).join("\n") || null,
        phone: editForm.phone.trim() || null,
        email: editForm.email.trim() || null,
        website_url: editForm.website.trim() || null,
      });
      setProfile(updated);
      setShowEditInfosModal(false);
      forgetBufferedProfile(updated, user.id);
      toast({ title: "Infos mises à jour", description: "Les informations de cette section ont été enregistrées." });
    } catch (error) {
      console.error("Error updating infos:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour les infos." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAbout = async () => {
    if (!user || !isOwnProfile) return;
    setSavingProfile(true);
    try {
      const updated = await profileService.updateProfile(user.id, {
        about_text: aboutHtmlIsEmpty(editForm.about) ? null : editForm.about.slice(0, MAX_ABOUT_LENGTH),
      });
      setProfile(updated);
      setEditingAbout(false);
      forgetBufferedProfile(updated, user.id);
      toast({ title: "À propos enregistré", description: "Votre section À propos a été mise à jour." });
    } catch (error) {
      console.error("Error updating about:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer la section À propos." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateReel = async () => {
    if (!user || !isOwnProfile || !reelVideoFile) return;
    setUploadingReel(true);
    setReelUploadProgress(0);
    try {
      const uploadResult = await streamService.uploadVideo(
        reelVideoFile,
        {
          title: reelTitle,
          description: reelDescription,
        },
        { onUploadProgress: setReelUploadProgress }
      );
      const videoId = uploadResult?.video?.id;
      if (!videoId) {
        throw new Error("Réponse upload invalide (pas d’identifiant vidéo).");
      }
      await reelService.createReel(user.id, {
        cloudflare_video_id: videoId,
        title: reelTitle.trim(),
        description: reelDescription.trim(),
        duration_seconds: uploadResult?.video?.durationSeconds ?? null,
      });
      const reelsPage = takePage(await reelService.getReelsByUser(user.id, PAGE.reels, 0), PAGE.reels);
      setReels(reelsPage.items);
      setReelsHasMore(reelsPage.hasMore);
      setReelVideoFile(null);
      setReelTitle("");
      setReelDescription("");
      setReelPublishFormOpen(false);
      forgetBufferedProfile({ id: user.id, username: profile?.username }, user.id);
      toast({ title: "Reel publie", description: "Votre reel a ete ajoute." });
    } catch (error) {
      console.error("Error creating reel:", error);
      const msg = error instanceof Error ? error.message : "Impossible d'ajouter ce reel.";
      toast({ title: "Erreur", description: msg });
    } finally {
      setUploadingReel(false);
      setReelUploadProgress(0);
    }
  };

  const buildSectionLink = (section: (typeof tabs)[number]) => {
    const usernameOrId = profile?.username || profile?.id;
    const viewQuery = section === "Posts" && postsView !== "grid" ? `&view=${postsView}` : "";
    return `${window.location.origin}/profile/${encodeURIComponent(usernameOrId)}?tab=${tabToQuery[section]}${viewQuery}`;
  };

  const copySectionLink = async (section: (typeof tabs)[number], title: string) => {
    try {
      const usernameOrId = profile?.username || profile?.id;
      const link = showReviews
        ? `${window.location.origin}/profile/${encodeURIComponent(usernameOrId)}?tab=avis`
        : showAbout
          ? `${window.location.origin}/profile/${encodeURIComponent(usernameOrId)}?tab=about`
          : buildSectionLink(section);
      await navigator.clipboard.writeText(link);
      toast({
        title: "Lien copié",
        description: `Lien de la section ${showReviews ? "Avis" : showAbout ? "Infos" : title} copié.`,
      });
    } catch {
      toast({ title: "Erreur", description: "Impossible de copier le lien." });
    }
  };

  if (loading || !profile) {
    if (!loading && !profile) {
      return <div className="py-10 text-center text-muted-foreground">Profil introuvable.</div>;
    }
    return <ProfilePageSkeleton />;
  }

  if (isBlockedProfile) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-card pb-10 sm:pb-20">
      <ProfileHeader
        profileId={profile.id}
        avatar={profileAvatar}
        fullName={profile.full_name || profile.username}
        username={profile.username || "Utilisateur"}
        coverPhoto={profile.cover_photo_url}
        bio={profile.bio}
        profession={profile.profession}
        location={profile.location}
        isOwnProfile={isOwnProfile}
        authReady={!authLoading}
        isFollowing={isFollowing}
        phone={profile.phone}
        websiteUrl={profile.website_url}
        onToggleFollow={handleToggleFollow}
        onEditProfile={() => setShowEditProfileModal(true)}
        onReportMember={handleReportMember}
        onBlockMember={handleBlockMember}
        onAboutMember={openAbout}
        onAboutThisMember={() => setShowAboutMember(true)}
        onMuteMember={() => setShowMuteModal(true)}
        rating={rating}
        reviewCount={reviews.length}
        onOpenReviews={openAvis}
      />

      <div className="mx-auto max-w-5xl">
        <div className="px-3 sm:px-4 md:px-6">
          <ProfileInfosCard
            profile={profile}
            isOwnProfile={isOwnProfile}
            userEmail={user?.email}
            rating={rating}
            reviewCount={reviews.length}
            layout="wide"
            onEdit={openInfosEditor}
          />
        </div>

        <div
          ref={tabsContentRef}
          className="scroll-mt-2 px-3 sm:px-4 md:px-6"
        >
        <div
          className={`mb-1 flex items-center bg-card px-2 py-1 sm:px-1 ${
            showReviews || showAbout ? "sticky top-0 z-20 border-b border-border" : ""
          }`}
        >
          {showReviews ? (
            <>
              <button
                type="button"
                onClick={closeAvis}
                className="mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-secondary"
                aria-label="Retour"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <p className="min-w-0 flex-1 text-sm font-semibold text-card-foreground">Avis</p>
            </>
          ) : showAbout ? (
            <>
              <button
                type="button"
                onClick={closeAbout}
                className="mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-secondary"
                aria-label="Retour"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <p className="min-w-0 flex-1 text-sm font-semibold text-card-foreground">Infos</p>
              {isOwnProfile ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => openInfosEditor()}
                >
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Modifier
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copySectionLink("Posts", "Infos")}
                className="h-9 w-9 shrink-0"
                aria-label="Partager la section"
                title="Partager la section"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="flex min-w-0 flex-1 border-b border-border">
              {tabs.map((tab) => {
                const count =
                  tab === "Posts" ? postsCount : tab === "Portfolio" ? portfolioCount : listingsCount;
                return (
                <button
                  key={tab}
                  onClick={() => goToTab(tab)}
                  className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-2.5 text-center transition-colors sm:flex-none sm:px-4 ${
                    activeTab === tab
                      ? "-mb-px border-accent text-accent"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {contentLoading ? (
                    <span className="inline-block h-4 w-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                  ) : (
                    <span className="text-sm font-medium tabular-nums">{count}</span>
                  )}
                  <span className="text-sm font-semibold">{tab}</span>
                </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div
            className={`min-w-0 ${
              showReviews || showAbout || activeTab === "Posts"
                ? ""
                : "rounded-lg border border-border bg-card"
            }`}
          >

          {showAbout && (
            <div id="about" className="min-w-0 overflow-hidden border-t border-border bg-card py-6 sm:rounded-lg sm:border">
              <div className="mb-6 px-4 sm:px-6 md:px-8">
                <ProfileDetailsFields
                  profile={profile}
                  isOwnProfile={isOwnProfile}
                  userEmail={user?.email}
                  onEdit={openInfosEditor}
                />
              </div>

              <section className="px-4 sm:px-6 md:px-8">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Présentation
                  </h3>
                  {isOwnProfile && !aboutHtmlIsEmpty(profile.about_text) && !editingAbout ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditForm((prev) => ({ ...prev, about: profile.about_text || "" }));
                        setEditingAbout(true);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </Button>
                  ) : null}
                </div>

                {isOwnProfile && editingAbout ? (
                  <div className="space-y-3">
                    <AboutRichEditor
                      value={editForm.about}
                      onChange={(html) => setEditForm((prev) => ({ ...prev, about: html.slice(0, MAX_ABOUT_LENGTH) }))}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditForm((prev) => ({ ...prev, about: profile.about_text || "" }));
                          setEditingAbout(false);
                        }}
                      >
                        Annuler
                      </Button>
                      <Button type="button" onClick={handleSaveAbout} disabled={savingProfile}>
                        {savingProfile ? "Enregistrement..." : "Enregistrer"}
                      </Button>
                    </div>
                  </div>
                ) : !aboutHtmlIsEmpty(profile.about_text) ? (
                  <div
                    className={`about-content w-full min-w-0 max-w-full overflow-hidden text-base leading-relaxed text-card-foreground ${
                      isOwnProfile ? "cursor-pointer" : ""
                    }`}
                    onClick={() => {
                      if (!isOwnProfile) return;
                      setEditForm((prev) => ({ ...prev, about: profile.about_text || "" }));
                      setEditingAbout(true);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeAboutHtml(toAboutHtml(profile.about_text)),
                    }}
                  />
                ) : isOwnProfile ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm((prev) => ({ ...prev, about: profile.about_text || "" }));
                      setEditingAbout(true);
                    }}
                    className="flex min-h-[180px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground hover:border-accent hover:text-foreground"
                  >
                    Cliquez pour rédiger votre présentation
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune présentation pour le moment.</p>
                )}
              </section>
            </div>
          )}

          {!showReviews && !showAbout && activeTab === "Portfolio" && (
            <div className="px-4 sm:px-6 md:px-8 py-6">
              <div className="mb-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copySectionLink("Portfolio", "Portfolio")}
                  className="h-9 w-9"
                  aria-label="Partager la section"
                  title="Partager la section"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              {contentLoading ? (
                <ProfileMediaGridSkeleton />
              ) : portfolioItems.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Aucun bien ni projet dans le portfolio...
                </p>
              ) : (
                <>
                <PortfolioGrid
                  items={portfolioItems.map((item) => {
                    const images = Array.isArray(item.images) ? item.images : [];
                    const image =
                      images[0] ||
                      item.single_image_url ||
                      item.after_image_url ||
                      item.before_image_url ||
                      "";
                    return {
                      id: item.id,
                      postType: item.post_type === "property" ? "property" : "project",
                      image,
                      images,
                      title: item.title || (item.post_type === "property" ? "Bien" : "Projet"),
                      description: item.description,
                      price: item.price,
                      surface: item.surface,
                      beds: item.beds,
                      baths: item.baths,
                      details: item.property_details || null,
                      sellerId: item.user_id,
                      sellerPhone: profile.phone,
                    };
                  })}
                />
                {(propertiesHasMore || projectsHasMore) ? (
                  <div className="flex flex-wrap justify-center gap-2">
                    <LoadMoreButton
                      hasMore={propertiesHasMore}
                      loading={loadingMoreProperties}
                      onClick={loadMoreProperties}
                      label="Charger plus de biens"
                    />
                    <LoadMoreButton
                      hasMore={projectsHasMore}
                      loading={loadingMoreProjects}
                      onClick={loadMoreProjects}
                      label="Charger plus de projets"
                    />
                  </div>
                ) : null}
                </>
              )}
            </div>
          )}

          {!showReviews && !showAbout && activeTab === "Posts" && (
            <div>
              <div className="mb-1 flex items-center justify-end gap-1 border-b border-border px-1 py-1">
                <div className="inline-flex rounded-md border border-border p-0.5">
                  <button
                    type="button"
                    aria-label="Publications"
                    onClick={() => {
                      setFeedPostId(null);
                      setPostsView("grid");
                    }}
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
                    onClick={() => {
                      setFeedPostId(null);
                      setPostsView("reels");
                    }}
                    className={`inline-flex h-7 w-8 items-center justify-center rounded-sm transition-colors ${
                      postsView === "reels"
                        ? "bg-accent/15 text-accent"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Video className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    copySectionLink("Posts", postsView === "reels" ? "Réels" : "Posts")
                  }
                  className="h-8 w-8 shrink-0"
                  aria-label={postsView === "reels" ? "Partager les réels" : "Partager les posts"}
                  title={postsView === "reels" ? "Partager les réels" : "Partager les posts"}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {postsView === "grid" ? (
                <>
                  {isOwnProfile && !contentLoading && <CreatePost onPostCreated={handlePostCreated} />}
                  {contentLoading ? (
                    <ProfileMediaGridSkeleton />
                  ) : posts.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">Aucun post publié.</div>
                  ) : feedPostId ? (
                    <div className="scroll-mt-2">
                      {posts.map((post) => (
                        <div
                          key={post.id}
                          id={`profile-post-${post.id}`}
                          className={`scroll-mt-2 ${
                            String(post.id) === String(feedPostId) ? "ring-2 ring-accent ring-inset" : ""
                          }`}
                        >
                          {renderFeedPost(post)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-0.5">
                      {posts.map((post) => {
                        const cover = coverOfPost(post);
                        const likes = post.likes_count || 0;
                        const comments = post.comments_count || 0;
                        const id = String(post.id);
                        const hovered = hoveredPostId === id;
                        return (
                          <div
                            key={post.id}
                            role="button"
                            tabIndex={0}
                            data-post-id={id}
                            aria-label={post.title || "Voir le post"}
                            onClick={() => navigate(`/post/${id}`)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                navigate(`/post/${id}`);
                              }
                            }}
                            className={`profile-post-thumb relative aspect-square ${
                              hovered ? "is-hovered" : ""
                            }`}
                          >
                            <div className="profile-post-thumb-media h-full w-full">
                              {cover ? (
                                <img src={cover} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center bg-muted p-2 text-center text-[11px] text-muted-foreground">
                                  {post.title || "Post"}
                                </span>
                              )}
                            </div>
                            <span className="profile-post-thumb-meta pointer-events-none absolute inset-0 flex items-center justify-center gap-4 text-white drop-shadow">
                              <span className="inline-flex items-center gap-1 text-sm font-semibold">
                                <Heart className="h-5 w-5 fill-white" />
                                {likes}
                              </span>
                              <span className="inline-flex items-center gap-1 text-sm font-semibold">
                                <MessageCircle className="h-5 w-5 fill-white" />
                                {comments}
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <LoadMoreButton
                    hasMore={postsHasMore}
                    loading={loadingMorePosts}
                    onClick={loadMorePosts}
                  />
                </>
              ) : (
                <div className="px-0 py-2 sm:py-3">
                  {isOwnProfile && (
                    <div className="mb-4 flex justify-center px-1">
                      <Collapsible open={reelPublishFormOpen} onOpenChange={setReelPublishFormOpen} className="w-full">
                        <div className="flex justify-center">
                          <CollapsibleTrigger asChild>
                            <Button type="button" variant="outline" size="sm">
                              Publier un reel
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="mt-3 grid gap-3 rounded-lg border border-border bg-card p-4">
                          <p className="text-xs text-muted-foreground leading-snug">
                            Actuellement, chaque utilisateur ne peut publier que {REEL_MAX_PER_USER_PER_MONTH} reels d’au
                            plus {REEL_MAX_DURATION_SECONDS} secondes par mois (mois calendaire UTC).
                          </p>
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
                            onChange={async (e) => {
                              const f = e.target.files?.[0] || null;
                              if (f && f.size > REEL_UPLOAD_MAX_BYTES) {
                                const maxMb = Math.round(REEL_UPLOAD_MAX_BYTES / (1024 * 1024));
                                toast({
                                  title: "Fichier trop grand",
                                  description: `Maximum ${maxMb} Mo pour un reel.`,
                                });
                                e.target.value = "";
                                setReelVideoFile(null);
                                return;
                              }
                              if (f) {
                                try {
                                  const seconds = await getBrowserVideoDurationSeconds(f);
                                  if (seconds > REEL_MAX_DURATION_SECONDS + 0.25) {
                                    toast({
                                      title: "Vidéo longue détectée",
                                      description: `Cette vidéo dure ${Math.round(
                                        seconds
                                      )}s. Nous n’utiliserons que les 30 premières secondes.`,
                                    });
                                  }
                                } catch {
                                  // best-effort metadata read
                                }
                              }
                              setReelVideoFile(f);
                            }}
                          />
                          {uploadingReel ? (
                            <UploadProgressRing
                              value={reelUploadProgress}
                              label="Envoi vers Cloudflare"
                            />
                          ) : null}
                          <div className="flex justify-end">
                            <Button onClick={handleCreateReel} disabled={!reelVideoFile || uploadingReel}>
                              {uploadingReel
                                ? reelUploadProgress > 0
                                  ? `Envoi ${reelUploadProgress}%`
                                  : "Préparation…"
                                : "Envoyer le reel"}
                            </Button>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )}
                  {contentLoading ? (
                    <ProfileMediaGridSkeleton />
                  ) : reels.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">Aucun reel publie.</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-0.5">
                      {reels.map((reel) => {
                        const openInReelsViewer = () => {
                          if (!profile?.id) return;
                          navigate(`/reels?from=profile&profileId=${profile.id}&reelId=${reel.id}`);
                        };
                        return (
                          <button
                            key={reel.id}
                            type="button"
                            aria-label={reel.title || "Voir le reel"}
                            onClick={openInReelsViewer}
                            className="relative aspect-[3/4] overflow-hidden bg-black"
                          >
                            {reel.cloudflare_video_id ? (
                              <CloudflareVideoPlayer
                                videoId={String(reel.cloudflare_video_id).trim()}
                                className="h-full w-full pointer-events-none"
                                autoPlay={false}
                                loop={true}
                                muted={true}
                                controls={false}
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
                  <LoadMoreButton
                    hasMore={reelsHasMore}
                    loading={loadingMoreReels}
                    onClick={loadMoreReels}
                  />
                </div>
              )}
            </div>
          )}

          {!showReviews && !showAbout && activeTab === "Services" && (
            <div className="px-4 py-4 sm:px-6 sm:py-6 md:px-8">
              <div className="mb-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copySectionLink("Services", "Services")}
                  className="h-9 w-9"
                  aria-label="Partager la section"
                  title="Partager la section"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              {isOwnProfile && !contentLoading && (
                <div className="mb-4">
                  <Button
                    onClick={() => setShowCreateListingForm((prev) => !prev)}
                    className="mb-3"
                  >
                    {showCreateListingForm ? "Annuler" : "Créer un nouveau service"}
                  </Button>
                  {showCreateListingForm && (
                    <FullScreenPopup open onClose={() => setShowCreateListingForm(false)}>
                      <PropertyListingWizard
                        onCancel={() => setShowCreateListingForm(false)}
                        onComplete={handleCreateListingFromWizard}
                      />
                    </FullScreenPopup>
                  )}
                </div>
              )}
              {contentLoading ? (
                <ProfileMediaGridSkeleton />
              ) : listings.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">Aucun service publié.</div>
              ) : (
                <>
                <div
                  className={`grid gap-4 sm:gap-6 ${
                    listings.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
                  }`}
                >
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
                      title={listing.title || "Service"}
                      profession={listing.profession}
                      priceRange={listing.price_range || "Prix sur demande"}
                      isSponsored={Boolean(listing.is_sponsored)}
                      fillWidth
                    />
                  ))}
                </div>
                <LoadMoreButton
                  hasMore={listingsHasMore}
                  loading={loadingMoreListings}
                  onClick={loadMoreListings}
                />
                </>
              )}
            </div>
          )}

          {showReviews && (
            <div id="avis" className="min-w-0">
              <div className="border-t border-border bg-card px-4 py-6 sm:rounded-lg sm:border sm:px-8">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-card-foreground">Avis</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {rating} / 5 · {reviews.length} avis
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copySectionLink("Posts", "Avis")}
                    className="h-9 w-9 shrink-0"
                    aria-label="Partager la section"
                    title="Partager la section"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {reviews.length === 0 ? (
                <div className="border-t border-border bg-card px-4 py-12 text-center text-muted-foreground sm:rounded-lg sm:border">
                  Aucun avis pour le moment.
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="overflow-hidden border-t border-border bg-card sm:rounded-lg sm:border">
                    <ReviewCard
                      avatar={review.reviewer?.avatar_url || getDefaultAvatar("craftsman")}
                      username={review.reviewer?.username || "Utilisateur"}
                      timeAgo={formatTimeAgo(review.created_at)}
                      rating={review.rating || 0}
                      text={review.text || ""}
                    />
                  </div>
                ))
              )}
            </div>
          )}

          </div>
        </div>
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

      <Dialog
        open={showEditProfileModal}
        onOpenChange={(open) => {
          setShowEditProfileModal(open);
          if (!open) {
            setProfileImageFile(null);
            setCoverImageFile(null);
            setRemoveCover(false);
            setRemoveAvatar(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <PhotoEditControl
              label="Photo de couverture"
              layout="cover"
              previewSrc={
                coverImageFile
                  ? URL.createObjectURL(coverImageFile)
                  : removeCover
                    ? ""
                    : profile.cover_photo_url || ""
              }
              canRemove={Boolean(coverImageFile || (profile.cover_photo_url && !removeCover))}
              onTake={(file) => {
                setCoverImageFile(file);
                setRemoveCover(false);
              }}
              onLibrary={(file) => {
                setCoverImageFile(file);
                setRemoveCover(false);
              }}
              onRemove={() => {
                setCoverImageFile(null);
                setRemoveCover(true);
              }}
            />

            <PhotoEditControl
              label="Photo de profil"
              layout="avatar"
              previewSrc={
                profileImageFile
                  ? URL.createObjectURL(profileImageFile)
                  : removeAvatar
                    ? getDefaultAvatar(profile.profile_type)
                    : profileAvatar
              }
              canRemove={Boolean(profileImageFile || (profile.avatar_url && !removeAvatar))}
              onTake={(file) => {
                setProfileImageFile(file);
                setRemoveAvatar(false);
              }}
              onLibrary={(file) => {
                setProfileImageFile(file);
                setRemoveAvatar(false);
              }}
              onRemove={() => {
                setProfileImageFile(null);
                setRemoveAvatar(true);
              }}
            />

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
              rows={3}
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

      <Dialog
        open={showEditInfosModal}
        onOpenChange={(open) => {
          setShowEditInfosModal(open);
          if (!open) setInfosEditField("all");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {infosEditField === "all"
                ? "Modifier les infos"
                : infosEditField === "profession"
                    ? "Ajouter une profession"
                    : infosEditField === "location"
                      ? "Ajouter un lieu"
                      : infosEditField === "email"
                        ? "Ajouter un email"
                        : infosEditField === "phone"
                          ? "Ajouter un téléphone"
                          : "Ajouter un site web"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {infosEditField === "all" || infosEditField === "profession" ? (
            <Input
              value={editForm.profession}
              onChange={(e) => setEditForm((prev) => ({ ...prev, profession: e.target.value }))}
              placeholder="Profession"
            />
            ) : null}
            {infosEditField === "all" || infosEditField === "location" ? (
            <div className="space-y-2">
              {(editForm.location.length ? editForm.location.split("\n") : [""]).map((lieu, index, rows) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={lieu}
                    onChange={(e) => {
                      const next = [...rows];
                      next[index] = e.target.value;
                      setEditForm((prev) => ({ ...prev, location: next.join("\n") }));
                    }}
                    placeholder={`Lieu ${index + 1} (ville, région, pays)`}
                  />
                  {rows.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        const next = rows.filter((_, i) => i !== index);
                        setEditForm((prev) => ({ ...prev, location: next.join("\n") }));
                      }}
                      aria-label="Supprimer ce lieu"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              ))}
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                onClick={() =>
                  setEditForm((prev) => {
                    const rows = prev.location.length ? prev.location.split("\n") : [""];
                    return { ...prev, location: [...rows, ""].join("\n") };
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Ajouter un lieu
              </button>
            </div>
            ) : null}
            {infosEditField === "all" || infosEditField === "email" ? (
            <Input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email de contact"
            />
            ) : null}
            {infosEditField === "all" || infosEditField === "phone" ? (
            <Input
              type="tel"
              value={editForm.phone}
              onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Téléphone"
            />
            ) : null}
            {infosEditField === "all" || infosEditField === "website" ? (
            <Textarea
              value={editForm.website}
              onChange={(e) => setEditForm((prev) => ({ ...prev, website: e.target.value }))}
              rows={3}
              placeholder="Liens de sites web (un par ligne)"
            />
            ) : null}
            <div className="flex justify-end">
              <Button onClick={handleSaveInfos} disabled={savingProfile}>
                {savingProfile ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ReportAbuseModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        variant="profile"
        subjectName={memberLabel}
        title="Report this profile"
        submitting={reportSubmitting}
        onSubmit={submitProfileReport}
      />
      <BlockMemberModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        message={`Bloquer ${memberLabel} ? Vous ne verrez plus ce profil.`}
        submitting={blockSubmitting}
        onConfirm={confirmBlockMember}
      />
      <MuteProfileModal
        isOpen={showMuteModal}
        onClose={() => setShowMuteModal(false)}
        handle={memberLabel}
        submitting={muteSubmitting}
        onConfirm={async (scope: MuteScope) => {
          if (!user || !profile) {
            toast({ title: "Connexion requise", description: "Connectez-vous pour masquer ce profil." });
            return;
          }
          setMuteSubmitting(true);
          try {
            await muteService.muteAccount(user.id, profile.id, scope);
            setShowMuteModal(false);
            toast({ title: "Compte masqué" });
            navigate("/", { replace: true });
          } catch (error) {
            console.error("Error muting profile:", error);
            toast({ title: "Erreur", description: "Impossible de masquer ce profil." });
          } finally {
            setMuteSubmitting(false);
          }
        }}
      />
      <AboutThisMemberSheet
        open={showAboutMember}
        onOpenChange={setShowAboutMember}
        createdAt={profile.created_at}
        contactUpdatedAt={profile.contact_updated_at}
        avatarUpdatedAt={profile.avatar_updated_at}
        signupCountry={profile.signup_country}
        isVerified={profile.is_verified}
        verifiedAt={profile.verified_at}
      />
    </div>
  );
};

export default Profile;
