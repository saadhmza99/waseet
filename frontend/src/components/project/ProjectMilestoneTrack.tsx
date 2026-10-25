import { commercialStatusLabel, type ProjectRecord, type ProjectStatusId } from "@/lib/projectDossier";

export const PROJECT_MILESTONES = [
  { id: "sur_plan" as const, label: "Sur plan" },
  { id: "construction" as const, label: "Construction" },
  { id: "pret_a_livrer" as const, label: "Prêt à livrer" },
  { id: "livre" as const, label: "Livré" },
];

export type ProjectMilestoneId = (typeof PROJECT_MILESTONES)[number]["id"];

/** Map any stored status onto the 4-step track (commercial is never part of progress). */
export const milestoneReachedIndex = (project: Pick<ProjectRecord, "status">) => {
  switch (project.status as ProjectStatusId | "") {
    case "livre":
    case "termine":
      return 3;
    case "pret_a_livrer":
      return 2;
    case "construction":
    case "pause":
      return 1;
    case "sur_plan":
    case "planification":
    case "preparation":
    default:
      return 0;
  }
};

export const progressFromMilestone = (status: string) => {
  switch (status) {
    case "livre":
    case "termine":
      return 100;
    case "pret_a_livrer":
      return 75;
    case "construction":
    case "pause":
      return 40;
    default:
      return 10;
  }
};

/** Only “en commercialisation” / “commercialisé” are shown as tags. */
export const projectCommercialTag = (commercialStatus?: string | null) => {
  const value = (commercialStatus || "").toLowerCase();
  if (value === "en_commercialisation") return "En commercialisation";
  if (value === "commercialise") return "Commercialisé";
  return "";
};

export const ProjectMilestoneTrack = ({
  project,
  size = "sm",
}: {
  project: ProjectRecord;
  size?: "sm" | "md";
}) => {
  const reached = milestoneReachedIndex(project);
  const fillPct = (reached / (PROJECT_MILESTONES.length - 1)) * 100;
  const dot = size === "md" ? "h-3 w-3" : "h-2.5 w-2.5";
  const label = size === "md" ? "text-[10px] sm:text-[11px]" : "text-[9px] sm:text-[10px]";
  const lineTop = size === "md" ? "top-[6px]" : "top-[5px]";

  return (
    <span className="relative flex w-full items-start justify-between">
      <span className={`absolute left-[12%] right-[12%] ${lineTop} h-0.5 bg-neutral-200`} />
      <span
        className={`absolute left-[12%] ${lineTop} h-0.5 bg-[#174f43]`}
        style={{ width: `calc(${fillPct}% * 0.76)` }}
      />
      {PROJECT_MILESTONES.map((step, index) => {
        const done = index <= reached;
        const current = index === reached;
        return (
          <span key={step.id} className="relative z-[1] flex w-[24%] min-w-0 flex-col items-center gap-1.5">
            <span
              className={`${dot} rounded-full border ${
                done
                  ? current
                    ? "border-[#174f43] bg-[#174f43] ring-2 ring-[#174f43]/25"
                    : "border-[#174f43] bg-[#174f43]"
                  : "border-neutral-300 bg-white"
              }`}
            />
            <span
              title={step.label}
              className={`w-full truncate text-center leading-tight ${label} ${
                done ? "font-semibold text-[#174f43]" : "font-medium text-neutral-400"
              }`}
            >
              {step.label}
            </span>
          </span>
        );
      })}
    </span>
  );
};

export const ProjectCommercialTag = ({
  commercialStatus,
  className = "",
}: {
  commercialStatus?: string | null;
  className?: string;
}) => {
  const tag = projectCommercialTag(commercialStatus);
  if (!tag) return null;
  return (
    <span
      className={`inline-flex truncate rounded-md bg-[#174f43]/10 px-2 py-1 text-[11px] font-semibold text-[#174f43] ${className}`}
      title={commercialStatusLabel(commercialStatus)}
    >
      {tag}
    </span>
  );
};
