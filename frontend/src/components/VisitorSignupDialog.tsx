import { Heart, Info, LogIn, MessageCircle, UserRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type VisitorFormValues = { name: string; phone: string; email: string };
export type VisitorFormReason = "save" | "comment" | "profile" | "contact";

const COPY: Record<VisitorFormReason, { title: string; description: string }> = {
  save: {
    title: "Ajoutez à vos favoris",
    description: "Connectez-vous ou créez un compte pour enregistrer des favoris.",
  },
  comment: {
    title: "Écrivez votre commentaire",
    description: "Connectez-vous ou créez un compte pour écrire un commentaire.",
  },
  profile: {
    title: "Continuez sur Sifarah",
    description: "Connectez-vous ou créez un compte pour accéder à votre profil.",
  },
  contact: {
    title: "Demander un contact",
    description: "Connectez-vous ou créez un compte pour envoyer cette demande.",
  },
};

const headerIcon: Record<VisitorFormReason, typeof Heart> = {
  save: Heart,
  comment: MessageCircle,
  profile: UserRound,
  contact: MessageCircle,
};

export const VisitorDetailsNote = () => (
  <p className="flex gap-2 rounded-xl bg-[#174f43]/5 px-3 py-2.5 text-left text-xs leading-snug text-[#174f43]">
    <Info className="mt-px h-4 w-4 shrink-0" />
    <span>
      Ces coordonnées seront utilisées pour toutes vos prochaines interactions (favoris, demandes d'infos).
      Vous pourrez les modifier à tout moment dans votre profil.
    </span>
  </p>
);

interface VisitorSignupDialogProps {
  open: boolean;
  reason: VisitorFormReason;
  onOpenChange: (open: boolean) => void;
}

const VisitorSignupDialog = ({ open, reason, onOpenChange }: VisitorSignupDialogProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const copy = COPY[reason];
  const HeaderIcon = headerIcon[reason];

  const go = (path: "/login" | "/create-profile") => {
    onOpenChange(false);
    const back = `${location.pathname}${location.search}`;
    navigate(`${path}?redirect=${encodeURIComponent(back)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-6 sm:max-w-sm">
        <DialogHeader className="items-center text-center sm:text-center">
          <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#174f43]/10">
            <HeaderIcon className={`h-7 w-7 text-[#174f43] ${reason === "save" ? "fill-[#174f43]" : ""}`} />
          </span>
          <DialogTitle className="text-xl">{copy.title}</DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">{copy.description}</DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-2.5">
          <button
            type="button"
            onClick={() => go("/login")}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#174f43] text-sm font-semibold text-white transition hover:bg-[#123d34]"
          >
            <LogIn className="h-4 w-4" />
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => go("/create-profile")}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#174f43] text-sm font-semibold text-[#174f43] transition hover:bg-[#174f43]/5"
          >
            Créer un compte
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisitorSignupDialog;
