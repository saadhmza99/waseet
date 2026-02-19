import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Phone, Shield, AlertTriangle, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportAbuseModal from "@/components/ReportAbuseModal";
import avatarSarah from "@/assets/avatar-sarah.jpg";
import bathroomRemodel from "@/assets/bathroom-remodel.jpg";

const JobDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Ensure page starts at top when navigating to job detail
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
  
  const job = location.state || {
    avatar: avatarSarah,
    username: "abdrlkrim",
    location: "Sidi Ghanem, Marrakech",
    timeAgo: "il ya 8 heures",
    title: "Plombier Marrakech",
    image: bathroomRemodel,
    profession: "Plombier",
    jobLocation: "Sidi Ghanem, Marrakech",
    priceRange: "150 DH",
    category: "Rénovation, Bricolage, Travaux de maison et jardin",
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/212612345678`, '_blank');
  };

  const handleCall = () => {
    window.open(`tel:+212612345678`, '_self');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `${job.title} - ${job.priceRange}`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Hero Image with Overlay Buttons */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] overflow-hidden">
        <img 
          src={job.image || bathroomRemodel} 
          alt={job.title} 
          className="w-full h-full object-cover"
        />
        
        {/* Top Overlay with Back, Share, and Favorite buttons */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-card-foreground" />
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-card-foreground" />
              <span className="hidden sm:inline text-sm font-medium text-card-foreground">Partager</span>
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg"
            >
              <Bookmark className={`w-5 h-5 sm:w-6 sm:h-6 ${isSaved ? 'fill-primary text-primary' : 'text-card-foreground'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card rounded-t-3xl -mt-8 relative z-10">
        {/* Title and Price */}
        <div className="px-4 sm:px-6 md:px-8 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-card-foreground flex-1">
              {job.title}
            </h1>
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary whitespace-nowrap">
              {job.priceRange}
            </span>
          </div>
        </div>

        {/* Location and Time */}
        <div className="px-4 sm:px-6 md:px-8 pb-4 flex items-center gap-4 sm:gap-6 text-sm sm:text-base">
          <div className="flex items-center gap-2 text-primary">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-primary font-medium">{job.jobLocation}</span>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-primary font-medium">actif {job.timeAgo}</span>
          </div>
        </div>

        {/* Seller Info and Contact Buttons */}
        <div className="px-4 sm:px-6 md:px-8 pb-4 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/profile/${job.username}`)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20" />
              </div>
              <span className="font-semibold text-base sm:text-lg text-card-foreground">{job.username}</span>
            </button>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {/* WhatsApp Button */}
              <button
                onClick={handleWhatsApp}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#25D366]/90 flex items-center justify-center transition-colors shadow-md"
                aria-label="WhatsApp"
              >
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </button>

              {/* Call Button */}
              <button
                onClick={handleCall}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-full hover:bg-primary/90 transition-colors font-medium text-sm sm:text-base shadow-md"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Appeler</span>
              </button>
            </div>
          </div>
        </div>

        {/* Safety Warning */}
        <div className="px-4 sm:px-6 md:px-8 py-4 border-t border-border">
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">+</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base text-card-foreground leading-relaxed">
                Il ne faut jamais envoyer d'argent à l'avance au vendeur par virement ou agence de transfert.
              </p>
            </div>
            <button 
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1.5 text-destructive hover:text-destructive/80 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-destructive flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="hidden sm:inline">SIGNALER UN ABUS</span>
              <span className="sm:hidden">SIGNALER</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Abuse Modal */}
      <ReportAbuseModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
      />
    </div>
  );
};

export default JobDetail;

