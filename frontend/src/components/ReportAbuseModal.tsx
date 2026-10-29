import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ReportReasonId =
  | "harassment"
  | "fraud"
  | "spam"
  | "misinformation"
  | "hate"
  | "threats"
  | "self_harm"
  | "graphic"
  | "extremist"
  | "sexual"
  | "fake_account"
  | "duplicate_fraud"
  | "exploitation"
  | "restricted_goods"
  | "ncii"
  | "impersonating"
  | "not_real_person"
  | "deceased";

export const REPORT_REASONS: {
  id: ReportReasonId;
  label: string;
  definition: string;
}[] = [
  {
    id: "duplicate_fraud",
    label: "Compte frauduleux en double",
    definition:
      "Un autre compte créé pour contourner un blocage, copier un vrai profil ou relancer la même arnaque.",
  },
  {
    id: "harassment",
    label: "Harcèlement",
    definition:
      "Attaques, intimidation ou propos abusifs, y compris la divulgation d'informations personnelles et les avances non souhaitées.",
  },
  {
    id: "fraud",
    label: "Fraude ou arnaque",
    definition:
      "Manœuvres destinées à voler de l'argent, des données ou un accès, y compris les faux paiements et les annonces trompeuses.",
  },
  {
    id: "spam",
    label: "Spam",
    definition: "Contenu répétitif ou non sollicité, publié pour promouvoir quelque chose ou saturer les échanges.",
  },
  {
    id: "misinformation",
    label: "Désinformation",
    definition: "Affirmations fausses ou trompeuses présentées comme des faits et susceptibles de causer un préjudice.",
  },
  {
    id: "hate",
    label: "Discours haineux",
    definition:
      "Attaques ou propos déshumanisants visant des personnes en raison de leur identité, de leur origine, de leur religion ou de leur genre.",
  },
  {
    id: "threats",
    label: "Menaces ou violence",
    definition: "Propos ou contenus qui menacent de faire du mal, encouragent la violence ou la célèbrent.",
  },
  {
    id: "self_harm",
    label: "Automutilation",
    definition:
      "Contenu qui encourage, explique ou valorise le suicide, l'automutilation ou les troubles alimentaires.",
  },
  {
    id: "graphic",
    label: "Contenu choquant",
    definition: "Images ou vidéos très violentes, y compris des blessures réelles, un décès ou de la cruauté envers les animaux.",
  },
  {
    id: "extremist",
    label: "Organisations dangereuses",
    definition: "Éloge, recrutement ou propagande d'organisations terroristes, extrémistes ou criminelles.",
  },
  {
    id: "sexual",
    label: "Contenu sexuel",
    definition: "Pornographie ou activité sexuelle non autorisée, y compris tout contenu sexuel impliquant un mineur.",
  },
  {
    id: "fake_account",
    label: "Faux compte",
    definition: "Un profil qui se fait passer pour une personne, une entreprise ou une organisation, ou qui cherche à tromper.",
  },
  {
    id: "exploitation",
    label: "Exploitation",
    definition: "Contenu ou comportement qui abuse d'autrui, y compris la traite, le travail forcé ou l'exploitation sexuelle.",
  },
  {
    id: "restricted_goods",
    label: "Biens ou services interdits",
    definition: "Offres ou demandes d'articles illégaux ou très réglementés, comme des armes, des drogues ou des biens volés.",
  },
  {
    id: "ncii",
    label: "Images intimes non consenties",
    definition: "Photos ou vidéos intimes partagées sans l'accord de la personne, y compris les menaces de les diffuser.",
  },
];

export const ACCOUNT_REPORT_OPTIONS: { id: ReportReasonId; label: string }[] = [
  { id: "impersonating", label: "Cette personne se fait passer pour quelqu'un" },
  { id: "not_real_person", label: "Ce compte n'est pas une vraie personne" },
  { id: "deceased", label: "Cette personne est décédée" },
];

type ProfileScreen = "action" | "account" | "element" | "element-confirm";

type ReportAbuseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  submitting?: boolean;
  variant?: "content" | "profile";
  subjectName?: string;
  onSubmit: (payload: { reason: ReportReasonId; details: string }) => void | Promise<void>;
};

const ReportAbuseModal = ({
  isOpen,
  onClose,
  title = "Signaler cette publication",
  submitting = false,
  variant = "content",
  subjectName = "ce compte",
  onSubmit,
}: ReportAbuseModalProps) => {
  const [contentStep, setContentStep] = useState<1 | 2>(1);
  const [profileScreen, setProfileScreen] = useState<ProfileScreen>("action");
  const [selectedId, setSelectedId] = useState<ReportReasonId | null>(null);
  const [accountOption, setAccountOption] = useState<ReportReasonId | null>(null);
  const [details, setDetails] = useState("");

  const isProfile = variant === "profile";

  useEffect(() => {
    if (!isOpen) {
      setContentStep(1);
      setProfileScreen("action");
      setSelectedId(null);
      setAccountOption(null);
      setDetails("");
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

  const selected = REPORT_REASONS.find((item) => item.id === selectedId);

  const headerTitle = isProfile
    ? profileScreen === "action"
      ? "Select an action"
      : title
    : title;

  const showBack = isProfile
    ? profileScreen !== "action"
    : contentStep === 2;

  const handleBack = () => {
    if (!isProfile) {
      setContentStep(1);
      return;
    }
    if (profileScreen === "element-confirm") {
      setProfileScreen("element");
      return;
    }
    setProfileScreen("action");
  };

  const handleSubmit = async () => {
    if (isProfile && profileScreen === "account") {
      if (!accountOption) return;
      await onSubmit({ reason: accountOption, details: "" });
      return;
    }
    if (!selectedId) return;
    await onSubmit({ reason: selectedId, details: details.trim() });
  };

  const showElementReasons =
    !isProfile ? contentStep === 1 : profileScreen === "element";
  const showElementConfirm =
    !isProfile ? contentStep === 2 : profileScreen === "element-confirm";

  const actionButtonClass =
    "w-full rounded-xl border border-border bg-card px-4 py-4 text-left text-base font-semibold text-card-foreground hover:bg-muted";

  return createPortal(
    <div className="fixed inset-0 z-[220] flex flex-col bg-background">
      <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center border-b border-border px-3 py-3">
        {showBack ? (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted"
            aria-label="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <span />
        )}
        <h1 className="truncate text-center text-base font-bold text-card-foreground sm:text-lg">
          {headerTitle}
        </h1>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-full text-foreground hover:bg-muted"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8">
        {isProfile && profileScreen === "action" ? (
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            <button
              type="button"
              className={actionButtonClass}
              onClick={() => {
                setAccountOption(null);
                setProfileScreen("account");
              }}
            >
              Signaler {subjectName} ou tout le compte
            </button>
            <button
              type="button"
              className={actionButtonClass}
              onClick={() => {
                setSelectedId(null);
                setDetails("");
                setProfileScreen("element");
              }}
            >
              Signaler un élément du profil
            </button>
          </div>
        ) : null}

        {isProfile && profileScreen === "account" ? (
          <div className="mx-auto max-w-2xl space-y-4">
            <p className="text-base font-medium text-card-foreground">Choisissez l&apos;option qui correspond :</p>
            <div className="space-y-2">
              {ACCOUNT_REPORT_OPTIONS.slice(0, 2).map((option) => {
                const checked = accountOption === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => setAccountOption(option.id)}
                    className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm ${
                      checked ? "border-accent bg-accent/10" : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        checked ? "border-accent bg-accent text-accent-foreground" : "border-muted-foreground/40"
                      }`}
                    >
                      {checked ? <Check className="h-3.5 w-3.5" /> : null}
                    </span>
                    <span className="font-medium text-card-foreground">{option.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="pt-2">
              {(() => {
                const option = ACCOUNT_REPORT_OPTIONS[2];
                const checked = accountOption === option.id;
                return (
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => setAccountOption(option.id)}
                    className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm ${
                      checked ? "border-accent bg-accent/10" : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        checked ? "border-accent bg-accent text-accent-foreground" : "border-muted-foreground/40"
                      }`}
                    >
                      {checked ? <Check className="h-3.5 w-3.5" /> : null}
                    </span>
                    <span className="font-medium text-card-foreground">{option.label}</span>
                  </button>
                );
              })()}
            </div>
          </div>
        ) : null}

        {showElementReasons ? (
          <div className="mx-auto max-w-2xl space-y-5">
            <p className="text-sm text-muted-foreground">Choisissez un motif.</p>
            <div className="flex flex-wrap gap-2">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => setSelectedId(reason.id)}
                  className={`rounded-full border px-3 py-2 text-left text-sm font-medium transition-colors ${
                    selectedId === reason.id
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border bg-card text-card-foreground hover:bg-muted"
                  }`}
                >
                  {reason.label}
                </button>
              ))}
            </div>
            <div>
              <label htmlFor="report-details" className="mb-2 block text-sm font-medium text-card-foreground">
                Précisions (facultatif)
              </label>
              <textarea
                id="report-details"
                value={details}
                onChange={(event) => setDetails(event.target.value.slice(0, 1000))}
                rows={5}
                placeholder="Décrivez ce qui s'est passé…"
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        ) : null}

        {showElementConfirm ? (
          <div className="mx-auto max-w-2xl space-y-4">
            <p className="text-sm text-muted-foreground">Vous avez choisi le motif suivant</p>
            <h2 className="text-xl font-bold text-card-foreground">{selected?.label}</h2>
            <p className="text-sm leading-relaxed text-card-foreground">{selected?.definition}</p>
          </div>
        ) : null}
      </div>

      {!(isProfile && profileScreen === "action") ? (
        <div className="border-t border-border px-4 py-4 sm:px-8">
          <div className="mx-auto max-w-2xl">
            {showElementReasons ? (
              <Button
                type="button"
                className="w-full"
                disabled={!selectedId}
                onClick={() => {
                  if (isProfile) setProfileScreen("element-confirm");
                  else setContentStep(2);
                }}
              >
                Suivant
              </Button>
            ) : (
              <Button
                type="button"
                className="w-full"
                disabled={
                  submitting ||
                  (isProfile && profileScreen === "account" ? !accountOption : !selectedId)
                }
                onClick={() => void handleSubmit()}
              >
                {submitting ? "Envoi…" : "Envoyer le signalement"}
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </div>,
    document.body
  );
};

export default ReportAbuseModal;
