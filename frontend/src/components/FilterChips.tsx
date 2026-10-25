import { feedCategoryBySlug } from "@/lib/taxonomy";

export type FilterChipOption = { id: string | null; label: string };

export const FilterChips = ({
  options,
  value,
  onChange,
}: {
  options: FilterChipOption[];
  value: string | null;
  onChange: (id: string | null) => void;
}) => (
  <div className="mt-[1.2vh] flex gap-[0.8vh] overflow-x-auto pb-[0.4vh] [scrollbar-width:none] lg:flex-wrap lg:overflow-visible [&::-webkit-scrollbar]:hidden">
    {options.map((option) => {
      const active = value === option.id;
      return (
        <button
          key={option.id ?? "tout"}
          type="button"
          onClick={() => onChange(option.id)}
          className={`shrink-0 whitespace-nowrap rounded-full border px-[1.6vh] py-[0.9vh] text-[1.6vh] font-semibold transition ${
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
}: {
  category: string | null;
  value: string | null;
  onChange: (id: string | null) => void;
}) => {
  const selected = feedCategoryBySlug(category);
  if (!selected) return null;
  return (
    <FilterChips
      options={[{ id: null, label: "Tout" }, ...selected.subCategories.map((item) => ({ id: item.slug, label: item.label }))]}
      value={value}
      onChange={onChange}
    />
  );
};
