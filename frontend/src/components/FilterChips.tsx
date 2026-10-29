import {
  BET_AGREMENT_OPTIONS,
  BUREAU_ETUDES_CODE,
  INGENIERIE_ETUDES_PEER_OPTIONS,
  INGENIERIE_ETUDES_SUB_SLUG,
  feedCategoryBySlug,
  isBetAgrementCode,
} from "@/lib/taxonomy";

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

const leafChipClass = (size: "md" | "lg", active: boolean) =>
  `inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border font-semibold transition ${
    size === "lg"
      ? "px-3.5 py-2 text-base"
      : "px-[1.4vh] py-[0.85vh] text-[1.55vh] lg:px-3 lg:py-1.5 lg:text-[14px]"
  } ${
    active
      ? "border-[#174f43] bg-[#174f43]/10 text-[#174f43]"
      : "border-neutral-200 bg-white text-neutral-700 hover:border-[#174f43] hover:text-[#174f43]"
  }`;

/**
 * Peers first. Checking Bureau d'études hides other peers and reveals D13–D21.
 */
export const IngenierieEtudesLeafChips = ({
  values,
  onChange,
  size = "md",
}: {
  values: string[];
  onChange: (codes: string[]) => void;
  size?: "md" | "lg";
}) => {
  const selected = new Set(values);
  const bureauOn = selected.has(BUREAU_ETUDES_CODE);

  const togglePeer = (code: string) => {
    if (code === BUREAU_ETUDES_CODE) {
      if (bureauOn) {
        // Leave bureau mode: drop Ds + bureau, restore empty peer selection.
        onChange([]);
      } else {
        // Enter bureau mode: only bureau; peers cleared; Ds available next.
        onChange([BUREAU_ETUDES_CODE]);
      }
      return;
    }
    if (selected.has(code)) onChange(values.filter((c) => c !== code));
    else onChange([...values.filter((c) => !isBetAgrementCode(c)), code]);
  };

  const toggleD = (code: string) => {
    if (selected.has(code)) {
      const next = values.filter((c) => c !== code);
      // Keep bureau checked even if all Ds cleared.
      if (!next.includes(BUREAU_ETUDES_CODE)) next.push(BUREAU_ETUDES_CODE);
      onChange(next);
    } else {
      const base = values.includes(BUREAU_ETUDES_CODE)
        ? values
        : [...values.filter((c) => !isBetAgrementCode(c)), BUREAU_ETUDES_CODE];
      onChange([...base, code]);
    }
  };

  const peerOptions = bureauOn
    ? INGENIERIE_ETUDES_PEER_OPTIONS.filter((o) => o.code === BUREAU_ETUDES_CODE)
    : INGENIERIE_ETUDES_PEER_OPTIONS;

  return (
    <div
      className={`flex flex-col ${size === "lg" ? "mt-2 gap-2" : "mt-[0.8vh] gap-[0.6vh]"}`}
    >
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Spécialités Ingénierie & études"
      >
        {peerOptions.map((option) => {
          const active = selected.has(option.code);
          return (
            <label key={option.code} className={leafChipClass(size, active)}>
              <input
                type="checkbox"
                className="h-3.5 w-3.5 accent-[#174f43]"
                checked={active}
                onChange={() => togglePeer(option.code)}
              />
              {option.label}
            </label>
          );
        })}
      </div>
      {bureauOn ? (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Agréments BET (D)"
        >
          {BET_AGREMENT_OPTIONS.map((option) => {
            const active = selected.has(option.code);
            return (
              <label key={option.code} className={leafChipClass(size, active)}>
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 accent-[#174f43]"
                  checked={active}
                  onChange={() => toggleD(option.code)}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

/** @deprecated Use IngenierieEtudesLeafChips */
export const BetAgrementChips = IngenierieEtudesLeafChips;

export const SubCategoryChips = ({
  category,
  value,
  onChange,
  betCodes = [],
  onBetCodesChange,
  size = "md",
}: {
  category: string | null;
  value: string | null;
  onChange: (id: string | null) => void;
  betCodes?: string[];
  onBetCodesChange?: (codes: string[]) => void;
  size?: "md" | "lg";
}) => {
  const selected = feedCategoryBySlug(category);
  if (!selected) return null;
  return (
    <div>
      <FilterChips
        options={[
          { id: null, label: "Tout" },
          ...selected.subCategories.map((item) => ({ id: item.slug, label: item.label })),
        ]}
        value={value}
        onChange={onChange}
        size={size}
      />
      {value === INGENIERIE_ETUDES_SUB_SLUG && onBetCodesChange ? (
        <IngenierieEtudesLeafChips values={betCodes} onChange={onBetCodesChange} size={size} />
      ) : null}
    </div>
  );
};
