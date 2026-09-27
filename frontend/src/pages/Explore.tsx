import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, Map, List, Wrench, Hammer, Zap, Paintbrush, Home as HomeIcon, Sparkles } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import JobFilterModal from "@/components/JobFilterModal";
import CategorySection from "@/components/CategorySection";
import SearchBar from "@/components/SearchBar";
import InfiniteScrollSentinel, { PAGE_SIZE } from "@/components/InfiniteScrollSentinel";
import { listingService } from "@/services/listingService";
import { moderationService } from "@/services/moderationService";
import { muteService } from "@/services/muteService";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultAvatar } from "@/lib/avatar";

interface ListingData {
  id: string;
  userId: string;
  avatar: string;
  username: string;
  isVerified: boolean;
  timeAgo: string;
  image: string;
  imageCount?: number;
  location: string;
  title: string;
  profession?: string;
  priceRange: string;
  isSponsored?: boolean;
}

const Explore = () => {
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const fetchedRef = useRef(0);
  const hiddenOwnersRef = useRef<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 639px)").matches);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const onChange = () => setIsMobile(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const handleViewMore = (category: string) => {
    console.log(`View more ${category}`);
  };

  // Helper function to sort listings: sponsored first
  const sortListings = (listings: ListingData[]) => {
    return [...listings].sort((a, b) => {
      if (a.isSponsored && !b.isSponsored) return -1;
      if (!a.isSponsored && b.isSponsored) return 1;
      return 0;
    });
  };

  const toListingData = (data: any[]): ListingData[] =>
    data
      .filter((listing) => !hiddenOwnersRef.current.has(listing.user_id))
      .map((listing) => ({
          id: listing.id,
          userId: listing.user_id,
          avatar: listing.profiles?.avatar_url || getDefaultAvatar("craftsman"),
          username: listing.profiles?.username || "Utilisateur",
          isVerified: Boolean(listing.profiles?.is_verified),
          timeAgo: "récemment",
          image: listing.image_url || "",
          imageCount: listing.image_count || 1,
          location: listing.location || "",
          title: listing.title || "service",
          profession: listing.profession || "Autre",
          priceRange: listing.price_range || "Prix sur demande",
          isSponsored: Boolean(listing.is_sponsored),
        }));

  useEffect(() => {
    const loadListings = async () => {
      try {
        setLoading(true);
        const [data, blockedIds, mutedIds] = await Promise.all([
          listingService.getListings(PAGE_SIZE, 0),
          user ? moderationService.getBlockedUserIds(user.id) : Promise.resolve([]),
          user ? muteService.getMutedIds(user.id) : Promise.resolve({ posts: new Set<string>(), services: new Set<string>() }),
        ]);
        hiddenOwnersRef.current = new Set([...(blockedIds || []), ...mutedIds.services]);
        fetchedRef.current = (data || []).length;
        setHasMore((data || []).length === PAGE_SIZE);
        setListings(toListingData(data || []));
      } catch (error) {
        console.error("Error loading listings:", error);
        setListings([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, [user]);

  const loadMoreListings = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const data = (await listingService.getListings(PAGE_SIZE, fetchedRef.current)) || [];
      fetchedRef.current += data.length;
      setHasMore(data.length === PAGE_SIZE);
      const next = toListingData(data);
      setListings((prev) => {
        const seen = new Set(prev.map((listing) => listing.id));
        return [...prev, ...next.filter((listing) => !seen.has(listing.id))];
      });
    } catch (error) {
      console.error("Error loading more listings:", error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const allSponsoredListings = useMemo(
    () => listings.filter((listing) => listing.isSponsored),
    [listings]
  );

  const groupedListings = useMemo(() => {
    const groups: Record<string, ListingData[]> = {};
    listings.forEach((listing) => {
      const key = listing.profession || "Autre";
      if (!groups[key]) groups[key] = [];
      groups[key].push(listing);
    });
    return groups;
  }, [listings]);

  const categoryIcon = (profession: string) => {
    const value = profession.toLowerCase();
    if (value.includes("plomb")) return <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (value.includes("menuis") || value.includes("carpen")) return <Hammer className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (value.includes("elect")) return <Zap className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (value.includes("paint") || value.includes("peint")) return <Paintbrush className="w-5 h-5 sm:w-6 sm:h-6" />;
    return <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6" />;
  };

  return (
    <div className="pb-20">
      {/* Search Bar Section */}
      <SearchBar />

      {/* Filter and View Mode Toggle */}
      <div className="lg:sticky lg:top-[57px] lg:z-40 bg-background border-b border-border px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-3 max-w-7xl mx-auto">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors flex-shrink-0"
            aria-label="Filter"
          >
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-card-foreground" />
            <span className="hidden sm:inline text-xs sm:text-sm font-medium">Filtrer</span>
          </button>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Liste</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                viewMode === "map"
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Carte</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          {loading && (
            <div className="text-center py-6 text-muted-foreground">Chargement des services...</div>
          )}

          {/* Sponsored Section */}
          {!loading && allSponsoredListings.length > 0 && (
            <CategorySection
              title="services sponsorisées"
              icon={<Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />}
              maxRows={2}
              isSponsored={true}
              stacked={isMobile}
            >
              {allSponsoredListings.map((listing, index) => (
                <ListingCard
                  key={listing.id || index}
                  id={listing.id}
                  userId={listing.userId}
                  avatar={listing.avatar}
                  username={listing.username}
                  isVerified={listing.isVerified}
                  timeAgo={listing.timeAgo}
                  image={listing.image}
                  imageCount={listing.imageCount}
                  location={listing.location}
                  title={listing.title}
                  profession={listing.profession}
                  priceRange={listing.priceRange}
                  isSponsored={listing.isSponsored}
                  isLarge={true}
                  compact={isMobile}
                />
              ))}
            </CategorySection>
          )}

          {!loading &&
            Object.entries(groupedListings).map(([profession, professionListings]) => (
              <CategorySection
                key={profession}
                title={`nouveaux services de ${profession}`}
                icon={categoryIcon(profession)}
                onViewMore={() => handleViewMore(profession)}
                stacked={isMobile}
              >
                {sortListings(professionListings).map((listing, index) => (
                  <ListingCard
                    key={listing.id || index}
                    id={listing.id}
                    userId={listing.userId}
                    avatar={listing.avatar}
                    username={listing.username}
                    isVerified={listing.isVerified}
                    timeAgo={listing.timeAgo}
                    image={listing.image}
                    imageCount={listing.imageCount}
                    location={listing.location}
                    title={listing.title}
                    profession={listing.profession}
                    priceRange={listing.priceRange}
                    isSponsored={listing.isSponsored}
                    compact={isMobile}
                  />
                ))}
              </CategorySection>
            ))}

          {!loading && listings.length === 0 && !hasMore && (
            <div className="text-center py-8 text-muted-foreground">Aucun service disponible pour le moment.</div>
          )}
          {!loading ? (
            <InfiniteScrollSentinel hasMore={hasMore} loading={loadingMore} onLoadMore={loadMoreListings} />
          ) : null}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-8 text-center text-muted-foreground">
          La vue carte sera affichée une fois les données géolocalisées disponibles.
        </div>
      )}
      <JobFilterModal isOpen={showFilters} onClose={() => setShowFilters(false)} />
    </div>
  );
};

export default Explore;

