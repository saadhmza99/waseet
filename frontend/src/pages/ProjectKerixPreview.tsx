import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Heart,
  MapPin,
  Share2,
  Trophy,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import InquiryDialog from "@/components/InquiryDialog";
import { ProjectCommercialTag, ProjectMilestoneTrack } from "@/components/project/ProjectMilestoneTrack";
import { toast } from "@/components/ui/use-toast";
import {
  TEAM_ROLE_BUCKETS,
  categoryLabel,
  commercialStatusLabel,
  statusLabel,
  teamRoleBucket,
  type ProjectRecord,
  type ProjectTeamMember,
} from "@/lib/projectDossier";

const TABS = ["Aperçu", "Équipe du projet", "Spécifications", "Médias", "Documents", "Opportunités"] as const;
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

const formatPrice = (value?: string, currency = "MAD") => {
  const digits = (value || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  return `${Number(digits).toLocaleString("fr-FR")} ${currency}`;
};

const field = (project: ProjectRecord, key: string) => (project.fields[key] || "").trim();

const withPromoter = (project: ProjectRecord): ProjectTeamMember[] => {
  const team = [...(project.team || [])];
  const promoter = project.promoter;
  if (promoter?.name && !team.some((member) => member.name === promoter.name && member.role === "Promoteur")) {
    team.unshift({
      id: promoter.id || "promoter",
      role: "Promoteur",
      name: promoter.name,
      website: promoter.website || "",
      description: "",
      logo: "",
    });
  }
  return team;
};

const ProjectKerixPreview = ({ project }: { project: ProjectRecord }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("Aperçu");
  const [contactOpen, setContactOpen] = useState(false);
  const [saved, setSaved] = useState(() => readSaved().includes(project.id));
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const gallery = useMemo(() => {
    if (project.media?.length) return project.media;
    return (project.images || []).map((url) => ({ url, caption: "", category: "Galerie" }));
  }, [project]);

  const team = useMemo(() => withPromoter(project).filter((member) => member.name), [project]);

  const teamBuckets = useMemo(() => {
    return TEAM_ROLE_BUCKETS.map((bucket) => ({
      ...bucket,
      members: team.filter((member) => teamRoleBucket(member.role)?.id === bucket.id),
    })).filter((bucket) => bucket.members.length || bucket.id === "promoteur" || bucket.id === "architecte" || bucket.id === "bet" || bucket.id === "eg");
  }, [team]);

  const filledBuckets = teamBuckets.filter((bucket) => bucket.members.length).length;
  const coreBuckets = 4;
  const publicDocs = (project.documents || []).filter((doc) => doc.privacy === "public" || project.userId === user?.id);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: project.title, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    toast({ title: "Lien copié" });
  };

  const toggleSave = () => {
    const next = saved ? readSaved().filter((item) => item !== project.id) : [...readSaved(), project.id];
    localStorage.setItem(savedKey, JSON.stringify(next));
    setSaved(!saved);
  };

  const openLightbox = (index: number) => {
    setActiveImage(index);
    setZoom(1);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setZoom(1);
  };

  const showPrev = () => {
    if (!gallery.length) return;
    setActiveImage((current) => (current - 1 + gallery.length) % gallery.length);
    setZoom(1);
  };

  const showNext = () => {
    if (!gallery.length) return;
    setActiveImage((current) => (current + 1) % gallery.length);
    setZoom(1);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
      if (event.key === "+" || event.key === "=") setZoom((value) => Math.min(3, Number((value + 0.25).toFixed(2))));
      if (event.key === "-") setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))));
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [lightboxOpen, gallery.length]);

  const currency = field(project, "currency") || "MAD";
  const priceFrom = formatPrice(field(project, "priceFrom") || field(project, "priceMin"), currency);
  const priceOnRequest = field(project, "priceOnRequest") === "true";
  const builtArea = field(project, "builtArea");
  const place = [project.city, project.region].filter(Boolean).join(" · ");
  const mainImage = gallery[activeImage]?.url || project.image;
  const thumbs = gallery.slice(0, 4);
  const mapQuery = [project.address, project.neighborhood, project.city, project.region, "Maroc"].filter(Boolean).join(", ");
  const mapUrl = project.latitude && project.longitude
    ? `https://www.openstreetmap.org/?mlat=${project.latitude}&mlon=${project.longitude}#map=15/${project.latitude}/${project.longitude}`
    : `https://www.openstreetmap.org/search?query=${encodeURIComponent(mapQuery)}`;

  const programmeRows = [
    { label: "Usage", value: field(project, "usage") },
    { label: "Destination", value: field(project, "destination") },
    { label: "Surface construite", value: builtArea ? `${Number(builtArea).toLocaleString("fr-FR")} m²` : "" },
    { label: "Nombre de bâtiments", value: field(project, "buildings") },
    { label: "Nombre d'étages", value: field(project, "floors") },
    { label: "Nombre de sous-sols", value: field(project, "basements") },
  ].filter((row) => row.value);

  const typologyRows = [
    { label: "Nombre d'appartements", value: field(project, "apartments") },
    { label: "Typologies", value: field(project, "typologies") },
    { label: "Équipements", value: field(project, "equipment") || project.choices.join(", ") },
    { label: "Structure", value: field(project, "structure") },
    { label: "Terrain", value: field(project, "landArea") ? `${Number(field(project, "landArea")).toLocaleString("fr-FR")} m²` : "" },
    { label: "À proximité", value: field(project, "nearby") },
  ].filter((row) => row.value);

  const commercialRows = [
    {
      label: "Prix à partir de",
      value: priceOnRequest ? "Sur demande" : priceFrom,
    },
    {
      label: "Fourchette de prix",
      value:
        field(project, "priceMin") && field(project, "priceMax")
          ? `${formatPrice(field(project, "priceMin"), currency)} – ${formatPrice(field(project, "priceMax"), currency)}`
          : "",
    },
    { label: "Devise", value: currency },
    {
      label: "Chambres",
      value:
        field(project, "bedroomsMin") || field(project, "bedroomsMax")
          ? `${field(project, "bedroomsMin") || "—"} – ${field(project, "bedroomsMax") || "—"}`
          : "",
    },
    {
      label: "Salles de bain",
      value:
        field(project, "bathroomsMin") || field(project, "bathroomsMax")
          ? `${field(project, "bathroomsMin") || "—"} – ${field(project, "bathroomsMax") || "—"}`
          : "",
    },
    { label: "Offres disponibles", value: field(project, "offersCount") },
  ].filter((row) => row.value);

  const MemberCard = ({ member }: { member: ProjectTeamMember }) => (
    <article className="flex h-full min-h-[10.5rem] flex-col rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start gap-3">
        {member.logo ? (
          <img src={member.logo} alt="" className="h-12 w-12 rounded-lg object-cover" />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e8f0ed] text-sm font-semibold text-[#174f43]">
            {member.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900">{member.name}</p>
          <p className="text-xs font-medium text-[#174f43]">{member.role}</p>
        </div>
      </div>
      {member.description ? <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-neutral-500">{member.description}</p> : null}
      {member.website ? (
        <a href={member.website} target="_blank" rel="noopener noreferrer" className="mt-auto pt-3 text-xs font-semibold text-[#174f43] hover:underline">
          Voir le profil
        </a>
      ) : (
        <span className="mt-auto pt-3 text-xs text-neutral-400">Profil non lié</span>
      )}
    </article>
  );

  const SpecColumn = ({
    title,
    subtitle,
    rows,
  }: {
    title: string;
    subtitle: string;
    rows: { label: string; value: string }[];
  }) => (
    <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-gradient-to-b from-white to-[#f7faf8] shadow-[0_1px_0_rgba(23,79,67,0.04)]">
      <div className="border-b border-neutral-100 bg-[#eef5f1]/80 px-4 py-3">
        <h3 className="text-sm font-semibold tracking-tight text-[#174f43]">{title}</h3>
        <p className="mt-0.5 text-[11px] text-neutral-500">{subtitle}</p>
      </div>
      {rows.length ? (
        <dl className="divide-y divide-neutral-100/90">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col gap-1.5 px-4 py-3.5">
              <dt className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-400">{row.label}</dt>
              <dd className="text-sm font-semibold leading-relaxed text-neutral-800">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="px-4 py-6 text-sm text-neutral-500">Aucune donnée renseignée.</p>
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-[#f4f6f3] pb-10 text-neutral-900">
      <div className="mx-auto w-full max-w-6xl px-3 pt-3 sm:px-4">
        <nav className="mb-3 flex flex-wrap items-center gap-1 text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-800">Accueil</Link>
          <span>/</span>
          <Link to="/explore" className="hover:text-neutral-800">Projets</Link>
          <span>/</span>
          <span className="truncate text-neutral-800">{project.title}</span>
        </nav>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div
            className={
              gallery.length > 1
                ? "grid gap-2 bg-neutral-100 sm:grid-cols-[minmax(0,1fr)_6.5rem]"
                : "bg-neutral-100"
            }
          >
            <button
              type="button"
              onClick={() => gallery.length && openLightbox(activeImage)}
              className="group relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 text-left sm:aspect-[21/9]"
            >
              {mainImage ? (
                <img
                  src={mainImage}
                  alt=""
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
              ) : null}
              {project.subtype || project.category ? (
                <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold text-neutral-800">
                  {project.subtype || categoryLabel(project.category)}
                </span>
              ) : null}
              {gallery.length ? (
                <>
                  <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">
                    {activeImage + 1}/{gallery.length}
                  </span>
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-black/65 px-2 py-1 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    <ZoomIn className="h-3.5 w-3.5" />
                    Agrandir
                  </span>
                </>
              ) : null}
            </button>
            {gallery.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto p-2 sm:flex-col sm:overflow-y-auto sm:overflow-x-hidden">
                {thumbs.map((item, index) => (
                  <button
                    key={`${item.url}-${index}`}
                    type="button"
                    onClick={() => (index === 3 && gallery.length > 4 ? openLightbox(index) : setActiveImage(index))}
                    onDoubleClick={() => openLightbox(index)}
                    className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border sm:h-auto sm:w-full sm:aspect-[4/3] ${
                      activeImage === index ? "border-[#174f43] ring-1 ring-[#174f43]" : "border-neutral-200"
                    }`}
                  >
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                    {index === 3 && gallery.length > 4 ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-semibold text-white">
                        +{gallery.length - 3}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="col-start-1 grid gap-6 bg-white p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{project.title}</h1>
                  <span className="rounded-full bg-[#e7f5ee] px-2.5 py-1 text-[11px] font-semibold text-[#174f43]">
                    {statusLabel(project.status)}
                  </span>
                </div>
                {place ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-neutral-500">
                    <MapPin className="h-4 w-4" />
                    {place}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.category ? (
                    <span className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700">
                      {categoryLabel(project.category)}
                    </span>
                  ) : null}
                  {project.subtype ? (
                    <span className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700">
                      {project.subtype}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-neutral-200 px-3 py-2.5">
                    <p className="text-[11px] text-neutral-500">Surface construite</p>
                    <p className="mt-0.5 text-sm font-semibold">{builtArea ? `${Number(builtArea).toLocaleString("fr-FR")} m²` : "—"}</p>
                  </div>
                  <div className="rounded-xl border border-neutral-200 px-3 py-2.5">
                    <p className="text-[11px] text-neutral-500">Promoteur</p>
                    <p className="mt-0.5 truncate text-sm font-semibold">{project.promoter?.name || project.partners[0]?.name || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-neutral-200 px-3 py-2.5">
                    <p className="text-[11px] text-neutral-500">Prix à partir de</p>
                    <p className="mt-0.5 text-sm font-semibold">{priceOnRequest ? "Sur demande" : priceFrom || "—"}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-neutral-200 bg-[#f8faf8] p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">État d'avancement</p>
                    <ProjectCommercialTag commercialStatus={project.commercialStatus} />
                  </div>
                  <div className="mt-3 px-0.5">
                    <ProjectMilestoneTrack project={project} size="md" />
                  </div>
                </div>
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

          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <div className="min-w-0">
              {tab === "Aperçu" ? (
                <div className="space-y-8">
                  <section>
                    <h2 className="text-base font-semibold">À propos du projet</h2>
                    {project.description ? (
                      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-700">{project.description}</p>
                    ) : (
                      <p className="mt-3 text-sm text-neutral-500">Aucune description.</p>
                    )}
                  </section>

                  <section>
                    <h2 className="text-base font-semibold">Informations clés</h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {[
                        { label: "Catégorie", value: categoryLabel(project.category) },
                        { label: "Sous-type", value: project.subtype },
                        { label: "Surface construite", value: builtArea ? `${Number(builtArea).toLocaleString("fr-FR")} m²` : "" },
                        { label: "Nombre d'étages", value: field(project, "floors") },
                        { label: "Statut", value: statusLabel(project.status) },
                        { label: "Commercialisation", value: commercialStatusLabel(project.commercialStatus) },
                        { label: "Région", value: project.region },
                        { label: "Ville", value: project.city },
                      ]
                        .filter((item) => item.value)
                        .map((item) => (
                          <div key={item.label} className="rounded-xl border border-neutral-200 bg-[#f8faf8] px-4 py-3">
                            <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-400">{item.label}</p>
                            <p className="mt-1.5 text-sm font-semibold leading-snug text-neutral-800">{item.value}</p>
                          </div>
                        ))}
                    </div>
                  </section>
                </div>
              ) : null}

              {tab === "Équipe du projet" ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="inline-flex items-center gap-2 text-base font-semibold">
                      <Users className="h-4 w-4 text-[#174f43]" />
                      Équipe du projet
                    </h2>
                    <span className="rounded-full bg-[#e8f0ed] px-2.5 py-1 text-[11px] font-semibold text-[#174f43]">
                      {Math.min(filledBuckets, coreBuckets)}/{coreBuckets} catégories identifiées
                    </span>
                  </div>
                  {teamBuckets.map((bucket) => (
                    <section key={bucket.id} className="min-w-0">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-neutral-700">{bucket.label}</h3>
                        {bucket.members.length > 1 ? (
                          <span className="text-[11px] text-neutral-400">{bucket.members.length} · glisser →</span>
                        ) : null}
                      </div>
                      {bucket.members.length ? (
                        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
                          {bucket.members.map((member) => (
                            <div key={member.id} className="w-[15.5rem] shrink-0">
                              <MemberCard member={member} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-xl border border-dashed border-neutral-200 px-3 py-4 text-sm text-neutral-500">
                          Aucun identifié
                        </p>
                      )}
                    </section>
                  ))}
                </div>
              ) : null}

              {tab === "Spécifications" ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-semibold">Spécifications</h2>
                    <p className="mt-1 text-sm text-neutral-500">Caractéristiques techniques et commerciales du programme.</p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <SpecColumn title="Programme & usage" subtitle="Emprise et morphologie" rows={programmeRows} />
                    <SpecColumn title="Typologies & équipements" subtitle="Offre et amenités" rows={typologyRows} />
                    <SpecColumn title="Commercial" subtitle="Prix et disponibilités" rows={commercialRows} />
                  </div>
                </div>
              ) : null}

              {tab === "Médias" ? (
                gallery.length ? (
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h2 className="text-base font-semibold">Médias</h2>
                      <span className="text-xs text-neutral-500">{gallery.length} fichiers</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {gallery.map((item, index) => (
                        <button
                          key={`${item.url}-${index}`}
                          type="button"
                          onClick={() => openLightbox(index)}
                          className="group overflow-hidden rounded-xl bg-neutral-100 text-left"
                        >
                          <span className="relative block">
                            <img src={item.url} alt={item.caption || ""} className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]" />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
                              <ZoomIn className="h-5 w-5 text-white" />
                            </span>
                          </span>
                          {item.category ? <p className="px-2 py-1.5 text-[11px] text-neutral-500">{item.category}</p> : null}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">Aucun média pour le moment.</p>
                )
              ) : null}

              {tab === "Documents" ? (
                publicDocs.filter((doc) => doc.title).length ? (
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h2 className="text-base font-semibold">Documents</h2>
                      <span className="text-xs text-neutral-500">{publicDocs.length} fichiers</span>
                    </div>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {publicDocs.filter((doc) => doc.title).map((doc) => (
                        <li key={doc.id} className="flex items-center gap-3 rounded-xl border border-neutral-200 px-3 py-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e8f0ed] text-[#174f43]">
                            <FileText className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{doc.title}</p>
                            <p className="truncate text-xs text-neutral-500">{doc.type}</p>
                          </div>
                          {doc.url ? (
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-[#174f43]">
                              <Download className="h-4 w-4" />
                            </a>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">Aucun document public pour le moment.</p>
                )
              ) : null}

              {tab === "Opportunités" ? (
                <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-12 text-center">
                  <Trophy className="mx-auto h-10 w-10 text-[#174f43]" />
                  <h2 className="mt-4 text-base font-semibold">Aucune opportunité publique actuellement.</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
                    Soyez notifié lorsque des appels d'offres, partenariats ou lots liés à ce projet seront publiés.
                  </p>
                  <button
                    type="button"
                    onClick={() => toast({ title: "Alerte enregistrée localement" })}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#174f43] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <Bell className="h-4 w-4" />
                    Être notifié des opportunités
                  </button>
                </div>
              ) : null}
            </div>

            <aside className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <div className="flex aspect-[4/3] items-center justify-center bg-[#e8f0ed] text-[#174f43]">
                  <MapPin className="h-8 w-8" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold">{project.city || "Localisation"}</p>
                  <p className="text-xs text-neutral-500">{[project.neighborhood, project.region].filter(Boolean).join(" · ") || "Maroc"}</p>
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#174f43]">
                    Voir sur la carte
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              <p className="px-1 text-[11px] leading-relaxed text-neutral-400">
                Informations à titre indicatif, non vérifiées par Sifarah.
                {project.provenance?.dateConsolidation
                  ? ` Dernière mise à jour : ${formatDate(project.provenance.dateConsolidation)}.`
                  : ""}
                {project.provenance?.niveau ? ` Niveau de vérification : ${project.provenance.niveau}.` : ""}
              </p>
            </aside>
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

      {lightboxOpen && gallery.length ? (
        <div className="fixed inset-0 z-[80] flex flex-col bg-black/92 text-white" role="dialog" aria-modal="true" aria-label="Galerie">
          <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-4 sm:px-6">
            <p className="text-sm font-medium text-white/80">
              {activeImage + 1} / {gallery.length}
              {gallery[activeImage]?.category ? ` · ${gallery[activeImage].category}` : ""}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Zoom arrière"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="min-w-[3rem] text-center text-xs text-white/70">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((value) => Math.min(3, Number((value + 0.25).toFixed(2))))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Zoom avant"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={closeLightbox}
                className="ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg hover:bg-neutral-100"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-12 pb-2">
            {gallery.length > 1 ? (
              <>
                <button type="button" onClick={showPrev} className="absolute left-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Image précédente">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button type="button" onClick={showNext} className="absolute right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Image suivante">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            ) : null}
            <div className="flex h-full max-h-full w-full items-center justify-center overflow-auto">
              <img
                src={gallery[activeImage]?.url}
                alt={gallery[activeImage]?.caption || ""}
                className="max-h-full max-w-full object-contain transition-transform duration-150"
                style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
              />
            </div>
          </div>

          {gallery.length > 1 ? (
            <div className="mx-auto mb-8 w-full max-w-md px-4 sm:mb-10">
              <div className="flex gap-1.5 overflow-x-auto rounded-xl bg-black/35 px-2.5 py-2.5 [scrollbar-width:thin]">
                {gallery.map((item, index) => (
                  <button
                    key={`lb-${item.url}-${index}`}
                    type="button"
                    onClick={() => {
                      setActiveImage(index);
                      setZoom(1);
                    }}
                    className={`h-11 w-14 shrink-0 overflow-hidden rounded-md border ${
                      index === activeImage ? "border-white" : "border-transparent opacity-55 hover:opacity-100"
                    }`}
                  >
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default ProjectKerixPreview;
