import { useState } from "react";
import { Loader2 } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { isCompletePhone } from "@/lib/phone";
import { isValidEmail } from "@/lib/visitorContact";
import { partnerRequestService } from "@/services/partnerRequestService";

type PartnerDemandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const fieldClass =
  "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-800 outline-none focus:border-[#174f43] focus:ring-1 focus:ring-[#174f43]";

const PartnerDemandDialog = ({ open, onOpenChange }: PartnerDemandDialogProps) => {
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Devenir partenaire Sifarah</DialogTitle>
          <DialogDescription>
            Publiez sur le fil et gagnez en visibilité auprès des maîtres d&apos;ouvrage. Nous répondons rapidement.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="space-y-3 py-2 text-center">
            <p className="text-sm font-semibold text-[#174f43]">Demande envoyée</p>
            <p className="text-sm text-neutral-600">
              Merci — notre équipe vous recontacte très vite pour activer votre présence sur Sifarah.
            </p>
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
          <form onSubmit={(e) => void submit(e)} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600">Nom de l&apos;entreprise *</label>
              <input
                value={enterpriseName}
                onChange={(e) => setEnterpriseName(e.target.value)}
                className={fieldClass}
                placeholder="Ex. Entreprise Bâtiment Atlas"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600">Nom du professionnel *</label>
              <input
                value={professionalName}
                onChange={(e) => setProfessionalName(e.target.value)}
                className={fieldClass}
                placeholder="Ex. Hassan Benali"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600">Téléphone *</label>
              <PhoneInput value={phone} onChange={setPhone} inputClassName="rounded-lg border-neutral-200 bg-neutral-50" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600">Email *</label>
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
              <label className="mb-1 block text-xs font-semibold text-neutral-600">
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
              <label className="mb-1 block text-xs font-semibold text-neutral-600">Localisation *</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={fieldClass}
                placeholder="Ville, région"
                required
              />
            </div>
            <p className="rounded-lg bg-[#174f43]/5 px-3 py-2 text-xs text-[#0f2f3d]">
              Nous répondons rapidement — en général sous 24 à 48 h.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#174f43] text-sm font-semibold text-white hover:bg-[#123d34] disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Envoyer la demande
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PartnerDemandDialog;
