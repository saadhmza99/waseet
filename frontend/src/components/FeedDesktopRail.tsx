import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bell, Briefcase, Heart, Home, Plus, Search, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import logoDetailed from "@/assets/sifarah-logo-detailed.png";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profileService";
import { getDefaultAvatar } from "@/lib/avatar";
import { readVisitorContact } from "@/lib/visitorContact";

const FeedDesktopRail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, visitorUser, signOut } = useAuth();
  const path = location.pathname;
  const creating = Boolean((location.state as { openCreate?: boolean } | null)?.openCreate);
  const account = user || visitorUser;
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!account) {
      setFullName("");
      setAvatarUrl(null);
      return;
    }
    let cancelled = false;
    profileService
      .getProfile(account.id)
      .then((profile) => {
        if (cancelled || !profile) return;
        const metaName = String(account.user_metadata?.full_name || account.user_metadata?.name || "").trim();
        setFullName((profile.full_name || "").trim() || metaName || (profile.username || "").trim());
        setAvatarUrl(profile.avatar_url || null);
      })
      .catch(() => {
        if (cancelled) return;
        const metaName = String(account.user_metadata?.full_name || account.user_metadata?.name || "").trim();
        setFullName(metaName || readVisitorContact().name.trim());
      });
    return () => {
      cancelled = true;
    };
  }, [account]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const goCreate = () => {
    if (!account) {
      navigate("/login");
      return;
    }
    if (creating) {
      navigate("/", { replace: true, state: {} });
      return;
    }
    navigate("/", { state: { openCreate: true } });
  };

  const itemClass = (active: boolean) =>
    `flex w-full items-center gap-3 rounded-xl py-2.5 pl-3 pr-3 text-left text-[15px] ${
      active ? "bg-[#174f43]/10 font-semibold text-[#174f43]" : "font-medium text-neutral-800 hover:bg-neutral-100"
    }`;

  const displayName = fullName || (account ? "Profil" : "Se connecter");

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-neutral-200 bg-white py-6 pl-4 pr-3 lg:flex">
      <button type="button" onClick={() => navigate("/")} className="flex items-center gap-2 text-left">
        <img src={logoDetailed} alt="" className="h-16 w-auto shrink-0 object-contain brightness-0" />
        <span className="flex flex-col items-start text-neutral-900">
          <span lang="ar" dir="rtl" className="text-[2.15rem] font-normal leading-none" style={{ fontFamily: "Arabswell, serif" }}>
            سفارة
          </span>
          <span className="mt-1 text-[18px] font-normal leading-none" style={{ fontFamily: "Arabswell, serif" }}>
            Sifarah
          </span>
        </span>
      </button>

      <nav className="mt-8 flex flex-col gap-1">
        <button type="button" onClick={() => navigate("/")} className={itemClass(path === "/" && !creating)}>
          <Home className="h-5 w-5" strokeWidth={path === "/" && !creating ? 2.4 : 2} />
          Fil
        </button>
        <button type="button" onClick={() => navigate("/explore")} className={itemClass(path.startsWith("/explore"))}>
          <Search className="h-5 w-5" strokeWidth={2} />
          Découvrir
        </button>
        <button type="button" onClick={goCreate} className={itemClass(creating)}>
          <Plus className="h-5 w-5" strokeWidth={2.4} />
          Créer
        </button>
        <button type="button" onClick={() => navigate("/saved")} className={itemClass(path.startsWith("/saved"))}>
          <Heart className="h-5 w-5" strokeWidth={2} />
          Favoris
        </button>
        <button type="button" onClick={() => navigate("/settings")} className={itemClass(path.startsWith("/settings"))}>
          <Settings className="h-5 w-5" strokeWidth={2} />
          Paramètres
        </button>
        <button type="button" onClick={() => navigate("/opportunites")} className={itemClass(path.startsWith("/opportunites"))}>
          <Briefcase className="h-5 w-5" strokeWidth={2} />
          Sifarah Business
        </button>
      </nav>

      <div ref={menuRef} className="relative mt-auto flex items-center gap-1">
        {menuOpen ? (
          <div className="absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                navigate(account ? "/profile" : "/login");
              }}
              className="flex w-full px-3 py-2.5 text-left text-sm font-medium text-neutral-800 hover:bg-neutral-100"
            >
              Voir profil
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                void signOut().then(() => navigate("/", { replace: true }));
              }}
              className="flex w-full px-3 py-2.5 text-left text-sm font-medium text-neutral-800 hover:bg-neutral-100"
            >
              Se déconnecter
            </button>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => (account ? setMenuOpen((open) => !open) : navigate("/login"))}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-2 pl-3 pr-2 text-left hover:bg-neutral-100"
        >
          <img
            src={avatarUrl || getDefaultAvatar(user ? "individual" : "enterprise")}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
          <span className="min-w-0 truncate text-sm font-semibold text-neutral-900">{displayName}</span>
        </button>
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-900 transition hover:bg-neutral-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
    </aside>
  );
};

export const DesktopRailFrame = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`lg:flex lg:min-h-screen lg:w-full ${className}`}>
    <FeedDesktopRail />
    <div className="min-w-0 lg:flex-1 lg:py-5">
      <div className="mx-auto w-full lg:w-[56rem] lg:max-w-[calc(100vw-22rem)] lg:px-8">{children}</div>
    </div>
  </div>
);

export default FeedDesktopRail;
