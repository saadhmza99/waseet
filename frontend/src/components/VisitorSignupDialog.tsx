import { useEffect, useState } from "react";
import { Heart, Info, Loader2, Mail, MessageCircle, User as UserIcon, UserRound } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PhoneInput from "@/components/PhoneInput";
import { isCompletePhone } from "@/lib/phone";
import { isValidEmail } from "@/lib/visitorContact";

export type VisitorFormValues = { name: string; phone: string; email: string };
export type VisitorFormReason = "save" | "profile" | "comment";

const COPY: Record<VisitorFormReason, { title: string; description: string; submit: string }> = {
  save: {
    title: "Ajoutez à vos favoris",
    description: "Une seule fois, sans mot de passe : retrouvez ensuite vos favoris à tout moment.",
    submit: "Favoris",
  },
  comment: {
    title: "Écrivez votre commentaire",
    description: "Une seule fois : votre message sera visible uniquement par vous et l'entreprise.",
    submit: "Commenter",
  },
  profile: {
    title: "Créez votre profil particulier",
    description: "Une seule fois, sans mot de passe : ajoutez des annonces à vos favoris, suivez des profils et publiez jusqu'à 3 biens.",
    submit: "Créer mon profil",
  },
};

const headerIcon = {
  save: Heart,
  comment: MessageCircle,
  profile: UserRound,
} as const;

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
  initialValues: VisitorFormValues;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: VisitorFormValues) => Promise<void>;
}

const fieldClass = "h-11 rounded-xl border-neutral-200 bg-neutral-50 pl-10 focus-visible:bg-white";

const VisitorSignupDialog = ({ open, reason, initialValues, onOpenChange, onSubmit }: VisitorSignupDialogProps) => {
  const copy = COPY[reason];
  const HeaderIcon = headerIcon[reason];
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setError("");
    }
  }, [open, initialValues]);

  const update = (field: keyof VisitorFormValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name.trim() || !isCompletePhone(values.phone) || !isValidEmail(values.email)) {
      setError("Nom, un email valide et un numéro de téléphone sont requis.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch {
      setError("Impossible de continuer pour le moment. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-6 sm:max-w-sm">
        <DialogHeader className="items-center text-center sm:text-center">
          <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#174f43]/10">
            <HeaderIcon className={`h-7 w-7 text-[#174f43] ${reason === "save" ? "fill-[#174f43]" : ""}`} />
          </span>
          <DialogTitle className="text-xl">{copy.title}</DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">{copy.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-1 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="visitor-name">Nom</Label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input id="visitor-name" autoComplete="name" placeholder="Votre nom" className={fieldClass} value={values.name} onChange={update("name")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="visitor-phone">Téléphone</Label>
            <PhoneInput
              id="visitor-phone"
              required
              value={values.phone}
              onChange={(phone) => setValues((prev) => ({ ...prev, phone }))}
              inputClassName="h-11 rounded-xl border-neutral-200 bg-neutral-50 focus-visible:bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="visitor-email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input id="visitor-email" type="email" required autoComplete="email" placeholder="vous@exemple.com" className={fieldClass} value={values.email} onChange={update("email")} />
            </div>
          </div>

          <VisitorDetailsNote />

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#174f43] text-sm font-semibold text-white transition-all hover:bg-[#123d34] active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <HeaderIcon className="h-4 w-4" />}
            {submitting ? "Un instant..." : copy.submit}
          </button>
          <p className="text-center text-[11px] leading-snug text-muted-foreground">
            Vos coordonnées restent privées. Vous restez connecté 30 jours après votre dernière visite.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VisitorSignupDialog;
