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

export const CategoryPicker = ({
  open,
  onToggle,
  selectedLabel,
  categories,
  onSelect,
  columns = 2,
  size = "md",
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
}) => {
  const large = size === "lg";
  const gridClass = columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2";
  const cardClass = large
    ? "flex min-h-28 w-full animate-category-pop items-center gap-3.5 rounded-2xl border border-neutral-200 bg-white px-5 py-5 text-lg font-semibold text-neutral-900 shadow-sm hover:border-[#174f43] hover:text-[#174f43]"
    : "flex min-h-16 w-full animate-category-pop items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-[1.2vh] text-sm font-semibold text-neutral-900 shadow-sm hover:border-[#174f43] hover:text-[#174f43]";
  const iconClass = large ? "h-8 w-8 shrink-0" : "h-5 w-5 shrink-0";
  const labelClass = large ? "block text-[18px] leading-snug" : "block leading-tight";
  const triggerClass = large
    ? "flex h-14 w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 text-base font-semibold text-neutral-900 shadow-sm transition duration-150 hover:scale-[0.97] hover:border-[#174f43] hover:text-[#174f43]"
    : "flex h-12 w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-900 shadow-sm transition duration-150 hover:scale-[0.97] hover:border-[#174f43] hover:text-[#174f43]";

  return (
    <div className={open ? "flex min-h-[calc(100dvh-9.5rem)] items-center justify-center" : ""}>
      <div className="w-full">
        <button type="button" onClick={onToggle} className={triggerClass}>
          {selectedLabel ? `Catégorie : ${selectedLabel}` : "Catégories"}
        </button>
        {open ? (
          <div className={`mt-3 grid items-start gap-3 ${gridClass}`}>
            <button type="button" onClick={() => onSelect("tout")} className={cardClass}>
              <LayoutGrid className={iconClass} />
              <span className={`text-left ${labelClass}`}>Tout</span>
            </button>
            {categories.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                style={{ animationDelay: `${(index + 1) * 45}ms` }}
                className={`group ${cardClass}`}
              >
                <item.Icon className={iconClass} />
                <span className="min-w-0 text-left">
                  <span className={labelClass}>{item.label}</span>
                  {item.description ? (
                    <span className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr]">
                      <span className="overflow-hidden">
                        <span
                          className={`block pt-[0.6vh] font-normal leading-snug text-neutral-500 ${
                            large ? "text-base" : "text-[1.5vh]"
                          }`}
                        >
                          {item.description}
                        </span>
                      </span>
                    </span>
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
