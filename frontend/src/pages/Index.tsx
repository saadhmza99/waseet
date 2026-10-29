import { useState, useEffect, useRef, type ReactElement } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import FeedPost from "@/components/FeedPost";
import CreatePost from "@/components/CreatePost";
import SponsoredBanner from "@/components/SponsoredBanner";
import ListingCard from "@/components/ListingCard";
import { FEED_PAGE_SIZE, postService } from "@/services/postService";
import { listingService } from "@/services/listingService";
import type { CreatePostPayload } from "@/components/CreatePost";
import { moderationService } from "@/services/moderationService";
import { muteService } from "@/services/muteService";
import { useAuth } from "@/contexts/AuthContext";
import { useMyCreateCapabilities } from "@/hooks/useMyCreateCapabilities";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getDefaultAvatar } from "@/lib/avatar";
import { toast } from "@/components/ui/use-toast";
import InfiniteScrollSentinel from "@/components/InfiniteScrollSentinel";
import { takeFeedFirstPage, takeFeedNextPage } from "@/lib/feedPrefetch";
import { cityFromPost } from "@/lib/feedLocation";
import { contactPhone, propertyViewFromRow } from "@/lib/propertyListing";
import { catalogService } from "@/services/catalogService";
import { FEED_BANNER_ROTATION_MS, feedBannerService } from "@/services/feedBannerService";
import { profileService } from "@/services/profileService";
import discoverCoast from "@/assets/discover-coast.jpg";
import discoverKasbah from "@/assets/discover-kasbah.jpg";
import { FilterChips } from "@/components/FilterChips";
import FeedDesktopRail from "@/components/FeedDesktopRail";
import { FeedFirmsStrip, FeedPartnersRail, RECOMMENDED_FIRMS } from "@/components/FeedSpotlight";
import PartnerDemandDialog, { PROJECT_PLAN_NOTICE } from "@/components/PartnerDemandDialog";
import { FeedArticles } from "@/components/FeedArticles";
import { ProjectCard } from "@/components/project/ProjectCard";
import { PROJECT_MILESTONES, milestoneReachedIndex } from "@/components/project/ProjectMilestoneTrack";
import { ProjectFiltersPanel } from "@/components/project/ProjectListFilters";
import { dossierFromRow } from "@/lib/projectDossier";
import { ServiceCard } from "@/components/service/ServiceCard.tsx";
import { PropertyCard } from "@/components/property/PropertyCard";
import { offerFromRow } from "@/lib/serviceOffer";
import { serviceFirmName, serviceIsVerified, serviceService, type ServiceRow } from "@/services/serviceService";
import { realisationService } from "@/services/realisationService";
import { PROPERTY_TYPES, normalizePropertyKind } from "@/lib/taxonomy";
import archIcon from "@/assets/sifarah-arch-icon-clean.png";

/** Full catalogue size announced on free vue=projets / Discover (listing stays capped). */
const PROJECTS_PAID_CATALOGUE_COUNT = 477;

const ArchIcon = ({ className }: { className?: string }) => (
  <span
    aria-hidden
    className={`inline-block shrink-0 bg-current ${className ?? ""}`}
    style={{
      maskImage: `url(${archIcon})`,
      WebkitMaskImage: `url(${archIcon})`,
      maskMode: "alpha",
      maskRepeat: "no-repeat",
      maskPosition: "center",
      maskSize: "contain",
      WebkitMaskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      WebkitMaskSize: "contain",
    }}
  />
);

const DISCOVER_BANNERS = [
  { id: "coast", image_url: discoverCoast, alt: "Côte marocaine au coucher du soleil" },
  { id: "kasbah", image_url: discoverKasbah, alt: "Ville fortifiée au coucher du soleil" },
];

const givenName = (value: string) => {
  const first = value.trim().split(/\s+/)[0] || "";
  if (!first || first.toLowerCase() === "profil") return "";
  return first;
};

type FeedView = "all" | "projets" | "biens" | "services" | "marche";

type TaxonomyPost = {
  post_type?: string | null;
  property_id?: string | null;
  project_id?: string | null;
  feed_category?: string | null;
  feed_sub_category?: string | null;
  property_kind?: string | null;
  project_kind?: string | null;
};

const isBienPost = (post: TaxonomyPost) =>
  ["property", "bien", "propriete", "propriété"].includes(post.post_type || "") || Boolean(post.property_id);
const isProjetPost = (post: TaxonomyPost) =>
  post.post_type === "project" || Boolean(post.project_id);

const matchesFeedView = (view: FeedView, typeFilter: string | null, post: TaxonomyPost) => {
  if (view === "projets") return isProjetPost(post) && (!typeFilter || post.project_kind === typeFilter);
  if (view === "biens") {
    return isBienPost(post) && !isProjetPost(post) && (!typeFilter || normalizePropertyKind(post.property_kind) === typeFilter);
  }
  return true;
};

/** Presse / media institution accounts — Accueil keeps one of these right after the lead post. */
const PRESSE_USERNAMES = new Set([
  "industrie-du-maroc",
  "btp-news",
  "leconomiste",
  "medias24",
  "challenge",
  "la-vie-eco",
  "les-inspirations-eco",
]);

const isPressePost = (post: any) => {
  const kind = post?.profiles?.institution_kind || post?.institution_kind;
  if (kind === "media") return true;
  const username = String(post?.profiles?.username || post?.username || "")
    .trim()
    .toLowerCase();
  return Boolean(username) && PRESSE_USERNAMES.has(username);
};

/** [lead non-presse][presse][rest…] when a presse post is available. */
const withPresseSecond = <T,>(posts: T[]): T[] => {
  if (posts.length < 2) return posts;
  const presseIdx = posts.findIndex((post) => isPressePost(post));
  if (presseIdx < 0) return posts;
  const leadIdx = posts.findIndex((post, index) => index !== presseIdx && !isPressePost(post));
  if (leadIdx < 0) {
    if (presseIdx === 1) return posts;
    const next = posts.slice();
    const [presse] = next.splice(presseIdx, 1);
    next.splice(1, 0, presse);
    return next;
  }
  if (leadIdx === 0 && presseIdx === 1) return posts;
  return [
    posts[leadIdx],
    posts[presseIdx],
    ...posts.filter((_, index) => index !== leadIdx && index !== presseIdx),
  ];
};

const Index = () => {
  const { user, visitorUser, loading: authLoading } = useAuth();
  const { sections: mySections } = useMyCreateCapabilities();
  const isAdmin = useIsAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const openCreate = Boolean((location.state as { openCreate?: boolean } | null)?.openCreate);
  const [searchParams, setSearchParams] = useSearchParams();
  const vue = searchParams.get("vue");
  const feedFil = searchParams.get("fil") === "articles" ? "articles" : "publications";
  const feedView: FeedView =
    vue === "projets" || vue === "biens" || vue === "services" || vue === "marche" ? vue : "all";
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [projectsUnlockOpen, setProjectsUnlockOpen] = useState(false);
  const [projectStageIdx, setProjectStageIdx] = useState(0);
  const [projectCommercial, setProjectCommercial] = useState<string | null>(null);
  const projectStage = projectStageIdx === 0 ? null : PROJECT_MILESTONES[projectStageIdx - 1].id;
  const matchesPost = (post: TaxonomyPost) => matchesFeedView(feedView, typeFilter, post);

  // Produits BTP (ex-Marché) → Sifarah Matériaux only (no properties chooser).
  useEffect(() => {
    if (vue === "marche") navigate("/produits", { replace: true });
  }, [vue, navigate]);

  useEffect(() => {
    setTypeFilter(null);
  }, [feedView]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [sponsoredListings, setSponsoredListings] = useState<any[]>([]);
  const [feedListings, setFeedListings] = useState<any[]>([]);
  const [liveServices, setLiveServices] = useState<ServiceRow[]>([]);
  const [catalogProjects, setCatalogProjects] = useState<any[]>([]);
  const [catalogProperties, setCatalogProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const filteredServices = liveServices;
  const filteredProjects = catalogProjects.filter((row) => {
    if (!projectStage && !projectCommercial) return true;
    const project = dossierFromRow(row);
    if (projectStage && PROJECT_MILESTONES[milestoneReachedIndex(project)]?.id !== projectStage) return false;
    if (projectCommercial && (project.commercialStatus || "") !== projectCommercial) return false;
    return true;
  });
  const filteredProperties = catalogProperties.filter((row) => !typeFilter || row.details?.propertyKind === typeFilter || row.property_kind === typeFilter);
  const [bannerNow, setBannerNow] = useState(() => Date.now());
  const [greetingName, setGreetingName] = useState("");
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const postsFetchedRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const feedGeneration = useRef(0);
  const loadTicket = useRef(0);

  const loadMorePosts = async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    const generation = feedGeneration.current;
    const ticket = ++loadTicket.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const prefetched = postsFetchedRef.current === FEED_PAGE_SIZE ? await takeFeedNextPage() : null;
      const page = prefetched ?? (await postService.getFeedPage(FEED_PAGE_SIZE, postsFetchedRef.current));
      if (generation !== feedGeneration.current) return;
      postsFetchedRef.current += FEED_PAGE_SIZE;
      hasMoreRef.current = page.hasMore;
      setHasMorePosts(page.hasMore);
      setAllPosts((prev) => {
        const seen = new Set(prev.map((post) => post.id));
        return [...prev, ...page.posts.filter((post) => !seen.has(post.id))];
      });
    } catch (error) {
      if (generation !== feedGeneration.current) return;
      console.error("Error loading more posts:", error);
      hasMoreRef.current = false;
      setHasMorePosts(false);
    } finally {
      if (loadTicket.current === ticket) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  };

  const account = user || visitorUser;

  useEffect(() => {
    if (!account) {
      setGreetingName("");
      return;
    }
    let cancelled = false;
    const metaName = String(account.user_metadata?.full_name || account.user_metadata?.name || "").trim();
    profileService
      .getProfile(account.id)
      .then((profile) => {
        if (cancelled) return;
        setGreetingName(givenName((profile?.full_name || "").trim() || metaName));
      })
      .catch(() => {
        if (!cancelled) setGreetingName(givenName(metaName));
      });
    return () => {
      cancelled = true;
    };
  }, [account]);

  useEffect(() => {
    const untilNextSlot = FEED_BANNER_ROTATION_MS - (Date.now() % FEED_BANNER_ROTATION_MS);
    const timer = window.setTimeout(() => setBannerNow(Date.now()), untilNextSlot + 50);
    return () => window.clearTimeout(timer);
  }, [bannerNow]);

  const bannerImage = feedBannerService.pickForNow(DISCOVER_BANNERS, bannerNow);

  // Load posts and sponsored listings
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    const loadData = async () => {
      try {
        feedGeneration.current += 1;
        loadTicket.current += 1;
        loadingMoreRef.current = false;
        postsFetchedRef.current = 0;
        hasMoreRef.current = true;
        setLoading(true);
        const page = (await takeFeedFirstPage()) ?? (await postService.getFeedPage(FEED_PAGE_SIZE, 0));
        if (cancelled) return;

        postsFetchedRef.current = FEED_PAGE_SIZE;
        hasMoreRef.current = page.hasMore;
        setHasMorePosts(page.hasMore);
        setAllPosts(page.posts);
        setLoading(false);
        if (page.hasMore) void loadMorePosts();

        Promise.all([
          listingService.getListings(40, 0),
          serviceService.listServices(120, 0),
          catalogService.listProjects(40, 0, { featuredPromoters: true }),
          catalogService.listProperties(80, 0),
          user ? moderationService.getBlockedUserIds(user.id) : Promise.resolve([]),
          user ? muteService.getMutedIds(user.id) : Promise.resolve({ posts: new Set<string>(), services: new Set<string>() }),
        ])
          .then(([listingsData, servicesData, projectsData, propertiesData, blockedUserIds, mutedIds]) => {
            if (cancelled) return;
            const blockedSet = new Set(blockedUserIds || []);
            const visible = (listingsData || []).filter(
              (listing) => !blockedSet.has(listing.user_id) && !mutedIds.services.has(listing.user_id)
            );
            setFeedListings(visible);
            setSponsoredListings(visible.filter((listing) => listing.is_sponsored));
            setLiveServices(
              (servicesData || []).filter((row) => !blockedSet.has(row.user_id) && !mutedIds.services.has(row.user_id)),
            );
            setCatalogProjects(projectsData || []);
            setCatalogProperties(propertiesData || []);
          })
          .catch((error) => console.error("Error loading catalog/listings:", error));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  useEffect(() => {
    if (feedView === "services" || loading || !hasMorePosts) return;
    if (!allPosts.some(matchesPost)) void loadMorePosts();
  }, [feedView, typeFilter, allPosts, hasMorePosts, loading]);

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
      avatar: listing.profiles?.avatar_url || getDefaultAvatar("individual"),
      username: listing.profiles?.username || "",
      timeAgo: formatTimeAgo(listing.created_at),
      profession: listing.profession || "",
      priceRange: listing.price_range || "",
      jobId: listing.id,
    }));
  };

  // Handle post creation
  const handlePostCreated = async (postData: CreatePostPayload) => {
    if (!user && visitorUser) {
      if (postData.postType !== "property" || postData.publishTo !== "portfolio") {
        toast({ title: "Compte professionnel requis", description: "Un particulier peut publier jusqu'à 3 biens dans son portfolio." });
        return;
      }
      try {
        const count = await catalogService.countPropertiesByUser(visitorUser.id);
        if (count >= 3) {
          toast({ title: "Limite atteinte", description: "Vous avez déjà publié 3 biens." });
          return;
        }
        const city = postData.city || (postData.propertyDetails as { city?: string } | undefined)?.city || "";
        const region = (postData.propertyDetails as { region?: string } | undefined)?.region || null;
        await catalogService.createProperty(visitorUser.id, {
          title: postData.title || "Bien",
          description: postData.text,
          city,
          region,
          price: postData.price || null,
          surface: postData.surface || null,
          beds: postData.beds ?? null,
          baths: postData.baths ?? null,
          images: postData.images || [],
          details: { ...(postData.propertyDetails || {}), city },
        });
        toast({ title: "Bien publié", description: "Ajouté à votre portfolio." });
      } catch (error) {
        console.error("Error creating particulier property:", error);
        toast({ title: "Erreur", description: "Impossible de publier ce bien." });
      }
      return;
    }
    if (user) {
      try {
      const city =
        postData.city ||
        (postData.propertyDetails as { city?: string } | undefined)?.city ||
        "";
      const region =
        (postData.propertyDetails as { region?: string } | undefined)?.region || null;
      const details = {
        ...(postData.propertyDetails || {}),
        city,
      };
      const destination = postData.publishTo || "both";
      const toFeed = destination === "feed" || destination === "both";
      const toPortfolio = destination === "portfolio" || destination === "both";

      if (postData.postType === "service") {
        await listingService.createListing(user.id, {
          title: postData.text.trim().slice(0, 80) || "Service",
          description: postData.text,
          profession: "",
          location: city,
          image_url: postData.images?.[0] || "",
          image_count: postData.images?.length || 0,
          images: postData.images || [],
        });
        toast({ title: "Service publié", description: "Votre service a été publié avec succès." });
      } else if (postData.postType === "property" || postData.postType === "project") {
        const catalogPayload = {
          title: postData.title || (postData.postType === "property" ? "Bien" : "Projet"),
          description: postData.text,
          city,
          region,
          price: postData.price || null,
          surface: postData.surface || null,
          beds: postData.beds ?? null,
          baths: postData.baths ?? null,
          images: postData.images || [],
          details,
        };
        const catalogRow = toPortfolio
          ? postData.postType === "property"
            ? await catalogService.createProperty(user.id, catalogPayload)
            : await catalogService.createProject(user.id, catalogPayload)
          : null;

        if (toFeed) {
          await postService.createPost(user.id, {
            title: postData.title || "",
            description: postData.text,
            before_image_url: postData.beforeImage,
            after_image_url: postData.afterImage,
            single_image_url: postData.singleImage,
            images: postData.images || [],
            post_type: postData.postType,
            price: postData.price || null,
            surface: postData.surface || null,
            beds: postData.beds ?? null,
            baths: postData.baths ?? null,
            property_details: details,
            city,
            property_id: postData.postType === "property" ? catalogRow?.id || null : null,
            project_id: postData.postType === "project" ? catalogRow?.id || null : null,
          });
        }

        toast({
          title: postData.postType === "property" ? "Bien publié" : "Projet publié",
          description: !toFeed
            ? "Ajouté au portfolio."
            : !toPortfolio
              ? "Publié sur le fil."
              : "Ajouté au fil et au portfolio.",
        });
      } else if (postData.postType === "realisation") {
        await realisationService.create(user.id, {
          title: (postData.title || "").trim() || (postData.text || "").trim().slice(0, 80) || "Réalisation",
          description: postData.text,
          images: postData.images || [],
          cover: postData.singleImage || postData.images?.[0] || null,
          city,
        });
        toast({
          title: "Réalisation publiée",
          description: "Ajoutée à votre onglet Réalisations.",
        });
      } else {
      await postService.createPost(user.id, {
        title: postData.title || "",
        description: postData.text,
        before_image_url: postData.beforeImage,
        after_image_url: postData.afterImage,
        single_image_url: postData.singleImage,
        images: postData.images || [],
        post_type: "standard",
        price: postData.price || null,
        surface: postData.surface || null,
        beds: postData.beds ?? null,
        baths: postData.baths ?? null,
        property_details: details,
        city,
      });
      toast({
        title: "Publication envoyée",
        description: "Votre publication a été envoyée avec succès.",
      });
      }
        feedGeneration.current += 1;
        loadTicket.current += 1;
        loadingMoreRef.current = false;
        const page = await postService.getFeedPage(FEED_PAGE_SIZE, 0);
        postsFetchedRef.current = FEED_PAGE_SIZE;
        hasMoreRef.current = page.hasMore;
        setHasMorePosts(page.hasMore);
        setAllPosts(page.posts);
        if (page.hasMore) void loadMorePosts();
      } catch (error) {
        console.error("Error creating post:", error);
        toast({ title: "Erreur", description: "Impossible de publier. Veuillez réessayer." });
      }
    }
  };

  const buildFeed = (): ReactElement[] => {
    const feed: ReactElement[] = [];
    const banners = getSponsoredBanners();
    const matched = allPosts.filter(matchesPost);
    const posts = feedView === "all" ? withPresseSecond(matched) : matched;
    if (feedView === "services") {
      const annonces = feedListings;
      if (!annonces.length) return [];
      return annonces.map((listing) => {
        const profile = listing.profiles || {};
        return (
          <div key={listing.id} className="mb-3 px-3">
            <ListingCard
              id={listing.id}
              userId={listing.user_id}
              avatar={profile.avatar_url || getDefaultAvatar("individual")}
              username={profile.username || ""}
              fullName={profile.full_name || ""}
              isVerified={Boolean(profile.is_verified)}
              timeAgo={formatTimeAgo(listing.created_at)}
              image={listing.image_url || ""}
              imageCount={listing.image_count || 1}
              location={listing.location || ""}
              title={listing.title || "Annonce"}
              profession={listing.profession || ""}
              priceRange={listing.price_range || "Prix sur demande"}
              isSponsored={Boolean(listing.is_sponsored)}
              fillWidth
            />
          </div>
        );
      });
    }
    if (!posts.length) {
      if (feedView === "projets" || feedView === "biens") return [];
      if (hasMorePosts || loadingMore) {
        return [
          <div key="kind-loading" className="py-8 text-center text-muted-foreground">
            Chargement...
          </div>,
        ];
      }
      return [
        <div key="kind-empty" className="py-8 text-center text-muted-foreground">
          Aucune publication pour ce filtre
        </div>,
      ];
    }
    let bannerIndex = 0;
    /** Implant recommended firms once after a few posts on Accueil. */
    const firmsStripAfter = Math.min(2, Math.max(posts.length, 1));
    let firmsStripInserted = false;

    posts.forEach((post, index) => {
      const profile = post.profiles || {};
      const feedItemCount = index + 1;
        
        feed.push(
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
            isSponsored={post.is_sponsored || false}
            postType={post.post_type}
            price={post.price}
            surface={post.surface}
            beds={post.beds}
            baths={post.baths}
            phone={contactPhone(post.property_details, profile.phone)}
          />
        );

        if (feedView === "all" && !firmsStripInserted && feedItemCount === firmsStripAfter) {
          firmsStripInserted = true;
          feed.push(<FeedFirmsStrip key="feed-firms-spotlight" firms={RECOMMENDED_FIRMS} />);
        }

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
    });

    return feed;
  };

  return (
    <div
      className="min-h-screen bg-white pb-4 lg:pb-0"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
    >
      <div className="lg:flex lg:min-h-screen lg:w-full">
      <FeedDesktopRail />
      <div className="min-w-0 lg:flex-1 lg:pb-5 lg:pt-1">
      <div
        className={`mx-auto flex w-full max-w-2xl lg:px-8 ${
          feedView === "all"
            ? "flex-col xl:max-w-[min(calc(100vw-20rem),calc(76rem+0.28*(100vw-96rem)))] xl:flex-row xl:items-start xl:gap-8"
            : "flex-col lg:w-[56rem] lg:max-w-[calc(100vw-22rem)]"
        }`}
      >
      <div className="flex min-w-0 w-full flex-col xl:flex-1">
        <div className="order-1 mb-[1.5vh] border-b border-neutral-200 px-[1vh] lg:mb-4 lg:px-0">
          <div className="flex min-w-0 items-end overflow-x-auto [scrollbar-width:none] lg:gap-1 [&::-webkit-scrollbar]:hidden">
            {[
              { id: "all" as const, label: "Accueil", order: "order-1" },
              { id: "projets" as const, label: "Projets", order: "order-2" },
              { id: "marche" as const, label: "Matériaux", mobileLabel: "Produits", order: "order-3" },
              { id: "opportunites" as const, label: "Opportunités", order: "order-4" },
              ...(isAdmin
                ? [{ id: "federations" as const, label: "Fédérations", order: "order-5", desktopOnly: true }]
                : []),
              { id: "contact" as const, label: "Contactez-nous", order: "order-6", desktopOnly: true },
            ].map((item) => {
              const active = item.id !== "opportunites" && item.id !== "federations" && item.id !== "contact" && feedView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === "federations") {
                      navigate("/federations");
                      return;
                    }
                    if (item.id === "contact") {
                      navigate("/contact");
                      return;
                    }
                    if (item.id === "opportunites") {
                      navigate("/opportunites");
                      return;
                    }
                    if (item.id === "marche") {
                      navigate("/produits");
                      return;
                    }
                    const next = new URLSearchParams(searchParams);
                    if (item.id === "all") {
                      next.delete("vue");
                    } else if (feedView === item.id) {
                      next.delete("vue");
                    } else {
                      next.set("vue", item.id);
                    }
                    setSearchParams(next, { replace: true });
                  }}
                  className={`${"desktopOnly" in item && item.desktopOnly ? "hidden lg:flex" : "flex"} flex-1 items-center justify-center whitespace-nowrap border-b-2 px-[0.45vh] py-[1.75vh] text-[1.8vh] font-semibold lg:flex-none lg:shrink-0 lg:px-3.5 lg:py-3.5 lg:text-lg ${item.order} ${
                    active ? "border-[#174f43] text-[#174f43]" : "border-transparent text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {"mobileLabel" in item && item.mobileLabel ? (
                    <>
                      <span className="lg:hidden">{item.mobileLabel}</span>
                      <span className="hidden lg:inline">{item.label}</span>
                    </>
                  ) : (
                    item.label
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {feedView !== "projets" ? (
        <section className="relative order-2 mx-2 mb-3 hidden min-h-[200px] overflow-hidden bg-neutral-800 text-white lg:mx-0 lg:block lg:min-h-[280px] xl:-ml-[54px] xl:w-[calc(100%_+_4rem_-_2px)] 2xl:ml-[calc(31.06rem_-_36vw_+_2px)] 2xl:w-[calc(100%_+_36vw_-_30.56rem_-_2px)]">
          <img
            key={bannerImage?.image_url || "fallback"}
            src={bannerImage?.image_url}
            alt={bannerImage?.alt || "Paysage du Maroc au coucher du soleil"}
            className="absolute inset-0 h-full w-full animate-in fade-in object-cover object-center duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
          <div className="relative flex min-h-[200px] max-w-xl flex-col justify-center px-6 py-6 lg:min-h-[280px] lg:px-10 lg:py-8">
            {greetingName ? (
              <p className="mb-3 text-[0.68rem] font-medium uppercase tracking-[0.28em] text-white lg:mb-4 lg:text-xs">
                <span>Bonjour, </span>
                {greetingName}
              </p>
            ) : null}
            <p
              className="text-[1.85rem] font-medium leading-[1.12] text-white lg:text-[3.15rem]"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Découvrez, suivez,
              <br />
              échangez.
            </p>
            <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-white/95 lg:mt-5 lg:text-base">
              L&apos;écosystème immobilier, construction et BTP
              <br />
              au Maroc.
            </p>
          </div>
        </section>
        ) : null}

        <div className={`order-3${feedView === "all" ? " xl:-ml-[46px] 2xl:ml-[calc(31.56rem_-_36vw_+_2px)]" : ""}`}>
        {/* Create Post */}
        {feedView === "all" || feedView === "services" ? (
          <CreatePost
            startOpen={openCreate}
            onClose={() => {
              if (openCreate) navigate("/", { replace: true, state: {} });
            }}
            onPostCreated={async (postData) => {
              await handlePostCreated(postData);
              if (openCreate) navigate("/", { replace: true, state: {} });
            }}
          />
        ) : null}

        {feedView === "all" ? (
          <div className="border-b border-neutral-200 px-3 lg:px-0">
            <div className="flex min-w-0 items-end">
              {[
                { id: "publications" as const, label: "Publications" },
                { id: "articles" as const, label: "Articles" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    if (item.id === "publications") next.delete("fil");
                    else next.set("fil", "articles");
                    setSearchParams(next, { replace: true });
                  }}
                  className={`flex flex-1 items-center justify-center whitespace-nowrap border-b-2 px-3 py-3.5 text-base font-semibold transition-colors ${
                    feedFil === item.id
                      ? "border-[#174f43] text-[#174f43]"
                      : "border-transparent text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {sponsoredListings.length >= 2 && feedView !== "services" && !(feedView === "all" && feedFil === "articles") && (
          <div className="my-4 space-y-3 sm:my-6 sm:space-y-4">
            {sponsoredListings.slice(0, 2).map((listing) => {
              const profile = listing.profiles || {};
              return (
                <SponsoredBanner
                  key={listing.id}
                  title={listing.title}
                  location={listing.location}
                  description={listing.description || ""}
                  image={listing.image_url || ""}
                  avatar={profile.avatar_url || getDefaultAvatar("individual")}
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

        {feedView === "all" && feedFil === "articles" ? (
          <FeedArticles />
        ) : (
        <>
        {/* Feed with posts and sponsored banners */}
        {feedView === "biens" ? (
          <div className="px-3 pb-[1.2vh] lg:relative lg:left-1/2 lg:w-[min(80rem,calc(100vw-19rem))] lg:-translate-x-1/2 lg:px-0">
            <FilterChips
              options={[
                { id: null, label: "Tout" },
                ...PROPERTY_TYPES.map((item) => ({ id: item.id, label: item.label })),
              ]}
              value={typeFilter}
              onChange={setTypeFilter}
            />
          </div>
        ) : null}
        {feedView === "projets" ? (
          <div className="space-y-3 px-3 pb-4 lg:relative lg:left-1/2 lg:w-[min(80rem,calc(100vw-19rem))] lg:-translate-x-1/2 lg:px-0">
            <div>
              <div className="flex flex-col items-start gap-3 lg:flex-row">
                <div className="min-w-0 w-full flex-1 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 sm:px-5">
                  <p className="text-sm leading-relaxed text-amber-950">
                    Sélection limitée : seuls quelques projets sont affichés ici. Les{" "}
                    <span className="font-semibold">{PROJECTS_PAID_CATALOGUE_COUNT} projets</span> complets
                    sont réservés au plan payant.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-amber-950">
                    {PROJECT_PLAN_NOTICE}
                  </p>
                  <button
                    type="button"
                    onClick={() => setProjectsUnlockOpen(true)}
                    className="mt-3 inline-flex items-center justify-center rounded-xl bg-[#174f43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123d34]"
                  >
                    Demander les détails du plan payant
                  </button>
                </div>
              </div>
              <ProjectFiltersPanel
                open
                stageIdx={projectStageIdx}
                onStage={setProjectStageIdx}
                commercial={projectCommercial}
                onCommercial={setProjectCommercial}
              />
            </div>
            {mySections.showProjets ? (
              <button
                type="button"
                onClick={() => navigate("/projet/nouveau")}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#174f43] px-4 text-sm font-semibold text-white hover:bg-[#123d34]"
              >
                <Plus className="h-4 w-4" />
                Ajouter un projet
              </button>
            ) : null}
            <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
              {filteredProjects.map((row) => (
                <ProjectCard
                  key={row.id}
                  row={row}
                  dossier={row.dossier_locked === false ? undefined : "locked"}
                />
              ))}
              {!filteredProjects.length ? (
                <p className="py-[2vh] text-center text-[1.6vh] text-muted-foreground lg:col-span-2">
                  Aucun projet dans cette rubrique pour le moment.
                </p>
              ) : null}
            </div>
            <PartnerDemandDialog
              open={projectsUnlockOpen}
              onOpenChange={setProjectsUnlockOpen}
              title="Débloquer les bonnes affaires"
              description={PROJECT_PLAN_NOTICE}
              successTitle="Demande reçue"
              successMessage="Merci. Nous vous enverrons les détails du plan payant."
              submitLabel="Envoyer ma demande"
            />
          </div>
        ) : null}
        {feedView === "services" ? (
          <div className="space-y-3 px-3 pb-4 lg:relative lg:left-1/2 lg:w-[min(80rem,calc(100vw-19rem))] lg:-translate-x-1/2 lg:px-0">
            {mySections.showServices ? (
              <button
                type="button"
                onClick={() => navigate("/service/nouveau")}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#174f43] px-4 text-sm font-semibold text-white hover:bg-[#123d34]"
              >
                <Plus className="h-4 w-4" />
                Créer un service
              </button>
            ) : null}
            <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
              {filteredServices.map((row) => (
                <ServiceCard
                  key={row.id}
                  row={{
                    id: row.id,
                    firm: serviceFirmName(row),
                    userId: row.user_id,
                    offer: offerFromRow(row),
                    isVerified: serviceIsVerified(row),
                  }}
                />
              ))}
              {!filteredServices.length ? (
                <p className="py-[2vh] text-center text-[1.6vh] text-muted-foreground lg:col-span-2">
                  Aucun service dans cette rubrique pour le moment.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
        {feedView === "biens" ? (
          <div className="grid grid-cols-1 items-start gap-3 px-3 pb-4 lg:relative lg:left-1/2 lg:w-[min(80rem,calc(100vw-19rem))] lg:-translate-x-1/2 lg:grid-cols-2 lg:px-0">
            {filteredProperties.map((row) => (
              <PropertyCard key={row.id} row={propertyViewFromRow(row)} />
            ))}
            {!filteredProperties.length ? (
              <p className="col-span-full py-[2vh] text-center text-[1.6vh] text-muted-foreground">Aucun bien dans cette rubrique pour le moment.</p>
            ) : null}
          </div>
        ) : null}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : feedView !== "services" &&
          feedView !== "projets" &&
          feedView !== "biens" &&
          feedView !== "marche" &&
          feedView !== "all" &&
          allPosts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Aucune publication pour le moment</div>
        ) : feedView === "marche" || feedView === "biens" || feedView === "projets" || feedView === "services" ? null : (
          buildFeed()
        )}
        {!loading && feedView !== "services" && feedView !== "marche" && feedView !== "biens" && feedView !== "projets" ? (
          <InfiniteScrollSentinel hasMore={hasMorePosts} loading={loadingMore} onLoadMore={loadMorePosts} />
        ) : null}
        </>
        )}
        </div>
      </div>
      {feedView === "all" ? <FeedPartnersRail firms={RECOMMENDED_FIRMS} /> : null}
      </div>
      </div>
      </div>
    </div>
  );
};

export default Index;

