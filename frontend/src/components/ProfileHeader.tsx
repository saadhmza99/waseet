import { useState } from "react";
import { ArrowLeft, Ban, Edit, Flag, Info, LogOut, MapPin, MessageSquare, MoreVertical, Phone, Settings, Share2, UserPlus, UserCheck, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InviteToJobModal, { type RecruitService } from "./InviteToJobModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { SafeImage } from "@/components/SafeImage";
import { WhatsAppIcon } from "@/components/PostActionIcons";
import { USERNAMES_ENABLED } from "@/lib/profileHandle";
import VerifiedBadge from "@/components/VerifiedBadge";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultAvatar } from "@/lib/avatar";
import { clampBio } from "@/lib/bio";

/** Kill-switch: hide cover photos. */
export const COVER_PHOTOS_ENABLED = false;

interface ProfileHeaderProps {
  profileId?: string;
  avatar: string;
  fullName?: string;
  username: string;
  coverPhoto?: string;
  bio?: string;
  ice?: string | null;
  /** Internal specialty labels (detailed_sub_category), shown under ICE. */
  specialties?: string[];
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

const actionPill =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-colors sm:h-12 sm:px-4 sm:text-base";

const iconActionBtn =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground hover:bg-muted sm:h-12 sm:w-12";

const ProfileHeader = ({
  profileId,
  avatar,
  fullName,
  username,
  coverPhoto,
  bio,
  ice,
  specialties = [],
  profession,
  location,
  phone,
  websiteUrl: _websiteUrl,
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
  const name =
    (fullName || "").trim() ||
    (USERNAMES_ENABLED ? (username || "").trim() : "") ||
    "Profil";
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
          text: name,
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
      className={iconActionBtn}
      aria-label="Share profile"
    >
      <Share2 className="h-5 w-5" />
    </button>
  );

  const hasCover = COVER_PHOTOS_ENABLED && Boolean(coverPhoto?.trim());

  const moreMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={iconActionBtn} aria-label="Plus d'options">
          <MoreVertical className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={isOwnProfile ? "w-48" : "w-56"}>
        {isOwnProfile ? (
          <>
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
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={onReportMember}>
              <Flag className="mr-2 h-4 w-4" />
              Report
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onBlockMember}>
              <Ban className="mr-2 h-4 w-4" />
              Block
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMuteMember}>
              <VolumeX className="mr-2 h-4 w-4" />
              Mute this profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAboutThisMember || onAboutMember}>
              <Info className="mr-2 h-4 w-4" />
              About this member
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="bg-card border-b border-border">
      <div className="mx-auto max-w-6xl sm:px-4 md:px-6">
        <div className="relative">
          {hasCover ? (
            <div className="h-44 overflow-hidden bg-muted sm:h-56 md:h-64">
              <SafeImage
                src={coverPhoto}
                fallback={
                  "data:image/svg+xml;utf8," +
                  encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400"><rect width="1200" height="400" fill="#e5e7eb"/></svg>`
                  )
                }
                alt=""
                className="h-full w-full object-cover"
              />
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
            {USERNAMES_ENABLED ? (
              <span
                className={`min-w-0 flex-1 truncate px-3 py-1.5 text-center text-base font-medium sm:text-left ${
                  hasCover ? "rounded-full bg-black/45 text-white" : "rounded-full bg-secondary text-foreground"
                }`}
              >
                @{username}
              </span>
            ) : (
              <span className="min-w-0 flex-1" aria-hidden />
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-5 sm:px-6">
        {(() => {
          const followLabel = isFollowing ? "Page suivie" : "Suivre cette page";
          const followBtn = !isOwnProfile && authReady ? (
            <button
              type="button"
              onClick={onToggleFollow}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold sm:px-4 sm:py-2 sm:text-base ${
                isFollowing
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  : "bg-[#174f43] text-white hover:bg-[#123d34]"
              }`}
            >
              {isFollowing ? <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" /> : <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />}
              {followLabel}
            </button>
          ) : null;

          const sideTools = (
            <div className="flex flex-col gap-2">
              {shareButton}
              {moreMenu}
            </div>
          );

          const contactBtn = !isOwnProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={iconActionBtn} aria-label="Contacter">
                  <Phone className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onClick={openSms}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  SMS
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openCall}>
                  <Phone className="mr-2 h-4 w-4" />
                  Appel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null;

          const primaryActions = (
            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:gap-2.5">
              {!isOwnProfile ? (
                <button
                  type="button"
                  onClick={() => setRecruitOpen(true)}
                  className={`${actionPill} border-emerald-800 bg-emerald-800 text-white shadow-md hover:bg-emerald-900`}
                >
                  <span className="truncate">Demander devis</span>
                </button>
              ) : null}
              {!isOwnProfile ? (
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className={`${actionPill} border-border bg-white text-foreground hover:bg-muted`}
                >
                  <WhatsAppIcon className="h-5 w-5 shrink-0" />
                  <span className="truncate">WhatsApp</span>
                </button>
              ) : null}
              {contactBtn}
              {onAboutMember ? (
                <button
                  type="button"
                  onClick={onAboutMember}
                  className={`${actionPill} border-border bg-white text-foreground hover:bg-muted`}
                >
                  <MapPin className="h-5 w-5 shrink-0" />
                  <span className="truncate">Infos</span>
                </button>
              ) : null}
            </div>
          );

          const bioBlock = (textClass: string) =>
            bioText ? (
              <p className={`whitespace-pre-wrap break-words leading-relaxed text-card-foreground ${textClass}`}>
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
            ) : null;

          return (
            <>
              {/* Mobile: name → pic(+share/⋮) → bio → categories/actions centered */}
              <div className="flex flex-col items-center text-center sm:hidden">
                <h1 className="mt-1 flex max-w-full items-center justify-center gap-1.5 text-2xl font-bold leading-snug text-card-foreground">
                  <span className="min-w-0 truncate">{name}</span>
                  <VerifiedBadge verified={isVerified} className="h-5 w-5 shrink-0" />
                </h1>
                {followBtn ? <div className="mt-3">{followBtn}</div> : null}
                <div className="relative mt-4 w-full">
                  <SafeImage
                    src={avatar}
                    fallback={getDefaultAvatar()}
                    alt={name}
                    className="mx-auto h-36 w-36 rounded-2xl border-4 border-card bg-muted object-cover"
                  />
                  <div className="absolute right-0 top-0">{sideTools}</div>
                </div>
                {agency || place ? (
                  <p className="mt-3 text-base text-muted-foreground">
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
                {bioText ? <div className="mt-3 w-full">{bioBlock("text-base")}</div> : null}
                {(ice || "").trim() ? (
                  <p className="mt-2 text-sm text-muted-foreground">ICE {(ice || "").trim()}</p>
                ) : null}
                {specialties.length > 0 ? (
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {specialties.map((label) => (
                      <span
                        key={label}
                        className="inline-flex max-w-full items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-card-foreground"
                      >
                        <span className="truncate">{label}</span>
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 flex w-full justify-center">{primaryActions}</div>
              </div>

              {/* Desktop: pic | details | share/⋮ extreme right */}
              <div className="hidden items-start gap-5 sm:flex sm:gap-8">
                <SafeImage
                  src={avatar}
                  fallback={getDefaultAvatar()}
                  alt={name}
                  className={`${hasCover ? "-mt-16 sm:-mt-20" : "mt-1"} relative z-10 h-48 w-48 shrink-0 rounded-2xl border-4 border-card bg-muted object-cover`}
                />

                <div className={`${hasCover ? "mt-2 sm:mt-3" : "mt-1"} min-w-0 flex-1 space-y-3 sm:space-y-3.5`}>
                  <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                    <h1 className="flex min-w-0 max-w-full items-center gap-1.5 text-4xl font-bold leading-snug text-card-foreground">
                      <span className="min-w-0 truncate whitespace-nowrap">{name}</span>
                      <VerifiedBadge verified={isVerified} className="h-7 w-7 shrink-0" />
                    </h1>
                    {followBtn}
                  </div>

                  {agency || place ? (
                    <p className="text-lg text-muted-foreground">
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

                  {bioBlock("text-lg")}

                  {(ice || "").trim() ? (
                    <p className="text-base text-muted-foreground">ICE {(ice || "").trim()}</p>
                  ) : null}

                  {specialties.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {specialties.map((label) => (
                        <span
                          key={label}
                          className="inline-flex max-w-full items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-sm font-medium text-card-foreground"
                        >
                          <span className="truncate">{label}</span>
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="pt-1">{primaryActions}</div>
                </div>

                <div className={`${hasCover ? "mt-2 sm:mt-3" : "mt-1"} ml-auto shrink-0`}>{sideTools}</div>
              </div>
            </>
          );
        })()}
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
