import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { DesktopRailFrame } from "@/components/FeedDesktopRail";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { toWhatsAppNumber } from "@/lib/propertyListing";
import { devisService } from "@/services/devisService";
import { privateThreadService } from "@/services/privateThreadService";

type InboxItem = {
  key: string;
  kind: "devis" | "message";
  id: string;
  who: string;
  phone: string | null;
  headline: string;
  body: string;
  reply: string | null;
  createdAt: string;
};

const timeAgo = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
};

const whatsAppHref = (phone: string | null, who: string) => {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length < 6) return null;
  const text = encodeURIComponent(`Bonjour ${who}, je vous réponds depuis Sifarah.`);
  return `https://wa.me/${toWhatsAppNumber(phone || "")}?text=${text}`;
};

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [replying, setReplying] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      devisService.listForSeller(user.id).catch(() => []),
      privateThreadService.listForBusiness(user.id).catch(() => []),
    ])
      .then(([devis, threads]) => {
        if (cancelled) return;
        const next: InboxItem[] = [
          ...devis.map((row) => ({
            key: `devis:${row.id}`,
            kind: "devis" as const,
            id: row.id,
            who: row.name || "Quelqu'un",
            phone: row.phone || null,
            headline: `${row.name || "Quelqu'un"} vous a envoyé une demande de devis`,
            body: [row.project_type_label, row.city, row.description].filter(Boolean).join(" · "),
            reply: row.reply || null,
            createdAt: row.created_at,
          })),
          ...threads.map((row) => ({
            key: `message:${row.id}`,
            kind: "message" as const,
            id: row.id,
            who: row.sender_name || "Quelqu'un",
            phone: row.sender_phone || null,
            headline: `${row.sender_name || "Quelqu'un"} vous a envoyé un message`,
            body: row.message,
            reply: row.reply || null,
            createdAt: row.created_at,
          })),
        ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        setItems(next);
      })
      .catch(() => {
        if (!cancelled) toast({ title: "Erreur", description: "Impossible de charger la boîte de réception." });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const selected = items.find((item) => item.key === selectedKey) || null;

  const sendReply = async () => {
    if (!selected || !draft.trim()) return;
    setSending(true);
    try {
      if (selected.kind === "devis") await devisService.reply(selected.id, draft);
      else await privateThreadService.reply(selected.id, draft);
      const answer = draft.trim();
      setItems((current) => current.map((item) => (item.key === selected.key ? { ...item, reply: answer } : item)));
      setDraft("");
      toast({ title: "Réponse envoyée" });
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible d'envoyer la réponse." });
    } finally {
      setSending(false);
    }
  };

  return (
    <DesktopRailFrame className="min-h-screen bg-white pb-20 lg:pb-0">
      <div className="mx-auto w-full max-w-2xl px-4 py-4 lg:px-0">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Boîte de réception</h1>
        {!user ? (
          <div className="mt-6 rounded-2xl border border-neutral-200 px-5 py-8 text-center">
            <p className="text-sm text-neutral-600">Connectez-vous pour voir qui vous a écrit.</p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-4 h-11 rounded-xl bg-[#174f43] px-5 text-sm font-semibold text-white"
            >
              Se connecter
            </button>
          </div>
        ) : loading ? (
          <p className="py-8 text-center text-neutral-500">Chargement...</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-neutral-500">Aucune demande pour le moment.</p>
        ) : (
          <div className="mt-4 divide-y divide-neutral-100 border-y border-neutral-100">
            {items.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setSelectedKey(item.key);
                  setDraft("");
                  setReplying(false);
                }}
                className={`block w-full px-1 py-4 text-left ${selectedKey === item.key ? "bg-[#174f43]/5" : ""}`}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-base font-semibold text-neutral-950">{item.who}</span>
                  <span className="shrink-0 text-xs text-neutral-400">{timeAgo(item.createdAt)}</span>
                </span>
                <span className="mt-1 block text-sm font-medium text-[#174f43]">
                  {item.kind === "devis" ? "Demande de devis" : "Message"}
                </span>
                <span className="mt-0.5 block truncate text-sm text-neutral-500">{item.body}</span>
              </button>
            ))}
          </div>
        )}

        {selected ? (
          <div className="mt-4 rounded-3xl border border-neutral-200 px-5 py-5">
            <p className="text-lg font-semibold text-neutral-950">{selected.headline}</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">{selected.body}</p>
            {selected.reply ? (
              <p className="mt-3 rounded-2xl bg-neutral-100 px-3 py-3 text-sm text-neutral-800">
                Votre réponse : {selected.reply}
              </p>
            ) : null}
            <p className="mt-4 text-sm font-semibold text-neutral-900">Que voulez-vous faire ?</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReplying(true)}
                className="h-11 rounded-xl bg-[#174f43] text-sm font-semibold text-white"
              >
                Répondre
              </button>
              {whatsAppHref(selected.phone, selected.who) ? (
                <a
                  href={whatsAppHref(selected.phone, selected.who) || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 items-center justify-center rounded-xl bg-neutral-200 text-sm font-semibold text-neutral-800"
                >
                  Continuer sur WhatsApp
                </a>
              ) : (
                <p className="flex h-11 items-center justify-center rounded-xl bg-neutral-100 px-3 text-center text-xs text-neutral-500">
                  Pas de numéro WhatsApp
                </p>
              )}
            </div>
            {replying ? (
              <>
                <label className="mt-3 block">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    rows={4}
                    maxLength={selected.kind === "message" ? 700 : 2000}
                    placeholder={`Répondre à ${selected.who}`}
                    className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-[#174f43]"
                  />
                </label>
                <button
                  type="button"
                  disabled={sending || !draft.trim()}
                  onClick={() => void sendReply()}
                  className="mt-2 h-11 rounded-xl border border-[#174f43] px-5 text-sm font-semibold text-[#174f43] disabled:opacity-50"
                >
                  {sending ? "Envoi…" : "Envoyer la réponse"}
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </DesktopRailFrame>
  );
};

export default Messages;
