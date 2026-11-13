import { Building2, Cpu, Ellipsis, Factory, Hammer, HardHat, Landmark, LayoutGrid, Package, PenTool, type LucideIcon } from "lucide-react";
import { FEED_CATEGORIES, FOURNISSEUR_CATEGORY_ID, PROMOTEUR_CATEGORY_ID } from "@/lib/taxonomy";

export type CategoryOption = {
  id: string;
  label: string;
  description?: string;
  Icon: LucideIcon;
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "gestion-services-immobiliers": Building2,
  "construction-btp": HardHat,
  "renovation-amenagement": Hammer,
  "architecture-design": PenTool,
  "juridique-foncier": Landmark,
  immotech: Cpu,
  "autres-services": Ellipsis,
};

export const FEED_PICKER_CATEGORIES: CategoryOption[] = [
  ...FEED_CATEGORIES.map((item) => ({
    id: item.slug,
    label: item.label,
    description: item.description,
    Icon: CATEGORY_ICONS[item.slug] || Ellipsis,
  })),
  {
    id: PROMOTEUR_CATEGORY_ID,
    label: "Promoteurs",
    description: "Promoteurs & développeurs immobiliers",
    Icon: Factory,
  },
  {
    id: FOURNISSEUR_CATEGORY_ID,
    label: "Fournisseurs",
    description: "Matériaux, équipements et fournitures",
    Icon: Package,
  },
];

export const PRIVATE_MARKET_CATEGORIES: CategoryOption[] = [
  {
    id: "materiaux",
    label: "Matériaux de construction et fournisseurs",
    Icon: Package,
  },
  {
    id: "projets",
    label: "Projets immobiliers",
    Icon: Building2,
  },
];

export const CategoryPicker = ({
  open,
  onToggle,
  selectedLabel,
  categories,
  onSelect,
  columns = 2,
  size = "md",
  showTrigger = true,
  showAll = true,
  embedded = false,
  comfortable = false,
}: {
  open: boolean;
  onToggle: () => void;
  selectedLabel: string | null;
  categories: CategoryOption[];
  onSelect: (id: string) => void;
  /** Grid columns when open (feed default 2; product uses 3). */
  columns?: 2 | 3;
  /** Card size — lg = bigger cards & text for product taxonomy. */
  size?: "md" | "lg";
  showTrigger?: boolean;
  showAll?: boolean;
  /** Skip the full-viewport centering used when the picker is the whole page. */
  embedded?: boolean;
  /** Taller cards on a phone. Used by Marché privé. */
  comfortable?: boolean;
}) => {
  const large = size === "lg";
  const gridClass = columns === 3 ? "grid-cols-1 sm:grid-cols-3" : showAll ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2";
  // Mobile: compact title-only cards. sm+: roomier + hover descriptions.
  const cardClass = comfortable
    ? "flex h-full min-h-[7.5rem] w-full animate-category-pop items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-5 text-base font-semibold text-neutral-900 shadow-sm hover:border-[#174f43] hover:text-[#174f43] sm:min-h-32 sm:gap-4 sm:px-5 sm:py-6 sm:text-xl"
    : large
    ? "flex h-full min-h-0 w-full animate-category-pop gap-2 rounded-xl border border-neutral-200 bg-white px-2.5 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm hover:border-[#174f43] hover:text-[#174f43] sm:min-h-32 sm:gap-4 sm:rounded-2xl sm:px-5 sm:py-6 sm:text-xl"
    : "flex h-full min-h-0 w-full animate-category-pop gap-2 rounded-xl border border-neutral-200 bg-white px-2.5 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm hover:border-[#174f43] hover:text-[#174f43] sm:min-h-[4.75rem] sm:gap-2.5 sm:rounded-2xl sm:px-3.5 sm:py-[1.35vh] sm:text-base";
  const iconClass = comfortable
    ? "h-6 w-6 shrink-0 sm:h-9 sm:w-9"
    : large
    ? "mt-0.5 h-4 w-4 shrink-0 sm:mt-0 sm:h-9 sm:w-9"
    : "mt-0.5 h-4 w-4 shrink-0 sm:mt-0 sm:h-6 sm:w-6";
  const labelClass = comfortable
    ? "block text-base leading-snug sm:text-[20px]"
    : large
    ? "block text-[12px] leading-snug sm:text-[20px]"
    : "block text-[12px] leading-snug sm:text-lg";
  const triggerClass = large
    ? "flex h-12 w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-900 shadow-sm transition duration-150 hover:scale-[0.97] hover:border-[#174f43] hover:text-[#174f43] sm:h-16 sm:px-5 sm:text-lg"
    : "flex h-12 w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white px-3.5 text-sm font-semibold text-neutral-900 shadow-sm transition duration-150 hover:scale-[0.97] hover:border-[#174f43] hover:text-[#174f43] sm:h-14 sm:text-base";

  return (
    <div className={open && !embedded ? "flex min-h-[calc(100dvh-9.5rem)] items-center justify-center" : ""}>
      <div className="w-full">
        {showTrigger ? (
          <button type="button" onClick={onToggle} className={triggerClass}>
            {selectedLabel ? `Catégorie : ${selectedLabel}` : "Catégories"}
          </button>
        ) : null}
        {open ? (
          <div className={`grid items-stretch gap-2 sm:gap-3 ${showTrigger ? "mt-3" : ""} ${gridClass}`}>
            {showAll ? (
            <button
              type="button"
              onClick={() => onSelect("tout")}
              className={`${cardClass} items-center justify-center`}
            >
              <LayoutGrid className={large ? "h-4 w-4 shrink-0 sm:h-9 sm:w-9" : "h-4 w-4 shrink-0 sm:h-6 sm:w-6"} />
              <span className={`text-center ${labelClass}`}>Tout</span>
            </button>
            ) : null}
            {categories.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                style={{ animationDelay: `${(index + 1) * 45}ms` }}
                className={`group ${cardClass} items-start sm:items-center`}
              >
                <item.Icon className={iconClass} />
                <span className="min-w-0 text-left">
                  <span className={labelClass}>{item.label}</span>
                  {item.description ? (
                    <>
                      <span className="mt-0.5 block text-[10px] font-normal leading-snug text-neutral-500 line-clamp-2 sm:hidden">
                        {item.description}
                      </span>
                      <span className="hidden sm:grid sm:grid-rows-[0fr] sm:transition-[grid-template-rows] sm:duration-200 sm:group-hover:grid-rows-[1fr] sm:group-focus-visible:grid-rows-[1fr]">
                        <span className="overflow-hidden">
                          <span
                            className={`block pt-[0.6vh] font-normal leading-snug text-neutral-500 ${
                              large ? "text-lg" : "text-sm"
                            }`}
                          >
                            {item.description}
                          </span>
                        </span>
                      </span>
                    </>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};
