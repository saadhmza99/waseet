import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronLeft, Search } from "lucide-react";
import { MOROCCO_REGION_CITIES } from "@/lib/moroccoPlaces";

/** Same region → city picker used by the top-nav location control. */
export const RegionCitySheet = ({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (city: string) => void;
}) => {
  const [step, setStep] = useState<"regions" | "cities">("regions");
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const reset = () => {
    setStep("regions");
    setActiveRegion(null);
    setQuery("");
  };

  const close = () => {
    reset();
    onClose();
  };

  const regionList = MOROCCO_REGION_CITIES.filter((item) =>
    item.region.toLowerCase().includes(query.trim().toLowerCase())
  );
  const cityList =
    MOROCCO_REGION_CITIES.find((item) => item.region === activeRegion)?.cities.filter((city) =>
      city.toLowerCase().includes(query.trim().toLowerCase())
    ) || [];

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-black/40" onClick={close}>
      <div
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white text-neutral-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          {step === "cities" ? (
            <button
              type="button"
              onClick={() => {
                setStep("regions");
                setActiveRegion(null);
                setQuery("");
              }}
              aria-label="Retour"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : null}
          <h2 className="flex-1 text-base font-semibold">
            {step === "regions" ? "Choisir une région" : activeRegion}
          </h2>
          <button type="button" onClick={close} className="text-sm text-muted-foreground">
            Fermer
          </button>
        </div>
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={step === "regions" ? "Rechercher une région" : "Rechercher une ville"}
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {step === "regions"
            ? regionList.map((item) => (
                <button
                  key={item.region}
                  type="button"
                  onClick={() => {
                    setActiveRegion(item.region);
                    setStep("cities");
                    setQuery("");
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
                  onClick={() => {
                    onSelect(city);
                    reset();
                    onClose();
                  }}
                  className="flex w-full border-b border-border px-4 py-3 text-left text-sm font-medium hover:bg-secondary"
                >
                  {city}
                </button>
              ))}
        </div>
      </div>
    </div>,
    document.body
  );
};
