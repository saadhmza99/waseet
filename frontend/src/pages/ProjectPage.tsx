import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Bookmark, ChevronRight, ExternalLink, MapPin, Share2 } from "lucide-react";
import { catalogService } from "@/services/catalogService";
import { useAuth } from "@/contexts/AuthContext";
import InquiryDialog from "@/components/InquiryDialog";
import { toast } from "@/components/ui/use-toast";
import { showcaseRow } from "@/lib/showcaseProjects";
import {
  DETAIL_SECTIONS,
  categoryLabel,
  dossierFromRow,
  phaseStatusLabel,
  projectLocation,
  projectMetrics,
  statusLabel,
  type ProjectRecord,
} from "@/lib/projectDossier";

const TABS = ["Aperçu", "Programme", "Équipe", "Documents", "Mises à jour"] as const;
type Tab = (typeof TABS)[number];

const savedKey = "sifarah.savedProjects";

const readSaved = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(savedKey) || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const formatDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
};

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [missing, setMissing] = useState(false);
  const [tab, setTab] = useState<Tab>("Aperçu");
  const [contactOpen, setContactOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setMissing(false);
    setProject(null);
    const sample = showcaseRow(id);
    if (sample) {
      setProject(dossierFromRow(sample));
      setSaved(readSaved().includes(id));
      return;
    }
    catalogService
      .getProject(id)
      .then((row) => {
        if (!active) return;
        if (!row) setMissing(true);
        else setProject(dossierFromRow(row));
      })
      .catch(() => {
        if (active) setMissing(true);
      });
    setSaved(readSaved().includes(id));
    return () => {
      active = false;
    };
  }, [id]);

  const metrics = useMemo(() => (project ? projectMetrics(project) : []), [project]);
  const sections = project?.category ? DETAIL_SECTIONS[project.category] : [];
  const filledFields = sections.flatMap((section) =>
    section.fields
      .map((field) => ({ label: field.label, value: project?.fields[field.key]?.trim() || "" }))
      .filter((field) => field.value)
  );
  const publicDocs = (project?.documents || []).filter((doc) => doc.privacy === "public" || project?.userId === user?.id);
  const gallery = project?.media?.length
    ? project.media
    : (project?.images || []).map((url) => ({ url, caption: "", category: "Réalisation" }));

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: project?.title, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    toast({ title: "Lien copié" });
  };

  const toggleSave = () => {
    if (!id) return;
    const next = saved ? readSaved().filter((item) => item !== id) : [...readSaved(), id];
    localStorage.setItem(savedKey, JSON.stringify(next));
    setSaved(!saved);
  };

  if (missing) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-neutral-600">Ce projet n'est plus disponible.</p>
        <button type="button" onClick={() => navigate(-1)} className="mt-4 text-sm font-semibold text-[#174f43]">
          Retour
        </button>
      </div>
    );
  }

  if (!project) {
    return <div className="py-16 text-center text-sm text-neutral-500">Chargement du dossier…</div>;
  }

  const place = projectLocation(project);

  return (
    <div className="min-h-screen bg-[#f4f6f3] pb-8 text-neutral-900">
      <div className="mx-auto w-full max-w-6xl px-3 pt-3 sm:px-4">
        <button type="button" onClick={() => navigate(-1)} className="mb-3 text-sm text-neutral-600">
          ← Retour
        </button>
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="relative aspect-[16/8] bg-neutral-100 sm:aspect-[21/8]">
            {project.image ? <img src={project.image} alt="" className="h-full w-full object-cover" /> : null}
            <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold text-neutral-800">
              {project.subtype || categoryLabel(project.category)}
            </span>
          </div>
          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{project.title}</h1>
              {place ? (
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-neutral-500">
                  <MapPin className="h-4 w-4" />
                  {place}
                </p>
              ) : null}
              <div className="mt-3 flex items-center gap-3 text-sm font-medium text-[#174f43]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#174f43]" />
                  {statusLabel(project.status)}
                </span>
                <span className="text-neutral-400">{project.progress} %</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                <div className="h-full bg-[#174f43]" style={{ width: `${Math.min(100, project.progress || 0)}%` }} />
              </div>
              {metrics.length ? (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {metrics.map((item) => (
                    <div key={item.label} className="rounded-lg border border-neutral-200 px-3 py-2">
                      <p className="truncate text-sm font-semibold">{item.value}</p>
                      <p className="truncate text-[11px] text-neutral-500">{item.label}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => setContactOpen(true)} className="h-11 rounded-lg bg-[#174f43] text-sm font-semibold text-white">
                Contacter
              </button>
              <button type="button" onClick={() => setContactOpen(true)} className="h-11 rounded-lg border border-neutral-300 text-sm font-semibold">
                Demander plus d'informations
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={toggleSave} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 text-xs font-semibold">
                  <Bookmark className={`h-4 w-4 ${saved ? "fill-[#174f43] text-[#174f43]" : ""}`} />
                  {saved ? "Enregistré" : "Enregistrer"}
                </button>
                <button type="button" onClick={() => void share()} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 text-xs font-semibold">
                  <Share2 className="h-4 w-4" />
                  Partager
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto border-t border-neutral-200 px-2">
            {TABS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold ${
                  tab === item ? "border-[#174f43] text-[#174f43]" : "border-transparent text-neutral-500"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="p-4 sm:p-6">
            {tab === "Aperçu" ? (
              <div className="space-y-6">
                {project.description ? <p className="max-w-3xl text-sm leading-relaxed text-neutral-700">{project.description}</p> : null}
                {filledFields.length ? (
                  <div>
                    <h2 className="text-sm font-semibold">Caractéristiques</h2>
                    <dl className="mt-3 grid gap-px overflow-hidden rounded-lg border border-neutral-200 bg-neutral-200 sm:grid-cols-2">
                      {filledFields.map((field) => (
                        <div key={field.label} className="flex items-center justify-between gap-3 bg-white px-3 py-2.5 text-sm">
                          <dt className="text-neutral-500">{field.label}</dt>
                          <dd className="font-medium">{field.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}
                {project.choices.length ? (
                  <div className="flex flex-wrap gap-2">
                    {project.choices.map((choice) => (
                      <span key={choice} className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700">
                        {choice}
                      </span>
                    ))}
                  </div>
                ) : null}
                {project.phases.length ? (
                  <div>
                    <h2 className="text-sm font-semibold">Planning</h2>
                    <ol className="mt-3 space-y-3">
                      {project.phases.map((phase) => (
                        <li key={phase.id} className="rounded-lg border border-neutral-200 px-3 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold">{phase.name || "Phase"}</p>
                            <p className="text-xs text-neutral-500">{phaseStatusLabel(phase.status)} · {phase.progress} %</p>
                          </div>
                          {phase.description ? <p className="mt-1 text-sm text-neutral-600">{phase.description}</p> : null}
                          <div className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-200">
                            <div className="h-full bg-[#174f43]" style={{ width: `${Math.min(100, phase.progress || 0)}%` }} />
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
                {gallery.length ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {gallery.map((item) => (
                      <figure key={item.url} className="overflow-hidden rounded-lg bg-neutral-100">
                        <img src={item.url} alt={item.caption || ""} className="aspect-[4/3] w-full object-cover" />
                        {item.category ? <figcaption className="px-2 py-1.5 text-[11px] text-neutral-500">{item.category}</figcaption> : null}
                      </figure>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {tab === "Programme" ? (
              <div className="space-y-5">
                {project.units.length ? (
                  <div className="overflow-x-auto rounded-lg border border-neutral-200">
                    <table className="w-full min-w-[28rem] text-left text-sm">
                      <thead className="bg-neutral-50 text-xs text-neutral-500">
                        <tr>
                          <th className="px-3 py-2 font-medium">Type</th>
                          <th className="px-3 py-2 font-medium">Unités</th>
                          <th className="px-3 py-2 font-medium">Surface min</th>
                          <th className="px-3 py-2 font-medium">Surface max</th>
                        </tr>
                      </thead>
                      <tbody>
                        {project.units.map((unit) => (
                          <tr key={`${unit.type}-${unit.count}`} className="border-t border-neutral-100">
                            <td className="px-3 py-2">{unit.type}</td>
                            <td className="px-3 py-2">{unit.count}</td>
                            <td className="px-3 py-2">{unit.min ? `${unit.min} m²` : "—"}</td>
                            <td className="px-3 py-2">{unit.max ? `${unit.max} m²` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
                {filledFields.length ? (
                  <dl className="grid gap-2 sm:grid-cols-2">
                    {filledFields.map((field) => (
                      <div key={field.label} className="rounded-lg border border-neutral-200 px-3 py-2">
                        <dt className="text-[11px] text-neutral-500">{field.label}</dt>
                        <dd className="text-sm font-semibold">{field.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-sm text-neutral-500">Le programme de ce projet n'est pas encore détaillé.</p>
                )}
              </div>
            ) : null}

            {tab === "Équipe" ? (
              <div className="space-y-8">
                {project.team.filter((member) => member.name).length ? (
                  <div>
                    <h2 className="text-sm font-semibold">L'équipe du projet</h2>
                    <ul className="mt-3 divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200">
                      {project.team.filter((member) => member.name).map((member) => {
                        const body = (
                          <>
                            {member.logo ? (
                              <img src={member.logo} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                            ) : (
                              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#174f43] text-sm font-semibold text-white">
                                {member.name.slice(0, 1).toUpperCase()}
                              </span>
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold">{member.role}</span>
                              <span className="block truncate text-sm text-neutral-800">{member.name}</span>
                              {member.description ? <span className="block truncate text-xs text-neutral-500">{member.description}</span> : null}
                            </span>
                            {member.website ? <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" /> : null}
                          </>
                        );
                        return (
                          <li key={member.id}>
                            {member.website ? (
                              <a href={member.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-3 hover:bg-neutral-50">
                                {body}
                              </a>
                            ) : (
                              <div className="flex items-center gap-3 px-3 py-3">{body}</div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">Aucune organisation n'est encore associée.</p>
                )}
                {project.partners.filter((partner) => partner.name).length ? (
                  <div>
                    <h2 className="text-sm font-semibold">Nos partenaires</h2>
                    <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {project.partners.filter((partner) => partner.name).map((partner) => {
                        const tile = (
                          <span className="flex h-24 w-28 flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-2">
                            {partner.logo ? (
                              <img src={partner.logo} alt="" className="h-10 w-16 object-contain" />
                            ) : (
                              <span className="text-xs font-semibold text-neutral-700">{partner.name}</span>
                            )}
                            {partner.logo ? <span className="max-w-full truncate text-[10px] text-neutral-500">{partner.name}</span> : null}
                          </span>
                        );
                        return (
                          <li key={partner.id} className="shrink-0">
                            {partner.website ? (
                              <a href={partner.website} target="_blank" rel="noopener noreferrer" className="block hover:border-[#174f43]">{tile}</a>
                            ) : tile}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}

            {tab === "Documents" ? (
              publicDocs.filter((doc) => doc.title).length ? (
                <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
                  {publicDocs.filter((doc) => doc.title).map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between gap-3 px-3 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {doc.thumbnail ? <img src={doc.thumbnail} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" /> : null}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{doc.title}</p>
                          <p className="truncate text-xs text-neutral-500">
                            {doc.type}
                            {doc.privacy === "private" ? " · Équipe" : ""}
                          </p>
                        </div>
                      </div>
                      {doc.url ? (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#174f43]">
                          Ouvrir
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500">Aucun document public pour le moment.</p>
              )
            ) : null}

            {tab === "Mises à jour" ? (
              project.updates.filter((entry) => entry.text || entry.phase).length ? (
                <ol className="space-y-5 border-l border-neutral-200 pl-4">
                  {project.updates
                    .filter((entry) => entry.text || entry.phase)
                    .map((entry) => (
                      <li key={entry.id} className="relative">
                        <span className="absolute -left-[1.3rem] top-1.5 h-2.5 w-2.5 rounded-full bg-[#174f43]" />
                        <p className="text-xs text-neutral-500">{formatDate(entry.date)}</p>
                        {entry.phase ? <p className="text-xs font-semibold uppercase tracking-wide text-[#174f43]">{entry.phase}</p> : null}
                        <p className="mt-1 text-sm text-neutral-800">{entry.text}</p>
                      </li>
                    ))}
                </ol>
              ) : (
                <p className="text-sm text-neutral-500">Le journal de chantier n'a pas encore de mise à jour.</p>
              )
            ) : null}
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-neutral-400">
          <Link to="/explore" className="hover:text-neutral-600">Découvrir d'autres projets</Link>
        </p>
      </div>
      <InquiryDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        type="project"
        sellerId={project.userId}
        projectId={project.id}
      />
    </div>
  );
};

export default ProjectPage;
