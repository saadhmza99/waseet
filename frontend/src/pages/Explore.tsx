import { useState } from "react";
import { Filter, Map, List, Wrench, Hammer, Zap, Paintbrush, Home as HomeIcon, Sparkles } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import JobFilterModal from "@/components/JobFilterModal";
import MapView from "@/components/MapView";
import CategorySection from "@/components/CategorySection";
import SearchBar from "@/components/SearchBar";
import avatarAnna from "@/assets/avatar-anna.jpg";
import avatarMike from "@/assets/avatar-mike.jpg";
import avatarTony from "@/assets/avatar-tony.jpg";
import avatarSarah from "@/assets/avatar-sarah.jpg";
import avatarMark from "@/assets/avatar-mark.jpg";
import avatarLaura from "@/assets/avatar-laura.jpg";
import bathroomRemodel from "@/assets/bathroom-remodel.jpg";
import paintingWork from "@/assets/painting-work.jpg";
import deckRenovation from "@/assets/deck-renovation.jpg";
import roofRepair from "@/assets/roof-repair.jpg";
import faucetInstall from "@/assets/faucet-install.jpg";
import kitchenBefore from "@/assets/kitchen-before.jpg";
import kitchenAfter from "@/assets/kitchen-after.jpg";

interface ListingData {
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
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const handleViewMore = (category: string) => {
    // Navigate to category page or filter by category
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

  // Plumbing listings
  const plumbingListings: ListingData[] = [
    {
      avatar: avatarMike,
      username: "Mike_Contractor",
      timeAgo: "il ya 4 heures",
      image: bathroomRemodel,
      imageCount: 15,
      location: "Plomberie dans Abu Dhabi, UAE",
      title: "Rénovation complète salle de bain",
      profession: "Plumber",
      priceRange: "$500 - $1,000",
      isSponsored: true,
    },
    {
      avatar: avatarLaura,
      username: "Laura_Design",
      timeAgo: "il ya 5 heures",
      image: faucetInstall,
      imageCount: 8,
      location: "Plomberie dans Jumeirah, Dubai",
      title: "Installation de robinetterie moderne",
      profession: "Plumber",
      priceRange: "$100 - $250",
    },
    {
      avatar: avatarSarah,
      username: "Sarah_Homeowner",
      timeAgo: "il ya 1 heure",
      image: bathroomRemodel,
      imageCount: 12,
      location: "Plomberie dans Dubai Marina, Dubai",
      title: "Réparation plomberie salle de bain",
      profession: "Plumber",
      priceRange: "$200 - $400",
    },
  ];

  // Carpentry listings
  const carpentryListings: ListingData[] = [
    {
      avatar: avatarAnna,
      username: "Anna_Designs",
      timeAgo: "il ya 2 heures",
      image: kitchenAfter,
      imageCount: 14,
      location: "Menuiserie dans Dubai, UAE",
      title: "Rénovation complète cuisine sur mesure",
      profession: "Carpenter",
      priceRange: "$1,200 - $2,500",
      isSponsored: true,
    },
    {
      avatar: avatarSarah,
      username: "Sarah_Homeowner",
      timeAgo: "il ya 1 heure",
      image: deckRenovation,
      imageCount: 10,
      location: "Menuiserie dans Dubai Marina, Dubai",
      title: "Rénovation terrasse en bois",
      profession: "Carpenter",
      priceRange: "$500 - $1,000",
    },
    {
      avatar: avatarTony,
      username: "Tony_McBuild",
      timeAgo: "il ya 3 heures",
      image: kitchenAfter,
      imageCount: 6,
      location: "Menuiserie dans Chicago, IL",
      title: "Installation armoires sur mesure",
      profession: "Carpenter",
      priceRange: "$300 - $600",
    },
  ];

  // Electrical listings
  const electricalListings: ListingData[] = [
    {
      avatar: avatarMike,
      username: "Mike_Contractor",
      timeAgo: "il ya 6 heures",
      image: bathroomRemodel,
      imageCount: 11,
      location: "Électricité dans Abu Dhabi, UAE",
      title: "Installation câblage domotique",
      profession: "Electrician",
      priceRange: "$600 - $1,200",
      isSponsored: true,
    },
    {
      avatar: avatarMark,
      username: "Mark_Johnson",
      timeAgo: "il ya 3 heures",
      image: roofRepair,
      imageCount: 9,
      location: "Électricité dans Downtown Dubai, Dubai",
      title: "Mise à niveau tableau électrique",
      profession: "Electrician",
      priceRange: "$400 - $800",
    },
    {
      avatar: avatarSarah,
      username: "Sarah_Homeowner",
      timeAgo: "il ya 2 heures",
      image: faucetInstall,
      imageCount: 5,
      location: "Électricité dans Dubai Marina, Dubai",
      title: "Installation luminaires modernes",
      profession: "Electrician",
      priceRange: "$150 - $300",
    },
  ];

  // Painting listings
  const paintingListings: ListingData[] = [
    {
      avatar: avatarTony,
      username: "Tony_Painter",
      timeAgo: "il ya 6 heures",
      image: paintingWork,
      imageCount: 18,
      location: "Peinture dans Sharjah, UAE",
      title: "Peinture extérieure complète",
      profession: "Painter",
      priceRange: "$800 - $1,500",
      isSponsored: true,
    },
    {
      avatar: avatarAnna,
      username: "Anna_Designs",
      timeAgo: "il ya 4 heures",
      image: paintingWork,
      imageCount: 7,
      location: "Peinture dans Dubai, UAE",
      title: "Service peinture intérieure",
      profession: "Painter",
      priceRange: "$250 - $500",
    },
    {
      avatar: avatarMike,
      username: "Mike_Contractor",
      timeAgo: "il ya 8 heures",
      image: paintingWork,
      imageCount: 12,
      location: "Peinture dans Abu Dhabi, UAE",
      title: "Texture murale et peinture",
      profession: "Painter",
      priceRange: "$400 - $800",
    },
  ];

  // Roofing listings
  const roofingListings: ListingData[] = [
    {
      avatar: avatarTony,
      username: "Tony_McBuild",
      timeAgo: "il ya 5 heures",
      image: roofRepair,
      imageCount: 20,
      location: "Toiture dans Chicago, IL",
      title: "Remplacement toiture complète",
      profession: "Roofer",
      priceRange: "$2,000 - $5,000",
      isSponsored: true,
    },
    {
      avatar: avatarMark,
      username: "Mark_Johnson",
      timeAgo: "il ya 3 heures",
      image: roofRepair,
      imageCount: 6,
      location: "Toiture dans Downtown Dubai, Dubai",
      title: "Service réparation toiture",
      profession: "Roofer",
      priceRange: "$300 - $600",
    },
    {
      avatar: avatarSarah,
      username: "Sarah_Homeowner",
      timeAgo: "il ya 7 heures",
      image: roofRepair,
      imageCount: 4,
      location: "Toiture dans Dubai Marina, Dubai",
      title: "Inspection et entretien toiture",
      profession: "Roofer",
      priceRange: "$150 - $300",
    },
  ];

  // Get all sponsored listings
  const allSponsoredListings: ListingData[] = [
    ...plumbingListings.filter(l => l.isSponsored),
    ...carpentryListings.filter(l => l.isSponsored),
    ...electricalListings.filter(l => l.isSponsored),
    ...paintingListings.filter(l => l.isSponsored),
    ...roofingListings.filter(l => l.isSponsored),
  ];

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
          {/* Sponsored Section */}
          {allSponsoredListings.length > 0 && (
            <CategorySection
              title="Annonces sponsorisées"
              icon={<Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />}
              maxRows={2}
              isSponsored={true}
            >
              {allSponsoredListings.map((listing, index) => (
                <ListingCard
                  key={index}
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

          {/* Plumbing Section */}
          <CategorySection
            title="Nouvelles annonces de Plomberie"
            icon={<Wrench className="w-5 h-5 sm:w-6 sm:h-6" />}
            onViewMore={() => handleViewMore("Plomberie")}
          >
            {sortListings(plumbingListings).map((listing, index) => (
              <ListingCard
                key={index}
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

          {/* Carpentry Section */}
          <CategorySection
            title="Nouvelles annonces de Menuiserie"
            icon={<Hammer className="w-5 h-5 sm:w-6 sm:h-6" />}
            onViewMore={() => handleViewMore("Menuiserie")}
          >
            {sortListings(carpentryListings).map((listing, index) => (
              <ListingCard
                key={index}
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

          {/* Electrical Section */}
          <CategorySection
            title="Nouvelles annonces d'Électricité"
            icon={<Zap className="w-5 h-5 sm:w-6 sm:h-6" />}
            onViewMore={() => handleViewMore("Électricité")}
          >
            {sortListings(electricalListings).map((listing, index) => (
              <ListingCard
                key={index}
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

          {/* Painting Section */}
          <CategorySection
            title="Nouvelles annonces de Peinture"
            icon={<Paintbrush className="w-5 h-5 sm:w-6 sm:h-6" />}
            onViewMore={() => handleViewMore("Peinture")}
          >
            {sortListings(paintingListings).map((listing, index) => (
              <ListingCard
                key={index}
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

          {/* Roofing Section */}
          <CategorySection
            title="Nouvelles annonces de Toiture"
            icon={<HomeIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
            onViewMore={() => handleViewMore("Toiture")}
          >
            {sortListings(roofingListings).map((listing, index) => (
              <ListingCard
                key={index}
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
        </div>
      ) : (
        <MapView />
      )}
      <JobFilterModal isOpen={showFilters} onClose={() => setShowFilters(false)} />
    </div>
  );
};

export default Explore;

