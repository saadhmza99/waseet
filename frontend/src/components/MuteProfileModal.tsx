import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MuteScope } from "@/services/muteService";

type MuteProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  handle: string;
  submitting?: boolean;
  onConfirm: (scope: MuteScope) => void | Promise<void>;
};

const MuteProfileModal = ({
  isOpen,
  onClose,
  handle,
  submitting = false,
  onConfirm,
}: MuteProfileModalProps) => {
  const [scope, setScope] = useState<MuteScope>("both");

  useEffect(() => {
    if (!isOpen) {
      setScope("both");
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const optionClass = (value: MuteScope) =>
    `w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold ${
      scope === value ? "border-accent bg-accent/10 text-accent" : "border-border bg-card text-card-foreground"
    }`;

  return createPortal(
    <div className="fixed inset-0 z-[220] flex flex-col bg-background">
      <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center border-b border-border px-3 py-3">
        <span />
        <h1 className="truncate text-center text-base font-bold text-card-foreground sm:text-lg">Mute profile</h1>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-full text-foreground hover:bg-muted"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-2xl space-y-3">
          <p className="text-sm text-muted-foreground">Choose what to mute from {handle}.</p>
          <button type="button" className={optionClass("posts")} onClick={() => setScope("posts")}>
            Mute posts
          </button>
          <button type="button" className={optionClass("services")} onClick={() => setScope("services")}>
            Mute services
          </button>
          <button type="button" className={optionClass("both")} onClick={() => setScope("both")}>
            Mute posts and services
          </button>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <Button type="button" className="w-full" disabled={submitting} onClick={() => void onConfirm(scope)}>
            {submitting ? "Muting…" : "Mute"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MuteProfileModal;
