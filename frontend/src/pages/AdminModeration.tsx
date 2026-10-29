import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { moderationService, ReportStatus } from "@/services/moderationService";
import { devisService } from "@/services/devisService";
import { contactService, CONTACT_TOPIC_LABELS, type ContactTopic } from "@/services/contactService";
import { partnerRequestService } from "@/services/partnerRequestService";
import { activityService, type ActivityEventRow } from "@/services/activityService";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const statuses: ReportStatus[] = ["pending", "reviewing", "resolved", "dismissed"];

type InboxTab = "reports" | "devis" | "contact" | "partners" | "activity";
type ContactFilter = "all" | ContactTopic;
type ActivityStatusFilter = "all" | "attempt" | "success" | "failure";
type ActivityActionFilter =
  | "all"
  | "login"
  | "devis"
  | "service"
  | "product"
  | "project"
  | "failure_only";

const ACTION_LABELS: Record<string, string> = {
  login: "Connexion",
  devis_click: "Clic devis",
  devis_submit: "Envoi devis",
  service_create: "Création service",
  service_update: "Modif. service",
  product_create: "Création produit",
  product_update: "Modif. produit",
  project_create: "Création projet",
  project_update: "Modif. projet",
};

const STATUS_STYLE: Record<string, string> = {
  attempt: "bg-amber-100 text-amber-900",
  success: "bg-emerald-100 text-emerald-900",
  failure: "bg-red-100 text-red-900",
};

const CONTACT_FILTERS: Array<{ id: ContactFilter; label: string }> = [
  { id: "all", label: "Tous" },
  { id: "partnership", label: "Partenariat" },
  { id: "sponsorship", label: "Sponsoring" },
  { id: "visibility", label: "Plan de visibilité" },
  { id: "problem", label: "Problème" },
];

const formatWhen = (value?: string | null) =>
  value ? new Date(value).toLocaleString("fr-MA") : "—";

const profileLabel = (row?: { username?: string | null; full_name?: string | null } | null, fallback = "—") => {
  if (!row) return fallback;
  return (row.full_name || row.username || fallback).trim() || fallback;
};

const AdminModeration = () => {
  const { user } = useAuth();
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<InboxTab>("activity");
  const [contactFilter, setContactFilter] = useState<ContactFilter>("all");
  const [activityStatus, setActivityStatus] = useState<ActivityStatusFilter>("all");
  const [activityAction, setActivityAction] = useState<ActivityActionFilter>("all");

  const [postReports, setPostReports] = useState<any[]>([]);
  const [reelReports, setReelReports] = useState<any[]>([]);
  const [reportType, setReportType] = useState<"posts" | "reels">("posts");
  const [editingNoteById, setEditingNoteById] = useState<Record<string, string>>({});

  const [devisRows, setDevisRows] = useState<any[]>([]);
  const [contactRows, setContactRows] = useState<any[]>([]);
  const [partnerRows, setPartnerRows] = useState<any[]>([]);
  const [activityRows, setActivityRows] = useState<ActivityEventRow[]>([]);

  const loadInbox = async () => {
    if (!user) return;
    try {
      const moderator = await moderationService.isModerator(user.id);
      setIsModerator(moderator);
      if (!moderator) return;

      const [postData, reelData, devisData, contactData, partnerData, activityData] = await Promise.all([
        moderationService.getPostReports(),
        moderationService.getReelReports(),
        devisService.listForAdmin(),
        contactService.listForAdmin("all"),
        partnerRequestService.listForAdmin(),
        activityService.listForAdmin(),
      ]);

      setPostReports(postData || []);
      setReelReports(reelData || []);
      setDevisRows(devisData || []);
      setContactRows(contactData || []);
      setPartnerRows(partnerData || []);
      setActivityRows(activityData || []);

      const notes: Record<string, string> = {};
      [...(postData || []), ...(reelData || [])].forEach((report) => {
        notes[report.id] = report.resolution_note || "";
      });
      setEditingNoteById(notes);
    } catch (error) {
      console.error("Error loading moderation inbox:", error);
      toast({ title: "Erreur", description: "Impossible de charger la boîte de modération." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInbox();
  }, [user?.id]);

  const updateStatus = async (reportId: string, status: ReportStatus, type: "posts" | "reels") => {
    if (!user) return;
    try {
      if (type === "posts") {
        await moderationService.updatePostReportStatus(reportId, user.id, status, editingNoteById[reportId]);
        setPostReports((prev) =>
          prev.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  status,
                  reviewed_by: user.id,
                  reviewed_at: new Date().toISOString(),
                  resolution_note: editingNoteById[reportId] || null,
                }
              : report,
          ),
        );
      } else {
        await moderationService.updateReelReportStatus(reportId, user.id, status, editingNoteById[reportId]);
        setReelReports((prev) =>
          prev.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  status,
                  reviewed_by: user.id,
                  reviewed_at: new Date().toISOString(),
                  resolution_note: editingNoteById[reportId] || null,
                }
              : report,
          ),
        );
      }
      toast({ title: "Mis à jour", description: "Le statut du signalement a été mis à jour." });
    } catch (error) {
      console.error("Error updating report status:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour ce signalement." });
    }
  };

  const filteredContacts = useMemo(
    () => (contactFilter === "all" ? contactRows : contactRows.filter((row) => row.topic === contactFilter)),
    [contactRows, contactFilter],
  );

  const filteredActivity = useMemo(() => {
    return activityRows.filter((row) => {
      if (activityAction === "failure_only") return row.status === "failure";
      if (activityStatus !== "all" && row.status !== activityStatus) return false;
      if (activityAction === "all") return true;
      if (activityAction === "login") return row.action === "login";
      if (activityAction === "devis") return row.action.startsWith("devis_");
      if (activityAction === "service") return row.action.startsWith("service_");
      if (activityAction === "product") return row.action.startsWith("product_");
      if (activityAction === "project") return row.action.startsWith("project_");
      return true;
    });
  }, [activityRows, activityStatus, activityAction]);

  const failureCount = useMemo(
    () => activityRows.filter((row) => row.status === "failure").length,
    [activityRows],
  );

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Chargement de la boîte admin...</div>;
  }

  if (!isModerator) {
    return <div className="py-8 text-center text-muted-foreground">Accès modération non autorisé.</div>;
  }

  const reports = reportType === "posts" ? postReports : reelReports;
  const getReportTitle = (report: any) =>
    reportType === "posts" ? report.posts?.title || "Publication sans titre" : report.reels?.title || "Vidéo sans titre";
  const getReportDescription = (report: any) =>
    reportType === "posts"
      ? report.posts?.description || "Sans description"
      : report.reels?.description || "Sans description";

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 pb-20 sm:px-4 md:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground sm:text-3xl">Boîte admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Activité (tentatives / erreurs), devis, contact, partenaires et signalements.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/analytics">Analytics visiteurs</Link>
          </Button>
          <Button type="button" variant="outline" onClick={() => void loadInbox()}>
            Actualiser
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            { id: "activity" as const, label: `Activité (${activityRows.length}${failureCount ? ` · ${failureCount} erreurs` : ""})` },
            { id: "contact" as const, label: `Contact (${contactRows.length})` },
            { id: "devis" as const, label: `Devis (${devisRows.length})` },
            { id: "partners" as const, label: `Partenaires feed (${partnerRows.length})` },
            { id: "reports" as const, label: `Signalements (${postReports.length + reelReports.length})` },
          ] as const
        ).map((item) => (
          <Button key={item.id} variant={tab === item.id ? "default" : "outline"} onClick={() => setTab(item.id)}>
            {item.label}
          </Button>
        ))}
      </div>

      {tab === "activity" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "all" as const, label: "Tout" },
                { id: "failure_only" as const, label: "Échecs seulement" },
                { id: "login" as const, label: "Connexion" },
                { id: "devis" as const, label: "Devis" },
                { id: "service" as const, label: "Services" },
                { id: "product" as const, label: "Produits" },
                { id: "project" as const, label: "Projets" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivityAction(item.id)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                  activityAction === item.id
                    ? "bg-[#174f43] text-white"
                    : "border border-neutral-200 bg-white text-neutral-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {activityAction !== "failure_only" ? (
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "all" as const, label: "Tous statuts" },
                  { id: "attempt" as const, label: "Tentatives" },
                  { id: "success" as const, label: "Succès" },
                  { id: "failure" as const, label: "Échecs" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivityStatus(item.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    activityStatus === item.id
                      ? "bg-neutral-800 text-white"
                      : "border border-neutral-200 bg-white text-neutral-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}

          {!filteredActivity.length ? (
            <p className="py-8 text-center text-muted-foreground">
              Aucune activité pour ce filtre. Les événements apparaissent dès qu’un utilisateur tente une action.
            </p>
          ) : (
            filteredActivity.map((row) => (
              <article key={row.id} className="rounded-lg border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                          STATUS_STYLE[row.status] || "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {row.status}
                      </span>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#174f43]">
                        {ACTION_LABELS[row.action] || row.action}
                      </p>
                    </div>
                    <h2 className="mt-1 text-base font-semibold text-card-foreground">
                      {row.message || ACTION_LABELS[row.action] || row.action}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Qui : {row.actor_label || "anonyme"} · {row.actor_kind}
                      {row.actor_id ? ` · id ${row.actor_id.slice(0, 8)}` : ""}
                    </p>
                    {(row.target_label || row.target_type || row.target_id) && (
                      <p className="text-sm text-muted-foreground">
                        Cible : {[row.target_type, row.target_label, row.target_id ? `#${row.target_id.slice(0, 8)}` : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatWhen(row.created_at)}</span>
                </div>
                {row.error_message ? (
                  <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                    Erreur : {row.error_message}
                  </p>
                ) : null}
                {row.path ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Page : <code>{row.path}</code>
                  </p>
                ) : null}
              </article>
            ))
          )}
        </div>
      ) : null}

      {tab === "contact" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {CONTACT_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setContactFilter(item.id)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                  contactFilter === item.id
                    ? "bg-[#174f43] text-white"
                    : "border border-neutral-200 bg-white text-neutral-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {!filteredContacts.length ? (
            <p className="py-8 text-center text-muted-foreground">Aucun message contact pour ce filtre.</p>
          ) : (
            filteredContacts.map((row) => (
              <article key={row.id} className="rounded-lg border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#174f43]">
                      {CONTACT_TOPIC_LABELS[row.topic as ContactTopic] || row.topic}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-card-foreground">{row.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {row.email}
                      {row.phone ? ` · ${row.phone}` : ""}
                      {row.organization ? ` · ${row.organization}` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatWhen(row.created_at)}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-card-foreground">{row.message}</p>
                {row.page_url ? (
                  <p className="mt-2 text-xs text-muted-foreground">Page signalée : {row.page_url}</p>
                ) : null}
              </article>
            ))
          )}
        </div>
      ) : null}

      {tab === "devis" ? (
        <div className="space-y-4">
          {!devisRows.length ? (
            <p className="py-8 text-center text-muted-foreground">Aucune demande de devis pour le moment.</p>
          ) : (
            devisRows.map((row) => {
              const seller = Array.isArray(row.seller) ? row.seller[0] : row.seller;
              const fromAccount = row.name || "Demandeur";
              const toAccount = profileLabel(seller, row.seller_name || "Sans destinataire (devis ouvert)");
              return (
                <article key={row.id} className="rounded-lg border border-border bg-card p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#174f43]">
                        {row.project_type_label || "Devis"} · {row.source || "open"}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-card-foreground">
                        De {fromAccount} → {toAccount}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {row.name} · {row.phone}
                        {row.email ? ` · ${row.email}` : ""} · {row.city}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatWhen(row.created_at)}</span>
                  </div>

                  <div className="mt-3 rounded-md bg-muted/40 px-3 py-2 text-sm">
                    <p>
                      <span className="font-medium">Clic devis :</span>{" "}
                      {row.source_label || "—"}
                      {row.source_path ? (
                        <>
                          {" "}
                          · page <code className="text-xs">{row.source_path}</code>
                        </>
                      ) : null}
                    </p>
                    {row.service_id ? <p className="mt-1 text-xs text-muted-foreground">Service id : {row.service_id}</p> : null}
                    {row.product_id ? <p className="mt-1 text-xs text-muted-foreground">Produit id : {row.product_id}</p> : null}
                  </div>

                  {row.description ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-card-foreground">{row.description}</p>
                  ) : null}
                  {row.budget ? <p className="mt-2 text-xs text-muted-foreground">Budget : {row.budget}</p> : null}
                  {row.reply ? (
                    <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                      Réponse pro : {row.reply}
                    </p>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      ) : null}

      {tab === "partners" ? (
        <div className="space-y-4">
          {!partnerRows.length ? (
            <p className="py-8 text-center text-muted-foreground">Aucune demande partenaire (CTA feed) pour le moment.</p>
          ) : (
            partnerRows.map((row) => (
              <article key={row.id} className="rounded-lg border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#174f43]">Demande partenaire</p>
                    <h2 className="mt-1 text-lg font-semibold text-card-foreground">{row.enterprise_name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {row.professional_name} · {row.email} · {row.phone} · {row.location}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatWhen(row.created_at)}</span>
                </div>
                {row.website ? <p className="mt-2 text-sm text-[#174f43]">{row.website}</p> : null}
              </article>
            ))
          )}
        </div>
      ) : null}

      {tab === "reports" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant={reportType === "posts" ? "default" : "outline"} onClick={() => setReportType("posts")}>
              Publications ({postReports.length})
            </Button>
            <Button variant={reportType === "reels" ? "default" : "outline"} onClick={() => setReportType("reels")}>
              Vidéos ({reelReports.length})
            </Button>
          </div>

          {!reports.length ? (
            <p className="py-8 text-center text-muted-foreground">Aucun signalement pour le moment.</p>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="rounded-lg border border-border bg-card p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-card-foreground">{getReportTitle(report)}</p>
                    <p className="text-sm text-muted-foreground">
                      Signalé par @{report.reporter?.username || "utilisateur"} - raison: {report.reason}
                    </p>
                  </div>
                  <span className="rounded bg-secondary px-2 py-1 text-xs font-semibold uppercase text-secondary-foreground">
                    {report.status}
                  </span>
                </div>

                <p className="mb-3 line-clamp-3 text-sm text-card-foreground">{getReportDescription(report)}</p>

                <label className="mb-1 block text-sm font-medium text-card-foreground">Note de résolution</label>
                <textarea
                  value={editingNoteById[report.id] || ""}
                  onChange={(e) =>
                    setEditingNoteById((prev) => ({
                      ...prev,
                      [report.id]: e.target.value,
                    }))
                  }
                  rows={3}
                  className="mb-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Ajouter une note interne de modération..."
                />

                <div className="flex flex-wrap items-center gap-2">
                  {statuses.map((status) => (
                    <Button
                      key={status}
                      variant={report.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateStatus(report.id, status, reportType)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
};

export default AdminModeration;
