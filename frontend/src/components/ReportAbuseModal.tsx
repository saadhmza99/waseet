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
    label: "Duplicate fraud account",
    definition:
      "Another account created to evade a ban, copy a real profile, or run the same scam after a previous account was restricted.",
  },
  {
    id: "harassment",
    label: "Harassment",
    definition:
      "Attacks or intimidation towards others with abusive language, or deliberately or repeatedly disrupting conversations, including revealing others' personal or sensitive information. This includes unwanted romantic advances, sexual remarks and/or requests for sexual favors.",
  },
  {
    id: "fraud",
    label: "Fraud or scam",
    definition:
      "Deceptive schemes meant to steal money, data, or access, including fake payments, impersonation for gain, and listings or jobs that exist only to defraud others.",
  },
  {
    id: "spam",
    label: "Spam",
    definition:
      "Unsolicited, repetitive, or misleading content posted to promote something, farm engagement, or flood conversations rather than participate genuinely.",
  },
  {
    id: "misinformation",
    label: "Misinformation",
    definition:
      "False or misleading claims presented as fact, especially about health, elections, emergencies, or people, in a way that can cause real-world harm.",
  },
  {
    id: "hate",
    label: "Hateful speech",
    definition:
      "Attacks, slurs, or dehumanizing content targeting people because of identity such as race, religion, nationality, gender, sexual orientation, or disability.",
  },
  {
    id: "threats",
    label: "Threats or violence",
    definition:
      "Statements or content that threaten physical harm, encourage violence, or celebrate violent acts against people or groups.",
  },
  {
    id: "self_harm",
    label: "Self-harm",
    definition:
      "Content that promotes, instructs, or glorifies suicide, self-injury, or eating disorders, or that appears to show someone in immediate danger of harming themselves.",
  },
  {
    id: "graphic",
    label: "Graphic content",
    definition:
      "Gory, shocking, or extremely violent imagery or video shared without a clear need, including real-world injury, death, or animal cruelty.",
  },
  {
    id: "extremist",
    label: "Dangerous or extremist organizations",
    definition:
      "Praise, recruitment, or coordination for terrorist, violent extremist, or criminal organizations, or content that spreads their propaganda.",
  },
  {
    id: "sexual",
    label: "Sexual content",
    definition:
      "Pornography or sexual activity that is not allowed on the platform, including sexual content involving anyone who appears to be a minor.",
  },
  {
    id: "fake_account",
    label: "Fake account",
    definition:
      "A profile that impersonates a person, business, or organization, or that is clearly not a real user and exists to mislead others.",
  },
  {
    id: "exploitation",
    label: "Exploitation",
    definition:
      "Content or behavior that takes advantage of others, including trafficking, coerced labor, or sexual exploitation.",
  },
  {
    id: "restricted_goods",
    label: "Restricted goods or services",
    definition:
      "Offers or requests for illegal or tightly regulated items such as weapons, drugs, stolen goods, or unauthorized professional services.",
  },
  {
    id: "ncii",
    label: "Nonconsensual intimate imagery",
    definition:
      "Intimate photos or videos shared without the person's permission, including threats to share them (revenge porn or sextortion).",
  },
];

export const ACCOUNT_REPORT_OPTIONS: { id: ReportReasonId; label: string }[] = [
  { id: "impersonating", label: "This person is impersonating someone" },
  { id: "not_real_person", label: "This account is not a real person" },
  { id: "deceased", label: "This person is deceased" },
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
  title = "Report this post",
  submitting = false,
  variant = "content",
  subjectName = "this account",
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
          aria-label="Close"
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
              Report {subjectName} or entire account
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
              Report profile element
            </button>
          </div>
        ) : null}

        {isProfile && profileScreen === "account" ? (
          <div className="mx-auto max-w-2xl space-y-4">
            <p className="text-base font-medium text-card-foreground">Select an option that applies:</p>
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
            <p className="text-sm text-muted-foreground">Choose a reason for this report.</p>
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
                Additional details (optional)
              </label>
              <textarea
                id="report-details"
                value={details}
                onChange={(event) => setDetails(event.target.value.slice(0, 1000))}
                rows={5}
                placeholder="Tell us more about what happened…"
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        ) : null}

        {showElementConfirm ? (
          <div className="mx-auto max-w-2xl space-y-4">
            <p className="text-sm text-muted-foreground">You've selected the following reason</p>
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
                Next
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
                {submitting ? "Sending…" : "Submit report"}
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
