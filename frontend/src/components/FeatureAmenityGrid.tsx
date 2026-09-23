import type { ReactNode } from "react";
import { iconUrl } from "@/assets/icons";

export const FEATURE_ICON_FILES: Record<string, string> = {
  jardin: "garden.svg",
  terrasse: "terrace.svg",
  garage: "garage.svg",
  ascenseur: "elevator.svg",
  vue_mer: "seaViews.svg",
  vue_montagnes: "mountainsViews.svg",
  piscine: "pool.svg",
  concierge: "doorman.svg",
  rangement: "storageRoom.svg",
  meuble: "furnished.svg",
  entre_seul: "cellar.svg",
  salon_marocain: "moroccanLounge.svg",
  salon_europeen: "europeanLounge.svg",
  antenne: "satellite.svg",
  cheminee: "fireplace.svg",
  clim: "airConditioning.svg",
  chauffage: "heating.svg",
  securite: "security.svg",
  double_vitrage: "doubleGlazing.svg",
  porte_blindee: "reinforcedDoor.svg",
  cuisine_equipee: "fullKitchen.svg",
  frigo: "fridge.svg",
  four: "oven.svg",
  lave_linge: "washer.svg",
  micro_ondes: "microwave.svg",
};

export const featureIconSrc = (id: string) => {
  const file = FEATURE_ICON_FILES[id];
  return file ? iconUrl(file) : "";
};

interface FeatureAmenityGridProps {
  items: { id: string; label: string }[];
  selected?: string[];
  onToggle?: (id: string) => void;
  extras?: Record<string, ReactNode>;
}

const FeatureIcon = ({ id, active }: { id: string; active: boolean }) => {
  const src = featureIconSrc(id);
  if (!src) return null;
  return (
    <span
      aria-hidden
      className={`block h-12 w-12 ${active ? "bg-sky-500" : "bg-foreground"}`}
      style={{
        maskImage: `url("${src}")`,
        WebkitMaskImage: `url("${src}")`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
    />
  );
};

const FeatureAmenityGrid = ({ items, selected = [], onToggle, extras }: FeatureAmenityGridProps) => (
  <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-3 gap-y-6">
    {items.map((item) => {
      const active = selected.includes(item.id);
      return (
        <div key={item.id} className="flex flex-col items-center text-center">
          <button type="button" onClick={() => onToggle?.(item.id)} className="flex flex-col items-center gap-2">
            <span
              className={`flex h-[76px] w-[76px] items-center justify-center rounded-full ${
                active ? "bg-sky-100 ring-1 ring-sky-300" : ""
              }`}
            >
              <FeatureIcon id={item.id} active={active} />
            </span>
            <span className={`text-[13px] leading-tight ${active ? "font-medium text-sky-500" : "text-foreground/80"}`}>
              {item.label}
            </span>
          </button>
          {active && extras?.[item.id] ? <div className="mt-3 w-full max-w-[140px]">{extras[item.id]}</div> : null}
        </div>
      );
    })}
  </div>
);

export default FeatureAmenityGrid;
