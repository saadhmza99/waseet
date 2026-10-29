import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams, Navigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import ProfileHeader, { COVER_PHOTOS_ENABLED } from "@/components/ProfileHeader";
import ProfilePageSkeleton, { ProfileMediaGridSkeleton } from "@/components/ProfilePageSkeleton";
import ReviewCard from "@/components/ReviewCard";
import FeedPost from "@/components/FeedPost";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { profileBuffer, profileRouteSlug, type ProfileBufferBundle } from "@/lib/profileBuffer";
import { profileService } from "@/services/profileService";
import { postService } from "@/services/postService";
import { serviceService } from "@/services/serviceService";
import { productService, type ProductRow } from "@/services/productService";
import { offerFromRow } from "@/lib/serviceOffer";
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
import { isWithinUploadLimit, storageService, uploadMaxLabel } from "@/services/storageService";
import { notificationService } from "@/services/notificationService";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { getDefaultAvatar, resolveAvatarUrl } from "@/lib/avatar";
import { cityFromPost } from "@/lib/feedLocation";
import { contactPhone } from "@/lib/propertyListing";
import { catalogService } from "@/services/catalogService";
import { USERNAMES_ENABLED, profileMemberLabel } from "@/lib/profileHandle";
import AboutRichEditor from "@/components/AboutRichEditor";
import { aboutHtmlIsEmpty, sanitizeAboutHtml, toAboutHtml } from "@/lib/aboutHtml";
import PortfolioGrid from "@/components/PortfolioGrid";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ServiceCard } from "@/components/service/ServiceCard";
import { ProductCard } from "@/components/product/ProductCard";
import { ProfileCategoriesDialog } from "@/components/ProfileCategoriesDialog";
import { locationsFrom, ProfileDetailsFields, type InfosField } from "@/components/ProfileInfosCard";
import UploadProgressRing from "@/components/UploadProgressRing";
import { RetryImage } from "@/components/RetryImage";
import ReportAbuseModal from "@/components/ReportAbuseModal";
import ImageCropper from "@/components/ImageCropper";
import PhoneInput from "@/components/PhoneInput";
import { isCompletePhone } from "@/lib/phone";
import BlockMemberModal from "@/components/BlockMemberModal";
import MuteProfileModal from "@/components/MuteProfileModal";
import AboutThisMemberSheet from "@/components/AboutThisMemberSheet";
import VerifiedBadge from "@/components/VerifiedBadge";
import { muteService, type MuteScope } from "@/services/muteService";
import { blockedAccountsToast } from "@/lib/blockedAccountsToast";
import { sectionsForProfile, institutionKindLabel, institutionOffersFormations, isInstitutionProfile } from "@/lib/institution";
import { InstitutionLibrary } from "@/components/InstitutionLibrary";
import { institutionService } from "@/services/institutionService";
import { MAX_BIO_LENGTH } from "@/lib/bio";
import { realisationService, type RealisationRow } from "@/services/realisationService";
import FullScreenPopup from "@/components/FullScreenPopup";
import { ArrowLeft, Camera, Heart, ImagePlus, LayoutGrid, Pencil, Plus, Share2, Trash2, Video } from "lucide-react";

const tabs = ["Infos", "Posts", "Articles", "Formations", "Réalisations", "Projets", "Biens", "Services", "Produits"] as const;
type ProfileTab = (typeof tabs)[number];
type PostsView = "grid" | "reels";
const MAX_ABOUT_LENGTH = 50000;
const tabToQuery: Record<ProfileTab, string> = {
  Infos: "infos",
  Posts: "posts",
  Articles: "articles",
  Formations: "formations",
  Réalisations: "realisations",
  Projets: "projets",
  Biens: "biens",
  Services: "services",
  Produits: "produits",
};

const queryToTab: Record<string, ProfileTab> = {
  infos: "Infos",
  about: "Infos",
  details: "Infos",
  apropos: "Infos",
  posts: "Posts",
  articles: "Articles",
  formations: "Formations",
  realisations: "Réalisations",
  portfolio: "Projets",
  projets: "Projets",
  biens: "Biens",
  services: "Services",
  produits: "Produits",
  reels: "Posts",
};

const internalCategoryLinksOf = (profile: any) => {
  const links = Array.isArray(profile?.profile_internal_categories)
    ? profile.profile_internal_categories
    : [];
  const fromLinks = links
    .map((link: any) => {
      const cat = link?.internal_categories ?? link?.internal_category;
      const row = Array.isArray(cat) ? cat[0] : cat;
      if (!row?.code) return null;
      return {
        code: String(row.code),
        label: String(row.detailed_sub_category || row.code).trim(),
        isPrimary: Boolean(link?.is_primary),
      };
    })
    .filter(Boolean) as { code: string; label: string; isPrimary: boolean }[];
  if (fromLinks.length) {
    return [...fromLinks].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  }
  const raw = profile?.internal_category;
  const single = Array.isArray(raw) ? raw[0] : raw;
  if (!single?.code) return [];
  return [
    {
      code: String(single.code),
      label: String(single.detailed_sub_category || single.code).trim(),
      isPrimary: true,
    },
  ];
};

const internalCategoryCodesOf = (profile: any): string[] =>
  Array.from(new Set(internalCategoryLinksOf(profile).map((row) => row.code)));

const internalCategoryLabelsOf = (profile: any): string[] => {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const row of internalCategoryLinksOf(profile)) {
    const label = row.label.trim();
    if (!label || seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }
  return labels;
};

const PAGE = {
  posts: 12,
  reels: 9,
  listings: 12,
  products: 12,
  properties: 12,
  projects: 10,
  realisations: 12,
} as const;

const takePage = <T,>(rows: T[] | null | undefined, limit: number) => {
  const list = rows || [];
  return { items: list.slice(0, limit), hasMore: list.length > limit };
};

const totalCountOf = (rows: { totalCount?: number } | null | undefined) =>
  typeof rows?.totalCount === "number" ? rows.totalCount : 0;

const emptyEditForm = {
  fullName: "",
  username: "",
  bio: "",
  about: "",
  profession: "",
  location: "",
  phone: "",
  email: "",
  website: "",
};

const editFormFromProfile = (profileData: any, emailFallback = "") => ({
  fullName: profileData.full_name || "",
  username: profileData.username || "",
  bio: profileData.bio || "",
  about: profileData.about_text || "",
  profession: profileData.profession || "",
  location: profileData.location || "",
  phone: profileData.phone || "",
  email: profileData.email || emailFallback || "",
  website: profileData.website_url || "",
});

const forgetBufferedProfile = (profileLike: { id?: string; username?: string } | null | undefined) => {
  if (!profileLike) return;
  if (profileLike.id) profileBuffer.invalidate(profileLike.id);
  if (profileLike.username) profileBuffer.invalidate(profileLike.username);
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
  const [pending, setPending] = useState<{ file: File; source: "camera" | "library" } | null>(null);

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
          if (file) {
            if (!isWithinUploadLimit(file)) {
              toast({ title: "Image", description: `Chaque fichier doit faire ${uploadMaxLabel} maximum.` });
            } else {
              setPending({ file, source: "camera" });
            }
          }
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
          if (file) {
            if (!isWithinUploadLimit(file)) {
              toast({ title: "Image", description: `Chaque fichier doit faire ${uploadMaxLabel} maximum.` });
            } else {
              setPending({ file, source: "library" });
            }
          }
          e.target.value = "";
        }}
      />
      {pending ? (
        <ImageCropper
          file={pending.file}
          aspect={isCover ? 3 : 1}
          round={!isCover}
          outputWidth={isCover ? 1500 : 512}
          onCancel={() => setPending(null)}
          onConfirm={(cropped) => {
            if (pending.source === "camera") onTake(cropped);
            else onLibrary(cropped);
            setPending(null);
          }}
        />
      ) : isCover ? (
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
            <img src={previewSrc} alt="" className="h-20 w-20 rounded-2xl object-cover bg-muted" />
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
  const [bootBundle] = useState(() => profileBuffer.read([profileRouteSlug(id)]));
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { profile: currentProfile } = useProfile();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(
    queryToTab[searchParams.get("tab") || ""] || "Infos"
  );
  const [showReviews, setShowReviews] = useState(false);
  const [feedPostId, setFeedPostId] = useState<string | null>(null);
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);
  const [postsView, setPostsView] = useState<PostsView>(
    postsViewFromQuery(searchParams.get("tab") || "", searchParams.get("view"))
  );
  const [profile, setProfile] = useState<any>(bootBundle?.profile ?? null);
  const institution = isInstitutionProfile(profile);
  const showFormations = institution && institutionOffersFormations(profile?.institution_kind);
  const profileSections = useMemo(
    () => sectionsForProfile(profile, internalCategoryCodesOf(profile)),
    [profile]
  );
  const visibleTabs = useMemo(() => {
    if (institution) {
      return tabs.filter((tab) => tab === "Posts" || tab === "Articles" || (tab === "Formations" && showFormations));
    }
    return tabs.filter((tab) => {
      if (tab === "Articles" || tab === "Formations") return false;
      if (tab === "Infos") return true;
      if (tab === "Posts") return profileSections.showPosts;
      if (tab === "Réalisations") return profileSections.showRealisations;
      if (tab === "Projets") return profileSections.showProjets;
      if (tab === "Biens") return profileSections.showBiens;
      if (tab === "Services") return profileSections.showServices;
      if (tab === "Produits") return profileSections.showProduits;
      return false;
    });
  }, [institution, showFormations, profileSections]);

  useEffect(() => {
    if (!institution || !profile?.id) return;
    let cancelled = false;
    institutionService.listArticles(profile.id).then((rows) => {
      if (!cancelled) setArticlesCount(rows.length);
    }).catch(() => {
      if (!cancelled) setArticlesCount(0);
    });
    if (!showFormations) {
      setFormationsCount(null);
      return () => {
        cancelled = true;
      };
    }
    institutionService.listFormations(profile.id).then((rows) => {
      if (!cancelled) setFormationsCount(rows.length);
    }).catch(() => {
      if (!cancelled) setFormationsCount(0);
    });
    return () => {
      cancelled = true;
    };
  }, [institution, showFormations, profile?.id]);
  const [posts, setPosts] = useState<any[]>(bootBundle?.posts ?? []);
  const [postsHasMore, setPostsHasMore] = useState(Boolean(bootBundle?.postsHasMore));
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const standardPosts = useMemo(
    () => posts.filter((post) => !post?.post_type || post.post_type === "standard"),
    [posts]
  );
  const tabPosts = standardPosts;
  const [realisations, setRealisations] = useState<RealisationRow[]>([]);
  const [realisationsHasMore, setRealisationsHasMore] = useState(false);
  const [loadingMoreRealisations, setLoadingMoreRealisations] = useState(false);
  const [realisationsCount, setRealisationsCount] = useState<number | null>(null);
  const [realisationsReady, setRealisationsReady] = useState(false);
  const [selectedRealisation, setSelectedRealisation] = useState<RealisationRow | null>(null);
  const [listings, setListings] = useState<any[]>(bootBundle?.listings ?? []);
  const [listingsHasMore, setListingsHasMore] = useState(Boolean(bootBundle?.listingsHasMore));
  const [loadingMoreListings, setLoadingMoreListings] = useState(false);
  const [products, setProducts] = useState<ProductRow[]>(bootBundle?.products ?? []);
  const [productsHasMore, setProductsHasMore] = useState(Boolean(bootBundle?.productsHasMore));
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [reviews, setReviews] = useState<any[]>(bootBundle?.reviews ?? []);
  const [reels, setReels] = useState<any[]>(bootBundle?.reels ?? []);
  const [reelsHasMore, setReelsHasMore] = useState(Boolean(bootBundle?.reelsHasMore));
  const [loadingMoreReels, setLoadingMoreReels] = useState(false);
  const [propertyItems, setPropertyItems] = useState<any[]>(bootBundle?.propertyItems ?? []);
  const [propertiesHasMore, setPropertiesHasMore] = useState(Boolean(bootBundle?.propertiesHasMore));
  const [loadingMoreProperties, setLoadingMoreProperties] = useState(false);
  const [projectItems, setProjectItems] = useState<any[]>(bootBundle?.projectItems ?? []);
  const [projectsHasMore, setProjectsHasMore] = useState(Boolean(bootBundle?.projectsHasMore));
  const [loadingMoreProjects, setLoadingMoreProjects] = useState(false);
  const [postsCount, setPostsCount] = useState<number | null>(bootBundle ? bootBundle.postsCount : null);
  const [articlesCount, setArticlesCount] = useState<number | null>(null);
  const [formationsCount, setFormationsCount] = useState<number | null>(null);
  const [propertiesCount, setPropertiesCount] = useState<number | null>(bootBundle?.propertiesCount ?? null);
  const [projectsCount, setProjectsCount] = useState<number | null>(bootBundle?.projectsCount ?? null);
  const [listingsCount, setListingsCount] = useState<number | null>(bootBundle ? bootBundle.listingsCount : null);
  const [productsCount, setProductsCount] = useState<number | null>(bootBundle ? bootBundle.productsCount : null);
  const [loading, setLoading] = useState(!bootBundle);

  useEffect(() => {
    if (loading || !profile || !visibleTabs.length) return;
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0]);
    }
  }, [loading, profile, visibleTabs, activeTab]);
  const [postsReady, setPostsReady] = useState(Boolean(bootBundle));
  const [reelsReady, setReelsReady] = useState(Boolean(bootBundle));
  const [portfolioReady, setPortfolioReady] = useState(Boolean(bootBundle));
  const [servicesReady, setServicesReady] = useState(Boolean(bootBundle));
  const [productsReady, setProductsReady] = useState(Boolean(bootBundle));
  const [isBlockedProfile, setIsBlockedProfile] = useState(Boolean(bootBundle?.isBlockedProfile));
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockSubmitting, setBlockSubmitting] = useState(false);
  const [showAboutMember, setShowAboutMember] = useState(false);
  const [showMuteModal, setShowMuteModal] = useState(false);
  const [muteSubmitting, setMuteSubmitting] = useState(false);
  const [followers, setFollowers] = useState<any[]>(bootBundle?.followers ?? []);
  const [isFollowing, setIsFollowing] = useState(Boolean(bootBundle?.isFollowing));
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showEditInfosModal, setShowEditInfosModal] = useState(false);
  const [infosEditField, setInfosEditField] = useState<InfosField | "all">("all");
  const [preferredWebsiteIndex, setPreferredWebsiteIndex] = useState(0);
  const [editForm, setEditForm] = useState(() =>
    bootBundle?.profile ? editFormFromProfile(bootBundle.profile) : emptyEditForm
  );
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
  const profileTabsScrollRef = useRef<HTMLDivElement>(null);

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
    setEditingAbout(false);
    if (tab !== "Posts" && tab !== "Réalisations") setFeedPostId(null);
    setActiveTab(tab);
    revealTabs();
  };

  // Social-style tab strip: keep the active tab readable by scrolling it into view.
  useEffect(() => {
    if (showReviews) return;
    const root = profileTabsScrollRef.current;
    if (!root) return;
    const active = root.querySelector<HTMLElement>(`[data-profile-tab="${activeTab}"]`);
    active?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeTab, showReviews]);

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
      return;
    }
    setShowReviews(false);
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
      } else {
        next.set("tab", tabToQuery[activeTab]);
        if (activeTab === "Posts" && postsView !== "grid") next.set("view", postsView);
        else next.delete("view");
      }
      return next.toString() === prev.toString() ? prev : next;
    }, { replace: true });
  }, [activeTab, postsView, showReviews]);

  const applyBundle = useCallback(
    (bundle: ProfileBufferBundle) => {
      const profileData = bundle?.profile;
      if (!profileData?.id) return;
      setProfile(profileData);
      setEditForm(editFormFromProfile(profileData, user?.id === profileData.id ? user?.email || "" : ""));
      setEditingAbout(false);
      setPosts(bundle.posts);
      setPostsHasMore(bundle.postsHasMore);
      setListings(bundle.listings);
      setListingsHasMore(bundle.listingsHasMore);
      setProducts(bundle.products || []);
      setProductsHasMore(Boolean(bundle.productsHasMore));
      setReviews(bundle.reviews);
      setReels(bundle.reels);
      setReelsHasMore(bundle.reelsHasMore);
      setPropertyItems(bundle.propertyItems);
      setPropertiesHasMore(bundle.propertiesHasMore);
      setProjectItems(bundle.projectItems);
      setProjectsHasMore(bundle.projectsHasMore);
      setPostsCount(bundle.postsCount);
      setPropertiesCount(bundle.propertiesCount ?? bundle.propertyItems.length);
      setProjectsCount(bundle.projectsCount ?? bundle.projectItems.length);
      setListingsCount(bundle.listingsCount);
      setProductsCount(bundle.productsCount ?? bundle.products?.length ?? 0);
      setRealisations(bundle.realisations || []);
      setRealisationsHasMore(Boolean(bundle.realisationsHasMore));
      setRealisationsCount(bundle.realisationsCount ?? bundle.realisations?.length ?? 0);
      setFollowers(bundle.followers);
      setIsBlockedProfile(bundle.isBlockedProfile);
      setIsFollowing(bundle.isFollowing);
      setLoading(false);
      setPostsReady(true);
      setReelsReady(true);
      setPortfolioReady(true);
      setServicesReady(true);
      setProductsReady(true);
      setRealisationsReady(true);
    },
    [user?.id, user?.email]
  );

  const lastProfileSlug = useRef<string>("");

  useLayoutEffect(() => {
    const slug = profileRouteSlug(id);
    if (!slug) return;
    const cached = profileBuffer.read([slug]);
    if (cached?.profile?.id) {
      applyBundle(cached);
      lastProfileSlug.current = slug;
      return;
    }
    if (lastProfileSlug.current !== slug) {
      lastProfileSlug.current = slug;
      setLoading(true);
      setPostsReady(false);
      setReelsReady(false);
      setPortfolioReady(false);
      setServicesReady(false);
      setProductsReady(false);
      setRealisationsReady(false);
      setPostsCount(null);
      setPropertiesCount(null);
      setProjectsCount(null);
      setListingsCount(null);
      setProductsCount(null);
      setRealisationsCount(null);
    }
  }, [id, applyBundle]);

  useEffect(() => {
    let cancelled = false;
    const alive = () => !cancelled;
    const settle = async <T,>(work: Promise<T>, fallback: T): Promise<T> => {
      try {
        return await work;
      } catch (error) {
        console.error(error);
        return fallback;
      }
    };

    const loadProfileData = async () => {
      if (authLoading) return;

      const slug = profileRouteSlug(id);
      const cached = profileBuffer.read([slug, !slug ? user?.id : null]);
      if (cached?.profile?.id) {
        applyBundle(cached);
        return;
      }

      try {
        setLoading(true);
        setPostsReady(false);
        setReelsReady(false);
        setPortfolioReady(false);
        setServicesReady(false);
        setRealisationsReady(false);
        setProfile(null);
        setPosts([]);
        setRealisations([]);
        setPropertyItems([]);
        setProjectItems([]);
        setListings([]);
        setReels([]);
        setReviews([]);
        setFollowers([]);
        setPostsCount(null);
        setPropertiesCount(null);
        setProjectsCount(null);
        setListingsCount(null);
        setRealisationsCount(null);

        let profileData = null;
        if (slug) {
          const looksLikeId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
          if (looksLikeId) {
            profileData = await profileService.getProfile(slug).catch(() => null);
          } else {
            profileData = await profileService.getProfileByUsername(slug).catch(() => null);
          }
        }
        if (!alive()) return;
        if (!profileData && user?.id) {
          profileData = await profileService.getProfile(user.id).catch(() => null);
        }
        if (!alive()) return;
        if (!profileData) {
          setProfile(null);
          setPostsReady(true);
          setReelsReady(true);
          setPortfolioReady(true);
          setServicesReady(true);
          setProductsReady(true);
          setRealisationsReady(true);
          return;
        }

        setProfile(profileData);
        setEditForm(editFormFromProfile(profileData, user?.id === profileData.id ? user?.email || "" : ""));
        setEditingAbout(false);
        setLoading(false);

        let propertiesTotal = 0;
        let projectsTotal = 0;
        let propertiesDone = false;
        let projectsDone = false;
        const finishPortfolio = () => {
          if (!alive() || !propertiesDone || !projectsDone) return;
          setPropertiesCount(propertiesTotal);
          setProjectsCount(projectsTotal);
          setPortfolioReady(true);
        };

        const postsTask = settle(postService.getPostsByUser(profileData.id, PAGE.posts, 0), Object.assign([], { totalCount: 0 })).then((postsData) => {
          const page = takePage(postsData, PAGE.posts);
          const count = totalCountOf(postsData);
          if (alive()) {
            setPosts(page.items);
            setPostsHasMore(page.hasMore);
            setPostsCount(count);
            setPostsReady(true);
          }
          return { page, count };
        });
        const realisationsTask = settle(
          realisationService.listByUser(profileData.id, PAGE.realisations, 0),
          Object.assign([], { totalCount: 0 }),
        ).then((rows) => {
          const page = takePage(rows, PAGE.realisations);
          const count = totalCountOf(rows);
          if (alive()) {
            setRealisations(page.items);
            setRealisationsHasMore(page.hasMore);
            setRealisationsCount(count);
            setRealisationsReady(true);
          }
          return { page, count };
        });
        const listingsTask = settle(serviceService.getServicesByUser(profileData.id, PAGE.listings, 0), Object.assign([], { totalCount: 0 })).then((listingsData) => {
          const page = takePage(listingsData, PAGE.listings);
          const count = totalCountOf(listingsData);
          if (alive()) {
            setListings(page.items);
            setListingsHasMore(page.hasMore);
            setListingsCount(count);
            setServicesReady(true);
          }
          return { page, count };
        });
        const productsTask = settle(productService.listProductsByUser(profileData.id, PAGE.products, 0), Object.assign([], { totalCount: 0 })).then((productsData) => {
          const page = takePage(productsData, PAGE.products);
          const count = totalCountOf(productsData);
          if (alive()) {
            setProducts(page.items);
            setProductsHasMore(page.hasMore);
            setProductsCount(count);
            setProductsReady(true);
          }
          return { page, count };
        });
        const reelsTask = settle(reelService.getReelsByUser(profileData.id, PAGE.reels, 0), []).then((reelsData) => {
          const page = takePage(reelsData, PAGE.reels);
          if (alive()) {
            setReels(page.items);
            setReelsHasMore(page.hasMore);
            setReelsReady(true);
          }
          return page;
        });
        const propertiesTask = settle(catalogService.getPropertiesByUser(profileData.id, PAGE.properties, 0), Object.assign([], { totalCount: 0 })).then((propertiesData) => {
          const page = takePage(propertiesData, PAGE.properties);
          propertiesTotal = totalCountOf(propertiesData);
          propertiesDone = true;
          if (alive()) {
            setPropertyItems(page.items);
            setPropertiesHasMore(page.hasMore);
          }
          finishPortfolio();
          return page;
        });
        const projectsTask = settle(catalogService.getProjectsByUser(profileData.id, PAGE.projects, 0), Object.assign([], { totalCount: 0 })).then((projectsData) => {
          const page = takePage(projectsData, PAGE.projects);
          projectsTotal = totalCountOf(projectsData);
          projectsDone = true;
          if (alive()) {
            setProjectItems(page.items);
            setProjectsHasMore(page.hasMore);
          }
          finishPortfolio();
          return page;
        });
        const reviewsTask = settle(reviewService.getReviewsByUser(profileData.id), []).then((reviewsData) => {
          const reviews = reviewsData || [];
          if (alive()) setReviews(reviews);
          return reviews;
        });
        const followersTask = settle(followService.getFollowers(profileData.id), []).then((followersData) => {
          const followers = followersData || [];
          if (alive()) setFollowers(followers);
          return followers;
        });
        const blockedTask = settle(
          user ? moderationService.getBlockedUserIds(user.id) : Promise.resolve([] as string[]),
          [] as string[]
        ).then((blockedIds) => {
          const isBlocked = new Set(blockedIds || []).has(profileData.id);
          if (alive()) setIsBlockedProfile(isBlocked);
          return isBlocked;
        });
        const followingTask = settle(
          user && user.id !== profileData.id ? followService.isFollowing(user.id, profileData.id) : Promise.resolve(false),
          false
        ).then((following) => {
          if (alive()) setIsFollowing(following);
          return following;
        });

        const [postsResult, realisationsResult, listingsResult, productsResult, reelsPage, propertiesPage, projectsPage, reviews, followers, isBlocked, following] =
          await Promise.all([
            postsTask,
            realisationsTask,
            listingsTask,
            productsTask,
            reelsTask,
            propertiesTask,
            projectsTask,
            reviewsTask,
            followersTask,
            blockedTask,
            followingTask,
          ]);
        if (!alive()) return;

        profileBuffer.write([slug, profileData.id, profileData.username], {
          profile: profileData,
          posts: postsResult.page.items,
          postsHasMore: postsResult.page.hasMore,
          listings: listingsResult.page.items,
          listingsHasMore: listingsResult.page.hasMore,
          products: productsResult.page.items,
          productsHasMore: productsResult.page.hasMore,
          reviews,
          reels: reelsPage.items,
          reelsHasMore: reelsPage.hasMore,
          propertyItems: propertiesPage.items,
          propertiesHasMore: propertiesPage.hasMore,
          projectItems: projectsPage.items,
          projectsHasMore: projectsPage.hasMore,
          postsCount: postsResult.count,
          portfolioCount: propertiesTotal + projectsTotal,
          propertiesCount: propertiesTotal,
          projectsCount: projectsTotal,
          listingsCount: listingsResult.count,
          productsCount: productsResult.count,
          realisations: realisationsResult.page.items,
          realisationsHasMore: realisationsResult.page.hasMore,
          realisationsCount: realisationsResult.count,
          followers,
          isBlockedProfile: isBlocked,
          isFollowing: following,
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        if (!alive()) return;
        setProfile(null);
        setIsBlockedProfile(false);
        setFollowers([]);
      } finally {
        if (!alive()) return;
        setLoading(false);
        setPostsReady(true);
        setReelsReady(true);
        setPortfolioReady(true);
        setServicesReady(true);
        setProductsReady(true);
        setRealisationsReady(true);
      }
    };

    void loadProfileData();
    return () => {
      cancelled = true;
    };
  }, [id, user?.id, authLoading, applyBundle]);

  const rating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return Number((total / reviews.length).toFixed(1));
  }, [reviews]);

  const visibleProjects = projectItems;
  const visibleProperties = propertyItems;
  const recruitServices = useMemo(
    () =>
      listings.map((listing) => {
        const card = serviceService.toCardProps(listing);
        return {
          id: String(listing.id),
          title: card.title,
          description: card.description || card.profession || "",
          location: card.location || "",
          budget: card.price_range || "",
        };
      }),
    [listings],
  );

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
    } catch {
      return "récemment";
    }
  };

  const catalogCards = (items: any[], kind: "property" | "project") =>
    items.map((item) => {
      const images = Array.isArray(item.images) ? item.images : [];
      const image = images[0] || item.single_image_url || item.after_image_url || item.before_image_url || "";
      return {
        id: item.id,
        postType: kind,
        image,
        images,
        title: item.title || (kind === "property" ? "Bien" : "Projet"),
        description: item.description,
        price: item.price,
        surface: item.surface,
        beds: item.beds,
        baths: item.baths,
        details: item.details || item.property_details || null,
        sellerId: item.user_id,
        sellerPhone: profile?.phone,
      };
    });

  const isOwnProfile = Boolean(
    user &&
      profile &&
      (String(user.id) === String(profile.id) ||
        (currentProfile?.id && String(currentProfile.id) === String(profile.id)) ||
        (currentProfile?.username &&
          profile.username &&
          String(currentProfile.username).toLowerCase() === String(profile.username).toLowerCase()))
  );
  const profileAvatar = resolveAvatarUrl(profile?.avatar_url, profile?.profile_type);
  const memberLabel = profileMemberLabel(profile?.full_name, profile?.username);

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
        await serviceService.getServicesByUser(profile.id, PAGE.listings, listings.length),
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

  const loadMoreProducts = async () => {
    if (!profile?.id || loadingMoreProducts || !productsHasMore) return;
    setLoadingMoreProducts(true);
    try {
      const page = takePage(
        await productService.listProductsByUser(profile.id, PAGE.products, products.length),
        PAGE.products
      );
      setProducts((prev) => [...prev, ...page.items]);
      setProductsHasMore(page.hasMore);
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setLoadingMoreProducts(false);
    }
  };

  const loadMoreProperties = async () => {
    if (!profile?.id || loadingMoreProperties || !propertiesHasMore) return;
    setLoadingMoreProperties(true);
    try {
      const page = takePage(
        await catalogService.getPropertiesByUser(profile.id, PAGE.properties, propertyItems.length),
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
        await catalogService.getProjectsByUser(profile.id, PAGE.projects, projectItems.length),
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
    setEditingAbout(false);
    setShowReviews(true);
    revealTabs();
  };

  const closeAvis = () => {
    setShowReviews(false);
    revealTabs();
  };

  const openInfosEditor = (field?: InfosField) => {
    setInfosEditField(field ?? "all");
    if (field === "website") {
      setEditForm((prev) => {
        const rows = prev.website.length ? prev.website.split("\n") : [];
        if (!rows.length || rows[rows.length - 1].trim()) {
          return { ...prev, website: [...rows, ""].join("\n") };
        }
        return prev;
      });
    }
    setPreferredWebsiteIndex(0);
    setShowEditInfosModal(true);
  };

  const renderFeedPost = (post: any) => (
    <FeedPost
      key={post.id}
      postId={post.id}
      postUserId={post.user_id}
      avatar={profileAvatar}
      username={profile.username || "Utilisateur"}
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
      showLikeCount={isOwnProfile}
      comments={post.comments_count || 0}
      shares={post.shares_count || 0}
      isSponsored={post.is_sponsored || false}
      postType={post.post_type}
      price={post.price}
      surface={post.surface}
      beds={post.beds}
      baths={post.baths}
      phone={contactPhone(post.property_details, profile.phone)}
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
      forgetBufferedProfile(profile);
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
      toast({ title: "Signalement envoyé" });
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
            title: "Vous pourrez bloquer ce compte à nouveau après 48 heures.",
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
          ? "Vous pourrez bloquer ce compte à nouveau après 48 heures."
          : "Erreur",
        description: isBlockCooldownError(error) ? undefined : "Impossible de bloquer ce profil.",
      });
    } finally {
      setBlockSubmitting(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !isOwnProfile) return;
    setSavingProfile(true);
    try {
      let nextUsername = profile.username;
      if (USERNAMES_ENABLED) {
        nextUsername = editForm.username.trim().toLowerCase();
        if (nextUsername && nextUsername !== (profile.username || "").toLowerCase()) {
          const existingProfile = await profileService.getProfileByUsername(nextUsername).catch(() => null);
          if (existingProfile && existingProfile.id !== user.id) {
            toast({ title: "Username indisponible", description: "Ce username est deja pris." });
            setSavingProfile(false);
            return;
          }
        }
      }
      let avatarUrl: string | null = profile.avatar_url || null;
      if (removeAvatar) {
        avatarUrl = null;
      } else if (profileImageFile) {
        avatarUrl = await storageService.uploadImage(profileImageFile, "avatars");
      }
      const profilePatch: Parameters<typeof profileService.updateProfile>[1] = {
        username: nextUsername || profile.username,
        full_name: editForm.fullName.trim() || profile.full_name,
        bio: editForm.bio.slice(0, MAX_BIO_LENGTH),
        profile_type: profile.profile_type,
        avatar_url: avatarUrl,
      };
      if (COVER_PHOTOS_ENABLED) {
        let coverPhotoUrl: string | null = profile.cover_photo_url || null;
        if (removeCover) {
          coverPhotoUrl = null;
        } else if (coverImageFile) {
          coverPhotoUrl = await storageService.uploadImage(coverImageFile, "covers");
        }
        profilePatch.cover_photo_url = coverPhotoUrl;
      }
      const updated = await profileService.updateProfile(user.id, profilePatch);
      setProfile(updated);
      setEditingAbout(false);
      setShowEditProfileModal(false);
      setProfileImageFile(null);
      setCoverImageFile(null);
      setRemoveCover(false);
      setRemoveAvatar(false);
      forgetBufferedProfile(updated);
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
    if (editForm.phone.trim() && !isCompletePhone(editForm.phone)) {
      toast({ title: "Téléphone incomplet", description: "Entrez un numéro valide pour l'indicatif choisi." });
      return;
    }
    setSavingProfile(true);
    try {
      const websiteRows = locationsFrom(editForm.website);
      const preferredIndex = Math.min(Math.max(0, preferredWebsiteIndex), Math.max(0, websiteRows.length - 1));
      const website_url = websiteRows.length
        ? [websiteRows[preferredIndex], ...websiteRows.filter((_, i) => i !== preferredIndex)].join("\n")
        : null;

      const updated = await profileService.updateProfile(user.id, {
        phone: editForm.phone.trim() || null,
        location: editForm.location.trim() || null,
        website_url,
      });
      setProfile(updated);
      setShowEditInfosModal(false);
      forgetBufferedProfile(updated);
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
        about_text: aboutHtmlIsEmpty(editForm.about)
          ? null
          : sanitizeAboutHtml(editForm.about).slice(0, MAX_ABOUT_LENGTH) || null,
      });
      setProfile(updated);
      setEditingAbout(false);
      forgetBufferedProfile(updated);
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
      forgetBufferedProfile({ id: user.id, username: profile?.username });
      toast({ title: "Vidéo publiée", description: "Votre vidéo a été ajoutée." });
    } catch (error) {
      console.error("Error creating reel:", error);
      const msg = error instanceof Error ? error.message : "Impossible d'ajouter cette vidéo.";
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
        : buildSectionLink(section);
      await navigator.clipboard.writeText(link);
      toast({
        title: "Lien copié",
        description: `Lien de la section ${showReviews ? "Avis" : title} copié.`,
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
        coverPhoto={undefined}
        bio={profile.bio}
        ice={profile.ice}
        specialties={internalCategoryLabelsOf(profile)}
        profession={institution ? institutionKindLabel(profile.institution_kind) : profile.profession}
        location={profile.location}
        isOwnProfile={isOwnProfile}
        isVerified={Boolean(profile.is_verified)}
        profileType={profile.profile_type}
        authReady={!authLoading}
        isFollowing={isFollowing}
        phone={profile.phone}
        websiteUrl={profile.website_url}
        onToggleFollow={handleToggleFollow}
        onEditProfile={() => setShowEditProfileModal(true)}
        onEditCategories={institution ? undefined : () => setShowCategories(true)}
        onReportMember={handleReportMember}
        onBlockMember={handleBlockMember}
        onAboutThisMember={() => setShowAboutMember(true)}
        onMuteMember={() => setShowMuteModal(true)}
        rating={rating}
        reviewCount={reviews.length}
        onOpenReviews={openAvis}
        services={recruitServices}
      />

      <div className="mx-auto max-w-7xl">
        <div
          ref={tabsContentRef}
          className="scroll-mt-2 px-3 sm:px-4 md:px-6"
        >
        <div
          className={`mb-1 flex items-center bg-card px-2 py-1 sm:px-1 ${
            showReviews ? "sticky top-0 z-20 border-b border-border" : ""
          }`}
        >
          {showReviews ? (
            <>
              <button
                type="button"
                onClick={closeAvis}
                className="mr-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-secondary"
                aria-label="Retour"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <p className="min-w-0 flex-1 text-lg font-semibold text-card-foreground">Avis</p>
            </>
          ) : (
            <div
              ref={profileTabsScrollRef}
              className="-mx-2 flex min-w-0 flex-1 touch-pan-x snap-x snap-mandatory overflow-x-auto overscroll-x-contain border-b border-border px-2 [scrollbar-width:none] sm:mx-0 sm:snap-none sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
            >
              {visibleTabs.map((tab) => {
                const count =
                  tab === "Infos"
                    ? undefined
                    : tab === "Posts"
                      ? standardPosts.length
                      : tab === "Articles"
                        ? articlesCount
                      : tab === "Formations"
                        ? formationsCount
                      : tab === "Réalisations"
                        ? realisationsCount ?? realisations.length
                      : tab === "Projets"
                        ? projectsCount
                        : tab === "Biens"
                          ? propertiesCount
                          : tab === "Services"
                            ? listingsCount
                            : productsCount;
                const tabLabel = tab === "Posts" ? "Publications" : tab;
                const hideZeroCount = count === 0;
                return (
                  <button
                    key={tab}
                    type="button"
                    data-profile-tab={tab}
                    onClick={() => goToTab(tab)}
                    className={`inline-flex shrink-0 snap-center items-center justify-center gap-1.5 border-b-2 px-3.5 py-3.5 text-center transition-colors sm:gap-2 sm:px-5 ${
                      activeTab === tab
                        ? "-mb-px border-accent text-accent"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab !== "Infos" && !hideZeroCount ? (
                      count == null ? (
                        <span className="inline-block h-4 w-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700 sm:h-5 sm:w-7" />
                      ) : (
                        <span className="text-sm font-medium tabular-nums sm:text-lg">{count}</span>
                      )
                    ) : null}
                    <span className="whitespace-nowrap text-sm font-semibold sm:text-lg">{tabLabel}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div
            className={`min-w-0 ${
              showReviews || activeTab === "Posts" || activeTab === "Réalisations" || activeTab === "Infos"
                ? ""
                : "rounded-lg border border-border bg-card"
            }`}
          >

          {!showReviews && activeTab === "Infos" && (
            <div id="about" className="min-w-0 overflow-hidden border-t border-border bg-card pb-8 pt-3 sm:rounded-lg sm:border sm:pt-4">
              <div className="mb-6 flex items-start justify-between gap-3 px-4 sm:px-6 md:px-8">
                <div className="min-w-0 flex-1">
                  <ProfileDetailsFields
                    profile={profile}
                    isOwnProfile={isOwnProfile}
                    onEdit={openInfosEditor}
                  />
                </div>
                <div className="flex shrink-0 items-center gap-1">
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
                    onClick={() => copySectionLink("Infos", "Infos")}
                    className="h-9 w-9 shrink-0"
                    aria-label="Partager la section"
                    title="Partager la section"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <section className="px-4 sm:px-6 md:px-8">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
                    À propos
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
                    className={`about-content w-full min-w-0 max-w-full overflow-hidden text-lg leading-relaxed text-card-foreground ${
                      isOwnProfile ? "cursor-pointer" : ""
                    }`}
                    onClick={(event) => {
                      if (!isOwnProfile || (event.target as HTMLElement).closest("a")) return;
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
                    className="flex min-h-[200px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-base text-muted-foreground hover:border-accent hover:text-foreground"
                  >
                    Cliquez pour rédiger votre à propos
                  </button>
                ) : (
                  <p className="text-base text-muted-foreground">Aucun à propos pour le moment.</p>
                )}
              </section>
            </div>
          )}

          {!showReviews && activeTab === "Projets" && (
            <div className="px-4 sm:px-6 md:px-8 py-6">
              <div className="mb-3 flex items-center justify-between gap-2">
                {isOwnProfile ? (
                  <Button type="button" onClick={() => navigate("/projet/nouveau")} className="h-9 bg-[#174f43] px-3 text-white hover:bg-[#174f43]/90">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Publier un projet
                  </Button>
                ) : (
                  <span />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copySectionLink("Projets", "Projets")}
                  className="h-9 w-9"
                  aria-label="Partager la section"
                  title="Partager la section"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              {!portfolioReady ? (
                <ProfileMediaGridSkeleton />
              ) : visibleProjects.length === 0 ? (
                <p className="py-12 text-center text-base text-muted-foreground">Aucun projet pour le moment.</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-3">
                    {visibleProjects.map((row) => (
                      <ProjectCard
                        key={row.id}
                        row={row}
                        onDeleted={() => {
                          setProjectItems((prev) => prev.filter((item) => item.id !== row.id));
                          setProjectsCount((count) => (count == null ? count : Math.max(0, count - 1)));
                        }}
                      />
                    ))}
                  </div>
                  <LoadMoreButton
                    hasMore={projectsHasMore}
                    loading={loadingMoreProjects}
                    onClick={loadMoreProjects}
                    label="Charger plus de projets"
                  />
                </>
              )}
            </div>
          )}

          {!showReviews && activeTab === "Biens" && (
            <div className="px-4 sm:px-6 md:px-8 py-6">
              <div className="mb-3 flex items-center justify-between gap-2">
                {isOwnProfile ? (
                  <Button
                    type="button"
                    onClick={() => navigate("/", { state: { openCreate: true } })}
                    className="h-9 bg-[#174f43] px-3 text-white hover:bg-[#174f43]/90"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Publier un bien
                  </Button>
                ) : (
                  <span />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copySectionLink("Biens", "Biens")}
                  className="h-9 w-9"
                  aria-label="Partager la section"
                  title="Partager la section"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              {!portfolioReady ? (
                <ProfileMediaGridSkeleton />
              ) : visibleProperties.length === 0 ? (
                <p className="py-12 text-center text-base text-muted-foreground">Aucun bien pour le moment.</p>
              ) : (
                <>
                  <PortfolioGrid items={catalogCards(visibleProperties, "property")} />
                  <LoadMoreButton
                    hasMore={propertiesHasMore}
                    loading={loadingMoreProperties}
                    onClick={loadMoreProperties}
                    label="Charger plus de biens"
                  />
                </>
              )}
            </div>
          )}

          {!showReviews && activeTab === "Réalisations" && (
            <div>
              <div className="mb-1 flex items-center justify-between gap-1 border-b border-border px-1 py-1">
                {isOwnProfile ? (
                  <Button
                    type="button"
                    onClick={() => navigate("/", { state: { openCreate: true } })}
                    className="h-8 bg-[#174f43] px-3 text-white hover:bg-[#174f43]/90"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Nouvelle réalisation
                  </Button>
                ) : (
                  <span />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copySectionLink("Réalisations", "Réalisations")}
                  className="h-8 w-8 shrink-0"
                  aria-label="Partager les réalisations"
                  title="Partager les réalisations"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              {!realisationsReady ? (
                <ProfileMediaGridSkeleton />
              ) : realisations.length === 0 ? (
                <div className="py-10 text-center text-base text-muted-foreground">
                  Aucune réalisation publiée.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {realisations.map((item) => {
                      const cover =
                        item.cover ||
                        (Array.isArray(item.images) ? item.images[0] : "") ||
                        "";
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedRealisation(item)}
                          className="group overflow-hidden rounded-lg border border-border bg-card text-left"
                        >
                          <div className="aspect-[4/3] overflow-hidden bg-muted">
                            {cover ? (
                              <RetryImage
                                src={cover}
                                alt={item.title}
                                className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                Photo
                              </div>
                            )}
                          </div>
                          <div className="space-y-0.5 p-2.5">
                            <p className="line-clamp-2 text-sm font-semibold text-card-foreground">
                              {item.title}
                            </p>
                            {item.city ? (
                              <p className="truncate text-xs text-muted-foreground">{item.city}</p>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {realisationsHasMore ? (
                    <div className="mt-4 flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loadingMoreRealisations}
                        onClick={async () => {
                          if (!profile?.id || loadingMoreRealisations) return;
                          setLoadingMoreRealisations(true);
                          try {
                            const rows = await realisationService.listByUser(
                              profile.id,
                              PAGE.realisations,
                              realisations.length,
                            );
                            const page = takePage(rows, PAGE.realisations);
                            setRealisations((prev) => [...prev, ...page.items]);
                            setRealisationsHasMore(page.hasMore);
                          } catch (error) {
                            console.error(error);
                          } finally {
                            setLoadingMoreRealisations(false);
                          }
                        }}
                      >
                        {loadingMoreRealisations ? "Chargement..." : "Charger plus"}
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
              <FullScreenPopup
                open={Boolean(selectedRealisation)}
                onClose={() => setSelectedRealisation(null)}
              >
                {selectedRealisation ? (
                  <div className="h-full overflow-y-auto">
                    <div className="space-y-4 px-4 pb-8 pt-12 sm:px-6">
                      <h2 className="text-xl font-semibold text-card-foreground">
                        {selectedRealisation.title}
                      </h2>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {(selectedRealisation.images?.length
                          ? selectedRealisation.images
                          : selectedRealisation.cover
                            ? [selectedRealisation.cover]
                            : []
                        ).map((src) => (
                          <RetryImage
                            key={src}
                            src={src}
                            alt={selectedRealisation.title}
                            className="w-full rounded-lg object-cover"
                          />
                        ))}
                      </div>
                      {selectedRealisation.city ? (
                        <p className="text-sm text-muted-foreground">{selectedRealisation.city}</p>
                      ) : null}
                      {selectedRealisation.description ? (
                        <p className="whitespace-pre-wrap text-base leading-relaxed text-card-foreground">
                          {selectedRealisation.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </FullScreenPopup>
            </div>
          )}

          {!showReviews && activeTab === "Posts" && (
            <div>
              <div className="mb-1 flex items-center justify-between gap-1 border-b border-border px-1 py-1">
                {isOwnProfile && profileSections.showPosts ? (
                  <Button
                    type="button"
                    onClick={() => navigate("/", { state: { openCreate: true } })}
                    className="h-8 bg-[#174f43] px-3 text-white hover:bg-[#174f43]/90"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Créer une publication
                  </Button>
                ) : (
                  <span />
                )}
                <div className="ml-auto inline-flex items-center gap-1">
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
                    aria-label="Vidéos"
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
                    copySectionLink(
                      "Posts",
                      postsView === "reels" ? "Vidéos" : "Publications",
                    )
                  }
                  className="h-8 w-8 shrink-0"
                  aria-label={
                    postsView === "reels" ? "Partager les vidéos" : "Partager les publications"
                  }
                  title={
                    postsView === "reels" ? "Partager les vidéos" : "Partager les publications"
                  }
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                </div>
              </div>

              {postsView === "grid" ? (
                <>
                  {!postsReady ? (
                    <ProfileMediaGridSkeleton />
                  ) : tabPosts.length === 0 ? (
                    <div className="py-10 text-center text-base text-muted-foreground">
                      Aucune publication.
                    </div>
                  ) : feedPostId ? (
                    <div className="scroll-mt-2">
                      {tabPosts.map((post) => (
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
                      {tabPosts.map((post) => {
                        const cover = coverOfPost(post);
                        const likes = post.likes_count || 0;
                        const id = String(post.id);
                        const hovered = hoveredPostId === id;
                        return (
                          <div
                            key={post.id}
                            role="button"
                            tabIndex={0}
                            data-post-id={id}
                            aria-label={post.description || "Voir la publication"}
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
                                <RetryImage
                                  src={cover}
                                  alt=""
                                  compact
                                  wrapClassName="h-full w-full"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center bg-muted p-2 text-center text-[11px] text-muted-foreground">
                                  {post.description?.trim() || "Post"}
                                </span>
                              )}
                            </div>
                            {isOwnProfile ? (
                              <span className="profile-post-thumb-meta pointer-events-none absolute inset-0 flex items-center justify-center gap-4 text-white drop-shadow">
                                <span className="inline-flex items-center gap-1 text-sm font-semibold">
                                  <Heart className="h-5 w-5 fill-white" />
                                  {likes}
                                </span>
                              </span>
                            ) : null}
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
                              Publier une vidéo
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="mt-3 grid gap-3 rounded-lg border border-border bg-card p-4">
                          <p className="text-xs text-muted-foreground leading-snug">
                            Actuellement, chaque utilisateur ne peut publier que {REEL_MAX_PER_USER_PER_MONTH} reels d’au
                            plus {REEL_MAX_DURATION_SECONDS} secondes par mois (mois calendaire UTC).
                          </p>
                          <Input
                            placeholder="Titre de la vidéo (optionnel)"
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
                                  description: `Maximum ${maxMb} Mo pour une vidéo.`,
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
                                : "Envoyer la vidéo"}
                            </Button>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )}
                  {!reelsReady ? (
                    <ProfileMediaGridSkeleton />
                  ) : reels.length === 0 ? (
                    <div className="py-10 text-center text-base text-muted-foreground">Aucune vidéo publiée.</div>
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
                  <LoadMoreButton
                    hasMore={reelsHasMore}
                    loading={loadingMoreReels}
                    onClick={loadMoreReels}
                  />
                </div>
              )}
            </div>
          )}

          {!showReviews && activeTab === "Articles" && institution ? (
            <InstitutionLibrary mode="articles" userId={profile.id} isOwn={isOwnProfile} onCount={setArticlesCount} />
          ) : null}

          {!showReviews && activeTab === "Formations" && showFormations ? (
            <InstitutionLibrary mode="formations" userId={profile.id} isOwn={isOwnProfile} onCount={setFormationsCount} />
          ) : null}

          {!showReviews && activeTab === "Services" && (
            <div className="px-4 py-4 sm:px-6 sm:py-6 md:px-8">
              <div className="mb-3 flex items-center justify-between gap-2">
                {isOwnProfile ? (
                  <Button type="button" onClick={() => navigate("/service/nouveau")} className="h-9 bg-[#174f43] px-3 text-white hover:bg-[#174f43]/90">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Publier un service
                  </Button>
                ) : (
                  <span />
                )}
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
              {!servicesReady ? (
                <ProfileMediaGridSkeleton />
              ) : listings.length === 0 ? (
                <div className="py-8 text-center text-base text-muted-foreground">Aucun service publié.</div>
              ) : (
                <>
                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 sm:gap-6">
                  {listings.map((listing) => {
                    const offer = listing.offer || offerFromRow(listing);
                    return (
                      <ServiceCard
                        key={listing.id}
                        onDeleted={() => {
                          setListings((prev) => prev.filter((item) => item.id !== listing.id));
                          setListingsCount((count) => (count == null ? count : Math.max(0, count - 1)));
                        }}
                        row={{
                          id: String(listing.id),
                          firm: profile.full_name || profile.username || "Entreprise",
                          offer,
                          userId: listing.user_id || profile.id,
                          isVerified: Boolean(profile.is_verified),
                        }}
                      />
                    );
                  })}
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

          {!showReviews && activeTab === "Produits" && (
            <div className="px-4 py-4 sm:px-6 sm:py-6 md:px-8">
              <div className="mb-3 flex items-center justify-between gap-2">
                {isOwnProfile ? (
                  <Button
                    type="button"
                    onClick={() => navigate("/produit/nouveau")}
                    className="h-9 bg-[#174f43] px-3 text-white hover:bg-[#174f43]/90"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Publier un produit
                  </Button>
                ) : (
                  <span />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copySectionLink("Produits", "Produits")}
                  className="h-9 w-9"
                  aria-label="Partager la section"
                  title="Partager la section"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              {!productsReady ? (
                <ProfileMediaGridSkeleton />
              ) : products.length === 0 ? (
                <div className="py-8 text-center text-base text-muted-foreground">Aucun produit publié.</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-3">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        row={product}
                        onDeleted={() => {
                          setProducts((prev) => prev.filter((item) => item.id !== product.id));
                          setProductsCount((count) => (count == null ? count : Math.max(0, count - 1)));
                        }}
                      />
                    ))}
                  </div>
                  <LoadMoreButton
                    hasMore={productsHasMore}
                    loading={loadingMoreProducts}
                    onClick={loadMoreProducts}
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
                    <h2 className="text-xl font-bold text-card-foreground sm:text-2xl">Avis</h2>
                    <p className="mt-1 text-base text-muted-foreground">
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
                      avatar={resolveAvatarUrl(review.reviewer?.avatar_url, "individual")}
                      username={review.reviewer?.username || "Utilisateur"}
                      isVerified={Boolean(review.reviewer?.is_verified)}
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
            <DialogTitle>Abonnés</DialogTitle>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto space-y-3">
            {followers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun abonné pour le moment.</p>
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
                    src={resolveAvatarUrl(follower.profiles?.avatar_url, "individual")}
                    alt={profileMemberLabel(follower.profiles?.full_name, follower.profiles?.username)}
                    className="w-10 h-10 rounded-2xl object-cover"
                  />
                  <p className="inline-flex items-center gap-1 font-medium text-card-foreground">
                    {profileMemberLabel(follower.profiles?.full_name, follower.profiles?.username)}
                    <VerifiedBadge verified={follower.profiles?.is_verified} className="h-4 w-4" />
                  </p>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ProfileCategoriesDialog
        open={showCategories}
        onOpenChange={setShowCategories}
        profileId={profile.id}
        onSaved={() => {
          if (!user) return;
          void profileService.getProfile(user.id).then((fresh) => {
            setProfile(fresh);
            forgetBufferedProfile(fresh);
          });
        }}
      />

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
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {COVER_PHOTOS_ENABLED ? (
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
            ) : null}

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
            {USERNAMES_ENABLED ? (
              <Input
                value={editForm.username}
                onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="Nom d'utilisateur"
              />
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="edit-bio" className="text-sm font-medium">
                Bio (accroche courte)
              </Label>
              <p className="text-xs text-muted-foreground">
                Visible sous votre nom. Distinct de la présentation « À propos ».
              </p>
              <Textarea
                id="edit-bio"
                value={editForm.bio}
                onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value.slice(0, MAX_BIO_LENGTH) }))}
                rows={4}
                maxLength={MAX_BIO_LENGTH}
                placeholder="Accroche courte : métier, ville, spécialité…"
              />
              <p className="text-xs text-muted-foreground text-right">{editForm.bio.length}/{MAX_BIO_LENGTH}</p>
            </div>

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
                : infosEditField === "location"
                  ? "Ajouter une adresse"
                  : infosEditField === "phone"
                    ? "Ajouter un téléphone"
                    : "Ajouter un site web"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {infosEditField === "all" || infosEditField === "location" ? (
            <div className="space-y-1.5">
              <Textarea
                value={editForm.location}
                onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Adresse (une ligne par lieu)"
                rows={3}
              />
              <p className="text-xs leading-snug text-muted-foreground">
                Adresse affichée dans Infos. Une ligne par lieu si vous en avez plusieurs.
              </p>
            </div>
            ) : null}
            {infosEditField === "all" || infosEditField === "phone" ? (
            <PhoneInput
              value={editForm.phone}
              onChange={(phone) => setEditForm((prev) => ({ ...prev, phone }))}
            />
            ) : null}
            {infosEditField === "all" || infosEditField === "website" ? (
            <div className="space-y-2">
              {(editForm.website.length ? editForm.website.split("\n") : [""]).map((site, index, rows) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="url"
                    value={site}
                    onChange={(e) => {
                      const next = [...rows];
                      next[index] = e.target.value;
                      setEditForm((prev) => ({ ...prev, website: next.join("\n") }));
                    }}
                    placeholder={`Site web ${index + 1}`}
                  />
                  {rows.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        const next = rows.filter((_, i) => i !== index);
                        setEditForm((prev) => ({ ...prev, website: next.join("\n") }));
                        setPreferredWebsiteIndex((prev) => {
                          if (prev === index) return 0;
                          if (prev > index) return prev - 1;
                          return prev;
                        });
                      }}
                      aria-label="Supprimer ce site"
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
                    const rows = prev.website.length ? prev.website.split("\n") : [""];
                    return { ...prev, website: [...rows, ""].join("\n") };
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Ajouter un site web
              </button>
              {(editForm.website.length ? editForm.website.split("\n") : []).some((item) => item.trim()) ? (
                <fieldset className="space-y-2 rounded-md border border-border p-3">
                  <legend className="px-1 text-sm font-medium text-card-foreground">
                    Quel site préférez-vous pour le bouton Website ?
                  </legend>
                  <p className="text-xs text-muted-foreground">
                    Le bouton Website sous la photo ouvrira uniquement ce lien.
                  </p>
                  {(editForm.website.length ? editForm.website.split("\n") : []).map((site, index) =>
                    site.trim() ? (
                      <label key={`${site}-${index}`} className="flex items-start gap-2 text-sm text-card-foreground">
                        <input
                          type="radio"
                          name="preferred-website"
                          className="mt-1"
                          checked={preferredWebsiteIndex === index}
                          onChange={() => setPreferredWebsiteIndex(index)}
                        />
                        <span className="min-w-0 break-all">{site.trim()}</span>
                      </label>
                    ) : null
                  )}
                </fieldset>
              ) : null}
            </div>
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
        title="Signaler ce profil"
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
