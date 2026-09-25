import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { moderationService } from "@/services/moderationService";
import { getDefaultAvatar } from "@/lib/avatar";
import { profileHandle } from "@/lib/profileHandle";
import { toast } from "@/components/ui/use-toast";
import BlockMemberModal from "@/components/BlockMemberModal";

type BlockedRow = {
  blockedId: string;
  blockedAt: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  profileType?: string | null;
};

const BlockedAccounts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState<BlockedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingUnblock, setPendingUnblock] = useState<BlockedRow | null>(null);
  const [unblocking, setUnblocking] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      setRows(await moderationService.getBlockedAccounts(user.id));
    } catch (error) {
      console.error("Error loading blocked accounts:", error);
      toast({ title: "Erreur", description: "Impossible de charger les comptes bloqués." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [user?.id]);

  const confirmUnblock = async () => {
    if (!user || !pendingUnblock) return;
    setUnblocking(true);
    try {
      await moderationService.unblockUser(user.id, pendingUnblock.blockedId);
      setRows((prev) => prev.filter((row) => row.blockedId !== pendingUnblock.blockedId));
      setPendingUnblock(null);
      toast({ title: "Compte débloqué" });
    } catch (error) {
      console.error("Error unblocking account:", error);
      toast({ title: "Erreur", description: "Impossible de débloquer ce compte." });
    } finally {
      setUnblocking(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="sticky top-[57px] sm:top-[60px] z-40 flex items-center gap-3 border-b border-border bg-background px-4 py-3 sm:px-6 sm:py-4 md:px-8">
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="text-card-foreground transition-opacity hover:opacity-70"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <h1 className="text-lg font-semibold text-card-foreground sm:text-xl md:text-2xl">
          Manage blocked accounts
        </h1>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Chargement...</p>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Aucun compte bloqué.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {rows.map((row) => (
              <li key={row.blockedId} className="flex items-center gap-3 px-4 py-3">
                <img
                  src={row.avatarUrl || getDefaultAvatar(row.profileType || undefined)}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-card-foreground">{profileHandle(row.username)}</p>
                  <p className="text-xs text-muted-foreground">
                    Bloqué {formatDistanceToNow(new Date(row.blockedAt), { addSuffix: true, locale: fr })}
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setPendingUnblock(row)}>
                  Unblock
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <BlockMemberModal
        isOpen={Boolean(pendingUnblock)}
        onClose={() => setPendingUnblock(null)}
        title="Unblock member"
        message="Are you sure you want to unblock this account? You can't block it again until after 48 hours."
        confirmLabel="Unblock"
        submittingLabel="Unblocking…"
        submitting={unblocking}
        onConfirm={confirmUnblock}
      />
    </div>
  );
};

export default BlockedAccounts;
