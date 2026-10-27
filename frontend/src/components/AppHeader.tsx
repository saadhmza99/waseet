import { useEffect, useState } from "react";
import { ClipboardList, Search } from "lucide-react";
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

  return (
    <div className={`flex items-center gap-1 ${calm ? "shrink-0" : "min-w-0"} ${className}`}>
      <button
        type="button"
        onClick={() => navigate("/devis")}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-[#174f43] px-3.5 py-1.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#123d34] ${pillClassName}`}
        aria-label="Demander un devis"
      >
        <ClipboardList className="h-5 w-5" strokeWidth={2.2} />
        <span className="truncate">Demander un devis</span>
      </button>
    </div>
  );
};

/** @deprecated Use CreateAndBell — kept so older imports keep working. */
export const LocationAndBell = CreateAndBell;

const AppHeader = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const hideSearch = pathname === "/" || pathname.startsWith("/saved") || pathname.startsWith("/explore") || pathname.startsWith("/opportunites");
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
