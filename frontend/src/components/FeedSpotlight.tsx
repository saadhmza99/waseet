import { ArrowRight, Building2, MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VerifiedBadge from "@/components/VerifiedBadge";
import { resolveAvatarUrl } from "@/lib/avatar";
import {
  categoryLabel,
  dossierFromRow,
  projectLocation,
  projectMetrics,
  statusLabel,
} from "@/lib/projectDossier";
import { RECOMMENDED_FIRMS as CURATED_RECOMMENDED_FIRMS } from "@/lib/recommendedFirms";
import { projectTypeLabel } from "@/lib/taxonomy";
import mubawabLogo from "@/assets/partners/mubawab.png";
import fnpiLogo from "@/assets/partners/fnpi.png";
import onigtLogo from "@/assets/partners/onigt.svg";
import ordreArchicentreLogo from "@/assets/partners/ordre-archicentre.png";
import fmciLogo from "@/assets/partners/fmci.jpg";
import fnbtpLogo from "@/assets/partners/fnbtp.jpg";
import cgemLogo from "@/assets/partners/cgem.svg";

const coverFallback =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="#e7ebe8"/><text x="50%" y="50%" text-anchor="middle" fill="#8b948e" font-family="sans-serif" font-size="18">Projet</text></svg>`,
  );

const FEED_PARTNERS = [
  { id: "mubawab", label: "Mubawab", logo: mubawabLogo },
  { id: "fnpi", label: "FNPI", logo: fnpiLogo },
  { id: "onigt", label: "ONIGT", logo: onigtLogo },
  { id: "ordre-archicentre", label: "Ordre Archicentre", logo: ordreArchicentreLogo },
  { id: "fmci", label: "FMCI", logo: fmciLogo },
  { id: "fnbtp", label: "FNBTP", logo: fnbtpLogo },
  { id: "cgem", label: "CGEM", logo: cgemLogo },
] as const;

const SectionHeader = ({
  title,
  actionLabel,
  onAction,
  large,
  caption,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  large?: boolean;
  /** Match the Fil post caption: system sans, text-base, neutral-800. */
  caption?: boolean;
}) => (
  <div className={`flex items-end justify-between gap-2 ${large && !caption ? "mb-4" : "mb-3"}`}>
    <h2
      className={
        caption
          ? "text-base leading-5 text-neutral-800"
          : `font-semibold leading-snug tracking-tight text-[#0f2f3d] ${
              large ? "text-[1.45rem] sm:text-[1.65rem]" : "text-xl"
            }`
      }
      style={caption ? undefined : { fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      {title}
    </h2>
    {actionLabel && onAction ? (
      <button
        type="button"
        onClick={onAction}
        className="inline-flex shrink-0 items-center gap-1 pb-0.5 text-sm font-semibold text-neutral-500 transition hover:text-[#174f43]"
      >
        {actionLabel}
        <ArrowRight className={large ? "h-4 w-4" : "h-3.5 w-3.5"} strokeWidth={2.2} />
      </button>
    ) : null}
  </div>
);

const SpotlightProjectCard = ({ row, compact }: { row: any; compact?: boolean }) => {
  const navigate = useNavigate();
  const project = dossierFromRow(row);
  const place = projectLocation(project);
  const subtitle =
    projectTypeLabel(project.subtype) || project.subtype || categoryLabel(project.category) || "Projet immobilier";
  const status = statusLabel(project.status);
  const isDelivered = ["livre", "termine"].includes((project.status || "").toLowerCase());
  const surface =
    projectMetrics(project).find((item) => item.label === "surface" || item.label === "logements") || null;

  return (
    <button
      type="button"
      onClick={() => {
        window.scrollTo(0, 0);
        navigate(`/projet/${project.id}`);
      }}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white text-left shadow-sm transition hover:border-neutral-300 hover:shadow-md ${
        compact ? "w-[19rem] shrink-0 sm:w-[21rem] xl:w-full xl:min-w-0 xl:shrink" : "w-full"
      }`}
    >
      <span className={`relative block w-full overflow-hidden bg-neutral-100 ${compact ? "aspect-[16/10]" : "aspect-[16/9]"}`}>
        <img
          src={project.image || coverFallback}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {status ? (
          <span
            className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm ${
              isDelivered ? "bg-neutral-700/90 text-white" : "bg-[#2f6fed] text-white"
            }`}
          >
            {status}
          </span>
        ) : null}
      </span>
      <span className="flex flex-col gap-1.5 px-3.5 py-3">
        <span className="line-clamp-2 text-base leading-5 text-neutral-800">{project.title}</span>
        <span className="line-clamp-1 text-sm text-neutral-500">{subtitle}</span>
        <span className="mt-0.5 flex items-center justify-between gap-2">
          <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-500">
            {place ? (
              <span className="inline-flex min-w-0 items-center gap-0.5 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{place}</span>
              </span>
            ) : null}
            {surface ? (
              <span className="inline-flex items-center gap-0.5 truncate">
                <Building2 className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {surface.value}
                  {surface.label === "logements" ? ` ${surface.label}` : ""}
                </span>
              </span>
            ) : null}
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-neutral-400 transition group-hover:text-[#174f43]" />
        </span>
      </span>
    </button>
  );
};

export type SpotlightFirm = {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  location?: string | null;
  profession?: string | null;
  profile_type?: string | null;
  is_verified?: boolean | null;
  specialty?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
};

/** Curated Accueil rail firms (seeded verified profiles + blue badge). */
export const RECOMMENDED_FIRMS: SpotlightFirm[] = CURATED_RECOMMENDED_FIRMS.map((firm) => ({
  id: firm.id,
  username: firm.username,
  full_name: firm.full_name,
  avatar_url: firm.avatar_url,
  location: firm.location,
  profession: firm.profession,
  profile_type: "enterprise",
  is_verified: true,
  specialty: firm.specialty,
}));

const SpotlightFirmCard = ({ firm }: { firm: SpotlightFirm }) => {
  const navigate = useNavigate();
  const name = firm.full_name || firm.username || "Entreprise";
  const specialty = firm.specialty || firm.profession || "Professionnel";
  const slug = firm.username || firm.id;

  return (
    <button
      type="button"
      onClick={() => {
        window.scrollTo(0, 0);
        navigate(`/profile/${slug}`);
      }}
      className="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl bg-transparent p-2.5 text-left transition hover:bg-neutral-50"
    >
      <img
        src={resolveAvatarUrl(firm.avatar_url, firm.profile_type === "individual" ? "individual" : "enterprise")}
        alt=""
        className="h-[3.25rem] w-[3.25rem] shrink-0 rounded-xl object-cover bg-neutral-100"
        onError={(e) => {
          const el = e.currentTarget;
          const fallback = resolveAvatarUrl(null, "enterprise");
          if (el.src !== fallback) el.src = fallback;
        }}
      />
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-1">
          <span className="truncate text-[1.0625rem] leading-5 text-neutral-800">{name}</span>
          <VerifiedBadge verified={firm.is_verified !== false} className="h-[1.125rem] w-[1.125rem]" />
        </span>
        <span className="mt-0.5 block truncate text-sm text-neutral-500">{specialty}</span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-neutral-500">
          {firm.rating != null && firm.rating > 0 ? (
            <span className="inline-flex items-center gap-0.5 font-medium text-neutral-700">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {firm.rating.toFixed(1)}
              {firm.reviewCount != null ? (
                <span className="font-normal text-neutral-500">({firm.reviewCount})</span>
              ) : null}
            </span>
          ) : null}
          {firm.location ? (
            <span className="inline-flex min-w-0 items-center gap-0.5 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{firm.location}</span>
            </span>
          ) : null}
        </span>
      </span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-neutral-300 transition group-hover:text-[#174f43]" />
    </button>
  );
};

/** Horizontal projets strip implanted inside the Accueil post stream. */
export const FeedProjectsStrip = ({ projects }: { projects: any[] }) => {
  const navigate = useNavigate();
  const featured = projects.slice(0, 3);
  if (!featured.length) return null;

  return (
    <section className="my-5 border-y border-neutral-100 bg-[#fafafa] px-3 py-5 sm:my-6 sm:px-4 sm:py-6">
      <SectionHeader
        title="Projets immobiliers à la une"
        actionLabel="Voir tous"
        onAction={() => navigate("/?vue=projets")}
        caption
        large
      />
      <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] sm:gap-5 xl:grid xl:grid-cols-2 xl:gap-5 xl:overflow-visible 2xl:grid-cols-3 2xl:gap-6 [&::-webkit-scrollbar]:hidden">
        {featured.map((row) => (
          <SpotlightProjectCard key={row.id} row={row} compact />
        ))}
      </div>
    </section>
  );
};

/**
 * Top-right Accueil rail (not under categories):
 * Associations logos + Entreprises recommandées (curated showcase firms + blue badge).
 */
export const FeedPartnersRail = ({ firms = RECOMMENDED_FIRMS }: { firms?: SpotlightFirm[] }) => {
  const navigate = useNavigate();
  const featuredFirms = firms.length ? firms : RECOMMENDED_FIRMS;

  return (
    <aside className="hidden w-[22rem] shrink-0 xl:block">
      <div className="sticky top-1 flex max-h-[calc(100vh-0.25rem)] flex-col gap-8 pb-8">
        <section className="shrink-0 pt-20">
          <SectionHeader title="Associations" caption />
          <ul className="grid grid-cols-3 gap-2">
            {FEED_PARTNERS.map((partner) => (
              <li key={partner.id}>
                <div className="flex h-16 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white px-2 shadow-sm">
                  <img
                    src={partner.logo}
                    alt={partner.label}
                    className="max-h-10 max-w-full object-contain"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex min-h-0 flex-1 flex-col">
          <SectionHeader
            title="Entreprises recommandées"
            actionLabel="Voir toutes"
            onAction={() => navigate("/explore")}
            caption
          />
          <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]">
            {featuredFirms.map((firm) => (
              <SpotlightFirmCard key={firm.id} firm={firm} />
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
};

const RecommendedFirmTile = ({ firm, className = "" }: { firm: SpotlightFirm; className?: string }) => {
  const navigate = useNavigate();
  const name = firm.full_name || firm.username || "Entreprise";
  const specialty = firm.specialty || firm.profession || "";
  const slug = firm.username || firm.id;

  return (
    <button
      type="button"
      onClick={() => {
        window.scrollTo(0, 0);
        navigate(`/profile/${slug}`);
      }}
      className={`flex flex-col items-center rounded-xl border border-neutral-200 bg-white px-3 pb-3 pt-4 text-center ${className}`}
    >
      <span className="relative">
        <img
          src={resolveAvatarUrl(firm.avatar_url, firm.profile_type === "individual" ? "individual" : "enterprise")}
          alt=""
          className="h-[4.5rem] w-[4.5rem] rounded-full bg-neutral-100 object-cover"
          onError={(e) => {
            const el = e.currentTarget;
            const fallback = resolveAvatarUrl(null, "enterprise");
            if (el.src !== fallback) el.src = fallback;
          }}
        />
        {firm.is_verified !== false ? (
          <VerifiedBadge verified className="absolute -bottom-0.5 -right-0.5 h-5 w-5" />
        ) : null}
      </span>
      <span className="mt-2 line-clamp-2 min-h-10 text-base leading-5 text-neutral-800">{name}</span>
      {specialty ? (
        <span className="mt-0.5 line-clamp-1 w-full text-xs text-neutral-500">{specialty}</span>
      ) : (
        <span className="mt-0.5 h-4" />
      )}
      <span className="mt-2 w-full rounded-lg bg-[#174f43] py-1.5 text-xs font-semibold text-white">Voir</span>
    </button>
  );
};

/** Two horizontal rows on mobile; four per row from the desktop breakpoint. */
const firmsStripClass = (desktop: "lg" | "xl") =>
  `grid auto-cols-[9.5rem] grid-flow-col gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
    desktop === "lg"
      ? "lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible"
      : "xl:auto-cols-auto xl:grid-flow-row xl:grid-cols-4 xl:overflow-visible"
  }`;

/** Photo on top, name underneath. Mobile: two rows you can scroll sideways. */
export const RecommendedFirmsGrid = ({ firms }: { firms: SpotlightFirm[] }) => {
  if (!firms.length) return null;
  const rows = firms.length > 2 ? "grid-rows-2" : "grid-rows-1";
  return (
    <div className={`${firmsStripClass("lg")} ${rows} lg:grid-rows-none`}>
      {firms.map((firm) => (
        <RecommendedFirmTile key={firm.id} firm={firm} className="w-full" />
      ))}
    </div>
  );
};

/** Suggested accounts in the Fil, including desktop. */
export const FeedFirmsStrip = ({ firms = RECOMMENDED_FIRMS }: { firms?: SpotlightFirm[] }) => {
  const navigate = useNavigate();
  const featuredFirms = firms.length ? firms : RECOMMENDED_FIRMS;
  if (!featuredFirms.length) return null;

  return (
    <section className="my-4 border-y border-neutral-100 bg-white px-3 py-4">
      <SectionHeader
        title="Entreprises recommandées"
        actionLabel="Voir toutes"
        onAction={() => navigate("/explore")}
        caption
      />
      <div
        className={`${firmsStripClass("xl")} ${featuredFirms.length > 2 ? "grid-rows-2" : "grid-rows-1"} xl:grid-rows-none`}
      >
        {featuredFirms.map((firm) => (
          <RecommendedFirmTile key={firm.id} firm={firm} className="w-full" />
        ))}
      </div>
    </section>
  );
};
