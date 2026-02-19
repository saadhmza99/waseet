import { useState } from "react";
import ListingCard from "@/components/ListingCard";
import FeedPost from "@/components/FeedPost";
import avatarSarah from "@/assets/avatar-sarah.jpg";
import avatarMark from "@/assets/avatar-mark.jpg";
import avatarLaura from "@/assets/avatar-laura.jpg";
import avatarAnna from "@/assets/avatar-anna.jpg";
import avatarMike from "@/assets/avatar-mike.jpg";
import avatarTony from "@/assets/avatar-tony.jpg";
import bathroomRemodel from "@/assets/bathroom-remodel.jpg";
import paintingWork from "@/assets/painting-work.jpg";
import deckRenovation from "@/assets/deck-renovation.jpg";
import roofRepair from "@/assets/roof-repair.jpg";
import faucetInstall from "@/assets/faucet-install.jpg";
import kitchenBefore from "@/assets/kitchen-before.jpg";
import kitchenAfter from "@/assets/kitchen-after.jpg";

const tabs = ["Posts", "Annonces", "Reels"] as const;

const Saved = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Posts");

  return (
    <div className="pb-20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-card-foreground mb-4 sm:mb-6">
          Enregistrés
        </h1>

        {/* Tab switcher */}
        <div className="bg-card rounded-lg border border-border mb-4 sm:mb-6">
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

          {/* Tab content */}
          <div className="p-4 sm:p-6">
            {activeTab === "Posts" && (
              <div className="space-y-4">
                <FeedPost
                  avatar={avatarAnna}
                  username="Anna_Designs"
                  location="Dubai, UAE"
                  timeAgo="il ya 2 heures"
                  title="Rénovation complète de cuisine - Avant et après"
                  description="Nous avons complètement transformé cette cuisine avec des armoires sur mesure, un nouveau comptoir en granit et des appareils modernes. Le projet a pris 3 semaines et le résultat est incroyable !"
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
                  singleImage={deckRenovation}
                  likes={89}
                  comments={12}
                  shares={3}
                />
              </div>
            )}

            {activeTab === "Annonces" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <ListingCard
                  avatar={avatarLaura}
                  username="Laura_Design"
                  timeAgo="il ya 5 heures"
                  image={faucetInstall}
                  imageCount={8}
                  location="Plomberie dans Jumeirah, Dubai"
                  title="Installation de robinetterie moderne"
                  profession="Plombier"
                  priceRange="$100 - $250"
                />
                <ListingCard
                  avatar={avatarSarah}
                  username="Sarah_Homeowner"
                  timeAgo="il ya 1 heure"
                  image={bathroomRemodel}
                  imageCount={12}
                  location="Plomberie dans Dubai Marina, Dubai"
                  title="Réparation plomberie salle de bain"
                  profession="Plombier"
                  priceRange="$200 - $400"
                />
                <ListingCard
                  avatar={avatarMark}
                  username="Mark_Johnson"
                  timeAgo="il ya 3 heures"
                  image={roofRepair}
                  imageCount={9}
                  location="Électricité dans Downtown Dubai, Dubai"
                  title="Mise à niveau tableau électrique"
                  profession="Électricien"
                  priceRange="$400 - $800"
                />
                <ListingCard
                  avatar={avatarSarah}
                  username="Sarah_Homeowner"
                  timeAgo="il ya 1 heure"
                  image={deckRenovation}
                  imageCount={10}
                  location="Menuiserie dans Dubai Marina, Dubai"
                  title="Rénovation terrasse en bois"
                  profession="Charpentier"
                  priceRange="$500 - $1,000"
                />
                <ListingCard
                  avatar={avatarMark}
                  username="Mark_Johnson"
                  timeAgo="il ya 3 heures"
                  image={roofRepair}
                  imageCount={6}
                  location="Toiture dans Downtown Dubai, Dubai"
                  title="Service réparation toiture"
                  profession="Couvreur"
                  priceRange="$300 - $600"
                />
              </div>
            )}

            {activeTab === "Reels" && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucun reel enregistré pour le moment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Saved;

