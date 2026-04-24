import { useEffect, useState } from "react";
import JobCard from "@/components/JobCard";
import { listingService } from "@/services/listingService";

const Jobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const data = await listingService.getListings(50, 0);
        setJobs(data || []);
      } catch (error) {
        console.error("Error loading jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  return (
    <div className="pb-20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 sm:py-6 border-b border-border mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-card-foreground">Emplois disponibles</h1>
        </div>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Aucun emploi disponible.</div>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              avatar={job.profiles?.avatar_url || "/default-avatar.png"}
              username={job.profiles?.username || "Utilisateur"}
              location={job.location || ""}
              timeAgo="récemment"
              title={job.title || "Annonce"}
              image={job.image_url || ""}
              budgetRange="1 professionnel"
              profession={job.profession || "Service"}
              jobLocation={job.location || ""}
              priceRange={job.price_range || "Prix sur demande"}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Jobs;

