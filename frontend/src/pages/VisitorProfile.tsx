import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Briefcase, Building2, Camera, ChevronRight, Loader2, Lock, LogOut, Mail, MoreVertical, Pencil, Phone, UserRound, Users, VolumeX, UserMinus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useVisitorGate } from "@/contexts/VisitorGateContext";
import { visitorService } from "@/services/visitorService";
import { followService } from "@/services/followService";
import { catalogService } from "@/services/catalogService";
import { muteService } from "@/services/muteService";
import VerifiedBadge from "@/components/VerifiedBadge";
import { WhatsAppIcon } from "@/components/PostActionIcons";
import InquiryDialog from "@/components/InquiryDialog";
import { storageService } from "@/services/storageService";
import { getDefaultAvatar } from "@/lib/avatar";
import { isValidEmail, storeVisitorContact } from "@/lib/visitorContact";
import { isCompletePhone } from "@/lib/phone";
import { toWhatsAppNumber } from "@/lib/propertyListing";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ImageCropper from "@/components/ImageCropper";
import PhoneInput from "@/components/PhoneInput";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const ChoiceCard = ({
  icon: Icon,
  title,
  description,
  onClick,
  primary = false,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-transform duration-150 hover:scale-[0.98] active:scale-[0.97] ${
      primary ? "border-[#174f43] bg-[#174f43]/5" : "border-neutral-200 bg-white"
    }`}
  >
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${primary ? "bg-[#174f43] text-white" : "bg-neutral-100 text-neutral-700"}`}>
      <Icon className="h-6 w-6" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block font-semibold text-neutral-900">{title}</span>
      <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{description}</span>
    </span>
    <ChevronRight className="h-5 w-5 shrink-0 text-neutral-400" />
  </button>
);

type FollowedProfile = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  isVerified: boolean;
  phone: string;
};

const followedProfile = (row: { following_id: string; profiles: unknown }): FollowedProfile | null => {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  if (!profile || typeof profile !== "object") return null;
  const record = profile as { id?: string; username?: string | null; full_name?: string | null; avatar_url?: string | null; is_verified?: boolean | null; phone?: string | null };
  const username = (record.username || "").trim();
  return {
    id: record.id || row.following_id,
    username,
    fullName: (record.full_name || "").trim() || username || "Profil",
    avatarUrl: record.avatar_url || null,
    isVerified: Boolean(record.is_verified),
    phone: (record.phone || "").trim(),
  };
};

export const JoinChoice = () => {
  const navigate = useNavigate();
  const { user, visitorUser, loading } = useAuth();
  const { requestVisitor } = useVisitorGate();

  if (!loading && user) return <Navigate to="/profile" replace />;

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 pb-10 pt-12">
      <h1 className="text-center text-2xl font-bold">Rejoindre Sifarah</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">Comment souhaitez-vous utiliser Sifarah ?</p>
      <div className="mt-8 space-y-3">
        {visitorUser ? null : (
          <ChoiceCard
            primary
            icon={UserRound}
            title="Particulier"
            description="Enregistrez des annonces, suivez des profils et publiez jusqu'à 3 biens."
            onClick={async () => {
              if (await requestVisitor("profile")) navigate("/profile");
            }}
          />
        )}
        <ChoiceCard
          icon={Building2}
          title="Agence"
          description="Publiez vos biens, projets et services."
          onClick={() => navigate("/create-profile?type=enterprise")}
        />
        <ChoiceCard
          icon={Briefcase}
          title="Professionnel indépendant"
          description="Présentez votre activité et vos réalisations."
          onClick={() => navigate("/create-profile?type=individual")}
        />
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <button type="button" onClick={() => navigate("/login")} className="font-semibold text-[#174f43] hover:underline">
          Se connecter
        </button>
      </p>
    </div>
  );
};

const VisitorProfile = () => {
  const navigate = useNavigate();
  const { visitorUser, loading: authLoading, signOut, setVisitorPassword } = useAuth();
  const { visitorProfile, refreshVisitorProfile } = useVisitorGate();
  const [editOpen, setEditOpen] = useState(false);
  const [infosOpen, setInfosOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", bio: "" });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [croppedAvatar, setCroppedAvatar] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [following, setFollowing] = useState<FollowedProfile[]>([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [biensOpen, setBiensOpen] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [biens, setBiens] = useState<Array<{ id: string; title?: string | null; city?: string | null; price?: string | null }>>([]);
  const [messageTarget, setMessageTarget] = useState<FollowedProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshLists = async () => {
    if (!visitorUser) return;
    const [followingRows, properties] = await Promise.all([
      followService.getFollowing(visitorUser.id),
      catalogService.getPropertiesByUser(visitorUser.id),
    ]);
    const people = (followingRows || []).map(followedProfile).filter((profile): profile is FollowedProfile => Boolean(profile));
    setFollowCount(people.length);
    setFollowing(people);
    setBiens(properties || []);
  };

  useEffect(() => {
    if (!visitorUser) return;
    void refreshLists().catch((error) => console.error("Error loading particulier profile:", error));
  }, [visitorUser?.id]);

  useEffect(() => {
    if ((!editOpen && !infosOpen) || !visitorProfile) return;
    setForm({
      name: visitorProfile.name,
      phone: visitorProfile.phone,
      email: visitorProfile.email || "",
      bio: visitorProfile.bio || "",
    });
    setAvatarUrl(visitorProfile.avatar_url);
    setCroppedAvatar(null);
    setPendingAvatar(null);
  }, [editOpen, infosOpen, visitorProfile]);

  const previewUrl = useMemo(() => (croppedAvatar ? URL.createObjectURL(croppedAvatar) : null), [croppedAvatar]);
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  if (authLoading || (visitorUser && !visitorProfile)) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#174f43]" />
      </div>
    );
  }

  if (!visitorUser || !visitorProfile) return <JoinChoice />;

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Nom requis", description: "Indiquez votre nom." });
      return;
    }
    setSaving(true);
    try {
      const nextAvatar = croppedAvatar
        ? await storageService.uploadImage(croppedAvatar, `visitors/${visitorUser.id}`)
        : avatarUrl;
      await visitorService.updateMine({
        name: form.name,
        phone: visitorProfile.phone,
        email: visitorProfile.email || "",
        bio: form.bio,
        avatarUrl: nextAvatar,
      });
      await refreshVisitorProfile();
      toast({ title: "Profil mis à jour" });
      setEditOpen(false);
    } catch (error) {
      console.error("Error updating visitor profile:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour le profil." });
    } finally {
      setSaving(false);
    }
  };

  const saveInfos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCompletePhone(form.phone) || !isValidEmail(form.email)) {
      toast({ title: "Coordonnées incomplètes", description: "Un email valide et un numéro de téléphone sont requis." });
      return;
    }
    setSaving(true);
    try {
      await visitorService.updateMine({
        name: visitorProfile.name,
        phone: form.phone,
        email: form.email,
        bio: visitorProfile.bio || "",
        avatarUrl: visitorProfile.avatar_url,
      });
      storeVisitorContact({ name: visitorProfile.name, phone: form.phone, email: form.email });
      await refreshVisitorProfile();
      toast({ title: "Infos mises à jour" });
      setInfosOpen(false);
    } catch (error) {
      console.error("Error updating visitor contact:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour les infos." });
    } finally {
      setSaving(false);
    }
  };

  const unfollow = async (profile: FollowedProfile) => {
    try {
      await followService.unfollowUser(visitorUser.id, profile.id);
      await refreshLists();
    } catch (error) {
      console.error("Error unfollowing:", error);
      toast({ title: "Erreur", description: "Impossible de ne plus suivre ce profil." });
    }
  };

  const mute = async (profile: FollowedProfile) => {
    try {
      await muteService.muteAccount(visitorUser.id, profile.id, "posts");
      toast({ title: "Profil masqué", description: "Ses posts n'apparaîtront plus dans votre fil." });
    } catch (error) {
      console.error("Error muting profile:", error);
      toast({ title: "Erreur", description: "Impossible de masquer ce profil pour le moment." });
    }
  };

  const openWhatsApp = (profile: FollowedProfile) => {
    const digits = profile.phone.replace(/\D/g, "");
    if (digits.length < 6) {
      toast({ title: "WhatsApp", description: "Ce profil n'a pas de numéro WhatsApp." });
      return;
    }
    window.open(`https://wa.me/${toWhatsAppNumber(profile.phone)}`, "_blank", "noopener,noreferrer");
  };

  const openFollowing = async () => {
    setFollowingOpen(true);
    setFollowingLoading(true);
    try {
      const rows = await followService.getFollowing(visitorUser.id);
      setFollowing((rows || []).map(followedProfile).filter((profile): profile is FollowedProfile => Boolean(profile)));
    } catch (error) {
      console.error("Error loading following:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger vos suivis." });
    } finally {
      setFollowingLoading(false);
    }
  };

  const passwordSet = !visitorUser.is_anonymous;

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidEmail(visitorProfile.email || "")) {
      toast({ title: "Email requis", description: "Ajoutez votre email dans Modifier les infos avant de choisir un mot de passe." });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Mot de passe trop court", description: "Utilisez au moins 6 caractères." });
      return;
    }
    if (password !== passwordConfirm) {
      toast({ title: "Mots de passe différents", description: "Les deux champs doivent être identiques." });
      return;
    }
    setSavingPassword(true);
    try {
      const { error, pendingConfirmation } = await setVisitorPassword(visitorProfile.email || "", password);
      if (error) {
        toast({ title: "Erreur", description: error.message });
        return;
      }
      setPassword("");
      setPasswordConfirm("");
      toast({
        title: pendingConfirmation ? "Confirmez votre email" : "Mot de passe enregistré",
        description: pendingConfirmation
          ? "Ouvrez l'email reçu, puis reconnectez-vous avec ce mot de passe."
          : "Vous pourrez vous reconnecter avec votre email et ce mot de passe.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const avatar = visitorProfile.avatar_url || getDefaultAvatar("enterprise");

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <div className="h-28 bg-white sm:h-36" />
      <div className="-mt-12 flex flex-col items-center px-5 text-center">
        <img src={avatar} alt={visitorProfile.name} className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-sm" />
        <h1 className="mt-3 text-xl font-bold">{visitorProfile.name}</h1>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Particulier</p>
        {visitorProfile.bio ? (
          <p className="mt-3 max-w-sm whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">{visitorProfile.bio}</p>
        ) : null}

        <div className="mt-5 w-full max-w-sm space-y-2 text-left">
          <button
            type="button"
            onClick={() => setBiensOpen(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 transition hover:bg-neutral-50 active:scale-[0.99]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#174f43] text-white">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-neutral-900">Mes biens</span>
              <span className="mt-0.5 block text-[13px] text-muted-foreground">{biens.length} / 3</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-neutral-400" />
          </button>
          <button
            type="button"
            onClick={() => void openFollowing()}
            className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 transition hover:bg-neutral-50 active:scale-[0.99]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
              <Users className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-neutral-900">Mes suivis</span>
              <span className="mt-0.5 block text-[13px] text-muted-foreground">{followCount}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-neutral-400" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold transition-transform hover:scale-[0.98] active:scale-[0.97]"
        >
          <Pencil className="h-4 w-4" /> Modifier le profil
        </button>
      </div>

      <div className="mx-5 mt-8 space-y-3">
        <div className="rounded-2xl border border-neutral-200 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Coordonnées · visibles uniquement par vous et les agences que vous contactez
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-neutral-400" /> {visitorProfile.phone}
          </p>
          {visitorProfile.email ? (
            <p className="mt-2 flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-neutral-400" /> {visitorProfile.email}
            </p>
          ) : (
            <p className="mt-2 text-sm text-neutral-500">Aucun email pour le moment.</p>
          )}
          <button
            type="button"
            onClick={() => setInfosOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-neutral-50"
          >
            <Phone className="h-4 w-4" /> Modifier les infos
          </button>
        </div>

        <form onSubmit={savePassword} className="rounded-2xl border border-neutral-200 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <Lock className="h-4 w-4 text-neutral-400" /> {passwordSet ? "Changer le mot de passe" : "Définir un mot de passe"}
          </p>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            {passwordSet
              ? "Vous pouvez vous reconnecter avec votre email et ce mot de passe."
              : "Optionnel. Sans mot de passe, vous restez connecté sur cet appareil. Avec un mot de passe, vous pourrez revenir plus tard."}
          </p>
          <div className="mt-3 space-y-2">
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="Mot de passe"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="Confirmer le mot de passe"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
            />
            <button
              type="submit"
              disabled={savingPassword || !password}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-[#174f43] text-sm font-semibold text-white disabled:opacity-60"
            >
              {savingPassword ? "Enregistrement..." : "Enregistrer le mot de passe"}
            </button>
          </div>
        </form>
        <ChoiceCard
          icon={Building2}
          title="Vous êtes une agence ou un pro ?"
          description="Créez un compte professionnel pour publier."
          onClick={() => navigate("/join")}
        />
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-red-600"
        >
          <LogOut className="h-4 w-4" /> Se déconnecter
        </button>
      </div>

      <Dialog open={biensOpen} onOpenChange={setBiensOpen}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mes biens · {biens.length}/3</DialogTitle>
          </DialogHeader>
          <p className="text-xs leading-snug text-muted-foreground">
            Un particulier publie jusqu'à 3 biens dans son portfolio. Un post ou un projet demande un compte professionnel.
          </p>
          {biens.length < 3 ? (
            <button
              type="button"
              onClick={() => {
                setBiensOpen(false);
                navigate("/", { state: { openCreate: true } });
              }}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-[#174f43] text-sm font-semibold text-white"
            >
              Publier un bien
            </button>
          ) : (
            <p className="text-sm text-neutral-500">Limite de 3 biens atteinte.</p>
          )}
          {biens.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Aucun bien pour le moment.</p>
          ) : (
            <ul className="space-y-2">
              {biens.map((bien) => (
                <li key={bien.id} className="rounded-xl bg-neutral-50 px-3 py-2">
                  <p className="truncate text-sm font-semibold text-neutral-900">{bien.title || "Bien"}</p>
                  <p className="truncate text-xs text-neutral-500">{[bien.city, bien.price].filter(Boolean).join(" · ")}</p>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={followingOpen} onOpenChange={setFollowingOpen}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mes suivis</DialogTitle>
          </DialogHeader>
          <div className="max-h-[50vh] space-y-1 overflow-y-auto">
            {followingLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-[#174f43]" />
              </div>
            ) : following.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Vous ne suivez personne pour le moment.</p>
            ) : (
              following.map((profile) => (
                <div key={profile.id} className="flex items-center gap-2 rounded-xl p-2">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    onClick={() => {
                      setFollowingOpen(false);
                      if (profile.username) navigate(`/profile/${profile.username}`);
                    }}
                  >
                    <img
                      src={profile.avatarUrl || getDefaultAvatar("individual")}
                      alt={profile.fullName}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    <span className="inline-flex min-w-0 items-center gap-1 font-semibold text-neutral-900">
                      <span className="truncate">{profile.fullName}</span>
                      <VerifiedBadge verified={profile.isVerified} className="h-4 w-4" />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageTarget(profile)}
                    className="shrink-0 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-semibold text-neutral-900"
                  >
                    Message
                  </button>
                  <button
                    type="button"
                    onClick={() => openWhatsApp(profile)}
                    className="shrink-0 text-neutral-900"
                    aria-label="WhatsApp"
                  >
                    <WhatsAppIcon className="h-7 w-7" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" className="shrink-0 text-neutral-500" aria-label="Plus d'options">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => void mute(profile)}>
                        <VolumeX className="mr-2 h-4 w-4" /> Masquer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => void unfollow(profile)}>
                        <UserMinus className="mr-2 h-4 w-4" /> Ne plus suivre
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <InquiryDialog
        open={Boolean(messageTarget)}
        onOpenChange={(open) => {
          if (!open) setMessageTarget(null);
        }}
        type="post"
        sellerId={messageTarget?.id}
        sellerName={messageTarget?.fullName}
      />

      <Dialog open={infosOpen} onOpenChange={(next) => !saving && setInfosOpen(next)}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier les infos</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveInfos} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="visitor-info-phone">Téléphone</Label>
              <PhoneInput id="visitor-info-phone" required value={form.phone} onChange={(phone) => setForm((prev) => ({ ...prev, phone }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visitor-info-email">Email</Label>
              <Input id="visitor-info-email" type="email" required value={form.email} onChange={update("email")} />
            </div>
            <p className="text-xs text-muted-foreground">
              Ces coordonnées servent à vos messages et à vous reconnecter. Vérifiez qu'elles sont correctes avant de publier un bien.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#174f43] text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(next) => !saving && setEditOpen(next)}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl sm:max-w-md">
          {pendingAvatar ? (
            <ImageCropper
              file={pendingAvatar}
              aspect={1}
              round
              outputWidth={512}
              onCancel={() => setPendingAvatar(null)}
              onConfirm={(file) => {
                setCroppedAvatar(file);
                setPendingAvatar(null);
              }}
            />
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Modifier le profil</DialogTitle>
              </DialogHeader>
              <form onSubmit={saveProfile} className="space-y-3">
                <div className="flex justify-center">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="relative">
                    <img
                      src={previewUrl || avatarUrl || getDefaultAvatar("enterprise")}
                      alt=""
                      className="h-24 w-24 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#174f43] text-white shadow">
                      <Camera className="h-4 w-4" />
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setPendingAvatar(file);
                      e.target.value = "";
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="visitor-edit-name">Nom</Label>
                  <Input id="visitor-edit-name" value={form.name} onChange={update("name")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="visitor-edit-bio">Bio</Label>
                  <Textarea id="visitor-edit-bio" rows={3} maxLength={300} className="resize-none" value={form.bio} onChange={update("bio")} />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#174f43] text-sm font-semibold text-white transition-colors hover:bg-[#123d34] disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisitorProfile;
