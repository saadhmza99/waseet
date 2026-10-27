import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, CheckCircle2, Loader2, Mail, MapPin, User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PhoneInput from "@/components/PhoneInput";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useVisitorGate } from "@/contexts/VisitorGateContext";
import {
  DEVIS_BUDGETS,
  DEVIS_CITIES,
  DEVIS_PROJECT_GROUPS,
  devisExtraFieldsFor,
  devisProjectTypeById,
  guessProType,
} from "@/lib/devisCatalog";
import { isCompletePhone } from "@/lib/phone";
import { isValidEmail, readVisitorContact, storeVisitorContact } from "@/lib/visitorContact";
import { devisService } from "@/services/devisService";
import { profileService } from "@/services/profileService";
import { visitorService } from "@/services/visitorService";

type StepId = "type" | "details" | "contact" | "done";

const STEPS: { id: StepId; label: string }[] = [
  { id: "type", label: "Type de projet" },
  { id: "details", label: "Détails" },
  { id: "contact", label: "Coordonnées" },
  { id: "done", label: "Confirmation" },
];

const fieldClass =
  "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none transition focus:border-[#174f43] focus:ring-1 focus:ring-[#174f43]";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-700";

const Devis = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, visitorUser, loading: authLoading } = useAuth();
  const { visitorProfile, refreshVisitorProfile } = useVisitorGate();

  const presetType = params.get("type") || "";
  const sellerId = params.get("sellerId") || "";
  const sellerName = params.get("sellerName") || "";
  const serviceId = params.get("serviceId") || "";
  const productId = params.get("productId") || "";
  const presetProType = params.get("proType") || "";

  const source = serviceId ? "service" : productId ? "product" : sellerId ? "profile" : "open";
  const lockedTypeId =
    presetType ||
    (productId ? "achat-materiaux" : serviceId || sellerId ? "trouver-un-pro" : "");

  const [step, setStep] = useState<StepId>(lockedTypeId ? "details" : "type");
  const [projectTypeId, setProjectTypeId] = useState(lockedTypeId);
  const [extras, setExtras] = useState<Record<string, string>>(() =>
    presetProType || lockedTypeId === "trouver-un-pro"
      ? { proType: presetProType || "" }
      : {},
  );
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState(true);
  const [askName, setAskName] = useState(true);
  const [askPhone, setAskPhone] = useState(true);
  const [askEmail, setAskEmail] = useState(true);
  const [contactReady, setContactReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sellerProfession, setSellerProfession] = useState("");

  const projectType = devisProjectTypeById(projectTypeId);
  const extraFields = useMemo(() => {
    const fields = devisExtraFieldsFor(projectTypeId);
    // Pro already chosen from profile/service — don't re-ask which pro type.
    if (sellerId && (serviceId || source === "profile")) {
      return fields.filter((field) => field.id !== "proType");
    }
    return fields;
  }, [projectTypeId, sellerId, serviceId, source]);

  const contactComplete =
    contactReady && Boolean(name.trim()) && isCompletePhone(phone) && isValidEmail(email);
  const skipContact = contactComplete && !askName && !askPhone && !askEmail;

  const visibleSteps = useMemo(
    () =>
      STEPS.filter((s) => {
        if (s.id === "type" && lockedTypeId) return false;
        if (s.id === "contact" && skipContact) return false;
        return true;
      }),
    [lockedTypeId, skipContact],
  );
  const stepIndex = Math.max(
    0,
    visibleSteps.findIndex((s) => s.id === step),
  );
  const progress = step === "done" ? 100 : ((stepIndex + 1) / visibleSteps.length) * 100;

  useEffect(() => {
    if (lockedTypeId && step === "type") setStep("details");
  }, [lockedTypeId, step]);

  useEffect(() => {
    if (!sellerId) return;
    let cancelled = false;
    profileService
      .getProfile(sellerId)
      .then((profile) => {
        if (cancelled || !profile) return;
        setSellerProfession(profile.profession || "");
        if (!presetProType && (lockedTypeId === "trouver-un-pro" || !lockedTypeId)) {
          const guessed = guessProType(profile.profession);
          if (guessed) setExtras((prev) => ({ ...prev, proType: prev.proType || guessed }));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sellerId, presetProType, lockedTypeId]);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    const applyContact = (n: string, p: string, e: string) => {
      setName(n);
      setPhone(p);
      setEmail(e);
      setAskName(!n.trim());
      setAskPhone(!isCompletePhone(p));
      setAskEmail(!isValidEmail(e));
      setContactReady(true);
    };

    const loadContact = async () => {
      const stored = readVisitorContact();
      if (!user && !visitorUser) {
        if (cancelled) return;
        applyContact(stored.name.trim(), stored.phone.trim(), stored.email.trim());
        return;
      }

      if (visitorUser) {
        const details = visitorProfile ?? (await visitorService.getMine(visitorUser.id));
        if (cancelled) return;
        applyContact(
          details?.name?.trim() || stored.name.trim(),
          details?.phone?.trim() || stored.phone.trim(),
          details?.email?.trim() || stored.email.trim(),
        );
        return;
      }

      if (user) {
        const profile = await profileService.getProfile(user.id);
        if (cancelled) return;
        applyContact(
          (profile.full_name || "").trim() || stored.name.trim(),
          (profile.phone || "").trim() || stored.phone.trim(),
          (profile.email || user.email || "").trim() || stored.email.trim(),
        );
      }
    };

    void loadContact().catch(() => {
      if (!cancelled) setContactReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [user, visitorUser, visitorProfile, authLoading]);

  const selectType = (id: string) => {
    setProjectTypeId(id);
    setExtras((prev) => {
      const next: Record<string, string> = {};
      for (const field of devisExtraFieldsFor(id)) {
        if (prev[field.id]) next[field.id] = prev[field.id];
      }
      if (id === "trouver-un-pro" && (presetProType || guessProType(sellerProfession))) {
        next.proType = prev.proType || presetProType || guessProType(sellerProfession);
      }
      return next;
    });
    setStep("details");
  };

  const goContact = () => {
    if (!city.trim()) {
      toast({ title: "Ville requise", description: "Indiquez la ville du projet." });
      return;
    }
    if (skipContact) {
      void submit();
      return;
    }
    setStep("contact");
  };

  const submit = async () => {
    if (!projectType) {
      toast({ title: "Type manquant", description: "Choisissez un type de projet." });
      setStep("type");
      return;
    }
    if (!city.trim()) {
      toast({ title: "Ville requise", description: "Indiquez la ville du projet." });
      setStep("details");
      return;
    }
    if (!name.trim() || !isCompletePhone(phone)) {
      toast({ title: "Coordonnées incomplètes", description: "Nom et téléphone sont obligatoires." });
      setStep("contact");
      return;
    }
    if (email.trim() && !isValidEmail(email)) {
      toast({ title: "Email invalide", description: "Vérifiez l'adresse email." });
      setStep("contact");
      return;
    }

    setSubmitting(true);
    try {
      storeVisitorContact({ name, phone, email });
      if (visitorUser) {
        await visitorService.updateMine({ name, phone, email: email || undefined });
        await refreshVisitorProfile();
      }
      await devisService.create({
        projectTypeId: projectType.id,
        projectTypeLabel: projectType.label,
        city,
        budget,
        description,
        name,
        phone,
        email,
        whatsapp,
        extras,
        sellerId: sellerId || null,
        sellerName: sellerName || null,
        serviceId: serviceId || null,
        productId: productId || null,
        source,
      });
      setStep("done");
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible d'envoyer la demande. Réessayez." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f7]">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <button
          type="button"
          onClick={() => (step === "done" ? navigate("/") : navigate(-1))}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="mb-8 text-center sm:mb-10">
          <h1 className="mb-3 text-3xl font-semibold tracking-tight text-[#0f2f3d] md:text-4xl">
            Demandez un devis gratuit
          </h1>
          <p className="text-base text-neutral-500">
            Décrivez votre projet en quelques étapes
            {sellerName ? (
              <>
                {" "}
                pour <span className="font-semibold text-neutral-800">{sellerName}</span>
              </>
            ) : (
              " et recevez des réponses de professionnels vérifiés"
            )}
            .
          </p>
        </div>

        <div className="mb-8 sm:mb-10">
          <div className="mb-4 flex items-center justify-between">
            {visibleSteps.map((item, index) => {
              const done = index < stepIndex || step === "done";
              const active = item.id === step;
              return (
                <div key={item.id} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      done
                        ? "bg-[#174f43] text-white"
                        : active
                          ? "bg-[#174f43]/15 text-[#174f43] ring-2 ring-[#174f43]"
                          : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    {done ? <Check className="h-5 w-5" /> : index + 1}
                  </div>
                  <span
                    className={`hidden text-xs font-medium sm:block ${
                      done || active ? "text-[#174f43]" : "text-neutral-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-[#174f43] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-8">
          {step === "type" ? (
            <div>
              <h2 className="mb-2 text-xl font-semibold text-neutral-900">Quel est votre projet ?</h2>
              <p className="mb-6 text-sm text-neutral-500">Sélectionnez le type de projet que vous souhaitez réaliser.</p>
              <div className="space-y-6">
                {DEVIS_PROJECT_GROUPS.map((group) => (
                  <div key={group.id}>
                    <div className="mb-2.5 flex items-center gap-2">
                      <span className="text-lg" aria-hidden>
                        {group.icon}
                      </span>
                      <h3 className="text-sm font-semibold text-neutral-900">{group.label}</h3>
                      <span className="text-xs text-neutral-400">· {group.hint}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                      {group.types.map((type) => {
                        const selected = projectTypeId === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => selectType(type.id)}
                            className={`group relative flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all ${
                              selected
                                ? "border-[#174f43] bg-[#174f43]/5 ring-2 ring-[#174f43]/20 shadow-sm"
                                : "border-neutral-200 bg-white hover:border-[#174f43]/40 hover:bg-neutral-50"
                            }`}
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${
                                selected ? "bg-[#174f43] text-white" : "bg-neutral-100"
                              }`}
                              aria-hidden
                            >
                              {selected ? <Check className="h-4 w-4" /> : type.icon}
                            </span>
                            <span className="min-w-0 flex-1 pt-0.5">
                              <span
                                className={`block text-[13px] font-semibold leading-tight ${
                                  selected ? "text-[#0f2f3d]" : "text-neutral-900"
                                }`}
                              >
                                {type.label}
                              </span>
                              <span className="mt-0.5 block line-clamp-2 text-[11px] leading-snug text-neutral-500">
                                {type.hint}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {step === "details" && projectType ? (
            <div>
              <h2 className="mb-2 text-xl font-semibold text-neutral-900">Détails du projet</h2>
              <p className="mb-6 text-sm text-neutral-500">Précisez les détails pour recevoir des devis adaptés.</p>
              <div className="space-y-5">
                {lockedTypeId ? (
                  sellerName ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#174f43]/20 bg-[#174f43]/5 px-3 py-1.5 text-xs font-semibold text-[#0f2f3d]">
                      <span aria-hidden>👷</span>
                      {sellerName}
                      {sellerProfession ? ` · ${sellerProfession}` : ""}
                    </div>
                  ) : null
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#174f43]/20 bg-[#174f43]/5 px-3 py-1.5 text-xs font-semibold text-[#0f2f3d]">
                    <span aria-hidden>{projectType.icon}</span>
                    {projectType.label}
                    <button type="button" className="ml-1 underline" onClick={() => setStep("type")}>
                      changer
                    </button>
                  </div>
                )}

                {extraFields.length ? (
                  <div className="space-y-4 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Précisez votre projet
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {extraFields.map((field) => (
                        <div key={field.id}>
                          <label htmlFor={`devis-extra-${field.id}`} className="mb-1.5 block text-xs font-medium text-neutral-700">
                            {field.label}
                          </label>
                          <select
                            id={`devis-extra-${field.id}`}
                            value={extras[field.id] || ""}
                            onChange={(e) => setExtras((prev) => ({ ...prev, [field.id]: e.target.value }))}
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none transition focus:border-[#174f43] focus:ring-1 focus:ring-[#174f43]"
                          >
                            <option value="">—</option>
                            {field.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div>
                  <label htmlFor="devis-city" className={labelClass}>
                    Ville du projet *
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <select
                      id="devis-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={`${fieldClass} appearance-none pl-10`}
                    >
                      <option value="">Sélectionnez une ville</option>
                      {DEVIS_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="devis-budget" className={labelClass}>
                    Budget estimatif
                  </label>
                  <select id="devis-budget" value={budget} onChange={(e) => setBudget(e.target.value)} className={fieldClass}>
                    <option value="">Sélectionnez un budget</option>
                    {DEVIS_BUDGETS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="devis-description" className={labelClass}>
                    Description du projet
                    <span className="ml-1 text-xs font-normal text-neutral-400">(optionnel)</span>
                  </label>
                  <textarea
                    id="devis-description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez votre projet : type de construction, matériaux souhaités, contraintes particulières..."
                    className={`${fieldClass} resize-none`}
                  />
                </div>

                {skipContact ? (
                  <p className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                    Coordonnées déjà enregistrées :{" "}
                    <span className="font-semibold text-neutral-900">{name}</span>
                    {" · "}
                    <span className="font-semibold text-neutral-900">{phone}</span>
                    {" · "}
                    <span className="font-semibold text-neutral-900">{email}</span>
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2 pt-2">
                  {!lockedTypeId ? (
                    <button
                      type="button"
                      onClick={() => setStep("type")}
                      className="h-11 rounded-lg border border-neutral-200 px-4 text-sm font-semibold text-neutral-700"
                    >
                      Retour
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={goContact}
                    disabled={submitting || !contactReady}
                    className="h-11 flex-1 rounded-lg bg-[#174f43] px-4 text-sm font-semibold text-white hover:bg-[#123d34] disabled:opacity-60"
                  >
                    {skipContact ? (submitting ? "Envoi…" : "Envoyer la demande") : "Continuer"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {step === "contact" ? (
            <div>
              <h2 className="mb-2 text-xl font-semibold text-neutral-900">Vos coordonnées</h2>
              <p className="mb-6 text-sm text-neutral-500">
                Pour que les professionnels puissent vous contacter avec leur devis.
              </p>
              {!contactReady ? (
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement…
                </div>
              ) : (
                <div className="space-y-5">
                  {askName ? (
                    <div>
                      <label htmlFor="devis-name" className={labelClass}>
                        Nom complet *
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                          id="devis-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Votre nom et prénom"
                          className={`${fieldClass} pl-10`}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                      Nom : <span className="font-semibold text-neutral-900">{name}</span>
                    </p>
                  )}

                  {askPhone ? (
                    <div>
                      <label htmlFor="devis-phone" className={labelClass}>
                        Téléphone *
                      </label>
                      <PhoneInput
                        id="devis-phone"
                        value={phone}
                        onChange={setPhone}
                        inputClassName="rounded-lg border border-neutral-200 bg-neutral-50 py-3 text-sm"
                      />
                    </div>
                  ) : (
                    <p className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                      Téléphone : <span className="font-semibold text-neutral-900">{phone}</span>
                    </p>
                  )}

                  {askEmail ? (
                    <div>
                      <label htmlFor="devis-email" className={labelClass}>
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                          id="devis-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="votre@email.com"
                          className={`${fieldClass} pl-10`}
                        />
                      </div>
                    </div>
                  ) : email ? (
                    <p className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                      Email : <span className="font-semibold text-neutral-900">{email}</span>
                    </p>
                  ) : null}

                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#25D366]/30 bg-[#25D366]/5 p-4">
                    <input
                      type="checkbox"
                      checked={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#0f7a40] focus:ring-[#25D366]"
                    />
                    <span className="text-sm">
                      <span className="font-medium text-neutral-900">Recevoir les devis via WhatsApp</span>
                      <br />
                      <span className="text-neutral-500">Plus rapide — la plupart des pros répondent via WhatsApp.</span>
                    </span>
                  </label>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="h-11 rounded-lg border border-neutral-200 px-4 text-sm font-semibold text-neutral-700"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={() => void submit()}
                      disabled={submitting}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#174f43] px-4 text-sm font-semibold text-white hover:bg-[#123d34] disabled:opacity-60"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Envoyer la demande
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {step === "done" ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-[#174f43]" />
              <h2 className="mt-4 text-2xl font-semibold text-neutral-900">Demande envoyée</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
                {sellerName
                  ? `${sellerName} a bien reçu votre demande de devis.`
                  : "Votre demande est enregistrée. Des professionnels vérifiés pourront vous recontacter."}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(sellerId ? `/profile/${sellerId}` : "/")}
                  className="h-11 rounded-lg bg-[#174f43] px-5 text-sm font-semibold text-white"
                >
                  {sellerId ? "Retour au profil" : "Retour à l'accueil"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/explore")}
                  className="h-11 rounded-lg border border-neutral-200 px-5 text-sm font-semibold text-neutral-700"
                >
                  Explorer les pros
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Devis;
