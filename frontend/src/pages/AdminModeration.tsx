import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { moderationService, ReportStatus } from "@/services/moderationService";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const statuses: ReportStatus[] = ["pending", "reviewing", "resolved", "dismissed"];

const AdminModeration = () => {
  const { user } = useAuth();
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [editingNoteById, setEditingNoteById] = useState<Record<string, string>>({});

  const loadReports = async () => {
    if (!user) return;
    try {
      const [moderator, data] = await Promise.all([
        moderationService.isModerator(user.id),
        moderationService.getPostReports(),
      ]);
      setIsModerator(moderator);
      setReports(data);
      const notes: Record<string, string> = {};
      data.forEach((report) => {
        notes[report.id] = report.resolution_note || "";
      });
      setEditingNoteById(notes);
    } catch (error) {
      console.error("Error loading moderation data:", error);
      toast({ title: "Erreur", description: "Impossible de charger les signalements." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [user?.id]);

  const updateStatus = async (reportId: string, status: ReportStatus) => {
    if (!user) return;
    try {
      await moderationService.updatePostReportStatus(
        reportId,
        user.id,
        status,
        editingNoteById[reportId]
      );
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status,
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
                resolution_note: editingNoteById[reportId] || null,
              }
            : report
        )
      );
      toast({ title: "Mis à jour", description: "Le statut du signalement a été mis à jour." });
    } catch (error) {
      console.error("Error updating report status:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour ce signalement." });
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Chargement des signalements...</div>;
  }

  if (!isModerator) {
    return <div className="py-8 text-center text-muted-foreground">Accès modération non autorisé.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 pb-20">
      <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-6">Modération des signalements</h1>

      {reports.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Aucun signalement pour le moment.</div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border border-border rounded-lg bg-card p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-card-foreground">{report.posts?.title || "Post sans titre"}</p>
                  <p className="text-sm text-muted-foreground">
                    Signalé par @{report.reporter?.username || "utilisateur"} - raison: {report.reason}
                  </p>
                </div>
                <span className="text-xs uppercase font-semibold px-2 py-1 rounded bg-secondary text-secondary-foreground">
                  {report.status}
                </span>
              </div>

              <p className="text-sm text-card-foreground mb-3 line-clamp-3">{report.posts?.description || "Sans description"}</p>

              <label className="text-sm font-medium text-card-foreground mb-1 block">Note de résolution</label>
              <textarea
                value={editingNoteById[report.id] || ""}
                onChange={(e) =>
                  setEditingNoteById((prev) => ({
                    ...prev,
                    [report.id]: e.target.value,
                  }))
                }
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm mb-3"
                placeholder="Ajouter une note interne de modération..."
              />

              <div className="flex flex-wrap items-center gap-2">
                {statuses.map((status) => (
                  <Button
                    key={status}
                    variant={report.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateStatus(report.id, status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminModeration;
