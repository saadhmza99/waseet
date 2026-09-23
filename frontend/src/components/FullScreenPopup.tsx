import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface FullScreenPopupProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const FullScreenPopup = ({ open, onClose, children }: FullScreenPopupProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="relative overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
        style={{ width: "min(1400px, 96vw)", height: "min(860px, 90vh)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 rounded-full bg-background/90 p-1.5 text-foreground shadow hover:bg-muted"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="h-full w-full overflow-hidden">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default FullScreenPopup;
