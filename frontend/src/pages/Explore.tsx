import { useEffect, useMemo, useState } from "react";
import { Filter, Map, List, Wrench, Hammer, Zap, Paintbrush, Home as HomeIcon, Sparkles } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import JobFilterModal from "@/components/JobFilterModal";
import CategorySection from "@/components/CategorySection";
import SearchBar from "@/components/SearchBar";
import { listingService } from "@/services/listingService";
import { moderationService } from "@/services/moderationService";
import { useAuth } from "@/contexts/AuthContext";

interface ListingData {
  id: string;
  userId: string;
  avatar: string;
  username: string;
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

  useEffect(() => {
    const loadListings = async () => {
      try {
        setLoading(true);
        const [data, blockedIds] = await Promise.all([
          listingService.getListings(100, 0),
          user ? moderationService.getBlockedUserIds(user.id) : Promise.resolve([]),
        ]);
        const blockedSet = new Set(blockedIds || []);
        const mapped = (data || []).map((listing) => ({
          id: listing.id,
          userId: listing.user_id,
          avatar: listing.profiles?.avatar_url || "/default-avatar.png",
          username: listing.profiles?.username || "Utilisateur",
          timeAgo: "récemment",
          image: listing.image_url || "",
          imageCount: listing.image_count || 1,
          location: listing.location || "",
          title: listing.title || "Annonce",
          profession: listing.profession || "Autre",
          priceRange: listing.price_range || "Prix sur demande",
          isSponsored: Boolean(listing.is_sponsored),
        }));
        setListings(mapped.filter((listing) => !blockedSet.has(listing.userId)));
      } catch (error) {
        console.error("Error loading listings:", error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, [user]);

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
            <div className="text-center py-6 text-muted-foreground">Chargement des annonces...</div>
          )}

          {/* Sponsored Section */}
          {!loading && allSponsoredListings.length > 0 && (
            <CategorySection
              title="Annonces sponsorisées"
              icon={<Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />}
              maxRows={2}
              isSponsored={true}
            >
              {allSponsoredListings.map((listing, index) => (
                <ListingCard
                  key={listing.id || index}
                  avatar={listing.avatar}
                  username={listing.username}
                  timeAgo={listing.timeAgo}
                  image={listing.image}
                  imageCount={listing.imageCount}
                  location={listing.location}
                  title={listing.title}
                  profession={listing.profession}
                  priceRange={listing.priceRange}
                  isSponsored={listing.isSponsored}
                  isLarge={true}
                />
              ))}
            </CategorySection>
          )}

          {!loading &&
            Object.entries(groupedListings).map(([profession, professionListings]) => (
              <CategorySection
                key={profession}
                title={`Nouvelles annonces de ${profession}`}
                icon={categoryIcon(profession)}
                onViewMore={() => handleViewMore(profession)}
              >
                {sortListings(professionListings).map((listing, index) => (
                  <ListingCard
                    key={listing.id || index}
                    avatar={listing.avatar}
                    username={listing.username}
                    timeAgo={listing.timeAgo}
                    image={listing.image}
                    imageCount={listing.imageCount}
                    location={listing.location}
                    title={listing.title}
                    profession={listing.profession}
                    priceRange={listing.priceRange}
                    isSponsored={listing.isSponsored}
                  />
                ))}
              </CategorySection>
            ))}

          {!loading && listings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Aucune annonce disponible pour le moment.</div>
          )}
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

