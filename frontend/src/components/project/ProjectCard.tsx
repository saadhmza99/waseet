import { Lock, MapPin, Unlock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProjectCommercialTag, ProjectMilestoneTrack } from "@/components/project/ProjectMilestoneTrack";
import {
  categoryLabel,
  dossierFromRow,
  projectLocation,
  projectMetrics,
  type ProjectRecord,
} from "@/lib/projectDossier";
import { projectTypeLabel } from "@/lib/taxonomy";

const coverFallback =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="#e7ebe8"/><text x="50%" y="50%" text-anchor="middle" fill="#8b948e" font-family="sans-serif" font-size="18">Projet</text></svg>`
  );

export const ProjectCard = ({ row, dossier }: { row: any; dossier?: "open" | "locked" }) => {
  const navigate = useNavigate();
  const project: ProjectRecord = dossierFromRow(row);
  const metrics = projectMetrics(project).filter(
    (item) => item.label !== "avancement" && item.label !== "réalisé",
  );
  const place = projectLocation(project);

  return (
    <button
      type="button"
      onClick={() => {
        window.scrollTo(0, 0);
        navigate(`/projet/${project.id}`);
      }}
      className={`flex w-full flex-col overflow-hidden rounded-xl border bg-white text-left shadow-sm transition hover:border-neutral-300 ${
        dossier === "open" ? "border-[#174f43]/50 ring-1 ring-[#174f43]/25" : "border-neutral-200"
      }`}
    >
      <span className="relative block aspect-[16/10] w-full overflow-hidden bg-neutral-100">
        <img
          src={project.image || coverFallback}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        {project.subtype || project.category ? (
          <span className="absolute left-3 top-3 max-w-[48%] truncate rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold text-neutral-800 shadow-sm">
            {projectTypeLabel(project.subtype) || project.subtype || categoryLabel(project.category)}
          </span>
        ) : null}
        <ProjectCommercialTag
          commercialStatus={project.commercialStatus}
          className="absolute right-3 top-3 max-w-[48%] bg-white/95 shadow-sm"
        />
        {dossier === "open" ? (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#174f43] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            <Unlock className="h-3.5 w-3.5" />
            Dossier ouvert
          </span>
        ) : null}
      </span>
      <span className="flex flex-col gap-2 px-3.5 py-3">
        <span className="text-[17px] font-semibold leading-tight text-neutral-950">{project.title}</span>
        {project.promoter?.name ? (
          <span
            role="link"
            tabIndex={0}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              const slug = project.promoter?.id || row?.user_id;
              if (!slug) return;
              window.scrollTo(0, 0);
              navigate(`/profile/${slug}`);
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              event.stopPropagation();
              const slug = project.promoter?.id || row?.user_id;
              if (!slug) return;
              window.scrollTo(0, 0);
              navigate(`/profile/${slug}`);
            }}
            className="truncate text-sm font-medium text-[#174f43] hover:underline"
          >
            {project.promoter.name}
          </span>
        ) : null}
        {place ? (
          <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
            <MapPin className="h-3.5 w-3.5" />
            {place}
          </span>
        ) : null}
        {dossier === "open" ? (
          <span className="text-xs font-medium text-[#174f43]">Équipe et documents consultables</span>
        ) : dossier === "locked" ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500">
            <Lock className="h-3.5 w-3.5" />
            Équipe et documents réservés aux partenaires
          </span>
        ) : null}

        <span className="mt-1 block px-0.5">
          <ProjectMilestoneTrack project={project} />
        </span>

        {metrics.length ? (
          <span className="mt-1 grid grid-cols-4 gap-1 border-t border-neutral-100 pt-2">
            {metrics.map((item) => (
              <span key={item.label} className="min-w-0 text-center">
                <span className="block truncate text-[13px] font-semibold text-neutral-900">{item.value}</span>
                <span className="block truncate text-[10px] text-neutral-500">{item.label}</span>
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </button>
  );
};
