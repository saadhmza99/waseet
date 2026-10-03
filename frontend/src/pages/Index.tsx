import { useState, useEffect, useRef, type ReactElement } from "react";
import { Briefcase, Building2, Cpu, Ellipsis, FileText, Hammer, HardHat, Home, Landmark, LayoutGrid, PenTool } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getDefaultAvatar } from "@/lib/avatar";
import { toast } from "@/components/ui/use-toast";
import InfiniteScrollSentinel from "@/components/InfiniteScrollSentinel";
import { takeFeedFirstPage, takeFeedNextPage } from "@/lib/feedPrefetch";
import { cityFromPost } from "@/lib/feedLocation";
import { contactPhone } from "@/lib/propertyListing";
import { catalogService } from "@/services/catalogService";
import { FEED_BANNER_ROTATION_MS, feedBannerService, type FeedBannerImage } from "@/services/feedBannerService";
import { CategoryPicker } from "@/components/CategoryPicker";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ServiceCard } from "@/components/service/ServiceCard.tsx";
import { PropertyCard } from "@/components/property/PropertyCard";
import { SHOWCASE_PROJECTS } from "@/lib/showcaseProjects";
import { SHOWCASE_SERVICES } from "@/lib/showcaseServices.ts";
import { SHOWCASE_PROPERTIES } from "@/lib/showcaseProperties";
import { SHOWCASE_POSTS } from "@/lib/showcasePosts";

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

const DEFAULT_BANNER_IMAGES: FeedBannerImage[] = [
  { id: "agadir-plage", image_url: "/feed-banners/agadir-plage.png", alt: "Plage d’Agadir au coucher du soleil" },
  { id: "palais-piscine", image_url: "/feed-banners/palais-piscine.webp", alt: "Palais marocain avec piscine" },
  { id: "villa-jardin", image_url: "/feed-banners/villa-jardin.webp", alt: "Villa marocaine dans un jardin" },
  { id: "riad-patio", image_url: "/feed-banners/riad-patio.jpg", alt: "Patio de riad avec piscine" },
];

type FeedView = "all" | "projets" | "biens" | "services";
type ProfessionId =
  | "foncier"
  | "gestion"
  | "biens"
  | "construction"
  | "renovation"
  | "architecture"
  | "notaires"
  | "immotech"
  | "autres";

const PROFESSION_CATEGORIES: { id: ProfessionId; label: string; Icon: typeof Building2; pattern: RegExp }[] = [
  { id: "foncier", label: "Foncier & Conseil", Icon: Landmark, pattern: /foncier|terrain|lotissement|titre foncier/ },
  { id: "gestion", label: "Gestion Immobilière", Icon: Building2, pattern: /gestion|syndic|locative/ },
  { id: "biens", label: "Biens & Projets", Icon: Home, pattern: /bien|propri[eé]t[eé]|immobilier|villa|appartement/ },
  { id: "construction", label: "Construction", Icon: HardHat, pattern: /construct|b[aâ]timent|batiment|chantier/ },
  { id: "renovation", label: "Rénovation & Aménagement", Icon: Hammer, pattern: /r[eé]nov|renov|am[eé]nagement|amenagement/ },
  { id: "architecture", label: "Architecture", Icon: PenTool, pattern: /architect/ },
  { id: "notaires", label: "Notaires & Juridiques", Icon: FileText, pattern: /notaire|juridique|avocat/ },
  { id: "immotech", label: "Immotech", Icon: Cpu, pattern: /immotech|logiciel|digital|proptech/ },
  { id: "autres", label: "Autres", Icon: Ellipsis, pattern: /$^/ },
];

const isBienPost = (post: { post_type?: string | null; property_id?: string | null }) =>
  ["property", "bien", "propriete", "propriété"].includes(post.post_type || "") || Boolean(post.property_id);
const isProjetPost = (post: { post_type?: string | null; project_id?: string | null }) =>
  post.post_type === "project" || Boolean(post.project_id);

const matchesProfession = (category: ProfessionId | "tout" | null, hay: string) => {
  if (!category || category === "tout") return true;
  if (category === "autres") {
    return !PROFESSION_CATEGORIES.some((item) => item.id !== "autres" && item.pattern.test(hay));
  }
  return PROFESSION_CATEGORIES.find((item) => item.id === category)?.pattern.test(hay) ?? true;
};

const matchesFeedView = (view: FeedView, post: { post_type?: string | null; property_id?: string | null; project_id?: string | null }) => {
  if (view === "projets") return isProjetPost(post);
  if (view === "biens") return isBienPost(post) && !isProjetPost(post);
  return true;
};

const Index = () => {
  const { user, visitorUser, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const openCreate = Boolean((location.state as { openCreate?: boolean } | null)?.openCreate);
  const [searchParams, setSearchParams] = useSearchParams();
  const vue = searchParams.get("vue");
  const feedView: FeedView = vue === "projets" || vue === "biens" || vue === "services" ? vue : "all";
  const [profession, setProfession] = useState<ProfessionId | "tout" | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [sponsoredListings, setSponsoredListings] = useState<any[]>([]);
  const [feedListings, setFeedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerImages, setBannerImages] = useState<FeedBannerImage[]>(DEFAULT_BANNER_IMAGES);
  const [bannerNow, setBannerNow] = useState(() => Date.now());
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

  useEffect(() => {
    feedBannerService
      .getActiveImages()
      .then((images) => {
        if (images.length) setBannerImages(images);
      })
      .catch((error) => console.error("Error loading feed banner images:", error));
  }, []);

  useEffect(() => {
    const untilNextSlot = FEED_BANNER_ROTATION_MS - (Date.now() % FEED_BANNER_ROTATION_MS);
    const timer = window.setTimeout(() => setBannerNow(Date.now()), untilNextSlot + 50);
    return () => window.clearTimeout(timer);
  }, [bannerNow]);

  const bannerImage = feedBannerService.pickForNow(bannerImages, bannerNow);

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
          user ? moderationService.getBlockedUserIds(user.id) : Promise.resolve([]),
          user ? muteService.getMutedIds(user.id) : Promise.resolve({ posts: new Set<string>(), services: new Set<string>() }),
        ])
          .then(([listingsData, blockedUserIds, mutedIds]) => {
            if (cancelled) return;
            const blockedSet = new Set(blockedUserIds || []);
            const visible = (listingsData || []).filter(
              (listing) => !blockedSet.has(listing.user_id) && !mutedIds.services.has(listing.user_id)
            );
            setFeedListings(visible);
            setSponsoredListings(visible.filter((listing) => listing.is_sponsored));
          })
          .catch((error) => console.error("Error loading sponsored listings:", error));
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
    if (feedView === "all" && !profession) return;
    const matches = allPosts.some((post) => {
      const hay = `${post.post_type || ""} ${post.profiles?.profession || ""} ${post.description || ""}`.toLowerCase();
      return matchesProfession(profession, hay) && matchesFeedView(feedView, post);
    });
    if (!matches) void loadMorePosts();
  }, [feedView, profession, allPosts, hasMorePosts, loading]);

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
      } else {
      await postService.createPost(user.id, {
        title: postData.title || "",
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
        property_details: details,
        city,
      });
      toast({
        title: "Post publié",
        description: "Votre post a été publié avec succès.",
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
    const posts = (feedView === "all" ? [...SHOWCASE_POSTS, ...allPosts] : allPosts).filter((post) => {
      const hay = `${post.post_type || ""} ${post.profiles?.profession || ""} ${post.description || ""}`.toLowerCase();
      return matchesProfession(profession, hay) && matchesFeedView(feedView, post);
    });
    if (feedView === "services") {
      const annonces = feedListings.filter((listing) => {
        const hay = `${listing.title || ""} ${listing.profession || ""} ${listing.description || ""} ${listing.location || ""}`.toLowerCase();
        return matchesProfession(profession, hay);
      });
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
          Aucun post pour ce filtre
        </div>,
      ];
    }
    let bannerIndex = 0;

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
      className="min-h-screen bg-white pb-4"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
    >
      <div className="mx-auto w-full max-w-2xl">
        {categoriesOpen ? null : (
        <div className="mb-2 border-b border-neutral-200 bg-white">
        <div className="flex w-full pb-[11px] pt-5">
          {[
            { id: "all" as const, label: "Accueil", Icon: LayoutGrid, tone: "bg-[#eee9ec]" },
            { id: "projets" as const, label: "Projets", Icon: RenovationIcon, tone: "bg-[#eee9ec]" },
            { id: "biens" as const, label: "Biens", Icon: Building2, tone: "bg-[#eee9ec]" },
            { id: "services" as const, label: "Services", Icon: Briefcase, tone: "bg-[#eee9ec]" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setCategoriesOpen(false);
                const next = new URLSearchParams(searchParams);
                if (item.id === "all") {
                  next.delete("vue");
                  setProfession(null);
                } else if (feedView === item.id) {
                  next.delete("vue");
                } else {
                  next.set("vue", item.id);
                }
                setSearchParams(next, { replace: true });
              }}
              className="group flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <span
                className={`inline-flex h-12 w-12 items-center justify-center rounded-full transition ${
                  feedView === item.id
                    ? "scale-105 bg-[#174f43] text-white shadow-md"
                    : `${item.tone} text-neutral-800 group-hover:shadow-sm`
                }`}
              >
                <item.Icon className="h-5 w-5" />
              </span>
              <span className="whitespace-nowrap text-center text-xs font-semibold leading-normal text-neutral-800">
                {item.label}
              </span>
            </button>
          ))}
        </div>
        </div>
        )}

        {categoriesOpen ? null : (
        <section className="relative mx-2 mb-3 min-h-[175px] overflow-hidden rounded-2xl bg-neutral-800 text-white">
          <img
            key={bannerImage?.image_url || "fallback"}
            src={bannerImage?.image_url || "/agadir-welcome.png"}
            alt={bannerImage?.alt || "Vue panoramique d’Agadir"}
            className="absolute inset-0 h-full w-full animate-in fade-in object-cover duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
          <div className="relative flex min-h-[175px] max-w-full translate-y-4 flex-col justify-center px-4 py-4">
            <p className="relative -top-1 mt-1 whitespace-nowrap text-2xl font-medium">Bonjour!</p>
            <p className="mt-2 font-normal leading-snug text-white/95">
              <span className="block whitespace-nowrap text-[clamp(0.7rem,3.7vw,1.0625rem)] font-light">Découvrez l'écosystème immobilier de votre région.</span>
              <span className="mt-1 block text-base font-medium leading-snug">Agences, professionnels, projets, biens et services autour de vous.</span>
            </p>
          </div>
        </section>
        )}

        <div className="px-3">
          <CategoryPicker
            open={categoriesOpen}
            onToggle={() => setCategoriesOpen((open) => !open)}
            selectedLabel={
              profession === "tout"
                ? "Tout"
                : PROFESSION_CATEGORIES.find((item) => item.id === profession)?.label || null
            }
            categories={PROFESSION_CATEGORIES}
            onSelect={(id) => {
              setProfession(id as ProfessionId | "tout");
              setCategoriesOpen(false);
            }}
          />
        </div>

        {categoriesOpen ? null : sponsoredListings.length >= 2 && feedView !== "services" && (
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

        {categoriesOpen ? null : (
        <>
        {/* Create Post */}
        <CreatePost
          hideLauncher
          startOpen={openCreate}
          onClose={() => {
            if (openCreate) navigate("/", { replace: true, state: {} });
          }}
          onPostCreated={async (postData) => {
            await handlePostCreated(postData);
            if (openCreate) navigate("/", { replace: true, state: {} });
          }}
        />

        {/* Feed with posts and sponsored banners */}
        {feedView === "projets" ? (
          <div className="grid gap-3 px-3 pb-4">
            {SHOWCASE_PROJECTS.map((row) => (
              <ProjectCard key={row.id} row={row} />
            ))}
          </div>
        ) : null}
        {feedView === "services" ? (
          <div className="grid gap-3 px-3 pb-4">
            {SHOWCASE_SERVICES.map((row) => (
              <ServiceCard key={row.id} row={row} />
            ))}
          </div>
        ) : null}
        {feedView === "biens" ? (
          <div className="grid gap-3 px-3 pb-4">
            {SHOWCASE_PROPERTIES.map((row) => (
              <PropertyCard key={row.id} row={row} />
            ))}
          </div>
        ) : null}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : feedView !== "services" && feedView !== "projets" && feedView !== "biens" && feedView !== "all" && allPosts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Aucun post pour le moment</div>
        ) : (
          buildFeed()
        )}
        {!loading && feedView !== "services" ? (
          <InfiniteScrollSentinel hasMore={hasMorePosts} loading={loadingMore} onLoadMore={loadMorePosts} />
        ) : null}
        </>
        )}
      </div>
    </div>
  );
};

export default Index;

