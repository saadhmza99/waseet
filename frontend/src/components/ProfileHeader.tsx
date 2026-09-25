import { useState, type ReactNode } from "react";
import { ArrowLeft, Ban, Briefcase, ChevronRight, Edit, Flag, Globe, Info, MessageCircle, MoreVertical, Phone, Star, UserPlus, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InviteToJobModal from "./InviteToJobModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

interface ProfileHeaderProps {
  profileId?: string;
  avatar: string;
  fullName?: string;
  username: string;
  coverPhoto?: string;
  bio?: string;
  profession?: string | null;
  location?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  isOwnProfile?: boolean;
  authReady?: boolean;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  onEditProfile?: () => void;
  onReportMember?: () => void;
  onBlockMember?: () => void;
  onAboutMember?: () => void;
  onAboutThisMember?: () => void;
  rating?: number;
  reviewCount?: number;
  onOpenReviews?: () => void;
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
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition-colors hover:bg-muted sm:h-11 sm:w-11";

const CircleAction = ({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex min-w-0 flex-1 flex-col items-center gap-1 text-card-foreground sm:flex-none sm:w-14"
  >
    <span className={circleFace}>{children}</span>
    <span className="w-full truncate text-center text-[11px] font-medium leading-none sm:text-xs">{label}</span>
  </button>
);

const ProfileHeader = ({
  profileId,
  avatar,
  fullName,
  username,
  coverPhoto,
  bio,
  profession,
  location,
  phone,
  websiteUrl,
  isOwnProfile = false,
  authReady = true,
  isFollowing = false,
  onToggleFollow,
  onEditProfile,
  onReportMember,
  onBlockMember,
  onAboutMember,
  onAboutThisMember,
  rating = 0,
  reviewCount = 0,
  onOpenReviews,
}: ProfileHeaderProps) => {
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const hasPhone = Boolean(phone && digitsOnly(phone).length >= 6);
  const hasWebsite = Boolean(websiteUrl?.trim());
  const name = (fullName || "").trim() || username;
  const agency = (profession || "").trim();
  const place = locationSummary(location);

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
    if (!websiteUrl?.trim()) return;
    window.open(normalizeWebsiteHref(websiteUrl), "_blank", "noopener,noreferrer");
  };

  const hasCover = Boolean(coverPhoto?.trim());

  return (
    <div className="bg-card border-b border-border">
      <div className="relative">
        {hasCover ? (
          <div className="h-36 sm:h-48 md:h-56 overflow-hidden bg-muted">
            <img src={coverPhoto} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="h-12 sm:h-14 bg-card" />
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
            className={`shrink-0 rounded-full p-2 ${
              hasCover ? "bg-black/45 text-white hover:bg-black/60" : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span
            className={`min-w-0 truncate px-2.5 py-1.5 text-sm font-medium ${
              hasCover ? "rounded-full bg-black/45 text-white" : "rounded-full bg-secondary text-foreground"
            }`}
          >
            @{username}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex items-start gap-2">
          <img
            src={avatar}
            alt={username}
            className={`${hasCover ? "-mt-14 sm:-mt-16" : "-mt-2"} h-28 w-28 sm:h-36 sm:w-36 flex-shrink-0 rounded-full border-4 border-card bg-muted object-cover relative z-10`}
          />
          <button
            type="button"
            onClick={onOpenReviews}
            className="relative z-10 mt-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1.5 text-sm font-semibold leading-none text-card-foreground shadow-sm hover:bg-muted active:scale-[0.98]"
            aria-label="Voir les avis"
          >
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>{Number(rating).toFixed(1)}</span>
            <span className="font-medium text-muted-foreground">({reviewCount})</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="mt-1 flex min-w-0 items-center gap-2">
          <h1 className="min-w-0 flex-1 break-words text-2xl font-bold leading-snug text-card-foreground sm:text-3xl">
            {name}
          </h1>
          {isOwnProfile ? (
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={onEditProfile}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground hover:bg-secondary/80"
              >
                <Edit className="h-4 w-4" />
                Modifier
              </button>
              <button
                type="button"
                onClick={() => navigate("/settings")}
                className="-mr-1 inline-flex h-9 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Paramètres"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-0.5">
              {authReady ? (
                <button
                  type="button"
                  onClick={onToggleFollow}
                  className={`inline-flex items-center justify-center gap-1 rounded-md px-3 py-1.5 text-[13px] font-semibold ${
                    isFollowing
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      : "bg-emerald-800 text-white hover:bg-emerald-900"
                  }`}
                >
                  {isFollowing ? <UserCheck className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                  {isFollowing ? "Suivi" : "Follow"}
                </button>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="-mr-1 inline-flex h-9 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                    aria-label="Plus d'options"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={onReportMember}>
                    <Flag className="mr-2 h-4 w-4" />
                    Report {name}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onBlockMember}>
                    <Ban className="mr-2 h-4 w-4" />
                    Block {name}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onAboutThisMember || onAboutMember}>
                    <Info className="mr-2 h-4 w-4" />
                    About this member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {agency || place ? (
          <p className="mt-0.5 text-sm text-muted-foreground">
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

        {bio ? (
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-card-foreground">
            {bio}
          </p>
        ) : null}

        <div className="mt-4 flex w-full min-w-0 items-start gap-1.5 pb-4 sm:gap-3">
          {!isOwnProfile && authReady ? (
            <CircleAction label="Recruter" onClick={() => setShowInviteModal(true)}>
              <Briefcase className="h-5 w-5" />
            </CircleAction>
          ) : null}
          {!isOwnProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="inline-flex min-w-0 flex-1 flex-col items-center gap-1 text-card-foreground sm:flex-none sm:w-14">
                  <span className={circleFace}>
                    <Phone className="h-5 w-5" />
                  </span>
                  <span className="w-full truncate text-center text-[11px] font-medium leading-none sm:text-xs">Contact</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onClick={openWhatsApp}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openCall}>
                  <Phone className="mr-2 h-4 w-4" />
                  Phone call
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          <CircleAction
            label="Website"
            onClick={() => {
              if (!hasWebsite) {
                toast({ title: "Unavailable", description: "This profile has no website." });
                return;
              }
              openWebsite();
            }}
          >
            <Globe className="h-5 w-5" />
          </CircleAction>
          <CircleAction label="Infos" onClick={onAboutMember}>
            <Info className="h-5 w-5" />
          </CircleAction>
        </div>
      </div>

      <InviteToJobModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        professionalName={username}
        professionalUserId={profileId}
      />
    </div>
  );
};

export default ProfileHeader;
