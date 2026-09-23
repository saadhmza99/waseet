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

  if (location.pathname.startsWith("/profile")) return null;

  return (
    <nav className="fixed left-0 right-0 top-[52px] z-40 min-h-[56px] border-b border-border bg-card sm:top-[60px] sm:min-h-[64px] lg:sticky lg:hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-1 px-1 py-1">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.label}
            onClick={() => navigate(tab.path)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors sm:gap-2 sm:px-4 sm:py-3 sm:text-sm md:px-6 md:text-base ${
              isActive
                ? "bg-accent/15 text-accent"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
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
