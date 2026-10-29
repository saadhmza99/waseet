import { useState } from "react";
import { Loader2 } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { isCompletePhone } from "@/lib/phone";
import { isValidEmail } from "@/lib/visitorContact";
import { partnerRequestService } from "@/services/partnerRequestService";

export const PAID_PLAN_REQUEST =
  "Accédez en priorité aux devis de plus de 2 700 professionnels et fournisseurs BTP et 364 promoteurs, et développez votre visibilité auprès des acteurs du secteur.";

/** Projects catalogue notice. Separate from the feed paid-plan sentence. */
export const PROJECT_PLAN_NOTICE =
  "Déverrouillez-les pour consulter les documents et les informations des équipes BTP qui ont participé à la réalisation de chaque projet, et accédez en priorité aux demandes de participation pour les projets encore sur plan ou en cours de construction.";

type PartnerDemandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  successTitle?: string;
  successMessage?: string;
  submitLabel?: string;
};

const fieldClass =
  "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-800 outline-none focus:border-[#174f43] focus:ring-1 focus:ring-[#174f43] lg:px-4 lg:py-3 lg:text-base";

const PartnerDemandDialog = ({
  open,
  onOpenChange,
  title = "Devenir partenaire Sifarah",
  description = PAID_PLAN_REQUEST,
  successTitle = "Demande envoyée",
  successMessage = "Merci. Nous vous enverrons les détails du plan payant.",
  submitLabel = "Envoyer la demande",
}: PartnerDemandDialogProps) => {
  const [enterpriseName, setEnterpriseName] = useState("");
  const [professionalName, setProfessionalName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const reset = () => {
    setEnterpriseName("");
    setProfessionalName("");
    setPhone("");
    setEmail("");
    setWebsite("");
    setLocation("");
    setSent(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!enterpriseName.trim() || !professionalName.trim() || !location.trim()) {
      toast({ title: "Champs requis", description: "Renseignez entreprise, professionnel et localisation." });
      return;
    }
    if (!isCompletePhone(phone) || !isValidEmail(email)) {
      toast({ title: "Coordonnées", description: "Téléphone et email valides sont obligatoires." });
      return;
    }
    setSubmitting(true);
    try {
      await partnerRequestService.create({
        enterpriseName,
        professionalName,
        phone,
        email,
        website,
        location,
      });
      setSent(true);
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible d'envoyer la demande. Réessayez." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md lg:max-w-4xl lg:gap-6 lg:p-8">
        <DialogHeader className="lg:space-y-3">
          <DialogTitle
            className="lg:text-3xl lg:font-normal"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            {title}
          </DialogTitle>
          <DialogDescription className="lg:text-base lg:leading-relaxed">{description}</DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="space-y-3 py-2 text-center">
            <p className="text-sm font-semibold text-[#174f43]">{successTitle}</p>
            <p className="text-sm text-neutral-600">{successMessage}</p>
            <button
              type="button"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="h-11 w-full rounded-lg bg-[#174f43] text-sm font-semibold text-white"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void submit(e)} className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-x-5 lg:gap-y-4 lg:space-y-0">
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600 lg:text-sm">Nom de l&apos;entreprise *</label>
              <input
                value={enterpriseName}
                onChange={(e) => setEnterpriseName(e.target.value)}
                className={fieldClass}
                placeholder="Ex. Entreprise Bâtiment Atlas"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600 lg:text-sm">Nom du professionnel *</label>
              <input
                value={professionalName}
                onChange={(e) => setProfessionalName(e.target.value)}
                className={fieldClass}
                placeholder="Ex. Hassan Benali"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600 lg:text-sm">Téléphone *</label>
              <PhoneInput value={phone} onChange={setPhone} inputClassName="rounded-lg border-neutral-200 bg-neutral-50" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600 lg:text-sm">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
                placeholder="contact@entreprise.ma"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600 lg:text-sm">
                Site web <span className="font-normal text-neutral-400">(optionnel)</span>
              </label>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className={fieldClass}
                placeholder="https://"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600 lg:text-sm">Localisation *</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={fieldClass}
                placeholder="Ville, région"
                required
              />
            </div>
            <p className="rounded-lg bg-[#174f43]/5 px-3 py-2 text-xs text-[#0f2f3d] lg:col-span-2 lg:px-4 lg:py-3 lg:text-sm">
              Nous vous envoyons les détails du plan payant, en général sous 24 à 48 h.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#174f43] text-sm font-semibold text-white hover:bg-[#123d34] disabled:opacity-60 lg:col-span-2 lg:h-12 lg:text-base"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitLabel}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PartnerDemandDialog;
