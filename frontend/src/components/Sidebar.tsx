import { TrendingUp, Users, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

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
          <h3 className="text-lg font-bold text-card-foreground">Professionnels tendance</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Les profils tendance seront affichés automatiquement depuis les données réelles.
        </p>
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

