import { useState, type ReactNode } from "react";
import { ArrowLeft, Ban, Briefcase, Edit, Flag, Globe, Info, LogOut, MapPin, MessageCircle, MessageSquare, MoreVertical, Phone, Settings, Share2, UserPlus, UserCheck, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InviteToJobModal, { type RecruitService } from "./InviteToJobModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { profileHandle } from "@/lib/profileHandle";
import { preferredWebsiteFrom } from "@/components/ProfileInfosCard";
import VerifiedBadge from "@/components/VerifiedBadge";
import { useAuth } from "@/contexts/AuthContext";
import { clampBio } from "@/lib/bio";

interface ProfileHeaderProps {
  profileId?: string;
  avatar: string;
  fullName?: string;
  username: string;
  coverPhoto?: string;
  bio?: string;
  ice?: string | null;
  profession?: string | null;
  location?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  isOwnProfile?: boolean;
  isVerified?: boolean;
  authReady?: boolean;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  onEditProfile?: () => void;
  onReportMember?: () => void;
  onBlockMember?: () => void;
  /** When set, shows the Infos circle action (e.g. preview pages). Profile uses the Infos tab instead. */
  onAboutMember?: () => void;
  onAboutThisMember?: () => void;
  onMuteMember?: () => void;
  rating?: number;
  reviewCount?: number;
  onOpenReviews?: () => void;
  services?: RecruitService[];
}

const cityRegionOf = (line: string) => {
  const parts = line.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]}, ${parts[1]}`;
  return parts[0] || "";
};

const locationSummary = (value?: string | null) => {
  const lieux = (value || "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (!lieux.length) return "";
  const first = cityRegionOf(lieux[0]);
  if (lieux.length === 1) return first;
  return first ? `${first} et autres` : "et autres";
};

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const toWhatsAppNumber = (phone: string) => {
  const digits = digitsOnly(phone);
  if (digits.startsWith("0")) return `212${digits.slice(1)}`;
  return digits;
};

const normalizeWebsiteHref = (url: string) => {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const circleFace =
  "inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition-colors hover:bg-muted sm:h-14 sm:w-14";

const circleFaceFeatured =
  "inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-800 bg-emerald-800 text-white shadow-md transition-colors hover:bg-emerald-900 sm:h-14 sm:w-14";

const CircleAction = ({
  label,
  children,
  onClick,
  featured = false,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  featured?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex min-w-0 flex-1 flex-col items-center gap-1.5 text-card-foreground sm:flex-none sm:w-24`}
  >
    <span className={featured ? circleFaceFeatured : circleFace}>{children}</span>
    <span
      className={`w-full truncate text-center text-base leading-snug sm:text-lg ${
        featured ? "font-bold text-emerald-800" : "font-medium"
      }`}
    >
      {label}
    </span>
  </button>
);

const ProfileHeader = ({
  profileId,
  avatar,
  fullName,
  username,
  coverPhoto,
  bio,
  ice,
  profession,
  location,
  phone,
  websiteUrl,
  isOwnProfile = false,
  isVerified = false,
  authReady = true,
  isFollowing = false,
  onToggleFollow,
  onEditProfile,
  onReportMember,
  onBlockMember,
  onAboutMember,
  onAboutThisMember,
  onMuteMember,
  services = [],
}: ProfileHeaderProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [recruitOpen, setRecruitOpen] = useState(false);
  const hasPhone = Boolean(phone && digitsOnly(phone).length >= 6);
  const preferredWebsite = preferredWebsiteFrom(websiteUrl);
  const hasWebsite = Boolean(preferredWebsite);
  const name = (fullName || "").trim() || username;
  const handle = profileHandle(username);
  const agency = (profession || "").trim();
  const place = locationSummary(location);
  const bioText = clampBio(bio);

  const openCall = () => {
    if (!phone || !hasPhone) {
      toast({ title: "Unavailable", description: "This profile has no phone number." });
      return;
    }
    window.location.href = `tel:${digitsOnly(phone)}`;
  };

  const openWhatsApp = () => {
    if (!phone || !hasPhone) {
      toast({ title: "Unavailable", description: "This profile has no WhatsApp number." });
      return;
    }
    window.open(`https://wa.me/${toWhatsAppNumber(phone)}`, "_blank", "noopener,noreferrer");
  };

  const openWebsite = () => {
    if (!preferredWebsite) return;
    window.open(normalizeWebsiteHref(preferredWebsite), "_blank", "noopener,noreferrer");
  };

  const openSms = () => {
    if (!phone || !hasPhone) {
      toast({ title: "Unavailable", description: "This profile has no phone number." });
      return;
    }
    window.location.href = `sms:${digitsOnly(phone)}`;
  };

  const shareProfile = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/profile/${encodeURIComponent(username)}`
        : `/profile/${encodeURIComponent(username)}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: name,
          text: handle,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast({ title: "Lien copié", description: "Le lien du profil a été copié." });
    } catch (error) {
      if ((error as { name?: string } | null)?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: "Lien copié", description: "Le lien du profil a été copié." });
      } catch {
        toast({ title: "Partage", description: url });
      }
    }
  };

  const shareButton = (
    <button
      type="button"
      onClick={() => void shareProfile()}
      className="-mr-0.5 inline-flex h-11 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
      aria-label="Share profile"
    >
      <Share2 className="h-6 w-6" />
    </button>
  );

  const hasCover = Boolean(coverPhoto?.trim());

  return (
    <div className="bg-card border-b border-border">
      <div className="mx-auto max-w-6xl sm:px-4 md:px-6">
        <div className="relative">
          {hasCover ? (
            <div className="h-44 overflow-hidden bg-muted sm:h-56 md:h-64">
              <img src={coverPhoto} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-14 bg-card sm:h-16" />
          )}
          <div className="absolute left-3 right-3 top-3 z-10 flex min-w-0 items-center gap-2">
            <button
              type="button"
              aria-label="Retour"
              onClick={() => {
                const idx = typeof window.history.state?.idx === "number" ? window.history.state.idx : 0;
                if (idx > 0) {
                  navigate(-1);
                  return;
                }
                navigate("/");
              }}
              className={`shrink-0 rounded-full p-2.5 ${
                hasCover ? "bg-black/45 text-white hover:bg-black/60" : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <span
              className={`min-w-0 truncate px-3 py-1.5 text-base font-medium ${
                hasCover ? "rounded-full bg-black/45 text-white" : "rounded-full bg-secondary text-foreground"
              }`}
            >
              @{username}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-start justify-between gap-2">
          <img
            src={avatar}
            alt={username}
            className={`${hasCover ? "-mt-16 sm:-mt-20" : "-mt-2"} relative z-10 h-36 w-36 flex-shrink-0 rounded-full border-4 border-card bg-muted object-cover sm:h-44 sm:w-44`}
          />
          <div className={`${hasCover ? "mt-2 sm:mt-3" : "mt-1"} flex shrink-0 items-center gap-1`}>
            {isOwnProfile ? (
              <>
                {shareButton}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="-mr-1 inline-flex h-11 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                      aria-label="Plus d'options"
                    >
                      <MoreVertical className="h-6 w-6" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={onEditProfile}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier le profil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={async () => {
                        await signOut();
                        navigate("/", { replace: true });
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {authReady ? (
                  <button
                    type="button"
                    onClick={onToggleFollow}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-base font-semibold ${
                      isFollowing
                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        : "bg-[#174f43] text-white hover:bg-[#123d34]"
                    }`}
                  >
                    {isFollowing ? <UserCheck className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                    {isFollowing ? "Suivi" : "Suivre"}
                  </button>
                ) : null}
                {shareButton}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="-mr-1 inline-flex h-11 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                      aria-label="Plus d'options"
                    >
                      <MoreVertical className="h-6 w-6" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={onReportMember}>
                      <Flag className="mr-2 h-4 w-4" />
                      Report {handle}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onBlockMember}>
                      <Ban className="mr-2 h-4 w-4" />
                      Block {handle}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onMuteMember}>
                      <VolumeX className="mr-2 h-4 w-4" />
                      Mute this profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onAboutThisMember || onAboutMember}>
                      <Info className="mr-2 h-4 w-4" />
                      About this member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        <div className="mt-2 flex min-w-0 items-center gap-2">
          <h1 className="flex min-w-0 flex-1 items-center gap-1.5 text-3xl font-bold leading-snug text-card-foreground sm:text-4xl">
            <span className="min-w-0 truncate whitespace-nowrap">{name}</span>
            <VerifiedBadge verified={isVerified} className="h-6 w-6 sm:h-7 sm:w-7" />
          </h1>
        </div>

        {agency || place ? (
          <p className="mt-1 text-base text-muted-foreground sm:text-lg">
            {agency && place ? (
              <>
                {agency}
                <span className="mx-1">·</span>
                {place}
              </>
            ) : (
              agency || place
            )}
          </p>
        ) : null}

        {bioText ? (
          <p className="mt-4 whitespace-pre-wrap break-words text-base leading-relaxed text-card-foreground sm:text-lg">
            {bioText.split(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g).map((part, index) =>
              part.includes("@") && part.includes(".") ? (
                <a
                  key={`${part}-${index}`}
                  href={`mailto:${part}`}
                  className="inline-block font-medium text-[#174f43] underline-offset-2 transition-transform hover:underline hover:scale-[0.97] active:scale-[0.95]"
                >
                  {part}
                </a>
              ) : (
                part
              )
            )}
          </p>
        ) : null}

        {(ice || "").trim() ? (
          <p className={`${bioText ? "mt-2" : "mt-4"} text-sm text-muted-foreground sm:text-base`}>
            ICE {(ice || "").trim()}
          </p>
        ) : null}

        <div className="mt-5 flex w-full min-w-0 items-start gap-2 pb-5 sm:gap-4">
          {!isOwnProfile ? (
            <CircleAction featured label="Demander devis" onClick={() => setRecruitOpen(true)}>
              <Briefcase className="h-6 w-6" />
            </CircleAction>
          ) : null}
          {!isOwnProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="inline-flex min-w-0 flex-1 flex-col items-center gap-1.5 text-card-foreground sm:flex-none sm:w-24">
                  <span className={circleFace}>
                    <Phone className="h-6 w-6" />
                  </span>
                  <span className="w-full truncate text-center text-base font-medium leading-snug sm:text-lg">Contact</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onClick={openWhatsApp}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openSms}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  SMS
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openCall}>
                  <Phone className="mr-2 h-4 w-4" />
                  Phone call
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {hasWebsite ? (
            <CircleAction label="Website" onClick={openWebsite}>
              <Globe className="h-6 w-6" />
            </CircleAction>
          ) : null}
          {onAboutMember ? (
            <CircleAction label="Infos" onClick={onAboutMember}>
              <MapPin className="h-6 w-6" />
            </CircleAction>
          ) : null}
        </div>
      </div>

      <InviteToJobModal
        isOpen={recruitOpen}
        onClose={() => setRecruitOpen(false)}
        professionalName={name}
        professionalUserId={profileId}
        phone={phone}
        services={services}
      />
    </div>
  );
};

export default ProfileHeader;
