import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Bell, Briefcase, Shield, Moon, Globe, Trash2, User, Users, Eye, Mail } from "lucide-react";
import { FEED_CATEGORIES } from "@/lib/taxonomy";
import { taxonomyService, type InternalCategory } from "@/services/taxonomyService";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useVisitorGate } from "@/contexts/VisitorGateContext";
import { useProfile } from "@/hooks/useProfile";
import { profileService } from "@/services/profileService";
import { visitorService } from "@/services/visitorService";
import { supabase } from "@/lib/supabase";
import { isWithinUploadLimit, storageService, uploadMaxLabel } from "@/services/storageService";
import { getDefaultAvatar } from "@/lib/avatar";
import { USERNAMES_ENABLED, profileMemberLabel } from "@/lib/profileHandle";
import { toast } from "@/components/ui/use-toast";
import { userSettingsService } from "@/services/userSettingsService";
import { muteService, type MutedAccount } from "@/services/muteService";
import { preferredWebsiteFrom, websiteLinksFrom } from "@/components/ProfileInfosCard";
import ImageCropper from "@/components/ImageCropper";
import { useAppLanguage } from "@/contexts/AppLanguageContext";
import { MAX_BIO_LENGTH } from "@/lib/bio";

const Settings = () => {
  const navigate = useNavigate();
  const { user, visitorUser } = useAuth();
  const { visitorProfile, refreshVisitorProfile } = useVisitorGate();
  const { profile, loading: profileLoading } = useProfile();
  const isParticulier = Boolean(visitorUser && !user);
  const accountId = user?.id || visitorUser?.id || null;
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("sifarah.dark") === "1";
    } catch {
      return false;
    }
  });
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [confirmLoginEmail, setConfirmLoginEmail] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem("app_language") || "Francais");
  const [region, setRegion] = useState("UAE");
  const [showPhone, setShowPhone] = useState(false);
  const [allowDirectMessages, setAllowDirectMessages] = useState(true);
  const [showActivityStatus, setShowActivityStatus] = useState(true);
  const [commentPermission, setCommentPermission] = useState<"followers" | "follow_back" | "off">("followers");
  const [tagPermission, setTagPermission] = useState<"everyone" | "following" | "off">("everyone");
  const [mutedAccounts, setMutedAccounts] = useState<MutedAccount[]>([]);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [internalCategories, setInternalCategories] = useState<InternalCategory[]>([]);
  const [taxonomyUnavailable, setTaxonomyUnavailable] = useState(false);
  const [savedInternalCategoryIds, setSavedInternalCategoryIds] = useState<number[]>([]);
  const [selectedInternalCategoryIds, setSelectedInternalCategoryIds] = useState<number[]>([]);
  const [pickedCategoryId, setPickedCategoryId] = useState<number | null>(null);
  const [pickedSubCategory, setPickedSubCategory] = useState("");
  const [pickedInternalCategoryId, setPickedInternalCategoryId] = useState<number | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const allowsMultipleCategories = profile?.profile_type === "enterprise";
  const { setLanguage: setAppLanguage } = useAppLanguage();
  const languageTouched = useRef(false);
  const languageOptions = [
    "English",
    "Francais",
    "Arabic",
    "Spanish",
    "German",
    "Italian",
    "Portuguese",
    "Chinese",
    "Japanese",
    "Korean",
    "Hindi",
    "Turkish",
    "Russian",
  ];
  const languageLabels: Record<string, string> = {
    English: "Anglais",
    Francais: "Français",
    Arabic: "Arabe",
    Spanish: "Espagnol",
    German: "Allemand",
    Italian: "Italien",
    Portuguese: "Portugais",
    Chinese: "Chinois",
    Japanese: "Japonais",
    Korean: "Coréen",
    Hindi: "Hindi",
    Turkish: "Turc",
    Russian: "Russe",
  };
  const regionOptions = [
    "UAE",
    "Saudi Arabia",
    "Qatar",
    "Kuwait",
    "Bahrain",
    "Oman",
    "Morocco",
    "Algeria",
    "Tunisia",
    "Egypt",
    "France",
    "Spain",
    "United Kingdom",
    "United States",
    "Canada",
    "India",
    "China",
    "Japan",
    "Brazil",
    "Australia",
  ];
  const regionLabels: Record<string, string> = {
    UAE: "Émirats arabes unis",
    "Saudi Arabia": "Arabie saoudite",
    Qatar: "Qatar",
    Kuwait: "Koweït",
    Bahrain: "Bahreïn",
    Oman: "Oman",
    Morocco: "Maroc",
    Algeria: "Algérie",
    Tunisia: "Tunisie",
    Egypt: "Égypte",
    France: "France",
    Spain: "Espagne",
    "United Kingdom": "Royaume-Uni",
    "United States": "États-Unis",
    Canada: "Canada",
    India: "Inde",
    China: "Chine",
    Japan: "Japon",
    Brazil: "Brésil",
    Australia: "Australie",
  };

  useEffect(() => {
    if (!profile || isParticulier) return;
    setUsername(profile.username || "");
    setFullName(profile.full_name || "");
    setLoginEmail(user?.email || "");
    setBio(profile.bio || "");
    setWebsiteUrl(preferredWebsiteFrom(profile.website_url));
  }, [profile, user?.email, isParticulier]);

  useEffect(() => {
    if (!isParticulier || !visitorProfile || !visitorUser) return;
    setUsername(String(visitorUser.user_metadata?.username || ""));
    setFullName(visitorProfile.name || "");
    setLoginEmail(visitorProfile.email || visitorUser.email || "");
    setBio(visitorProfile.bio || "");
  }, [isParticulier, visitorProfile, visitorUser]);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!accountId) return;
      try {
        const settings = await userSettingsService.loadForAccount(accountId, isParticulier);
        setNotifications(settings.notifications_enabled);
        setEmailNotifications(settings.email_notifications_enabled);
        setDarkMode(settings.dark_mode_enabled);
        applySavedDark(settings.dark_mode_enabled);
        if (!languageTouched.current) {
          const chosen = localStorage.getItem("app_language");
          const next = chosen || settings.language;
          setLanguage(next);
          setAppLanguage(next);
        }
        setRegion(settings.region);
        setShowPhone(settings.show_phone);
        setAllowDirectMessages(settings.allow_direct_messages);
        setShowActivityStatus(settings.show_activity_status);
        setCommentPermission(settings.comment_permission);
        setTagPermission(settings.tag_permission);
        const muted = await muteService.getMutedAccounts(accountId);
        setMutedAccounts(muted);
      } catch (error) {
        console.error("Error loading user settings:", error);
      }
    };

    loadPreferences();
  }, [accountId, isParticulier]);

  useEffect(() => {
    if (!user || isParticulier) return;
    let cancelled = false;
    Promise.all([taxonomyService.listInternalCategories(), taxonomyService.getProfileInternalCategoryIds(user.id)])
      .then(([rows, currentIds]) => {
        if (cancelled) return;
        setInternalCategories(rows);
        setSavedInternalCategoryIds(currentIds);
        setSelectedInternalCategoryIds(currentIds);
        const current = rows.find((row) => row.id === currentIds[0]);
        if (current) {
          setPickedCategoryId(current.category_id);
          setPickedSubCategory(current.sub_category);
          setPickedInternalCategoryId(current.id);
        }
      })
      .catch((error) => {
        console.error("Error loading internal categories:", error);
        if (!cancelled) setTaxonomyUnavailable(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, isParticulier]);

  const subCategoryOptions = Array.from(
    new Set(internalCategories.filter((row) => row.category_id === pickedCategoryId).map((row) => row.sub_category))
  );
  const detailOptions = internalCategories.filter(
    (row) => row.category_id === pickedCategoryId && row.sub_category === pickedSubCategory
  );
  const selectedCategoryRows = selectedInternalCategoryIds
    .map((id) => internalCategories.find((row) => row.id === id))
    .filter(Boolean) as InternalCategory[];
  const categorySelectionDirty =
    selectedInternalCategoryIds.length !== savedInternalCategoryIds.length ||
    selectedInternalCategoryIds.some((id, index) => id !== savedInternalCategoryIds[index]);

  const addPickedCategory = () => {
    if (!pickedInternalCategoryId) return;
    if (allowsMultipleCategories) {
      setSelectedInternalCategoryIds((prev) =>
        prev.includes(pickedInternalCategoryId) ? prev : [...prev, pickedInternalCategoryId]
      );
    } else {
      setSelectedInternalCategoryIds([pickedInternalCategoryId]);
    }
  };

  const removeSelectedCategory = (id: number) => {
    setSelectedInternalCategoryIds((prev) => {
      const next = prev.filter((item) => item !== id);
      return allowsMultipleCategories ? next : next.slice(0, 1);
    });
  };

  const makePrimaryCategory = (id: number) => {
    setSelectedInternalCategoryIds((prev) => [id, ...prev.filter((item) => item !== id)]);
  };

  const handleSaveCategory = async () => {
    if (!user || !selectedInternalCategoryIds.length) return;
    setIsSavingCategory(true);
    try {
      const ids = allowsMultipleCategories
        ? selectedInternalCategoryIds
        : selectedInternalCategoryIds.slice(0, 1);
      await taxonomyService.setProfileInternalCategoryIds(user.id, ids);
      setSavedInternalCategoryIds(ids);
      setSelectedInternalCategoryIds(ids);
      toast({
        title: "Catégorie enregistrée",
        description: allowsMultipleCategories
          ? "Vos spécialités sont enregistrées. La première est utilisée pour le fil."
          : "Vos prochaines publications apparaîtront dans cette catégorie du fil.",
      });
    } catch (error) {
      console.error("Error saving internal category:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer la catégorie." });
    } finally {
      setIsSavingCategory(false);
    }
  };

  const applySavedDark = (on: boolean) => {
    document.documentElement.classList.toggle("dark", on);
    try {
      localStorage.setItem("sifarah.dark", on ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const avatarPreview = avatarFile
    ? URL.createObjectURL(avatarFile)
    : (isParticulier ? visitorProfile?.avatar_url : profile?.avatar_url) || getDefaultAvatar(isParticulier ? "individual" : profile?.profile_type);

  const normalizeWebsiteUrl = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Invalid website URL");
    }
    return parsed.toString();
  };

  const persistProfile = async (alsoChangeLoginEmail = false) => {
    if (isParticulier) {
      if (!visitorUser || !visitorProfile) return;
      setIsSaving(true);
      try {
        const avatarUrl = avatarFile
          ? await storageService.uploadImage(avatarFile, `visitors/${visitorUser.id}`)
          : visitorProfile.avatar_url;
        await visitorService.updateMine({
          name: fullName.trim() || visitorProfile.name,
          phone: visitorProfile.phone,
          email: loginEmail.trim(),
          bio: bio.slice(0, MAX_BIO_LENGTH),
          avatarUrl,
        });
        await supabase.auth.updateUser({
          data: { username: username.trim() },
          ...(alsoChangeLoginEmail ? { email: loginEmail.trim() } : {}),
        });
        await refreshVisitorProfile();
        setAvatarFile(null);
        setConfirmLoginEmail(null);
        toast({
          title: alsoChangeLoginEmail ? "Email de connexion mis à jour" : "Profil mis à jour",
          description: alsoChangeLoginEmail
            ? `Vous vous connecterez avec ${loginEmail.trim()}. Si un message de confirmation arrive, ouvrez-le pour valider le changement.`
            : "Vos informations ont bien été enregistrées.",
        });
      } catch (error) {
        console.error("Error updating particulier settings:", error);
        toast({ title: "Erreur", description: "Impossible de sauvegarder le profil." });
      } finally {
        setIsSaving(false);
      }
      return;
    }
    if (!user || !profile) return;
    setIsSaving(true);
    try {
      let avatarUrl = profile.avatar_url;
      if (avatarFile) {
        avatarUrl = await storageService.uploadImage(avatarFile, "avatars");
      }

      const nextPreferred = normalizeWebsiteUrl(websiteUrl);
      const extraSites = websiteLinksFrom(profile.website_url).slice(1).filter(
        (url) => url !== nextPreferred
      );
      const nextWebsiteUrl = nextPreferred
        ? [nextPreferred, ...extraSites].join("\n")
        : extraSites.join("\n") || null;

      await profileService.updateProfile(user.id, {
        username: USERNAMES_ENABLED ? username.trim() || profile.username : profile.username,
        full_name: fullName.trim(),
        bio: bio.slice(0, MAX_BIO_LENGTH),
        profession: profile.profession,
        location: profile.location,
        phone: profile.phone,
        website_url: nextWebsiteUrl,
        profile_type: profile.profile_type,
        avatar_url: avatarUrl,
      });

      if (alsoChangeLoginEmail) {
        await profileService.updateLoginEmail(loginEmail.trim());
      }

      setAvatarFile(null);
      setConfirmLoginEmail(null);
      toast({
        title: alsoChangeLoginEmail ? "Email de connexion mis à jour" : "Profil mis à jour",
        description: alsoChangeLoginEmail
          ? `Vous vous connecterez avec ${loginEmail.trim()}. Si un message de confirmation arrive, ouvrez-le pour valider le changement.`
          : "Vos informations ont bien été enregistrées.",
      });
    } catch (error) {
      console.error("Error updating settings profile:", error);
      const invalidUrl =
        error instanceof TypeError ||
        (error instanceof Error && error.message === "Invalid website URL");
      toast({
        title: "Erreur",
        description: invalidUrl
          ? "Enter a valid website URL (http or https)."
          : "Impossible de sauvegarder le profil.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!accountId || (!isParticulier && !profile)) return;
    const next = loginEmail.trim();
    const current = (isParticulier ? visitorProfile?.email || visitorUser?.email || "" : user?.email || "").trim();
    if (next && next.toLowerCase() !== current.toLowerCase()) {
      setConfirmLoginEmail(next);
      return;
    }
    await persistProfile(false);
  };

  const handleSavePreferences = async () => {
    if (!accountId) return;
    setIsSavingPreferences(true);
    try {
      await userSettingsService.saveForAccount(accountId, isParticulier, {
        notifications_enabled: notifications,
        email_notifications_enabled: emailNotifications,
        dark_mode_enabled: darkMode,
        language,
        region,
        show_phone: showPhone,
        allow_direct_messages: allowDirectMessages,
        show_activity_status: showActivityStatus,
        comment_permission: commentPermission,
        tag_permission: tagPermission,
      });
      setAppLanguage(language);
      toast({
        title: "Préférences sauvegardées",
        description: "Vos paramètres ont été enregistrés en base.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences.",
      });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm("Confirmer ? Cette action est irréversible.");
    if (!confirmed) return;

    toast({
      title: "Action requise",
      description: "Suppression de compte a brancher au backend.",
    });
  };

  if ((user && profileLoading) || (isParticulier && !visitorProfile)) {
    return <div className="py-10 text-center text-muted-foreground">Chargement des paramètres...</div>;
  }

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background px-4 py-3 sm:px-6 sm:py-4 md:px-8">
        <button onClick={() => navigate(-1)} className="text-card-foreground hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-card-foreground">Paramètres</h1>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-2xl mx-auto space-y-6 sm:space-y-8">
        {/* Profile Section */}
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Profil</h2>
          </div>
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3">
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover border border-border"
              />
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && !isWithinUploadLimit(file)) {
                        toast({ title: "Image", description: `Chaque fichier doit faire ${uploadMaxLabel} maximum.` });
                      } else {
                        setCropFile(file);
                      }
                      e.target.value = "";
                    }}
                  />
                  <span className="inline-flex h-9 items-center rounded-md bg-secondary px-3 text-sm font-medium">
                    Prendre une photo
                  </span>
                </label>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && !isWithinUploadLimit(file)) {
                        toast({ title: "Image", description: `Chaque fichier doit faire ${uploadMaxLabel} maximum.` });
                      } else {
                        setCropFile(file);
                      }
                      e.target.value = "";
                    }}
                  />
                  <span className="inline-flex h-9 items-center rounded-md bg-secondary px-3 text-sm font-medium">
                    Importer une photo
                  </span>
                </label>
              </div>
            </div>
            {cropFile ? (
              <ImageCropper
                file={cropFile}
                aspect={1}
                round
                outputWidth={512}
                onCancel={() => setCropFile(null)}
                onConfirm={(cropped) => {
                  setAvatarFile(cropped);
                  setCropFile(null);
                }}
              />
            ) : null}

            {USERNAMES_ENABLED ? (
              <div>
                <Label htmlFor="username" className="text-sm sm:text-base font-medium text-card-foreground mb-2 block">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre nom d'utilisateur"
                />
              </div>
            ) : null}

            <div>
              <Label htmlFor="fullname" className="text-sm sm:text-base font-medium text-card-foreground mb-2 block">
                Nom complet
              </Label>
              <Input
                id="fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Votre nom"
              />
            </div>

            <div>
              <Label htmlFor="login-email" className="text-sm sm:text-base font-medium text-card-foreground mb-2 block">
                Email de connexion
              </Label>
              <Input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  setConfirmLoginEmail(null);
                }}
                placeholder="vous@exemple.com"
              />
              <p className="mt-1 text-xs leading-snug text-muted-foreground">
                C'est l'email du compte Auth. Le changer change aussi votre prochaine connexion.
              </p>
            </div>

            {confirmLoginEmail ? (
              <div className="rounded-xl border border-[#174f43]/20 bg-[#174f43]/5 px-3 py-3 text-sm leading-relaxed text-[#174f43]">
                <p className="flex items-center gap-2 font-semibold">
                  <Mail className="h-4 w-4" />
                  Changer l'email de connexion ?
                </p>
                <p className="mt-1 text-[13px]">
                  Vous vous connecterez ensuite avec <span className="font-semibold">{confirmLoginEmail}</span>
                  {user?.email ? `, et non plus avec ${user.email}` : ""}.
                </p>
                <div className="mt-3 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setConfirmLoginEmail(null)} disabled={isSaving}>
                    Annuler
                  </Button>
                  <Button type="button" onClick={() => void persistProfile(true)} disabled={isSaving}>
                    {isSaving ? "Enregistrement..." : "Oui, changer l'email"}
                  </Button>
                </div>
              </div>
            ) : null}

            {isParticulier ? null : (
            <div>
              <Label htmlFor="website" className="text-sm sm:text-base font-medium text-card-foreground mb-2 block">
                Site web préféré (bouton Website)
              </Label>
              <Input
                id="website"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://your-site.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                If set, a Website button appears on your public profile.
              </p>
            </div>
            )}

            <div>
              <Label htmlFor="bio" className="text-sm sm:text-base font-medium text-card-foreground mb-2 block">
                Bio (accroche courte)
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Courte phrase sous votre nom. La présentation longue se rédige dans « À propos » sur le profil.
              </p>
              <div className="relative">
                <Textarea
                  id="bio"
                  placeholder="Accroche courte : métier, ville, spécialité…"
                  value={bio}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= MAX_BIO_LENGTH) {
                      setBio(value);
                    }
                  }}
                  className="min-h-[100px] resize-none pr-16"
                  maxLength={MAX_BIO_LENGTH}
                />
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                  {bio.length}/{MAX_BIO_LENGTH}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={isSaving || !accountId}>
                {isSaving ? "Enregistrement..." : "Enregistrer le profil"}
              </Button>
            </div>
          </div>
        </div>

        {isParticulier ? null : (
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Catégorie professionnelle</h2>
          </div>
          {taxonomyUnavailable ? (
            <p className="text-sm text-muted-foreground">Les catégories sont indisponibles pour le moment.</p>
          ) : (
          <div className="space-y-4 sm:space-y-5">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {allowsMultipleCategories
                ? "Les entreprises peuvent ajouter plusieurs spécialités. Chaque spécialité débloque ses onglets profil (Biens, Projets, Réalisations, Services, Produits) ; la première (principale) place seulement vos publications dans le fil."
                : "Votre catégorie place vos publications dans le fil et définit les onglets de votre profil. Si vous la changez, vos anciennes publications restent dans leur catégorie d'origine."}
            </p>
            {selectedCategoryRows.length ? (
              <ul className="space-y-2">
                {selectedCategoryRows.map((row, index) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-card-foreground">
                        {row.detailed_sub_category}
                        {index === 0 ? (
                          <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-accent">Principale</span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.sub_category} · {row.code}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {allowsMultipleCategories && index > 0 ? (
                        <Button type="button" variant="ghost" size="sm" onClick={() => makePrimaryCategory(row.id)}>
                          Principale
                        </Button>
                      ) : null}
                      {allowsMultipleCategories || selectedCategoryRows.length > 1 ? (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeSelectedCategory(row.id)}>
                          Retirer
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
            <div>
              <Label htmlFor="pro-category" className="text-sm sm:text-base font-medium text-card-foreground mb-2 block">
                Catégorie
              </Label>
              <select
                id="pro-category"
                value={pickedCategoryId ?? ""}
                onChange={(e) => {
                  setPickedCategoryId(e.target.value ? Number(e.target.value) : null);
                  setPickedSubCategory("");
                  setPickedInternalCategoryId(null);
                }}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Choisir</option>
                {FEED_CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="pro-sub-category" className="text-sm sm:text-base font-medium text-card-foreground mb-2 block">
                Sous-catégorie
              </Label>
              <select
                id="pro-sub-category"
                value={pickedSubCategory}
                disabled={!pickedCategoryId}
                onChange={(e) => {
                  setPickedSubCategory(e.target.value);
                  setPickedInternalCategoryId(null);
                }}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">Choisir</option>
                {subCategoryOptions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="pro-detail" className="text-sm sm:text-base font-medium text-card-foreground mb-2 block">
                Spécialité
              </Label>
              <select
                id="pro-detail"
                value={pickedInternalCategoryId ?? ""}
                disabled={!pickedSubCategory}
                onChange={(e) => setPickedInternalCategoryId(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">Choisir</option>
                {detailOptions.map((item) => (
                  <option key={item.id} value={item.id}>{item.detailed_sub_category}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={addPickedCategory}
                disabled={
                  !pickedInternalCategoryId ||
                  (allowsMultipleCategories
                    ? selectedInternalCategoryIds.includes(pickedInternalCategoryId)
                    : false)
                }
              >
                {allowsMultipleCategories ? "Ajouter" : "Sélectionner"}
              </Button>
              <Button
                onClick={handleSaveCategory}
                disabled={isSavingCategory || !selectedInternalCategoryIds.length || !categorySelectionDirty}
              >
                {isSavingCategory ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
          )}
        </div>
        )}

        {/* Notifications Section */}
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Notifications</h2>
          </div>
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="notifications" className="text-sm sm:text-base font-medium text-card-foreground">
                  Notifications push
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Alertes pour les nouveaux messages et demandes
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="email-notifications" className="text-sm sm:text-base font-medium text-card-foreground">
                  Notifications email
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Recevoir les mises à jour par email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSavePreferences} disabled={isSavingPreferences || !accountId}>
                {isSavingPreferences ? "Enregistrement..." : "Enregistrer préférences"}
              </Button>
            </div>
          </div>
        </div>

        {isParticulier ? null : (
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Interagir avec les autres</h2>
          </div>
          <div className="space-y-4 sm:space-y-5">
            <div>
              <Label htmlFor="comment-permission" className="text-sm sm:text-base font-medium text-card-foreground mb-2 block">
                Qui peut commenter
              </Label>
              <select
                id="comment-permission"
                value={commentPermission}
                onChange={(e) => setCommentPermission(e.target.value as typeof commentPermission)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="followers">Vos abonnés</option>
                <option value="follow_back">Les abonnés que vous suivez en retour</option>
                <option value="off">Personne</option>
              </select>
            </div>
            <div>
              <Label htmlFor="tag-permission" className="text-sm sm:text-base font-medium text-card-foreground mb-2 block">
                Qui peut vous identifier
              </Label>
              <select
                id="tag-permission"
                value={tagPermission}
                onChange={(e) => setTagPermission(e.target.value as typeof tagPermission)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="everyone">Tout le monde</option>
                <option value="following">Les personnes que vous suivez</option>
                <option value="off">Ne pas autoriser les identifications</option>
              </select>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSavePreferences} disabled={isSavingPreferences || !accountId}>
                {isSavingPreferences ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </div>
        )}

        <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Ce que vous voyez</h2>
          </div>
          {mutedAccounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun compte masqué.</p>
          ) : (
            <ul className="divide-y divide-border">
              {mutedAccounts.map((row) => (
                <li key={row.mutedId} className="flex items-center gap-3 py-3">
                  <img
                    src={row.avatarUrl || getDefaultAvatar(row.profileType || undefined)}
                    alt=""
                    className="h-10 w-10 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {profileMemberLabel(row.fullName, row.username)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.mutePosts && row.muteServices
                        ? "Publications et services"
                        : row.mutePosts
                          ? "Publications"
                          : "Services"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!accountId) return;
                      try {
                        await muteService.unmuteAccount(accountId, row.mutedId);
                        setMutedAccounts((prev) => prev.filter((item) => item.mutedId !== row.mutedId));
                      } catch (error) {
                        console.error(error);
                        toast({ title: "Erreur", description: "Impossible de rétablir ce compte." });
                      }
                    }}
                  >
                    Réafficher
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Privacy & Security */}
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Confidentialité et sécurité</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/change-password")}>
              Changer le mot de passe
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/privacy-settings")}>
              Paramètres de confidentialité
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/settings/blocked")}>
              Comptes bloqués
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              Authentification à deux facteurs
            </Button>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Apparence</h2>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="dark-mode" className="text-sm sm:text-base font-medium text-card-foreground">
                Mode sombre
              </Label>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Passer au thème sombre
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={(checked) => {
                setDarkMode(checked);
                applySavedDark(checked);
              }}
            />
          </div>
        </div>

        {/* Language & Region */}
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Langue et région</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="language" className="text-sm sm:text-base font-medium text-card-foreground mb-2 block">
                Langue
              </Label>
              <select
                id="language"
                value={language}
                onChange={(e) => {
                  languageTouched.current = true;
                  setLanguage(e.target.value);
                  setAppLanguage(e.target.value);
                }}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>
                    {languageLabels[lang] || lang}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="region" className="text-sm sm:text-base font-medium text-card-foreground mb-2 block">
                Région
              </Label>
              <select
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {regionOptions.map((r) => (
                  <option key={r} value={r}>
                    {regionLabels[r] || r}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSavePreferences} disabled={isSavingPreferences || !accountId}>
                {isSavingPreferences ? "Enregistrement..." : "Appliquer la langue et la région"}
              </Button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-card rounded-lg border border-destructive/50 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
            <h2 className="text-lg sm:text-xl font-semibold text-destructive">Zone sensible</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <Button variant="destructive" className="w-full justify-start" onClick={handleDeleteAccount}>
              Supprimer le compte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

