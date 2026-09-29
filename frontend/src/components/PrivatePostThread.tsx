import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Send, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getDefaultAvatar } from "@/lib/avatar";
import VerifiedBadge from "@/components/VerifiedBadge";
import { toast } from "@/components/ui/use-toast";
import { toWhatsAppNumber } from "@/lib/propertyListing";
import { privateThreadService, type PrivateThread } from "@/services/privateThreadService";

interface PrivatePostThreadProps {
  postId?: string;
  businessName: string;
  businessAvatar?: string | null;
  businessPhone?: string | null;
  businessLine?: string;
  isVerified?: boolean;
  description?: string;
  image?: string | null;
  viewerId?: string | null;
  isOwner?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const whatsAppHref = (phone?: string | null) => {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length < 6) return null;
  return `https://wa.me/${toWhatsAppNumber(phone || "")}`;
};

const COMMENT_MAX = 700;
const COMMENT_COUNTER_FROM = 620;

const timeAgo = (value?: string | null) => {
  if (!value) return "";
  return formatDistanceToNow(new Date(value), { addSuffix: true, locale: fr });
};

const CommentRow = ({
  avatar,
  name,
  verified = false,
  text,
  when,
}: {
  avatar: string;
  name: string;
  verified?: boolean;
  text: string;
  when: string;
}) => (
  <div className="flex gap-3 border-b border-border py-3 last:border-b-0">
    <img src={avatar || getDefaultAvatar("individual")} alt="" className="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover sm:h-10 sm:w-10" />
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex items-baseline gap-2">
        <span className="inline-flex min-w-0 items-center gap-1 text-sm font-semibold text-card-foreground sm:text-base">
          <span className="truncate">{name}</span>
          <VerifiedBadge verified={verified} className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        </span>
        {when ? <span className="text-xs text-muted-foreground sm:text-sm">{when}</span> : null}
      </div>
      <p className="text-sm leading-relaxed text-card-foreground sm:text-base">{text}</p>
    </div>
  </div>
);

const PrivatePostThread = ({
  postId,
  businessName,
  businessAvatar,
  businessPhone,
  isVerified = false,
  viewerId,
  isOwner = false,
  open,
  onOpenChange,
}: PrivatePostThreadProps) => {
  const [threads, setThreads] = useState<PrivateThread[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const recipient = businessName.trim() || "cette entreprise";
  const businessPhoto = businessAvatar || getDefaultAvatar("individual");

  useEffect(() => {
    if (!postId || !viewerId) {
      setThreads([]);
      return;
    }
    let cancelled = false;
    privateThreadService
      .listForPost(postId)
      .then((rows) => {
        if (!cancelled) setThreads(rows);
      })
      .catch((error) => console.error("Error loading private thread:", error));
    return () => {
      cancelled = true;
    };
  }, [postId, viewerId, open]);

  const mine = threads.find((thread) => thread.sender_id === viewerId) || null;
  const unanswered = threads.filter((thread) => !thread.reply);
  const target = threads.find((thread) => thread.id === replyTo) || unanswered[0] || null;
  const canWrite = isOwner ? Boolean(target) : !mine;

  const submit = async () => {
    const text = draft.trim();
    if (!postId || !text || sending || !canWrite) return;
    setSending(true);
    try {
      if (isOwner && target) {
        const updated = await privateThreadService.reply(target.id, text);
        setThreads((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
        setReplyTo(null);
      } else {
        const created = await privateThreadService.send(postId, text);
        setThreads((prev) => [...prev, created]);
      }
      setDraft("");
    } catch (error) {
      console.error("Error sending private comment:", error);
      const message = error instanceof Error ? error.message : "";
      toast({
        title: "Erreur",
        description: message.includes("THREAD_EXISTS")
          ? "Vous avez déjà écrit sur ce post."
          : "Impossible d'envoyer le commentaire.",
      });
    } finally {
      setSending(false);
    }
  };

  const waitingOnAgency = Boolean(!isOwner && mine && !mine.reply);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[220] flex items-end">
      <style>{`@keyframes private-sheet-up { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="relative flex max-h-[70vh] w-full flex-col rounded-t-3xl bg-card shadow-2xl"
        style={{ animation: "private-sheet-up 280ms ease-out both" }}
      >
        <div className="flex items-center justify-between px-4 pb-2 pt-3">
          <span className="mx-auto h-1.5 w-10 rounded-full bg-neutral-300" />
          <button type="button" onClick={() => onOpenChange(false)} className="absolute right-3 top-3 text-muted-foreground" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
          <h2 className="text-xl font-bold text-card-foreground">Commentaires</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Visible uniquement par vous et l'entreprise.</p>

          <div className="mt-3">
            {threads.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Aucun commentaire pour le moment.</p>
            ) : (
              threads.map((thread) => {
                const continueHref = thread.reply ? whatsAppHref(isOwner ? thread.sender_phone : businessPhone) : null;
                const showWaiting = !isOwner && thread.sender_id === viewerId && !thread.reply;
                return (
                  <div key={thread.id}>
                    <CommentRow
                      avatar={getDefaultAvatar("individual")}
                      name={thread.sender_name || "Quelqu'un"}
                      text={thread.message}
                      when={timeAgo(thread.created_at)}
                    />
                    {thread.reply ? (
                      <div className="pl-11">
                        <CommentRow
                          avatar={businessPhoto}
                          name={recipient}
                          verified={isVerified}
                          text={thread.reply}
                          when={timeAgo(thread.replied_at)}
                        />
                        {continueHref ? (
                          <a
                            href={continueHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-2 inline-flex text-sm font-semibold text-[#174f43] underline-offset-2 hover:underline"
                          >
                            Continuer sur WhatsApp
                          </a>
                        ) : null}
                      </div>
                    ) : showWaiting ? (
                      <p className="mb-3 text-sm text-muted-foreground">Message envoyé. En attente de la réponse de {recipient}.</p>
                    ) : isOwner ? (
                      <button
                        type="button"
                        onClick={() => setReplyTo(thread.id)}
                        className="mb-2 ml-11 text-xs font-semibold text-muted-foreground hover:text-foreground"
                      >
                        Répondre
                      </button>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {canWrite && !waitingOnAgency ? (
          <div className="shrink-0 border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {draft.length >= COMMENT_COUNTER_FROM ? (
              <p className="mb-1 text-right text-[11px] leading-none text-muted-foreground">{draft.length}/{COMMENT_MAX}</p>
            ) : null}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draft}
                maxLength={COMMENT_MAX}
                onChange={(event) => setDraft(event.target.value.slice(0, COMMENT_MAX))}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void submit();
                }}
                placeholder={isOwner && target ? `Répondre à ${target.sender_name || "ce commentaire"}...` : "Ajouter un commentaire..."}
                className="flex-1 rounded-full bg-secondary px-4 py-2.5 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
                autoFocus
              />
              <button
                type="button"
                onClick={() => void submit()}
                disabled={!draft.trim() || sending}
                className="p-2 text-accent transition-opacity hover:opacity-70 disabled:opacity-50"
                aria-label="Envoyer"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
};

export default PrivatePostThread;
