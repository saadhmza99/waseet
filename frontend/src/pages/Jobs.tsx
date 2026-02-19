import JobCard from "@/components/JobCard";
import avatarSarah from "@/assets/avatar-sarah.jpg";
import avatarMark from "@/assets/avatar-mark.jpg";
import avatarLaura from "@/assets/avatar-laura.jpg";
import deckRenovation from "@/assets/deck-renovation.jpg";
import roofRepair from "@/assets/roof-repair.jpg";
import faucetInstall from "@/assets/faucet-install.jpg";

const Jobs = () => {

  const jobs = [
    {
      avatar: avatarSarah,
      username: "Sarah_Homeowner",
      location: "Dubai Marina",
      timeAgo: "1h ago",
      title: "Deck Renovation Needed",
      image: deckRenovation,
      budgetRange: "1-2 professionals",
      profession: "Carpenter",
      jobLocation: "Dubai Marina, Dubai",
      priceRange: "$500 - $1,000",
    },
    {
      avatar: avatarMark,
      username: "Mark_Johnson",
      location: "Downtown Dubai",
      timeAgo: "3h ago",
      title: "Roof Repair Service",
      image: roofRepair,
      budgetRange: "1 professional",
      profession: "Roofer",
      jobLocation: "Downtown Dubai, Dubai",
      priceRange: "$300 - $600",
    },
    {
      avatar: avatarLaura,
      username: "Laura_Design",
      location: "Jumeirah",
      timeAgo: "5h ago",
      title: "Faucet Installation",
      image: faucetInstall,
      budgetRange: "1 professional",
      profession: "Plumber",
      jobLocation: "Jumeirah, Dubai",
      priceRange: "$100 - $250",
    },
  ];

  return (
    <div className="pb-20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 sm:py-6 border-b border-border mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-card-foreground">Emplois disponibles</h1>
        </div>
        {jobs.map((job, index) => (
          <JobCard key={index} {...job} />
        ))}
      </div>
    </div>
  );
};

export default Jobs;

