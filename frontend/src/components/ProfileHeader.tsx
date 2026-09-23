import { useState } from "react";
import { ArrowLeft, Ban, Briefcase, Edit, Flag, Globe, Info, MessageCircle, MoreHorizontal, Phone, UserPlus, UserCheck } from "lucide-react";
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
  followers: number;
  coverPhoto?: string;
  bio?: string;
  phone?: string | null;
  websiteUrl?: string | null;
  isOwnProfile?: boolean;
  authReady?: boolean;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  onFollowersClick?: () => void;
  onEditProfile?: () => void;
  onReportMember?: () => void;
  onBlockMember?: () => void;
  onAboutMember?: () => void;
}

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

const actionBtn =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold";

const ProfileHeader = ({
  profileId,
  avatar,
  fullName,
  username,
  coverPhoto,
  bio,
  followers,
  phone,
  websiteUrl,
  isOwnProfile = false,
  authReady = true,
  isFollowing = false,
  onToggleFollow,
  onFollowersClick,
  onEditProfile,
  onReportMember,
  onBlockMember,
  onAboutMember,
}: ProfileHeaderProps) => {
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const hasPhone = Boolean(phone && digitsOnly(phone).length >= 6);
  const hasWebsite = Boolean(websiteUrl?.trim());
  const name = (fullName || "").trim() || username;

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
          className={`absolute left-3 top-3 z-10 rounded-full p-2 ${
            hasCover ? "bg-black/45 text-white hover:bg-black/60" : "bg-secondary text-foreground hover:bg-secondary/80"
          }`}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div>
          <img
            src={avatar}
            alt={username}
            className={`${hasCover ? "-mt-14 sm:-mt-16" : "-mt-2"} h-28 w-28 sm:h-36 sm:w-36 flex-shrink-0 rounded-full border-4 border-card bg-muted object-cover relative z-10`}
          />
        </div>

        <div className="mt-3 flex min-w-0 items-start gap-2">
          <h1 className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 text-xl font-bold leading-snug text-card-foreground sm:text-2xl">
            <span className="break-words">{name}</span>
            <span className="text-sm font-normal text-muted-foreground sm:text-base">·</span>
            <span className="truncate text-sm font-normal text-muted-foreground sm:text-base">@{username}</span>
          </h1>
          {!isOwnProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                  aria-label="Plus d'options"
                >
                  <MoreHorizontal className="h-5 w-5" />
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
                <DropdownMenuItem onClick={onAboutMember}>
                  <Info className="mr-2 h-4 w-4" />
                  About this member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        {bio ? (
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-card-foreground">
            {bio}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onFollowersClick}
          className="mt-1 text-sm text-muted-foreground hover:underline"
        >
          {followers} followers
        </button>

        <div className="mt-4 flex flex-wrap items-center gap-2 pb-4">
          {isOwnProfile ? (
            <button type="button" onClick={onEditProfile} className={`${actionBtn} bg-secondary text-secondary-foreground hover:bg-secondary/80`}>
              <Edit className="h-4 w-4" />
              Modifier le profil
            </button>
          ) : authReady ? (
            <button
              type="button"
              onClick={onToggleFollow}
              className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                isFollowing
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isFollowing ? <UserCheck className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
              {isFollowing ? "Suivi" : "Follow"}
            </button>
          ) : null}
          {!isOwnProfile && authReady && (
            <>
              <button type="button" onClick={() => setShowInviteModal(true)} className={`${actionBtn} bg-secondary text-secondary-foreground hover:bg-secondary/80`}>
                <Briefcase className="h-4 w-4" />
                Invite to Job
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className={`${actionBtn} bg-secondary text-secondary-foreground hover:bg-secondary/80`}>
                    <Phone className="h-4 w-4" />
                    Contact
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
              {hasWebsite && (
                <button type="button" onClick={openWebsite} className={`${actionBtn} bg-secondary text-secondary-foreground hover:bg-secondary/80`}>
                  <Globe className="h-4 w-4" />
                  Website
                </button>
              )}
            </>
          )}
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
