import FeedPost from "@/components/FeedPost";
import CreatePost from "@/components/CreatePost";
import SponsoredBanner from "@/components/SponsoredBanner";
import avatarAnna from "@/assets/avatar-anna.jpg";
import avatarMike from "@/assets/avatar-mike.jpg";
import avatarTony from "@/assets/avatar-tony.jpg";
import kitchenBefore from "@/assets/kitchen-before.jpg";
import kitchenAfter from "@/assets/kitchen-after.jpg";
import bathroomRemodel from "@/assets/bathroom-remodel.jpg";
import paintingWork from "@/assets/painting-work.jpg";
import { ReactElement } from "react";

const Index = () => {
  // Sponsored banners pool
  const sponsoredBanners = [
    {
      title: "Rénovation complète salle de bain",
      location: "Dubai Marina, Dubai",
      description: "Plombier professionnel disponible",
      image: bathroomRemodel,
      avatar: avatarMike,
      username: "Mike_Contractor",
      timeAgo: "il ya 1 heure",
      profession: "Plombier",
      priceRange: "500 - 1000 DH",
    },
    {
      title: "Rénovation cuisine sur mesure",
      location: "Downtown Dubai, Dubai",
      description: "Menuisier expérimenté",
      image: kitchenAfter,
      avatar: avatarAnna,
      username: "Anna_Designs",
      timeAgo: "il ya 2 heures",
      profession: "Menuisier",
      priceRange: "1200 - 2500 DH",
    },
    {
      title: "Travaux de peinture professionnels",
      location: "Sharjah, UAE",
      description: "Peintre expérimenté disponible",
      image: paintingWork,
      avatar: avatarTony,
      username: "Tony_Painter",
      timeAgo: "il ya 3 heures",
      profession: "Peintre",
      priceRange: "300 - 600 DH",
    },
    {
      title: "Installation électrique moderne",
      location: "Dubai, UAE",
      description: "Électricien certifié",
      image: bathroomRemodel,
      avatar: avatarMike,
      username: "Mike_Contractor",
      timeAgo: "il ya 4 heures",
      profession: "Électricien",
      priceRange: "400 - 800 DH",
    },
  ];

  // Posts data
  const posts = [
    {
      avatar: avatarAnna,
      username: "Anna_Designs",
      location: "Dubai, UAE",
      timeAgo: "il ya 2 heures",
      title: "Rénovation complète de cuisine - Avant et après",
      description: "Nous avons complètement transformé cette cuisine avec des armoires sur mesure, un nouveau comptoir en granit et des appareils modernes. Le projet a pris 3 semaines et le résultat est incroyable !",
      beforeImage: kitchenBefore,
      afterImage: kitchenAfter,
      likes: 124,
      comments: 18,
      shares: 5,
    },
    {
      avatar: avatarMike,
      username: "Mike_Contractor",
      location: "Abu Dhabi, UAE",
      timeAgo: "il ya 4 heures",
      title: "Projet de rénovation de salle de bain moderne",
      description: "Rénovation complète d'une salle de bain avec carrelage moderne, douche à l'italienne et éclairage LED. Disponible pour vos projets de rénovation !",
      singleImage: bathroomRemodel,
      likes: 89,
      comments: 12,
      shares: 3,
      isSponsored: true,
    },
    {
      avatar: avatarTony,
      username: "Tony_Painter",
      location: "Sharjah, UAE",
      timeAgo: "il ya 6 heures",
      title: "Travaux de peinture extérieure terminés",
      singleImage: paintingWork,
      likes: 156,
      comments: 24,
      shares: 8,
    },
    {
      avatar: avatarAnna,
      username: "Anna_Designs",
      location: "Dubai, UAE",
      timeAgo: "il ya 8 heures",
      title: "Transformation complète d'appartement",
      beforeImage: kitchenBefore,
      afterImage: kitchenAfter,
      likes: 203,
      comments: 31,
      shares: 12,
      isSponsored: true,
    },
    {
      avatar: avatarMike,
      username: "Mike_Contractor",
      location: "Abu Dhabi, UAE",
      timeAgo: "il ya 10 heures",
      title: "Installation plomberie complète",
      singleImage: bathroomRemodel,
      likes: 67,
      comments: 9,
      shares: 2,
    },
    {
      avatar: avatarTony,
      username: "Tony_Painter",
      location: "Sharjah, UAE",
      timeAgo: "il ya 12 heures",
      title: "Rénovation façade extérieure",
      singleImage: paintingWork,
      likes: 142,
      comments: 19,
      shares: 6,
    },
    {
      avatar: avatarAnna,
      username: "Anna_Designs",
      location: "Dubai, UAE",
      timeAgo: "il ya 14 heures",
      title: "Design intérieur moderne",
      beforeImage: kitchenBefore,
      afterImage: kitchenAfter,
      likes: 178,
      comments: 27,
      shares: 9,
    },
    {
      avatar: avatarMike,
      username: "Mike_Contractor",
      location: "Abu Dhabi, UAE",
      timeAgo: "il ya 16 heures",
      title: "Réparation urgente plomberie",
      singleImage: bathroomRemodel,
      likes: 95,
      comments: 14,
      shares: 4,
    },
    {
      avatar: avatarTony,
      username: "Tony_Painter",
      location: "Sharjah, UAE",
      timeAgo: "il ya 18 heures",
      title: "Peinture intérieure résidentielle",
      singleImage: paintingWork,
      likes: 134,
      comments: 21,
      shares: 7,
    },
    {
      avatar: avatarAnna,
      username: "Anna_Designs",
      location: "Dubai, UAE",
      timeAgo: "il ya 20 heures",
      title: "Rénovation complète appartement",
      beforeImage: kitchenBefore,
      afterImage: kitchenAfter,
      likes: 167,
      comments: 25,
      shares: 8,
    },
    {
      avatar: avatarMike,
      username: "Mike_Contractor",
      location: "Abu Dhabi, UAE",
      timeAgo: "il ya 22 heures",
      title: "Installation système de plomberie",
      singleImage: bathroomRemodel,
      likes: 112,
      comments: 16,
      shares: 5,
    },
    {
      avatar: avatarTony,
      username: "Tony_Painter",
      location: "Sharjah, UAE",
      timeAgo: "il ya 1 jour",
      title: "Peinture extérieure commerciale",
      singleImage: paintingWork,
      likes: 189,
      comments: 29,
      shares: 10,
    },
    {
      avatar: avatarAnna,
      username: "Anna_Designs",
      location: "Dubai, UAE",
      timeAgo: "il ya 1 jour",
      title: "Design et rénovation cuisine",
      beforeImage: kitchenBefore,
      afterImage: kitchenAfter,
      likes: 201,
      comments: 33,
      shares: 11,
    },
    {
      avatar: avatarMike,
      username: "Mike_Contractor",
      location: "Abu Dhabi, UAE",
      timeAgo: "il ya 1 jour",
      title: "Réparation plomberie d'urgence",
      singleImage: bathroomRemodel,
      likes: 88,
      comments: 13,
      shares: 3,
    },
    {
      avatar: avatarTony,
      username: "Tony_Painter",
      location: "Sharjah, UAE",
      timeAgo: "il ya 1 jour",
      title: "Peinture résidentielle complète",
      singleImage: paintingWork,
      likes: 145,
      comments: 22,
      shares: 7,
    },
    {
      avatar: avatarAnna,
      username: "Anna_Designs",
      location: "Dubai, UAE",
      timeAgo: "il ya 2 jours",
      title: "Transformation complète maison",
      beforeImage: kitchenBefore,
      afterImage: kitchenAfter,
      likes: 223,
      comments: 38,
      shares: 13,
    },
  ];

  // Build feed with sponsored banners every 8 posts
  const buildFeed = (): ReactElement[] => {
    const feed: ReactElement[] = [];
    let bannerIndex = 0;

    posts.forEach((post, index) => {
      // Add post
      feed.push(
        <FeedPost
          key={`post-${index}`}
          avatar={post.avatar}
          username={post.username}
          location={post.location}
          timeAgo={post.timeAgo}
          title={post.title}
          description={post.description}
          beforeImage={post.beforeImage}
          afterImage={post.afterImage}
          singleImage={post.singleImage}
          likes={post.likes}
          comments={post.comments}
          shares={post.shares}
          isSponsored={post.isSponsored}
        />
      );

      // Add 2 sponsored banners after every 8 posts (after post index 7, 15, 23, etc.)
      if ((index + 1) % 8 === 0) {
        const banner1 = sponsoredBanners[bannerIndex % sponsoredBanners.length];
        const banner2 = sponsoredBanners[(bannerIndex + 1) % sponsoredBanners.length];
        
        feed.push(
          <div key={`banners-${index}`} className="my-4 sm:my-6 space-y-3 sm:space-y-4">
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
            />
          </div>
        );
        
        bannerIndex += 2;
      }
    });

    return feed;
  };

  return (
    <div className="pb-20">
      {/* Normal Feed */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Initial Sponsored Banners */}
        <div className="my-4 sm:my-6 space-y-3 sm:space-y-4">
          <SponsoredBanner
            title="Rénovation complète salle de bain"
            location="Dubai Marina, Dubai"
            description="Plombier professionnel disponible"
            image={bathroomRemodel}
            avatar={avatarMike}
            username="Mike_Contractor"
            timeAgo="il ya 1 heure"
            profession="Plombier"
            priceRange="500 - 1000 DH"
          />
          <SponsoredBanner
            title="Rénovation cuisine sur mesure"
            location="Downtown Dubai, Dubai"
            description="Menuisier expérimenté"
            image={kitchenAfter}
            avatar={avatarAnna}
            username="Anna_Designs"
            timeAgo="il ya 2 heures"
            profession="Menuisier"
            priceRange="1200 - 2500 DH"
          />
        </div>

        {/* Create Post */}
        <CreatePost />
        
        {/* Feed with posts and sponsored banners */}
        {buildFeed()}
      </div>
    </div>
  );
};

export default Index;

