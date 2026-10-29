import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { toast } from "@/components/ui/use-toast";

export const OwnerDeleteButton = ({
  onDelete,
  className,
  title = "Supprimer ?",
  message = "Cette fiche sera retirée de votre profil. Cette action est définitive.",
}: {
  onDelete: () => Promise<void>;
  className?: string;
  title?: string;
  message?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Supprimer"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        className={
          className ||
          "absolute right-2.5 top-2.5 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-sm hover:bg-white"
        }
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <ConfirmDeleteDialog
        open={open}
        title={title}
        message={message}
        busy={busy}
        onCancel={() => {
          if (!busy) setOpen(false);
        }}
        onConfirm={() => {
          setBusy(true);
          void onDelete()
            .then(() => setOpen(false))
            .catch((error) => {
              console.error(error);
              toast({ title: "Erreur", description: "Impossible de supprimer." });
            })
            .finally(() => setBusy(false));
        }}
      />
    </>
  );
};
