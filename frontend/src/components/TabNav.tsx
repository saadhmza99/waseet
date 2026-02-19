import { Home, MapPin, Video, Bookmark } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { label: "Fil d'actualité", icon: Home, path: "/" },
  { label: "Explorer", icon: MapPin, path: "/explore" },
  { label: "Reels", icon: Video, path: "/reels" },
  { label: "Enregistrés", icon: Bookmark, path: "/saved" },
];

const TabNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bg-tab border-b border-border fixed lg:sticky top-[52px] sm:top-[60px] left-0 right-0 z-40 lg:hidden min-h-[56px] sm:min-h-[64px] backdrop-blur-sm bg-tab/95">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.label}
            onClick={() => navigate(tab.path)}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm md:text-base font-medium transition-colors border-b-2 ${
              isActive
                ? "text-accent border-accent"
                : "text-tab-foreground border-transparent hover:text-foreground"
            }`}
          >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-[10px]">{tab.label.split(' ')[0]}</span>
          </button>
        );
      })}
        </div>
      </div>
    </nav>
  );
};

export default TabNav;
