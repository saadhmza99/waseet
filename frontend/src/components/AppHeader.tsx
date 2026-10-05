import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, MapPin, ChevronDown, ChevronLeft, Search } from "lucide-react";
import logoDetailed from "@/assets/sifarah-logo-detailed.png";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { detectCityFromIp, getStoredFeedCity, setStoredFeedCity } from "@/lib/feedLocation";
import { MOROCCO_REGION_CITIES } from "@/lib/moroccoPlaces";

export const LocationAndBell = ({
  calm = false,
  showBell = true,
  className = "",
  pillClassName = "",
}: {
  calm?: boolean;
  showBell?: boolean;
  className?: string;
  pillClassName?: string;
}) => {
  const [feedCity, setFeedCity] = useState(() => getStoredFeedCity() || "…");
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationStep, setLocationStep] = useState<"regions" | "cities">("regions");
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [regionQuery, setRegionQuery] = useState("");

  useEffect(() => {
    const stored = getStoredFeedCity();
    if (stored) {
      setFeedCity(stored);
      return;
    }
    detectCityFromIp().then((city) => {
      const next = city || "Maroc";
      setFeedCity(next);
      setStoredFeedCity(next);
    });
  }, []);

  const regionList = MOROCCO_REGION_CITIES.filter((item) =>
    item.region.toLowerCase().includes(regionQuery.trim().toLowerCase())
  );
  const cityList =
    MOROCCO_REGION_CITIES.find((item) => item.region === activeRegion)?.cities.filter((city) =>
      city.toLowerCase().includes(regionQuery.trim().toLowerCase())
    ) || [];

  const pickCity = (city: string) => {
    setFeedCity(city);
    setStoredFeedCity(city);
    setLocationOpen(false);
    setLocationStep("regions");
    setActiveRegion(null);
    setRegionQuery("");
  };

  return (
    <>
      <div className={`flex items-center gap-1 ${calm ? "shrink-0" : "min-w-0"} ${className}`}>
        <button
          type="button"
          onClick={() => {
            setLocationOpen(true);
            setLocationStep("regions");
            setActiveRegion(null);
            setRegionQuery("");
          }}
          className={`flex max-w-[50vw] items-center gap-1.5 rounded-full px-2.5 py-1.5 text-left shadow-sm backdrop-blur-xl transition sm:max-w-xs ${calm ? "shrink-0" : "min-w-0 shrink"} ${
            calm ? "border border-neutral-200 bg-white hover:bg-neutral-50" : "border border-white/40 bg-[#ececee]/70 hover:bg-[#ececee]/85"
          } ${pillClassName}`}
        >
          <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
            <MapPin
              className="h-5 w-5 fill-current text-neutral-900"
              strokeWidth={2}
              style={{
                maskImage: "radial-gradient(circle at 50% 42%, transparent 2.4px, #000 2.9px)",
                WebkitMaskImage: "radial-gradient(circle at 50% 42%, transparent 2.4px, #000 2.9px)",
              }}
            />
          </span>
          <span className="truncate text-[15px] font-medium text-neutral-900">{feedCity}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-neutral-900" />
        </button>
        {showBell ? (
        <button
          type="button"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-neutral-900 transition hover:text-neutral-600"
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6" strokeWidth={2} />
        </button>
        ) : null}
      </div>

      {locationOpen
        ? createPortal(
            <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setLocationOpen(false)}>
              <div
                className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white text-neutral-900 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  {locationStep === "cities" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setLocationStep("regions");
                        setActiveRegion(null);
                        setRegionQuery("");
                      }}
                      aria-label="Retour"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                  ) : null}
                  <h2 className="flex-1 text-base font-semibold">
                    {locationStep === "regions" ? "Choisir une région" : activeRegion}
                  </h2>
                  <button type="button" onClick={() => setLocationOpen(false)} className="text-sm text-muted-foreground">
                    Fermer
                  </button>
                </div>
                <div className="border-b border-border p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={regionQuery}
                      onChange={(e) => setRegionQuery(e.target.value)}
                      placeholder={locationStep === "regions" ? "Rechercher une région" : "Rechercher une ville"}
                      className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {locationStep === "regions"
                    ? regionList.map((item) => (
                        <button
                          key={item.region}
                          type="button"
                          onClick={() => {
                            setActiveRegion(item.region);
                            setLocationStep("cities");
                            setRegionQuery("");
                          }}
                          className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left text-sm font-medium hover:bg-secondary"
                        >
                          {item.region}
                          <ChevronDown className="-rotate-90 h-4 w-4 text-muted-foreground" />
                        </button>
                      ))
                    : cityList.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => pickCity(city)}
                          className="flex w-full border-b border-border px-4 py-3 text-left text-sm font-medium hover:bg-secondary"
                        >
                          {city}
                        </button>
                      ))}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
};

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
          <LocationAndBell calm={calm} />
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
