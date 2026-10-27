import { feedCategoryBySlug } from "@/lib/taxonomy";

export type FilterChipOption = { id: string | null; label: string };

export const FilterChips = ({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: FilterChipOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  size?: "md" | "lg";
}) => (
  <div
    className={`flex overflow-x-auto [scrollbar-width:none] lg:flex-wrap lg:overflow-visible [&::-webkit-scrollbar]:hidden ${
      size === "lg" ? "mt-3 gap-2 pb-1" : "mt-[1.2vh] gap-[0.8vh] pb-[0.4vh]"
    }`}
  >
    {options.map((option) => {
      const active = value === option.id;
      return (
        <button
          key={option.id ?? "tout"}
          type="button"
          onClick={() => onChange(option.id)}
          className={`shrink-0 whitespace-nowrap rounded-full border font-semibold transition ${
            size === "lg"
              ? "px-4 py-2.5 text-lg"
              : "px-[1.75vh] py-[1vh] text-[1.75vh] lg:px-3.5 lg:py-2 lg:text-[15px]"
          } ${
            active
              ? "border-[#174f43] bg-[#174f43] text-white"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-[#174f43] hover:text-[#174f43]"
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export const SubCategoryChips = ({
  category,
  value,
  onChange,
  size = "md",
}: {
  category: string | null;
  value: string | null;
  onChange: (id: string | null) => void;
  size?: "md" | "lg";
}) => {
  const selected = feedCategoryBySlug(category);
  if (!selected) return null;
  return (
    <FilterChips
      options={[{ id: null, label: "Tout" }, ...selected.subCategories.map((item) => ({ id: item.slug, label: item.label }))]}
      value={value}
      onChange={onChange}
      size={size}
    />
  );
};
