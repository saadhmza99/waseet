import { useState, useEffect, useRef } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import PortfolioGrid from "@/components/PortfolioGrid";
import ReviewCard from "@/components/ReviewCard";
import FeedPost from "@/components/FeedPost";
import ListingCard from "@/components/ListingCard";
import avatarTony from "@/assets/avatar-tony.jpg";
import avatarSarah from "@/assets/avatar-sarah.jpg";
import avatarLaura from "@/assets/avatar-laura.jpg";
import deckImg from "@/assets/deck-renovation.jpg";
import bathroomImg from "@/assets/bathroom-remodel.jpg";
import roofImg from "@/assets/roof-repair.jpg";
import kitchenBefore from "@/assets/kitchen-before.jpg";
import kitchenAfter from "@/assets/kitchen-after.jpg";
import paintingWork from "@/assets/painting-work.jpg";
import heroBanner from "@/assets/hero-banner.jpg";
import { MapPin, Clock, Award, Wrench } from "lucide-react";

const tabs = ["Portfolio", "Posts", "Annonces", "Avis"] as const;

const Profile = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Portfolio");
  const tabsContentRef = useRef<HTMLDivElement>(null);
  const previousTabRef = useRef<(typeof tabs)[number]>("Portfolio");

  // Prevent scroll when switching tabs
  useEffect(() => {
    if (activeTab !== previousTabRef.current && tabsContentRef.current) {
      const scrollY = window.scrollY;
      // Prevent any automatic scrolling
      window.scrollTo(0, scrollY);
      previousTabRef.current = activeTab;
    }
  }, [activeTab]);

  return (
    <div className="pb-10 sm:pb-20">
      <ProfileHeader
        avatar={avatarTony}
        username="Tony_McBuild"
        profession="General Contractor"
        location="Chicago, IL"
        posts={245}
        followers="1.2k"
        rating={4.8}
        coverPhoto={heroBanner}
        bio="Entrepreneur général agréé avec plus de 12 ans d'expérience dans les rénovations résidentielles et commerciales. Spécialisé dans les rénovations de cuisine"
      />

      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - About Section */}
          <div className="lg:w-1/3">
            <div className="bg-card rounded-lg border border-border p-4 sm:p-6 lg:sticky lg:top-[120px] shadow-lg -mt-6 sm:-mt-8 md:-mt-12 lg:-mt-20 relative z-20">
              <h2 className="text-lg sm:text-xl font-bold text-card-foreground mb-4 sm:mb-6">
                À propos
              </h2>
              <div className="space-y-4 sm:space-y-5">
                <p className="text-sm sm:text-base text-card-foreground leading-relaxed">
                  Entrepreneur général agréé avec plus de 12 ans d'expérience dans les rénovations résidentielles et commerciales. 
                  Spécialisé dans les rénovations de cuisines, la construction de terrasses et les rénovations complètes de maisons. 
                  Engagé à fournir un travail de qualité dans les délais et le budget.
                </p>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3 text-sm sm:text-base">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                    <span className="text-card-foreground">Basé à Chicago, IL — Desservant le Grand Chicagoland</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm sm:text-base">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                    <span className="text-card-foreground">Plus de 12 ans d'expérience</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm sm:text-base">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                    <span className="text-card-foreground">Agréé et assuré — Licence IL #GC-4829</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm sm:text-base">
                    <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                    <span className="text-card-foreground">Cuisines, Terrasses, Toiture, Rénovations complètes</span>
                  </div>
                </div>

                <div className="pt-2 sm:pt-4 border-t border-border">
                  <h3 className="font-semibold text-sm sm:text-base text-card-foreground mb-2 sm:mb-3">Certifications</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {["EPA Lead-Safe", "OSHA 30", "NAHB Certified"].map((cert) => (
                      <span
                        key={cert}
                        className="bg-secondary text-secondary-foreground text-xs sm:text-sm px-3 py-1 sm:py-1.5 rounded-full font-medium"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tabs Content */}
          <div className="lg:w-2/3 flex-1">
            <div ref={tabsContentRef} className="bg-card rounded-lg border border-border">
              {/* Tab switcher */}
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
                <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            <PortfolioGrid
              items={[
                { image: deckImg, label: "Deck Renovation" },
                { image: bathroomImg, label: "Bathroom Remodel" },
                { image: roofImg, label: "Roof Repair" },
                { image: kitchenBefore, label: "Kitchen Before" },
                { image: kitchenAfter, label: "Kitchen After" },
                { image: paintingWork, label: "Interior Painting" },
              ]}
              username="Tony_McBuild"
              avatar={avatarTony}
            />
                </div>
              )}

              {activeTab === "Posts" && (
                <div className="divide-y divide-border">
                  <FeedPost
                    avatar={avatarTony}
                    username="Tony_McBuild"
                    location="Chicago, IL"
                    timeAgo="il ya 2 heures"
                    title="Rénovation complète de cuisine terminée"
                    description="Nous avons terminé cette magnifique rénovation de cuisine avec des armoires sur mesure, un comptoir en granit et des appareils modernes. Le projet a pris 3 semaines et le client est ravi du résultat !"
                    beforeImage={kitchenBefore}
                    afterImage={kitchenAfter}
                    likes={124}
                    comments={18}
                    shares={5}
                  />
                  <FeedPost
                    avatar={avatarTony}
                    username="Tony_McBuild"
                    location="Chicago, IL"
                    timeAgo="il ya 5 heures"
                    title="Nouvelle terrasse en bois composite"
                    description="Installation d'une terrasse en bois composite de qualité supérieure. Résistant aux intempéries et nécessite peu d'entretien. Parfait pour les soirées d'été !"
                    singleImage={deckImg}
                    likes={89}
                    comments={12}
                    shares={3}
                  />
                  <FeedPost
                    avatar={avatarTony}
                    username="Tony_McBuild"
                    location="Chicago, IL"
                    timeAgo="il ya 1 jour"
                    title="Réparation de toiture - Avant et après"
                    description="Remplacement complet de la toiture avec des matériaux de première qualité. Le toit est maintenant étanche et prêt pour l'hiver."
                    singleImage={roofImg}
                    likes={156}
                    comments={24}
                    shares={8}
                  />
                  <FeedPost
                    avatar={avatarTony}
                    username="Tony_McBuild"
                    location="Chicago, IL"
                    timeAgo="il ya 3 jours"
                    title="Rénovation de salle de bain moderne"
                    description="Transformation complète d'une salle de bain avec carrelage moderne, douche à l'italienne et éclairage LED. Disponible pour vos projets de rénovation !"
                    singleImage={bathroomImg}
                    likes={203}
                    comments={31}
                    shares={12}
                  />
                  <FeedPost
                    avatar={avatarTony}
                    username="Tony_McBuild"
                    location="Chicago, IL"
                    timeAgo="il ya 1 semaine"
                    title="Travaux de peinture intérieure terminés"
                    description="Peinture complète de l'intérieur avec des couleurs modernes et des finitions impeccables. Le résultat est époustouflant !"
                    singleImage={paintingWork}
                    likes={178}
                    comments={28}
                    shares={9}
                  />
                </div>
              )}

              {activeTab === "Annonces" && (
                <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <ListingCard
                      avatar={avatarTony}
                      username="Tony_McBuild"
                      timeAgo="il ya 2 heures"
                      image={kitchenAfter}
                      imageCount={5}
                      location="Chicago, IL"
                      title="Rénovation de cuisine complète"
                      profession="General Contractor"
                      priceRange="15000 - 25000 DH"
                    />
                    <ListingCard
                      avatar={avatarTony}
                      username="Tony_McBuild"
                      timeAgo="il ya 1 jour"
                      image={bathroomImg}
                      imageCount={8}
                      location="Chicago, IL"
                      title="Installation de salle de bain moderne"
                      profession="General Contractor"
                      priceRange="8000 - 12000 DH"
                    />
                    <ListingCard
                      avatar={avatarTony}
                      username="Tony_McBuild"
                      timeAgo="il ya 3 jours"
                      image={deckImg}
                      imageCount={12}
                      location="Chicago, IL"
                      title="Construction de terrasse en bois"
                      profession="General Contractor"
                      priceRange="5000 - 8000 DH"
                    />
                    <ListingCard
                      avatar={avatarTony}
                      username="Tony_McBuild"
                      timeAgo="il ya 1 semaine"
                      image={roofImg}
                      imageCount={6}
                      location="Chicago, IL"
                      title="Réparation et remplacement de toiture"
                      profession="General Contractor"
                      priceRange="10000 - 15000 DH"
                    />
                    <ListingCard
                      avatar={avatarTony}
                      username="Tony_McBuild"
                      timeAgo="il ya 2 semaines"
                      image={paintingWork}
                      imageCount={4}
                      location="Chicago, IL"
                      title="Peinture intérieure et extérieure"
                      profession="General Contractor"
                      priceRange="3000 - 6000 DH"
                    />
                  </div>
                </div>
              )}

              {activeTab === "Avis" && (
                <div>
                  <ReviewCard
                    avatar={avatarSarah}
                    username="Sarah_Homeowner"
                    timeAgo="2d ago"
                    rating={4}
                    text="Tony did an amazing job on our basement remodel. Professional and reliable!"
                  />
                  <ReviewCard
                    avatar={avatarLaura}
                    username="Laura_Painter"
                    timeAgo="1w ago"
                    rating={5}
                    text="Excellent work on the deck renovation. Finished ahead of schedule and the quality is outstanding."
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
