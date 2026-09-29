import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useVisitorGate } from "@/contexts/VisitorGateContext";
import { VisitorDetailsNote } from "@/components/VisitorSignupDialog";
import {
  inquiryCooldownMessage,
  inquiryService,
  isInquiryRateLimitError,
  type InquiryRateStatus,
  type InquiryType,
} from "@/services/inquiryService";
import { profileService } from "@/services/profileService";
import { visitorService } from "@/services/visitorService";
import { readVisitorContact as readStoredContact, storeVisitorContact } from "@/lib/visitorContact";
import PhoneInput from "@/components/PhoneInput";
import { isCompletePhone } from "@/lib/phone";
import { isValidEmail } from "@/lib/visitorContact";

const DEFAULT_MESSAGE = "Bonjour, je souhaite avoir plus d'informations concernant ";

interface InquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: InquiryType;
  sellerId?: string;
  sellerName?: string;
  postId?: string;
  listingId?: string;
  propertyId?: string;
  projectId?: string;
}

const InquiryDialog = ({
  open,
  onOpenChange,
  type,
  sellerId,
  sellerName,
  postId,
  listingId,
  propertyId,
  projectId,
}: InquiryDialogProps) => {
  const { user, visitorUser, loading: authLoading } = useAuth();
  const { startVisitor, visitorProfile, refreshVisitorProfile } = useVisitorGate();
  const [form, setForm] = useState({ ...readStoredContact(), needs: DEFAULT_MESSAGE });
  const [askName, setAskName] = useState(true);
  const [askPhone, setAskPhone] = useState(true);
  const [askEmail, setAskEmail] = useState(true);
  const [ready, setReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [rate, setRate] = useState<InquiryRateStatus | null>(null);
  const signedIn = Boolean(user || visitorUser);
  const recipient = sellerName?.trim() || "ce membre";
  const blocked = rate && !rate.allowed;

  useEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }
    if (authLoading) return;

    let cancelled = false;

    const load = async () => {
      const defaults = { ...readStoredContact(), needs: DEFAULT_MESSAGE };
      const status = await inquiryService.getRateStatus({ postId, listingId, propertyId, projectId, phone: defaults.phone }).catch(() => null);
      if (!signedIn) {
        if (!cancelled) {
          setForm(defaults);
          setAskName(true);
          setAskPhone(true);
          setAskEmail(true);
          setRate(status);
          setReady(true);
        }
        return;
      }

      if (visitorUser) {
        const details = visitorProfile ?? (await visitorService.getMine(visitorUser.id));
        const name = details?.name?.trim() || "";
        const phone = details?.phone?.trim() || "";
        if (cancelled) return;
        setForm({ name, phone, email: details?.email?.trim() || "", needs: DEFAULT_MESSAGE });
        setAskName(!name);
        setAskPhone(!isCompletePhone(phone));
        setAskEmail(!isValidEmail(details?.email || ""));
        setRate(status || (await inquiryService.getRateStatus({ postId, listingId, propertyId, projectId, phone }).catch(() => null)));
        setReady(true);
        return;
      }

      if (user) {
        const profile = await profileService.getProfile(user.id);
        const name = (profile.full_name || "").trim();
        const phone = (profile.phone || "").trim();
        if (cancelled) return;
        setForm({
          name,
          phone,
          email: (profile.email || user.email || "").trim(),
          needs: DEFAULT_MESSAGE,
        });
        setAskName(!name);
        setAskPhone(!isCompletePhone(phone));
        setAskEmail(!isValidEmail(profile.email || user.email || ""));
        setRate(status || (await inquiryService.getRateStatus({ postId, listingId, propertyId, projectId, phone }).catch(() => null)));
        setReady(true);
      }
    };

    void load().catch((error) => {
      console.error("Error preparing inquiry:", error);
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [open, authLoading, signedIn, visitorUser, visitorProfile, user, type, postId, listingId, propertyId, projectId]);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerId) return;
    if (blocked) {
      toast({ title: "Limite atteinte", description: inquiryCooldownMessage(rate.retryAt) });
      return;
    }
    if (!form.name.trim() || !isCompletePhone(form.phone) || !isValidEmail(form.email)) {
      toast({ title: "Coordonnées incomplètes", description: "Nom, un email valide et un numéro de téléphone sont requis." });
      return;
    }
    setSending(true);
    try {
      if (user && (askName || askPhone || askEmail)) {
        await profileService.updateProfile(user.id, {
          full_name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
        });
      } else if (visitorUser && (askName || askPhone || askEmail)) {
        await visitorService.updateMine({
          name: form.name,
          phone: form.phone,
          email: form.email,
          bio: visitorProfile?.bio || undefined,
          avatarUrl: visitorProfile?.avatar_url,
        });
        await refreshVisitorProfile();
      } else if (!signedIn) {
        await startVisitor({ name: form.name, phone: form.phone, email: form.email });
      }
      await inquiryService.createInquiry({
        type,
        sellerId,
        postId,
        listingId,
        propertyId,
        projectId,
        name: form.name,
        email: form.email,
        phone: form.phone,
        needs: form.needs,
      });
      storeVisitorContact(form);
      toast({ title: "Demande envoyée", description: `${recipient} vous recontactera bientôt.` });
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending inquiry:", error);
      if (isInquiryRateLimitError(error)) {
        const next = await inquiryService.getRateStatus({ postId, listingId, propertyId, projectId, phone: form.phone }).catch(() => null);
        if (next) setRate(next);
        toast({ title: "Limite atteinte", description: inquiryCooldownMessage(next?.retryAt) });
      } else {
        toast({ variant: "destructive", title: "Erreur", description: "Impossible d'envoyer la demande." });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open && !authLoading && ready} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Écrire en privé</DialogTitle>
          <DialogDescription>
            Une question, envie d'échanger ou exprimer votre intérêt ? Écrivez à {recipient} en privé.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {askName ? (
            <div className="space-y-1.5">
              <Label htmlFor="inquiry-name">Nom</Label>
              <Input id="inquiry-name" autoComplete="name" value={form.name} onChange={update("name")} required />
            </div>
          ) : null}
          {askPhone ? (
            <div className="space-y-1.5">
              <Label htmlFor="inquiry-phone">Téléphone</Label>
              <PhoneInput id="inquiry-phone" required value={form.phone} onChange={(phone) => setForm((prev) => ({ ...prev, phone }))} />
            </div>
          ) : null}
          {askEmail || !signedIn ? (
            <div className="space-y-1.5">
              <Label htmlFor="inquiry-email">Email</Label>
              <Input id="inquiry-email" type="email" required autoComplete="email" value={form.email} onChange={update("email")} />
            </div>
          ) : null}
          {blocked ? (
            <p className="rounded-xl bg-[#174f43]/5 px-3 py-2.5 text-sm leading-snug text-[#174f43]">
              {inquiryCooldownMessage(rate.retryAt)}
            </p>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="inquiry-needs">Message</Label>
              <Textarea id="inquiry-needs" rows={4} className="resize-none" value={form.needs} onChange={update("needs")} />
            </div>
          )}
          {!signedIn && !blocked ? <VisitorDetailsNote /> : null}
          <button
            type="submit"
            disabled={sending || Boolean(blocked)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#174f43] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#123d34] disabled:opacity-60"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {blocked ? "Réessayer plus tard" : sending ? "Envoi..." : "Envoyer la demande"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InquiryDialog;
