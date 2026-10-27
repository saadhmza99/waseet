import { useEffect, useMemo, useRef, useState, type ReactNode, type KeyboardEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Mail, Eye, EyeOff, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import PhoneInput from "@/components/PhoneInput";
import { CityPicker, RegionSelect } from "@/components/CityPicker";
import { isCompletePhone } from "@/lib/phone";
import { citiesForRegion } from "@/lib/moroccoPlaces";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profileService";
import { taxonomyService } from "@/services/taxonomyService";
import { lookupSignupGeo } from "@/lib/signupGeo";
import { FEED_CATEGORIES } from "@/lib/taxonomy";
import { toast } from "sonner";
import logoDetailed from "@/assets/sifarah-logo-detailed.png";
import heroArch from "@/assets/sifarah-arch-wide.jpg";
import { cn } from "@/lib/utils";

const DRAFT_KEY = "sifarah:onboarding-draft";
const TOTAL_STEPS = 6;
const MAX_SECTEURS = 5;
const RESEND_SECONDS = 60;

type UsageIntent = "seeker" | "independent" | "company" | "investor";
type ProfileType = "individual" | "enterprise";

type Draft = {
  usage: UsageIntent | null;
  interests: string[];
  profileType: ProfileType | null;
  raisonSociale: string;
  region: string;
  location: string;
  secteurs: string[];
  newsletter: boolean;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone: string;
  username: string;
  acceptTerms: boolean;
};

const INTERESTS = [
  { id: "immobilier", label: "Immobilier (biens et projets)", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=160&h=120&fit=crop" },
  { id: "architectes", label: "Architectes et bureaux d'études", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=160&h=120&fit=crop" },
  { id: "construction", label: "Entreprises de construction et rénovation", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=160&h=120&fit=crop" },
  { id: "materiaux", label: "Matériaux", image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=160&h=120&fit=crop" },
  { id: "opportunites", label: "Opportunités et partenariats", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=160&h=120&fit=crop" },
  { id: "chantiers", label: "Chantiers et réalisations", image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=160&h=120&fit=crop" },
];

const USAGE_OPTIONS: { id: UsageIntent; label: string }[] = [
  { id: "seeker", label: "Je cherche un bien, un projet ou un professionnel" },
  { id: "independent", label: "Je suis un professionnel indépendant" },
  { id: "company", label: "Je représente une entreprise" },
  { id: "investor", label: "Je recherche des opportunités d'investissement" },
];

const emptyDraft = (): Draft => ({
  usage: null,
  interests: [],
  profileType: null,
  raisonSociale: "",
  region: "",
  location: "",
  secteurs: [""],
  newsletter: true,
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  passwordConfirm: "",
  phone: "",
  username: "",
  acceptTerms: false,
});

const readDraft = (): Draft => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return emptyDraft();
    const parsed = JSON.parse(raw) as Partial<Draft> & { name?: string };
    const base = { ...emptyDraft(), ...parsed };
    if (!base.firstName && !base.lastName && parsed.name) {
      const parts = String(parsed.name).trim().split(/\s+/);
      base.firstName = parts[0] || "";
      base.lastName = parts.slice(1).join(" ");
    }
    return base;
  } catch {
    return emptyDraft();
  }
};

const draftFullName = (draft: Draft) =>
  [draft.firstName, draft.lastName].map((s) => s.trim()).filter(Boolean).join(" ");

const GoogleIcon = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AppleIcon = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16.365 1.43c0 1.14-.42 2.2-1.18 3.03-.79.87-2.1 1.54-3.2 1.45-.14-1.1.4-2.27 1.16-3.1.8-.88 2.2-1.52 3.22-1.38zM20.9 17.2c-.55 1.27-.82 1.84-1.53 2.96-1 1.55-2.4 3.48-4.15 3.5-1.55.02-1.95-1.01-4.06-1-2.1.01-2.55 1.02-4.1 1-1.74-.03-3.07-1.76-4.07-3.3C1.1 17.3-.4 12.5 1.7 9.2c1.05-1.65 2.72-2.7 4.32-2.7 1.7 0 2.77 1.05 4.18 1.05 1.37 0 2.2-1.06 4.17-1.06 1.48 0 3.05.8 4.1 2.19-3.6 1.97-3.02 7.1.43 8.52z" />
  </svg>
);

const writeDraft = (draft: Draft) => {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* ignore */
  }
};

const clearDraft = () => {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
};

const buildDefaultUsername = (baseName: string) => {
  const seed = Math.random().toString(36).slice(2, 8);
  const normalized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized ? `${normalized}_${seed}` : `user_${seed}`;
};

const isProPath = (usage: UsageIntent | null, profileType: ProfileType | null) => {
  if (usage === "independent" || usage === "company") return true;
  return profileType === "individual" || profileType === "enterprise";
};

const resolvedProfileType = (draft: Draft): ProfileType => {
  if (draft.usage === "company" || draft.profileType === "enterprise") return "enterprise";
  return "individual";
};

const BrandMark = ({ size = "md" }: { size?: "md" | "lg" }) => {
  const large = size === "lg";
  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      <img
        src={logoDetailed}
        alt=""
        className={cn("shrink-0 object-contain brightness-0", large ? "h-14 w-auto sm:h-16" : "h-12 w-auto")}
      />
      <span className="flex flex-col items-start">
        <span
          lang="ar"
          dir="rtl"
          className={cn("font-normal leading-none text-neutral-900", large ? "text-[2.35rem] sm:text-[2.7rem]" : "text-[2rem]")}
          style={{ fontFamily: "Arabswell, serif" }}
        >
          سفارة
        </span>
        <span
          className={cn("font-normal leading-none text-neutral-800", large ? "mt-1 text-lg sm:text-xl" : "mt-0.5 text-base")}
          style={{ fontFamily: "Arabswell, serif" }}
        >
          Sifarah
        </span>
      </span>
    </div>
  );
};

const OnboardingShell = ({
  step,
  children,
  wide = false,
  account = false,
}: {
  step: number;
  children: ReactNode;
  wide?: boolean;
  account?: boolean;
}) => (
  <div className={cn("fixed inset-0 z-50 overflow-y-auto", account ? "bg-[#EEF0EF]" : "bg-white")}>
    <div
      className={cn(
        "mx-auto w-full px-5 pb-16 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10",
        account ? "max-w-6xl" : "max-w-3xl lg:max-w-4xl",
      )}
    >
      <header className="flex items-center justify-between gap-4">
        <BrandMark size="lg" />
        <div className="flex min-w-[7.5rem] flex-col items-end gap-1.5">
          <span className="text-xs font-medium tabular-nums text-neutral-500">
            {step}/{TOTAL_STEPS}
          </span>
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-neutral-200 sm:w-40">
            <div
              className="h-full rounded-full bg-[#174f43] transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      </header>
      <div
        className={cn(
          "mx-auto mt-8 w-full sm:mt-10",
          account ? "max-w-6xl" : wide ? "max-w-2xl" : "max-w-xl",
        )}
      >
        {children}
      </div>
    </div>
  </div>
);

const NavRow = ({
  onBack,
  onContinue,
  continueLabel = "Continuer →",
  continueDisabled,
  loading,
}: {
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  loading?: boolean;
}) => (
  <div className={`mt-8 flex gap-3 ${onBack ? "" : ""}`}>
    {onBack ? (
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className="h-12 flex-1 border-neutral-300 text-neutral-800"
      >
        ← Retour
      </Button>
    ) : null}
    <Button
      type="button"
      onClick={onContinue}
      disabled={continueDisabled || loading}
      className={`h-12 bg-[#174f43] text-base font-semibold text-white hover:bg-[#123d34] ${onBack ? "flex-1" : "w-full"}`}
    >
      {loading ? "Patientez..." : continueLabel}
    </Button>
  </div>
);

const CreateProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, signInWithOAuth, verifySignupOtp, resendSignupEmail, user, session } = useAuth();

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(() => readDraft());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendIn, setResendIn] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const needsRoleStep = draft.usage === "seeker" || draft.usage === "investor" || draft.usage === null;
  const pro = isProPath(draft.usage, draft.profileType);
  const profileType = resolvedProfileType(draft);

  useEffect(() => {
    writeDraft(draft);
  }, [draft]);

  useEffect(() => {
    if (draft.usage === "independent") {
      setDraft((d) => (d.profileType === "individual" ? d : { ...d, profileType: "individual" }));
    } else if (draft.usage === "company") {
      setDraft((d) => (d.profileType === "enterprise" ? d : { ...d, profileType: "enterprise" }));
    }
  }, [draft.usage]);

  // OAuth / email-link return: finish profile then show success (step 0 = done).
  useEffect(() => {
    const oauth = searchParams.get("oauth") === "1";
    const verified = searchParams.get("verified") === "1";
    if (!oauth && !verified) return;
    if (!session?.user) return;

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        await finalizeProfile(session.user.id);
        if (!cancelled) {
          clearDraft();
          setStep(0);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Impossible de finaliser le profil");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, session?.user?.id]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  const patch = (partial: Partial<Draft>) => setDraft((d) => ({ ...d, ...partial }));

  const goNextFrom = (current: number) => {
    setError(null);
    if (current === 1) {
      setStep(2);
      return;
    }
    if (current === 2) {
      if (draft.usage === "independent" || draft.usage === "company") setStep(4);
      else setStep(3);
      return;
    }
    if (current === 3) {
      setStep(4);
      return;
    }
    if (current === 4) {
      setStep(5);
      return;
    }
  };

  const goBackFrom = (current: number) => {
    setError(null);
    if (current === 2) {
      setStep(1);
      return;
    }
    if (current === 3) {
      setStep(2);
      return;
    }
    if (current === 4) {
      if (draft.usage === "independent" || draft.usage === "company") setStep(2);
      else setStep(3);
      return;
    }
    if (current === 5) {
      setStep(4);
      return;
    }
    if (current === 6) {
      setStep(5);
    }
  };

  const validateStep = (current: number): boolean => {
    if (current === 1 && !draft.usage) {
      setError("Choisissez comment vous souhaitez utiliser Sifarah.");
      return false;
    }
    if (current === 2 && draft.interests.length === 0) {
      setError("Sélectionnez au moins un centre d'intérêt.");
      return false;
    }
    if (current === 3 && !draft.profileType && needsRoleStep) {
      // For seeker/investor, role step lets them optionally become pro; allow continue as seeker.
      return true;
    }
    if (current === 4) {
      if (!draft.region || !draft.location) {
        setError("Indiquez votre région et votre ville.");
        return false;
      }
      if (pro) {
        if (!draft.raisonSociale.trim()) {
          setError("Indiquez votre raison sociale.");
          return false;
        }
        const filled = draft.secteurs.map((s) => s.trim()).filter(Boolean);
        if (!filled.length) {
          setError("Le secteur d'activité est obligatoire pour les professionnels et entreprises.");
          return false;
        }
      }
    }
    if (current === 5) {
      if (!draft.firstName.trim() || !draft.lastName.trim() || !draft.email.trim() || !draft.password.trim()) {
        setError("Renseignez votre nom, prénom, e-mail et mot de passe.");
        return false;
      }
      if (!isCompletePhone(draft.phone)) {
        setError("Entrez un numéro de téléphone valide.");
        return false;
      }
      if (draft.password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
        return false;
      }
      if (draft.password !== draft.passwordConfirm) {
        setError("Les mots de passe ne correspondent pas.");
        return false;
      }
      if (!draft.acceptTerms) {
        setError("Veuillez accepter les conditions d'utilisation.");
        return false;
      }
    }
    return true;
  };

  const finalizeProfile = async (userId: string) => {
    const personName = draftFullName(draft);
    const username = draft.username.trim() || buildDefaultUsername(draft.raisonSociale || personName);
    const secteurs = draft.secteurs.map((s) => s.trim()).filter(Boolean);
    const displayName = (pro ? draft.raisonSociale : personName).trim() || personName;
    await profileService.updateProfile(userId, {
      username,
      full_name: displayName,
      profession: secteurs[0] || null,
      location: draft.location,
      phone: draft.phone || null,
      email: draft.email || null,
      profile_type: profileType,
      bio: "",
    });

    if (pro && secteurs.length) {
      try {
        const all = await taxonomyService.listInternalCategories();
        const matchedIds: number[] = [];
        for (const label of secteurs) {
          const feed = FEED_CATEGORIES.find((c) => c.label === label);
          if (!feed) continue;
          const first = all.find((row) => row.category_id === feed.id);
          if (first && !matchedIds.includes(first.id)) matchedIds.push(first.id);
          if (matchedIds.length >= MAX_SECTEURS) break;
        }
        if (matchedIds.length) {
          await taxonomyService.setProfileInternalCategoryIds(userId, matchedIds);
        }
      } catch {
        /* taxonomy optional at signup */
      }
    }
  };

  const handleEmailSignUp = async () => {
    if (!validateStep(5)) return;
    setIsLoading(true);
    setError(null);
    try {
      const personName = draftFullName(draft);
      const username = draft.username.trim() || buildDefaultUsername(draft.raisonSociale || personName);
      const secteurs = draft.secteurs.map((s) => s.trim()).filter(Boolean);
      const geo = await lookupSignupGeo();
      const displayName = (pro ? draft.raisonSociale : personName).trim() || personName;
      patch({ username });

      const { error: signUpError, needsEmailConfirmation } = await signUp(draft.email.trim(), draft.password, {
        username,
        full_name: displayName,
        profession: secteurs[0] || "",
        location: draft.location,
        phone: draft.phone,
        profile_type: profileType,
        usage_intent: draft.usage || "",
        interests: draft.interests.join(","),
        secteurs: secteurs.join("|"),
        newsletter: draft.newsletter ? "1" : "0",
        signup_ip: geo.ip || "",
        signup_country: geo.country || "",
        signup_country_code: geo.countryCode || "",
      });

      if (signUpError) {
        setError(signUpError.message);
        toast.error(signUpError.message);
        return;
      }

      if (needsEmailConfirmation) {
        setResendIn(RESEND_SECONDS);
        setStep(6);
        toast.success("Code de vérification envoyé", {
          description: `Vérifiez votre boîte mail (${draft.email}).`,
        });
        return;
      }

      const uid = user?.id;
      const { data } = await (await import("@/lib/supabase")).supabase.auth.getUser();
      const id = data.user?.id || uid;
      if (id) await finalizeProfile(id);
      clearDraft();
      setStep(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setError(null);
    writeDraft(draft);
    setIsLoading(true);
    const { error: oauthError } = await signInWithOAuth(provider);
    if (oauthError) {
      setError(oauthError.message);
      toast.error(oauthError.message);
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Entrez le code à 6 chiffres.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { error: verifyError } = await verifySignupOtp(draft.email, code);
      if (verifyError) {
        setError(verifyError.message);
        toast.error(verifyError.message);
        return;
      }
      const { data } = await (await import("@/lib/supabase")).supabase.auth.getUser();
      if (data.user) await finalizeProfile(data.user.id);
      clearDraft();
      setStep(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Code invalide";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || isResending) return;
    setIsResending(true);
    try {
      const { error: resendError } = await resendSignupEmail(draft.email);
      if (resendError) {
        toast.error(resendError.message);
        return;
      }
      setResendIn(RESEND_SECONDS);
      toast.success("Code renvoyé", { description: `Vérifiez ${draft.email}` });
    } finally {
      setIsResending(false);
    }
  };

  const onOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const onOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const secteurOptions = useMemo(() => FEED_CATEGORIES.map((c) => c.label), []);

  const setSecteurAt = (index: number, value: string) => {
    const next = [...draft.secteurs];
    next[index] = value;
    patch({ secteurs: next });
  };

  const addSecteur = () => {
    if (draft.secteurs.length >= MAX_SECTEURS) return;
    patch({ secteurs: [...draft.secteurs, ""] });
  };

  const removeSecteur = (index: number) => {
    if (draft.secteurs.length <= 1) {
      patch({ secteurs: [""] });
      return;
    }
    patch({ secteurs: draft.secteurs.filter((_, i) => i !== index) });
  };

  if (step === 0) {
    return (
      <OnboardingShell step={6}>
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#174f43] text-white shadow-lg">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>
          <h1
            className="mt-6 text-3xl font-normal tracking-tight text-neutral-900 sm:text-4xl"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            C'est parti !
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground sm:text-base">
            Votre profil est maintenant configuré.
          </p>
          <Button
            type="button"
            className="mt-8 h-12 w-full max-w-sm bg-[#174f43] text-base font-semibold text-white hover:bg-[#123d34] lg:max-w-xs"
            onClick={() => navigate("/", { replace: true })}
          >
            Découvrir Sifarah →
          </Button>
          <button
            type="button"
            className="mt-4 text-sm font-medium text-[#174f43] hover:underline"
            onClick={() => navigate("/profile", { replace: true })}
          >
            Accéder à mon espace
          </button>
          <div className="mt-12 grid w-full max-w-sm grid-cols-2 gap-3 text-center text-xs text-muted-foreground">
            <span>Entreprises vérifiées</span>
            <span>Projets et réalisations</span>
            <span>Experts et professionnels</span>
            <span>Opportunités & partenariats</span>
          </div>
        </div>
      </OnboardingShell>
    );
  }

  // Progress: 1 usage → 2 interests → 3 rôle → 4 infos → 5 compte → verify as 5/6 → success 6/6
  const progressStep = step === 6 ? 5 : step;

  return (
    <OnboardingShell step={progressStep} wide={step === 2 || step === 4} account={step === 5}>
      {step === 1 ? (
        <div>
          <div className="relative mb-6 overflow-hidden rounded-xl">
            <img src={heroArch} alt="" className="h-28 w-full object-cover sm:h-32" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <p
              className="absolute bottom-3 left-4 right-4 text-lg font-normal text-white sm:text-xl"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Bienvenue sur Sifarah.
            </p>
          </div>
          <h2
            className="text-xl font-normal tracking-tight text-neutral-900 sm:text-2xl"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Comment souhaitez-vous utiliser Sifarah ?
          </h2>
          <div className="mt-4 space-y-2">
            {USAGE_OPTIONS.map((opt) => {
              const selected = draft.usage === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    patch({
                      usage: opt.id,
                      profileType:
                        opt.id === "company" ? "enterprise" : opt.id === "independent" ? "individual" : null,
                    })
                  }
                  className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3.5 text-left transition-colors ${
                    selected ? "border-[#174f43] bg-[#174f43]/5" : "border-neutral-200 bg-white"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      selected ? "border-[#174f43] bg-[#174f43]" : "border-neutral-300"
                    }`}
                  >
                    {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                  </span>
                  <span className="text-sm font-medium leading-snug text-neutral-900">{opt.label}</span>
                </button>
              );
            })}
          </div>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          <NavRow
            onContinue={() => {
              if (!validateStep(1)) return;
              goNextFrom(1);
            }}
          />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <button type="button" onClick={() => navigate("/login")} className="font-semibold text-[#174f43] hover:underline">
              Se connecter
            </button>
          </p>
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <h2
            className="text-xl font-normal tracking-tight text-neutral-900 sm:text-2xl"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Qu'est-ce qui vous intéresse ?
          </h2>
          <div className="mt-4 space-y-2">
            {INTERESTS.map((item) => {
              const checked = draft.interests.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    patch({
                      interests: checked
                        ? draft.interests.filter((id) => id !== item.id)
                        : [...draft.interests, item.id],
                    })
                  }
                  className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left ${
                    checked ? "border-[#174f43] bg-[#174f43]/5" : "border-neutral-200 bg-white"
                  }`}
                >
                  <img src={item.image} alt="" className="h-14 w-16 shrink-0 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1 text-sm font-medium text-neutral-900">{item.label}</span>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      checked ? "border-[#174f43] bg-[#174f43] text-white" : "border-neutral-300"
                    }`}
                  >
                    {checked ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                  </span>
                </button>
              );
            })}
          </div>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          <NavRow
            onBack={() => goBackFrom(2)}
            onContinue={() => {
              if (!validateStep(2)) return;
              goNextFrom(2);
            }}
          />
        </div>
      ) : null}

      {step === 3 ? (
        <div>
          <h2
            className="text-xl font-normal tracking-tight text-neutral-900 sm:text-2xl"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Vous êtes un professionnel ou une entreprise ?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Optionnel si vous explorez seulement — vous pourrez créer un profil pro plus tard.
          </p>
          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={() => patch({ profileType: "individual" })}
              className={`w-full rounded-2xl border p-4 text-left ${
                draft.profileType === "individual" ? "border-[#174f43] bg-[#174f43]/5" : "border-neutral-200"
              }`}
            >
              <p className="font-semibold text-neutral-900">Professionnel indépendant</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Architecte, ingénieur, artisan, maître d'œuvre…
              </p>
            </button>
            <button
              type="button"
              onClick={() => patch({ profileType: "enterprise" })}
              className={`w-full rounded-2xl border p-4 text-left ${
                draft.profileType === "enterprise" ? "border-[#174f43] bg-[#174f43]/5" : "border-neutral-200"
              }`}
            >
              <p className="font-semibold text-neutral-900">Entreprise</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Société de construction, promoteur, bureau d'études…
              </p>
            </button>
            <button
              type="button"
              onClick={() => patch({ profileType: null })}
              className={`w-full rounded-2xl border p-4 text-left ${
                draft.profileType === null ? "border-[#174f43] bg-[#174f43]/5" : "border-neutral-200"
              }`}
            >
              <p className="font-semibold text-neutral-900">Particulier / investisseur</p>
              <p className="mt-1 text-sm text-muted-foreground">Je souhaite seulement explorer la plateforme.</p>
            </button>
          </div>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          <NavRow
            onBack={() => goBackFrom(3)}
            onContinue={() => {
              if (!validateStep(3)) return;
              goNextFrom(3);
            }}
          />
        </div>
      ) : null}

      {step === 4 ? (
        <div>
          <h2
            className="text-xl font-normal tracking-tight text-neutral-900 sm:text-2xl"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Quelques informations en plus
          </h2>
          <div className="mt-5 space-y-4">
            {pro ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Raison sociale</label>
                <Input
                  value={draft.raisonSociale}
                  onChange={(e) => patch({ raisonSociale: e.target.value })}
                  placeholder="Nom de votre activité ou entreprise"
                  className="h-11"
                  required
                />
              </div>
            ) : null}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-800">Votre région</label>
              <RegionSelect
                value={draft.region}
                onChange={(region) => {
                  const nextCity = citiesForRegion(region).includes(draft.location) ? draft.location : "";
                  patch({ region, location: nextCity });
                }}
                className="h-11"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-800">Votre ville</label>
              <CityPicker
                region={draft.region}
                value={draft.location}
                onChange={(location) => patch({ location })}
                placeholder="Sélectionnez votre ville"
                className="h-11"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                Votre secteur d'activité{pro ? "" : " (optionnel)"}
              </label>
              <div className="space-y-2">
                {draft.secteurs.map((value, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      value={value}
                      onChange={(e) => setSecteurAt(index, e.target.value)}
                      className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-[#174f43]"
                      required={pro && index === 0}
                    >
                      <option value="">Sélectionnez une activité</option>
                      {secteurOptions.map((label) => (
                        <option
                          key={label}
                          value={label}
                          disabled={draft.secteurs.some((s, i) => i !== index && s === label)}
                        >
                          {label}
                        </option>
                      ))}
                    </select>
                    {draft.secteurs.length > 1 ? (
                      <Button type="button" variant="outline" size="icon" className="h-11 w-11 shrink-0" onClick={() => removeSecteur(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
              {pro && draft.secteurs.length < MAX_SECTEURS ? (
                <button
                  type="button"
                  onClick={addSecteur}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#174f43] hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un autre secteur
                </button>
              ) : null}
              {pro ? (
                <p className="mt-1.5 text-xs text-muted-foreground">Jusqu'à {MAX_SECTEURS} secteurs.</p>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 px-3 py-3">
              <span className="text-sm text-neutral-800">Souhaitez-vous recevoir nos actualités ?</span>
              <Switch checked={draft.newsletter} onCheckedChange={(newsletter) => patch({ newsletter })} />
            </div>
          </div>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          <NavRow
            onBack={() => goBackFrom(4)}
            onContinue={() => {
              if (!validateStep(4)) return;
              goNextFrom(4);
            }}
          />
        </div>
      ) : null}

      {step === 5 ? (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <h2 className="text-xl font-bold leading-snug text-neutral-900 sm:text-2xl">
                Créez votre compte pour découvrir des professionnels, projets et matériaux au Maroc
              </h2>

              <div className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={draft.lastName}
                      onChange={(e) => patch({ lastName: e.target.value })}
                      className="h-11"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={draft.firstName}
                      onChange={(e) => patch({ firstName: e.target.value })}
                      className="h-11"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                    Numéro de téléphone <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    value={draft.phone}
                    onChange={(phone) => patch({ phone })}
                    inputClassName="h-11"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={draft.email}
                      onChange={(e) => patch({ email: e.target.value })}
                      className="h-11 pr-10"
                      required
                    />
                    <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={draft.password}
                      onChange={(e) => patch({ password: e.target.value })}
                      className="h-11 pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                    Confirmer votre mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswordConfirm ? "text" : "password"}
                      value={draft.passwordConfirm}
                      onChange={(e) => patch({ passwordConfirm: e.target.value })}
                      className="h-11 pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      onClick={() => setShowPasswordConfirm((v) => !v)}
                      aria-label={showPasswordConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-xs leading-relaxed text-neutral-500">
                Conformément à la loi n° 09-08, vous disposez d'un droit d'accès, de rectification et d'opposition
                aux données vous concernant.
              </p>

              <label className="mt-4 flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={draft.acceptTerms}
                  onChange={(e) => patch({ acceptTerms: e.target.checked })}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 accent-[#174f43]"
                />
                <span className="text-sm leading-snug text-neutral-700">
                  J'ai lu et j'accepte les{" "}
                  <button type="button" className="font-medium text-[#174f43] underline-offset-2 hover:underline">
                    Conditions Générales d'Utilisation
                  </button>{" "}
                  et la{" "}
                  <button type="button" className="font-medium text-[#174f43] underline-offset-2 hover:underline">
                    Politique de Confidentialité
                  </button>
                </span>
              </label>

              {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => goBackFrom(5)}
                  className="h-12 border-neutral-300 sm:w-36"
                >
                  ← Retour
                </Button>
                <Button
                  type="button"
                  onClick={handleEmailSignUp}
                  disabled={isLoading}
                  className="h-12 flex-1 bg-[#174f43] text-base font-semibold text-white hover:bg-[#123d34]"
                >
                  {isLoading ? "Inscription..." : "Inscrivez-vous"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col border-t border-neutral-200 bg-[#F7F8F7] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
              <div className="mx-auto w-full max-w-xs flex-1">
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={heroArch}
                    alt=""
                    className="h-44 w-full object-cover object-center sm:h-52 lg:h-56"
                  />
                </div>
                <div className="mt-6 space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full justify-center gap-3 border-neutral-300 bg-white text-neutral-900 hover:bg-white"
                    disabled={isLoading}
                    onClick={() => handleOAuth("google")}
                  >
                    <GoogleIcon />
                    Continuer avec Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full justify-center gap-3 border-neutral-300 bg-white text-neutral-900 hover:bg-white"
                    disabled={isLoading}
                    onClick={() => handleOAuth("apple")}
                  >
                    <AppleIcon />
                    Continuer avec Apple
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {step === 6 ? (
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#174f43]/10 text-[#174f43]">
            <Mail className="h-10 w-10" />
          </div>
          <h2
            className="mt-6 text-xl font-normal tracking-tight text-neutral-900 sm:text-2xl"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Vérifiez votre e-mail
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Nous avons envoyé un code de vérification à{" "}
            <span className="font-medium text-neutral-900">{draft.email}</span>
          </p>

          <div className="mt-6 flex gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  otpRefs.current[index] = el;
                }}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => onOtpChange(index, e.target.value)}
                onKeyDown={(e) => onOtpKeyDown(index, e)}
                className="h-12 w-10 rounded-lg border border-neutral-300 text-center text-lg font-semibold outline-none focus:border-[#174f43] focus:ring-2 focus:ring-[#174f43]/30"
              />
            ))}
          </div>

          <button
            type="button"
            disabled={resendIn > 0 || isResending}
            onClick={handleResend}
            className="mt-4 text-sm text-muted-foreground disabled:opacity-60"
          >
            {resendIn > 0 ? `Renvoyer le code dans ${resendIn}s` : isResending ? "Envoi..." : "Renvoyer le code"}
          </button>

          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

          <Button
            type="button"
            className="mt-6 h-12 w-full bg-[#174f43] text-base font-semibold text-white hover:bg-[#123d34]"
            disabled={isLoading}
            onClick={handleVerifyOtp}
          >
            {isLoading ? "Vérification..." : "Vérifier et continuer"}
          </Button>

          <button
            type="button"
            className="mt-4 text-sm font-medium text-[#174f43] hover:underline"
            onClick={() => {
              setOtp(["", "", "", "", "", ""]);
              setStep(5);
            }}
          >
            Modifier l'adresse e-mail
          </button>
        </div>
      ) : null}
    </OnboardingShell>
  );
};

export default CreateProfile;
