import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MOROCCO_REGIONS, allMoroccoCities, citiesForRegion } from "@/lib/moroccoPlaces";

const fieldClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-[#174f43]";

export const RegionSelect = ({
  id,
  value,
  onChange,
  className,
  required,
}: {
  id?: string;
  value: string;
  onChange: (region: string) => void;
  className?: string;
  required?: boolean;
}) => (
  <select
    id={id}
    required={required}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={cn(fieldClass, className)}
  >
    <option value="">Sélectionnez une région</option>
    {MOROCCO_REGIONS.map((region) => (
      <option key={region} value={region}>
        {region}
      </option>
    ))}
  </select>
);

export const CityPicker = ({
  id,
  value,
  onChange,
  region,
  placeholder = "Ville",
  className,
  required,
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (city: string) => void;
  region?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const cities = region ? citiesForRegion(region) : allMoroccoCities();
  const isDisabled = Boolean(disabled || (region !== undefined && !region));

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!open || isDisabled) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setQuery(value);
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, value, isDisabled]);

  useEffect(() => {
    if (isDisabled) setOpen(false);
  }, [isDisabled]);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    // When a region is set, list every city in that region (from cities_and_regions.json).
    // Without a region, keep a search-narrowed list so the dropdown stays usable.
    if (region) {
      return needle ? cities.filter((city) => city.toLowerCase().includes(needle)) : cities;
    }
    const list = needle ? cities.filter((city) => city.toLowerCase().includes(needle)) : cities;
    return needle ? list : list.slice(0, 80);
  }, [cities, query, region]);

  const pick = (city: string) => {
    onChange(city);
    setQuery(city);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        required={required}
        disabled={isDisabled}
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        onFocus={() => {
          if (!isDisabled) setOpen(true);
        }}
        onChange={(e) => {
          if (isDisabled) return;
          setQuery(e.target.value);
          setOpen(true);
        }}
        className={cn("pl-9", className)}
      />
      {open && !isDisabled ? (
        <div className="absolute left-0 right-0 z-40 mt-1 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
          <div className="max-h-56 overflow-y-auto py-1">
            {matches.length ? (
              matches.map((city) => (
                <button
                  key={city}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(city)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-neutral-50",
                    city === value ? "bg-[#174f43]/8 font-medium text-[#174f43]" : "text-neutral-800"
                  )}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  {city}
                </button>
              ))
            ) : (
              <p className="px-3 py-3 text-sm text-muted-foreground">Aucune ville</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
