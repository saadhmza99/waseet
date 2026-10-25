import { MapPin } from "lucide-react";
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

export const ProjectCard = ({ row }: { row: any }) => {
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
      className="flex w-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-left shadow-sm transition hover:border-neutral-300"
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
      </span>
      <span className="flex flex-col gap-2 px-3.5 py-3">
        <span className="text-[17px] font-semibold leading-tight text-neutral-950">{project.title}</span>
        {place ? (
          <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
            <MapPin className="h-3.5 w-3.5" />
            {place}
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
