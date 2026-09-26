import { Bookmark, Plus, Search, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const HomeNavIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    preserveAspectRatio="none"
    className={className}
    aria-hidden
  >
    <path
      d="m3.8 10.3 6.9-6.95a1.82 1.82 0 0 1 2.6 0l6.9 6.95a1.35 1.35 0 0 1-.96 2.3h-.99v7.1a2.3 2.3 0 0 1-2.3 2.3h-7.9a2.3 2.3 0 0 1-2.3-2.3v-7.1h-.99a1.35 1.35 0 0 1-.96-2.3Z"
      fill="#237a5d"
    />
    <path d="M10.3 24v-6.7a1.7 1.7 0 0 1 3.4 0V24z" fill="white" />
  </svg>
);

const TabNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const path = location.pathname;

  if (
    path.startsWith("/login") ||
    path.startsWith("/create-profile") ||
    path.startsWith("/change-password") ||
    path.startsWith("/settings") ||
    path.startsWith("/admin") ||
    path.startsWith("/settings")
  ) {
    return null;
  }

  const goCreate = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/", { state: { openCreate: true } });
  };

  const itemClass = (active: boolean) =>
    `flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 whitespace-nowrap py-1 text-[11px] leading-none ${
      active ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-xl items-center px-1 py-1">
        <button type="button" onClick={() => navigate("/")} className={itemClass(path === "/")}>
          <span className="flex h-8 items-center justify-center">
            <HomeNavIcon className="h-8 w-9" />
          </span>
          Fil
        </button>
        <button type="button" onClick={() => navigate("/explore")} className={itemClass(path.startsWith("/explore"))}>
          <span className="flex h-8 items-center justify-center">
            <Search className="h-7 w-7" />
          </span>
          Découvrir
        </button>
        <button
          type="button"
          onClick={goCreate}
          aria-label="Créer"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-white shadow-lg hover:bg-black"
        >
          <Plus className="h-8 w-8" strokeWidth={2.5} />
        </button>
        <button type="button" onClick={() => navigate("/reels")} className={itemClass(path.startsWith("/reels"))}>
          <span className="flex h-8 items-center justify-center">
            <Clapperboard className="h-7 w-7" />
          </span>
          Réels
        </button>
        <button type="button" onClick={() => navigate("/saved")} className={itemClass(path.startsWith("/saved"))}>
          <span className="flex h-8 items-center justify-center">
            <Bookmark className="h-7 w-7" />
          </span>
          Enregistrés
        </button>
      </div>
    </nav>
  );
};

export default TabNav;
