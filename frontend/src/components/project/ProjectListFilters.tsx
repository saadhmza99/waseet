import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { PROJECT_MILESTONES } from "@/components/project/ProjectMilestoneTrack";
import { COMMERCIAL_STATUSES } from "@/lib/projectDossier";

/** Vertical sliding segmented control: Tout, then the project stages. */
export const StageSlider = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
  const stops = [{ id: "", label: "Tout" }, ...PROJECT_MILESTONES];
  const count = stops.length;
  return (
    <div className="relative flex flex-col rounded-[2.2vh] bg-neutral-100 p-[0.5vh]" role="group" aria-label="État du projet">
      <span
        aria-hidden
        className="absolute left-[0.5vh] right-[0.5vh] rounded-[1.8vh] bg-[#174f43] shadow-sm transition-all duration-200 ease-out"
        style={{
          height: `calc((100% - 1vh) / ${count})`,
          top: `calc(0.5vh + ${value} * (100% - 1vh) / ${count})`,
        }}
      />
      {stops.map((stop, index) => (
        <button
          key={stop.label}
          type="button"
          onClick={() => onChange(index)}
          aria-pressed={index === value}
          className={`relative z-[1] w-full whitespace-nowrap rounded-[1.8vh] px-[1.8vh] py-[1.1vh] text-left text-[1.55vh] font-semibold leading-none transition-colors duration-200 ${
            index === value ? "text-white" : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          {stop.label}
        </button>
      ))}
    </div>
  );
};

export const ProjectFiltersButton = ({
  open,
  activeCount,
  onToggle,
}: {
  open: boolean;
  activeCount: number;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={open}
    className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full border bg-white px-4 py-2.5 text-base font-semibold shadow-sm transition ${
      activeCount > 0
        ? "border-[#174f43] text-[#174f43]"
        : "border-neutral-200 text-neutral-700 hover:border-[#174f43] hover:text-[#174f43]"
    }`}
  >
    <SlidersHorizontal className="h-5 w-5" />
    Filtres
    {activeCount > 0 ? (
      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#174f43] px-1.5 text-sm font-bold text-white">
        {activeCount}
      </span>
    ) : null}
    <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
  </button>
);

export const ProjectFiltersPanel = ({
  open,
  stageIdx,
  onStage,
  commercial,
  onCommercial,
}: {
  open: boolean;
  stageIdx: number;
  onStage: (value: number) => void;
  commercial: string | null;
  onCommercial: (value: string | null) => void;
}) => (
  <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
    <div className="min-h-0 overflow-hidden">
      <div className="flex max-w-full items-start gap-[1.5vh] pt-[1.2vh]">
        <div className="w-[24vh] max-w-[48%] shrink-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 sm:text-sm">État du projet</p>
          <StageSlider value={stageIdx} onChange={onStage} />
        </div>
        <div className="w-[24vh] max-w-[48%] shrink-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 sm:text-sm">Commercialisation</p>
          <div className="flex flex-col rounded-[2.2vh] bg-neutral-100 p-[0.5vh]">
            {[
              { id: null as string | null, label: "Tous" },
              ...COMMERCIAL_STATUSES.filter(
                (status) => status.id === "en_commercialisation" || status.id === "commercialise",
              ).map((status) => ({ id: status.id as string | null, label: status.label })),
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => onCommercial(option.id)}
                aria-pressed={commercial === option.id}
                className={`w-full whitespace-nowrap rounded-[1.8vh] px-[1.8vh] py-[1.1vh] text-left text-[1.55vh] font-semibold leading-none transition ${
                  commercial === option.id
                    ? "bg-[#174f43] text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
