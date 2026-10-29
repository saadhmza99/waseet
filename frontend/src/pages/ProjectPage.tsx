import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronRight, ExternalLink, FileText, Heart, ImagePlus, Lock, MapPin, Share2, Trash2 } from "lucide-react";
import { catalogService } from "@/services/catalogService";
import { isWithinUploadLimit, storageService, uploadMaxLabel } from "@/services/storageService";
import { OwnerDeleteButton } from "@/components/OwnerDeleteButton";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { savedService } from "@/services/savedService";
import { useAuth } from "@/contexts/AuthContext";
import { useVisitorGate } from "@/contexts/VisitorGateContext";
import InquiryDialog from "@/components/InquiryDialog";
import PartnerDemandDialog, { PAID_PLAN_REQUEST } from "@/components/PartnerDemandDialog";
import { ProjectCommercialTag, ProjectMilestoneTrack } from "@/components/project/ProjectMilestoneTrack";
import { toast } from "@/components/ui/use-toast";
import { savedToast } from "@/lib/savedToast";
import FeedDesktopRail from "@/components/FeedDesktopRail";
import {
  DETAIL_SECTIONS,
  categoryLabel,
  dossierFromRow,
  phaseStatusLabel,
  projectLocation,
  projectMetrics,
  type ProjectRecord,
} from "@/lib/projectDossier";
import { projectTypeLabel } from "@/lib/taxonomy";

const MEDIA_POWER_KEY = "waseet_media_power";
/** Only this curator pro account can use ?power=1 / media mode. */
const MEDIA_CURATOR_USER_ID = "a1111111-1111-5111-8111-111111111111";
const MEDIA_CURATOR_EMAIL = "curator@sifarah.local";

const isMediaCurator = (user: { id?: string; email?: string | null } | null | undefined) =>
  Boolean(
    user &&
      (user.id === MEDIA_CURATOR_USER_ID ||
        String(user.email || "")
          .trim()
          .toLowerCase() === MEDIA_CURATOR_EMAIL),
  );

const withProjectChrome = (node: ReactNode) => (
  <div className="lg:flex lg:min-h-screen lg:w-full">
    <FeedDesktopRail />
    <div className="min-w-0 flex-1">{node}</div>
  </div>
);

const DossierLock = ({ onJoin }: { onJoin: () => void }) => (
  <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-8 text-center">
    <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#174f43] shadow-sm">
      <Lock className="h-5 w-5" />
    </span>
    <p className="mt-4 text-base font-semibold text-neutral-900">Réservé au plan payant</p>
    <p className="mt-2 text-sm leading-relaxed text-neutral-600">
      L&apos;équipe et les documents de ce projet sont réservés au plan payant. {PAID_PLAN_REQUEST}
    </p>
    <button
      type="button"
      onClick={onJoin}
      className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#174f43] px-5 py-3 text-sm font-semibold text-white hover:bg-[#123d34]"
    >
      Deviens notre partenaire!
    </button>
  </div>
);

/** Extra project photos are hidden until each project has its own images. */
const SHOW_EXTRA_PROJECT_IMAGES = false;

const TABS = ["Aperçu", "Programme", "Équipe", "Documents", "Mises à jour"] as const;
type Tab = (typeof TABS)[number];

const formatDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
};

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, visitorUser } = useAuth();
  const { requestVisitor } = useVisitorGate();
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [missing, setMissing] = useState(false);
  const [tab, setTab] = useState<Tab>("Aperçu");
  const [contactOpen, setContactOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dossierLocked, setDossierLocked] = useState(false);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [mediaPowerWanted, setMediaPowerWanted] = useState(() => {
    if (typeof window === "undefined") return false;
    return searchParams.get("power") === "1" || localStorage.getItem(MEDIA_POWER_KEY) === "1";
  });
  const [mediaBusy, setMediaBusy] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [coverEditorOpen, setCoverEditorOpen] = useState(false);
  const [coverConfirmOpen, setCoverConfirmOpen] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const canMediaPower = isMediaCurator(user);
  const mediaPower = canMediaPower && mediaPowerWanted;

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  useEffect(() => {
    if (searchParams.get("power") === "1") {
      localStorage.setItem(MEDIA_POWER_KEY, "1");
      setMediaPowerWanted(true);
    } else if (searchParams.get("power") === "0") {
      localStorage.removeItem(MEDIA_POWER_KEY);
      setMediaPowerWanted(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setMissing(false);
    setProject(null);
    setDossierLocked(false);
    catalogService
      .getProject(id)
      .then((row) => {
        if (!active) return;
        if (!row) setMissing(true);
        else {
          setProject(dossierFromRow(row));
          setDossierLocked(Boolean(row.dossier_locked));
        }
      })
      .catch(() => {
        if (active) setMissing(true);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const reloadProject = async () => {
    if (!id) return;
    const row = await catalogService.getProject(id);
    if (!row) return;
    setProject(dossierFromRow(row));
  };

  const toggleMediaPower = () => {
    if (!canMediaPower) {
      toast({
        title: "Compte curator requis",
        description: "Le mode média n'est disponible que pour curator@sifarah.local.",
      });
      return;
    }
    const next = !mediaPowerWanted;
    setMediaPowerWanted(next);
    if (next) {
      localStorage.setItem(MEDIA_POWER_KEY, "1");
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("power", "1");
      setSearchParams(nextParams, { replace: true });
    } else {
      localStorage.removeItem(MEDIA_POWER_KEY);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("power");
      setSearchParams(nextParams, { replace: true });
    }
  };

  const ownsProject = Boolean(user && project?.userId === user.id);

  const patchMedia = async (action: "set_cover" | "delete_image", url: string) => {
    if (!id || !url) return;
    const allowed = action === "delete_image" ? canMediaPower || ownsProject : canMediaPower;
    if (!allowed) {
      toast({
        title: "Compte curator requis",
        description: "Connectez-vous avec curator@sifarah.local pour modifier les médias.",
      });
      return;
    }
    setMediaBusy(`${action}:${url}`);
    try {
      await catalogService.patchProjectMedia(id, action, url);
      await reloadProject();
      toast({
        title: action === "set_cover" ? "Couverture mise à jour" : "Photo supprimée",
        description: "Enregistré dans Supabase.",
      });
    } catch (error) {
      console.error("patchProjectMedia", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de modifier ce média.",
      });
    } finally {
      setMediaBusy(null);
    }
  };

  const replaceCover = async (file: File) => {
    if (!id || !ownsProject) return;
    if (!file.type.startsWith("image/") || !isWithinUploadLimit(file)) {
      toast({ title: "Image", description: `Choisissez une image de ${uploadMaxLabel} maximum.` });
      return;
    }
    setMediaBusy("set_cover");
    try {
      const url = await storageService.uploadImage(file, "projects");
      await catalogService.patchProjectMedia(id, "set_cover", url);
      await reloadProject();
      setCoverEditorOpen(false);
      toast({ title: "Couverture mise à jour" });
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de modifier la couverture." });
    } finally {
      setMediaBusy(null);
    }
  };

  const clearCover = async () => {
    if (!id || !ownsProject) return;
    setMediaBusy("clear_cover");
    try {
      await catalogService.patchProjectMedia(id, "clear_cover", "");
      await reloadProject();
      setCoverConfirmOpen(false);
      setCoverEditorOpen(false);
      toast({ title: "Couverture supprimée" });
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de supprimer la couverture." });
    } finally {
      setMediaBusy(null);
    }
  };

  useEffect(() => {
    if (!id) return;
    const saverId = user?.id || visitorUser?.id;
    if (!saverId) {
      setSaved(false);
      return;
    }
    let cancelled = false;
    savedService.isProjectSaved(saverId, id).then((value) => {
      if (!cancelled) setSaved(value);
    });
    return () => {
      cancelled = true;
    };
  }, [id, user?.id, visitorUser?.id]);

  const metrics = useMemo(() => (project ? projectMetrics(project) : []), [project]);
  const sections = project?.category ? DETAIL_SECTIONS[project.category] || [] : [];
  const sectionFields = sections.flatMap((section) =>
    section.fields
      .map((field) => ({ label: field.label, value: project?.fields[field.key]?.trim() || "" }))
      .filter((field) => field.value),
  );
  /** Seeded Kerix rows often only have typologies / equipment / nearby / prices. */
  const extraFields = [
    { key: "typologies", label: "Typologies" },
    { key: "surface", label: "Surface" },
    { key: "equipment", label: "Équipements" },
    { key: "nearby", label: "À proximité" },
    { key: "priceFrom", label: "À partir de" },
    { key: "priceMin", label: "Prix min" },
    { key: "priceMax", label: "Prix max" },
  ]
    .map((field) => {
      const raw = project?.fields[field.key]?.trim() || "";
      if (!raw) return { label: field.label, value: "" };
      if (field.key.startsWith("price")) {
        const amount = Number(String(raw).replace(/\s/g, "").replace(",", "."));
        if (!Number.isFinite(amount)) return { label: field.label, value: raw };
        return {
          label: field.label,
          value: `${amount.toLocaleString("fr-FR")} ${project?.fields.currency || "MAD"}`,
        };
      }
      return { label: field.label, value: raw };
    })
    .filter((field) => field.value);
  const filledFieldLabels = new Set(sectionFields.map((field) => field.label));
  const filledFields = [...sectionFields, ...extraFields.filter((field) => !filledFieldLabels.has(field.label))];
  const publicDocs = (project?.documents || []).filter((doc) => doc.privacy === "public" || project?.userId === user?.id);
  const gallery = (
    project?.media?.length
      ? project.media
      : (project?.images || []).map((url) => ({ url, caption: "", category: "Réalisation" }))
  ).filter((item) => item.url && item.url !== project?.coverImage);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: project?.title, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    toast({ title: "Lien copié" });
  };

  const toggleSave = async () => {
    if (!id) return;
    const saver = await requestVisitor();
    if (!saver) return;
    try {
      if (saved) {
        await savedService.unsaveProject(saver.id, id);
        setSaved(false);
      } else {
        await savedService.saveProject(saver.id, id);
        setSaved(true);
        savedToast();
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour les favoris." });
    }
  };

  if (missing) {
    return withProjectChrome(
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-neutral-600">Ce projet n'est plus disponible.</p>
        <button type="button" onClick={() => navigate(-1)} className="mt-4 text-sm font-semibold text-[#174f43]">
          Retour
        </button>
      </div>
    );
  }

  if (!project) {
    return withProjectChrome(<div className="py-16 text-center text-sm text-neutral-500">Chargement du dossier…</div>);
  }

  const place = projectLocation(project);

  return withProjectChrome(
    <div className="min-h-screen bg-[#f4f6f3] pb-8 text-neutral-900">
      <div className="mx-auto w-full max-w-6xl px-3 pt-3 sm:px-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={() => navigate(-1)} className="text-sm text-neutral-600">
            ← Retour
          </button>
          {canMediaPower ? (
            <button
              type="button"
              onClick={toggleMediaPower}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                mediaPower ? "bg-amber-500 text-white" : "border border-neutral-300 text-neutral-500"
              }`}
            >
              {mediaPower ? "Mode média ON" : "Mode média"}
            </button>
          ) : null}
        </div>
        {mediaPower ? (
          <div className="mb-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950">
            Mode média curator : dans la galerie → <strong>Couverture</strong> ou <strong>Supprimer</strong> (écrit
            dans Supabase).
          </div>
        ) : null}
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="relative aspect-[16/9] bg-neutral-100 sm:aspect-[21/9]">
            {user && project.userId === user.id ? (
              <OwnerDeleteButton
                onDelete={async () => {
                  await catalogService.deleteProject(project.id, user.id);
                  navigate("/profile?tab=projets");
                }}
              />
            ) : null}
            {project.coverImage ? <img src={project.coverImage} alt="" className="h-full w-full object-cover" /> : (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-neutral-400">
                Aucune photo de couverture
              </div>
            )}
            <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold text-neutral-800">
              {projectTypeLabel(project.subtype) || project.subtype || categoryLabel(project.category)}
            </span>
            {mediaPower && project.coverImage ? (
              <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">
                Couverture actuelle
              </span>
            ) : null}
          </div>
          {ownsProject ? (
            <div className="border-b border-neutral-200 px-4 py-3">
              <button
                type="button"
                onClick={() => setCoverEditorOpen(true)}
                className="text-sm font-semibold text-[#174f43] hover:underline"
              >
                modifier photo de couverture du projet
              </button>
            </div>
          ) : null}
          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{project.title}</h1>
              {place ? (
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-neutral-500">
                  <MapPin className="h-4 w-4" />
                  {place}
                </p>
              ) : null}
              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-neutral-800">État d'avancement</p>
                  <ProjectCommercialTag commercialStatus={project.commercialStatus} />
                </div>
                <div className="mt-2.5 px-0.5">
                  <ProjectMilestoneTrack project={project} size="md" />
                </div>
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
              {user && project.userId === user.id ? (
                <button
                  type="button"
                  onClick={() => navigate(`/projet/${project.id}/modifier`)}
                  className="h-11 rounded-lg bg-[#174f43] text-sm font-semibold text-white"
                >
                  Modifier
                </button>
              ) : (
                <button type="button" onClick={() => setContactOpen(true)} className="h-11 rounded-lg bg-[#174f43] text-sm font-semibold text-white">
                  Contacter
                </button>
              )}
              <button type="button" onClick={() => setContactOpen(true)} className="h-11 rounded-lg border border-neutral-300 text-sm font-semibold">
                Demander plus d'informations
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={toggleSave} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 text-xs font-semibold">
                  <Heart className={`h-4 w-4 ${saved ? "fill-[#174f43] text-[#174f43]" : ""}`} />
                  {saved ? "Enregistré" : "Favoris"}
                </button>
                <button type="button" onClick={() => void share()} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 text-xs font-semibold">
                  <Share2 className="h-4 w-4" />
                  Partager
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto border-t border-neutral-200 px-2">
            {TABS.map((item) => {
              const gated = item === "Équipe" || item === "Documents";
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-semibold ${
                    tab === item ? "border-[#174f43] text-[#174f43]" : "border-transparent text-neutral-500"
                  }`}
                >
                  {gated && dossierLocked ? <Lock className="h-3.5 w-3.5" /> : null}
                  {item}
                </button>
              );
            })}
          </div>
          <div className="p-4 sm:p-6">
            {tab === "Aperçu" ? (
              <div className="space-y-6">
                {project.description ? <p className="max-w-3xl text-base leading-relaxed text-neutral-700">{project.description}</p> : null}
                {project.promoter?.name ? (
                  <p className="text-base text-neutral-700">
                    <span className="font-semibold">Promoteur </span>
                    {project.promoter.website ? (
                      <a href={project.promoter.website} target="_blank" rel="noreferrer" className="font-medium text-[#174f43]">
                        {project.promoter.name}
                      </a>
                    ) : (
                      project.promoter.name
                    )}
                  </p>
                ) : null}
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
                {SHOW_EXTRA_PROJECT_IMAGES && gallery.length ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {gallery.map((item) => {
                      const isCover = Boolean(project.coverImage && item.url === project.coverImage);
                      const busyCover = mediaBusy === `set_cover:${item.url}`;
                      const busyDelete = mediaBusy === `delete_image:${item.url}`;
                      return (
                        <figure key={item.url} className="group relative overflow-hidden rounded-lg bg-neutral-100">
                          <img src={item.url} alt={item.caption || ""} className="aspect-[4/3] w-full object-cover" />
                          {isCover ? (
                            <span className="absolute left-2 top-2 rounded bg-[#174f43] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              Cover
                            </span>
                          ) : null}
                          {mediaPower || ownsProject ? (
                            <div className={`absolute flex gap-1 ${mediaPower ? "inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100" : "right-2 top-2"}`}>
                              {mediaPower ? (
                                <button
                                  type="button"
                                  disabled={Boolean(mediaBusy) || isCover}
                                  onClick={() => void patchMedia("set_cover", item.url)}
                                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-white px-2 py-1.5 text-[11px] font-semibold text-neutral-900 disabled:opacity-50"
                                >
                                  <ImagePlus className="h-3.5 w-3.5" />
                                  {busyCover ? "…" : isCover ? "Cover" : "Couverture"}
                                </button>
                              ) : null}
                              <button
                                type="button"
                                disabled={Boolean(mediaBusy)}
                                onClick={() => setPhotoToDelete(item.url)}
                                className="inline-flex items-center justify-center rounded-md bg-white/95 p-1.5 text-neutral-900 shadow-sm disabled:opacity-50"
                                aria-label="Supprimer"
                              >
                                <Trash2 className={`h-3.5 w-3.5 ${busyDelete ? "opacity-50" : ""}`} />
                              </button>
                            </div>
                          ) : item.category ? (
                            <figcaption className="px-2 py-1.5 text-[11px] text-neutral-500">{item.category}</figcaption>
                          ) : null}
                        </figure>
                      );
                    })}
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

            {tab === "Équipe" && dossierLocked ? (
              <DossierLock onJoin={() => setPartnerOpen(true)} />
            ) : tab === "Équipe" ? (
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

            {tab === "Documents" && dossierLocked ? (
              <DossierLock onJoin={() => setPartnerOpen(true)} />
            ) : tab === "Documents" ? (
              <div className="space-y-4">
                {publicDocs.filter((doc) => doc.title).length ? (
                <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
                  {publicDocs.filter((doc) => doc.title).map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between gap-3 px-3 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md bg-red-600 text-white">
                          <FileText className="h-4 w-4" />
                          <span className="text-[8px] font-bold leading-tight">PDF</span>
                        </span>
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
                )}
              </div>
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
      <PartnerDemandDialog open={partnerOpen} onOpenChange={setPartnerOpen} />
      <InquiryDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        type="project"
        sellerId={project.userId}
        projectId={project.id}
      />
      <ConfirmDeleteDialog
        open={Boolean(photoToDelete)}
        title="Supprimer cette photo ?"
        message="Elle sera retirée de la galerie du projet."
        busy={Boolean(photoToDelete && mediaBusy === `delete_image:${photoToDelete}`)}
        onCancel={() => {
          if (!mediaBusy) setPhotoToDelete(null);
        }}
        onConfirm={() => {
          if (!photoToDelete) return;
          void patchMedia("delete_image", photoToDelete).finally(() => setPhotoToDelete(null));
        }}
      />
      {coverEditorOpen ? (
        <div
          className="fixed inset-0 z-[230] flex items-end justify-center bg-[#0e2c26]/55 p-3 sm:items-center"
          onClick={() => {
            if (!mediaBusy) setCoverEditorOpen(false);
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cover-editor-title"
          >
            <div className="h-1.5 bg-[#174f43]" />
            <div className="px-5 py-5">
              <h2 id="cover-editor-title" className="text-lg font-semibold text-neutral-900">
                Photo de couverture
              </h2>
              <div className="mt-3 overflow-hidden rounded-xl bg-neutral-100">
                {project.coverImage ? (
                  <img src={project.coverImage} alt="" className="aspect-[16/9] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center px-6 text-center text-sm text-neutral-500">
                    Aucune photo de couverture
                  </div>
                )}
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void replaceCover(file);
                }}
              />
              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  disabled={Boolean(mediaBusy)}
                  onClick={() => coverInputRef.current?.click()}
                  className="h-11 rounded-xl bg-[#174f43] text-sm font-semibold text-white disabled:opacity-60"
                >
                  {mediaBusy === "set_cover" ? "Envoi…" : project.coverImage ? "Remplacer" : "Ajouter"}
                </button>
                {project.coverImage ? (
                  <button
                    type="button"
                    disabled={Boolean(mediaBusy)}
                    onClick={() => setCoverConfirmOpen(true)}
                    className="h-11 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-800 disabled:opacity-60"
                  >
                    Supprimer
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={Boolean(mediaBusy)}
                  onClick={() => setCoverEditorOpen(false)}
                  className="h-11 text-sm font-semibold text-neutral-600"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <ConfirmDeleteDialog
        open={coverConfirmOpen}
        title="Supprimer la couverture ?"
        message="La couverture sera retirée. Les photos de la galerie restent en place."
        busy={mediaBusy === "clear_cover"}
        onCancel={() => {
          if (mediaBusy !== "clear_cover") setCoverConfirmOpen(false);
        }}
        onConfirm={() => {
          void clearCover();
        }}
      />
    </div>
  );
};

export default ProjectPage;
