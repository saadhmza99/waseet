import { useEffect, useState } from "react";
import { Bell, MapPin, ChevronDown, ChevronLeft, Search } from "lucide-react";
import logo from "@/assets/sifarah-arch-wide.jpg";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { detectCityFromIp, getStoredFeedCity, setStoredFeedCity } from "@/lib/feedLocation";
import { MOROCCO_REGION_CITIES } from "@/lib/moroccoPlaces";

const AppHeader = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const hideSearch = pathname === "/" || pathname.startsWith("/saved") || pathname.startsWith("/explore");
  const [feedCity, setFeedCity] = useState(() => getStoredFeedCity() || "…");
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationStep, setLocationStep] = useState<"regions" | "cities">("regions");
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [regionQuery, setRegionQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!pathname.startsWith("/explore")) return;
    setSearchQuery(searchParams.get("q") || "");
  }, [pathname, searchParams]);

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
    <header className="relative z-50 bg-[#174f43] text-white">
      <div className="mx-auto max-w-2xl px-3 pb-3 pt-3">
        <div className="flex h-14 items-center justify-between gap-3 px-1">
          <button type="button" onClick={() => navigate("/")} className="flex min-w-0 items-center gap-2">
            <img src={logo} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
            <span className="truncate text-3xl font-bold leading-none tracking-tight text-white">Sifarah</span>
          </button>
          <div className="flex min-w-0 items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setLocationOpen(true);
                setLocationStep("regions");
                setActiveRegion(null);
                setRegionQuery("");
              }}
              className="flex max-w-[50vw] items-center gap-1.5 rounded-full border border-white/40 bg-[#ececee]/70 px-2.5 py-1.5 text-left shadow-sm backdrop-blur-xl transition hover:bg-[#ececee]/85 sm:max-w-xs"
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
            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-white transition hover:text-white/80"
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6" strokeWidth={2} />
            </button>
          </div>
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
              className="h-10 w-full rounded-full border border-white/40 bg-white pl-9 pr-3 text-sm text-neutral-900 shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-white"
            />
          </form>
        )}
      </div>

      {locationOpen ? (
        <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setLocationOpen(false)}>
          <div
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl"
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
        </div>
      ) : null}
    </header>
  );
};

export default AppHeader;
