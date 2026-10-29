import { useEffect, useRef, useState } from "react";
import { ClipboardList, Mail, Menu, Search, X } from "lucide-react";
import logoDetailed from "@/assets/sifarah-logo-detailed.png";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

/** Top-right CTA: Demander un devis (Créer lives in the feed / profile sections). */
export const CreateAndBell = ({
  calm = false,
  showBell: _showBell = false,
  className = "",
  pillClassName = "",
}: {
  calm?: boolean;
  showBell?: boolean;
  className?: string;
  pillClassName?: string;
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: MouseEvent | TouchEvent) => {
      const node = menuRef.current;
      if (!node || !(event.target instanceof Node) || node.contains(event.target)) return;
      setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className={`relative flex items-center gap-1 ${calm ? "shrink-0" : "min-w-0"} ${className}`} ref={menuRef}>
      {/* Desktop / large: keep devis pill */}
      <button
        type="button"
        onClick={() => navigate("/devis")}
        className={`hidden items-center justify-center gap-1.5 rounded-full bg-[#174f43] px-3.5 py-1.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#123d34] lg:inline-flex ${pillClassName}`}
        aria-label="Demander un devis"
      >
        <ClipboardList className="h-5 w-5" strokeWidth={2.2} />
        <span className="truncate">Demander un devis</span>
      </button>

      {/* Mobile: aesthetic three-line menu */}
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-800 shadow-sm transition hover:border-[#174f43]/40 hover:text-[#174f43] lg:hidden"
        aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X className="h-5 w-5" strokeWidth={2} /> : <Menu className="h-5 w-5" strokeWidth={2} />}
      </button>

      {menuOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-[60] w-56 overflow-hidden rounded-2xl border border-neutral-200 bg-white py-1.5 shadow-lg lg:hidden">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              navigate("/devis");
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-neutral-800 transition hover:bg-[#174f43]/5 hover:text-[#174f43]"
          >
            <ClipboardList className="h-4 w-4 shrink-0 text-[#174f43]" strokeWidth={2.2} />
            Demander un devis
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              navigate("/contact");
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-neutral-800 transition hover:bg-[#174f43]/5 hover:text-[#174f43]"
          >
            <Mail className="h-4 w-4 shrink-0 text-[#174f43]" strokeWidth={2.2} />
            Contactez-nous
          </button>
        </div>
      ) : null}
    </div>
  );
};

/** @deprecated Use CreateAndBell — kept so older imports keep working. */
export const LocationAndBell = CreateAndBell;

const AppHeader = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const hideSearch =
    pathname === "/" ||
    pathname.startsWith("/saved") ||
    pathname.startsWith("/explore") ||
    pathname.startsWith("/opportunites") ||
    pathname.startsWith("/produits") ||
    pathname.startsWith("/inbox");
  const calm = pathname.startsWith("/opportunites");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!pathname.startsWith("/explore")) return;
    setSearchQuery(searchParams.get("q") || "");
  }, [pathname, searchParams]);

  return (
    <header className={`relative z-50 border-b border-neutral-200 text-neutral-900 ${calm ? "bg-[#f6f5f3]" : "bg-white"}`}>
      <div className={`mx-auto max-w-2xl ${calm ? "px-4 pb-1 pt-3" : "px-3 pb-3 pt-3"}`}>
        <div className={`flex items-center justify-between ${calm ? "flex-wrap gap-x-2 gap-y-1" : "min-h-16 gap-2 px-1"}`}>
          <button type="button" onClick={() => navigate("/")} className="flex shrink-0 items-center gap-2">
            <img
              src={logoDetailed}
              alt=""
              className={`shrink-0 object-contain brightness-0 ${calm ? "h-24 w-auto" : "h-16 w-auto"}`}
            />
            <span className="flex flex-col items-start">
              <span
                lang="ar"
                dir="rtl"
                className={`font-normal leading-none text-neutral-900 ${calm ? "text-[2.7rem]" : "text-[2.15rem]"}`}
                style={{ fontFamily: "Arabswell, serif" }}
              >
                سفارة
              </span>
              <span
                className={`font-normal leading-none text-neutral-800 ${calm ? "mt-0.5 text-xl" : "mt-1.5 text-[17px]"}`}
                style={{ fontFamily: "Arabswell, serif" }}
              >
                Sifarah
              </span>
            </span>
          </button>
          <CreateAndBell calm={calm} />
        </div>
        {hideSearch ? null : (
          <form
            className="relative mt-2"
            onSubmit={(event) => {
              event.preventDefault();
              const query = searchQuery.trim();
              navigate(query ? `/explore?q=${encodeURIComponent(query)}` : "/explore");
            }}
          >
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Rechercher entreprises, catégories…"
              className="h-10 w-full rounded-full border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-900 shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
            />
          </form>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
