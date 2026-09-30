import { LayoutGrid, type LucideIcon } from "lucide-react";

export type CategoryOption = {
  id: string;
  label: string;
  Icon: LucideIcon;
};

export const CategoryPicker = ({
  open,
  onToggle,
  selectedLabel,
  categories,
  onSelect,
}: {
  open: boolean;
  onToggle: () => void;
  selectedLabel: string | null;
  categories: CategoryOption[];
  onSelect: (id: string) => void;
}) => (
  <div className={open ? "flex min-h-[calc(100dvh-9.5rem)] items-center justify-center" : ""}>
    <div className="w-full">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-12 w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-900 shadow-sm transition duration-150 hover:scale-[0.97] hover:border-[#174f43] hover:text-[#174f43]"
      >
        {selectedLabel ? `Catégorie : ${selectedLabel}` : "Catégories"}
      </button>
      {open ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSelect("tout")}
            className="flex h-16 animate-category-pop items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-900 shadow-sm hover:border-[#174f43] hover:text-[#174f43]"
          >
            <LayoutGrid className="h-5 w-5 shrink-0" />
            <span className="text-left leading-tight">Tout</span>
          </button>
          {categories.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              style={{ animationDelay: `${(index + 1) * 45}ms` }}
              className="flex h-16 animate-category-pop items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-900 shadow-sm hover:border-[#174f43] hover:text-[#174f43]"
            >
              <item.Icon className="h-5 w-5 shrink-0" />
              <span className="text-left leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  </div>
);
