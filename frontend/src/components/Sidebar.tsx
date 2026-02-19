import { TrendingUp, Users, Briefcase, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import avatarMike from "@/assets/avatar-mike.jpg";
import avatarAnna from "@/assets/avatar-anna.jpg";
import avatarMark from "@/assets/avatar-mark.jpg";

const Sidebar = () => {
  const navigate = useNavigate();

  const trendingProfessionals = [
    { id: 1, name: "Mike_Contractor", avatar: avatarMike, profession: "General Contractor", rating: 4.8 },
    { id: 2, name: "Anna_Designs", avatar: avatarAnna, profession: "Interior Designer", rating: 4.9 },
    { id: 3, name: "Mark_Johnson", avatar: avatarMark, profession: "Electrician", rating: 4.7 },
  ];

  const quickStats = [
    { label: "Active Jobs", value: "1,234", icon: Briefcase },
    { label: "Professionals", value: "5,678", icon: Users },
    { label: "Completed", value: "12.5K", icon: TrendingUp },
  ];

  return (
    <aside className="hidden lg:block w-80 xl:w-96 space-y-6 pr-6 pt-6 sticky top-[120px] h-[calc(100vh-120px)] overflow-y-auto">
      {/* Quick Stats */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-lg font-bold text-card-foreground mb-4">Platform Stats</h3>
        <div className="space-y-3">
          {quickStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <span className="text-lg font-bold text-card-foreground">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Professionals */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-bold text-card-foreground">Trending Professionals</h3>
        </div>
        <div className="space-y-3">
          {trendingProfessionals.map((professional) => (
            <button
              key={professional.id}
              onClick={() => navigate(`/profile/${professional.name}`)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
            >
              <img
                src={professional.avatar}
                alt={professional.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-card-foreground truncate">{professional.name}</p>
                <p className="text-xs text-muted-foreground">{professional.profession}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs font-semibold text-card-foreground">{professional.rating}</span>
                  <Sparkles className="w-3 h-3 text-star fill-star" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl border border-accent/20 p-5">
        <h3 className="text-lg font-bold text-card-foreground mb-3">Get Started</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Join thousands of professionals and clients connecting on Sefarah
        </p>
        <button
          onClick={() => navigate("/create-profile")}
          className="w-full bg-accent text-accent-foreground font-semibold py-2.5 rounded-lg hover:bg-accent/90 transition-colors"
        >
          Create Profile
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

