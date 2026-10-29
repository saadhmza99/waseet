import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";

export const ConfirmDeleteDialog = ({
  open,
  title,
  message,
  busy = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[240] flex items-end justify-center bg-[#0e2c26]/55 p-3 sm:items-center sm:p-6"
      onClick={() => {
        if (!busy) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        className="w-full max-w-[22rem] overflow-hidden rounded-3xl bg-[#174f43] text-white shadow-[0_24px_60px_rgba(14,44,38,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-6 pb-2 pt-7 text-center">
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#174f43]">
            <Trash2 className="h-6 w-6" />
          </span>
          <h2 id="confirm-delete-title" className="mt-4 text-xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/80">{message}</p>
        </div>
        <div className="grid gap-2 px-5 py-5">
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="h-12 rounded-xl bg-white text-sm font-semibold text-[#174f43] hover:bg-white/90 disabled:opacity-60"
          >
            {busy ? "Suppression…" : "Supprimer"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="h-12 rounded-xl text-sm font-semibold text-white/90 hover:bg-white/10 disabled:opacity-60"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
