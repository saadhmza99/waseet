import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Briefcase, Building, Building2, ChevronDown, Ellipsis, Factory, HardHat, Home, Hotel, Landmark, List, Map as MapIcon, MapPin, Search, SlidersHorizontal, Store, X, type LucideIcon } from "lucide-react";
import { DesktopRailFrame } from "@/components/FeedDesktopRail";
import PartnerDemandDialog from "@/components/PartnerDemandDialog";
import InfiniteScrollSentinel from "@/components/InfiniteScrollSentinel";
import MapView from "@/components/MapView";
import { CategoryPicker, FEED_PICKER_CATEGORIES, type CategoryOption } from "@/components/CategoryPicker";
import { RegionCitySheet } from "@/components/RegionCitySheet";
import { SubCategoryChips } from "@/components/FilterChips";
import { ProjectCard } from "@/components/project/ProjectCard";
import { PROJECT_MILESTONES, milestoneReachedIndex } from "@/components/project/ProjectMilestoneTrack";
import { COMMERCIAL_STATUSES, dossierFromRow } from "@/lib/projectDossier";
import { ServiceCard } from "@/components/service/ServiceCard";
import VerifiedBadge from "@/components/VerifiedBadge";
import { resolveAvatarUrl } from "@/lib/avatar";
import { DISCOVER_ITEMS, type DiscoverItem } from "@/lib/showcaseDiscover";
import { offerFromRow, priceLabel, serviceMainImage, zoneLabel } from "@/lib/serviceOffer";
import { catalogService } from "@/services/catalogService";
import { profileService } from "@/services/profileService";
import { serviceFirmName, serviceFeedTags, serviceIsVerified, serviceService, type ServiceRow } from "@/services/serviceService";
import {
  FOURNISSEUR_CATEGORY_ID,
  PROJECT_TYPES,
  PROMOTEUR_CATEGORY_ID,
  feedCategoryLabel,
  feedSubCategoryBySlug,
  isFournisseurInternalCode,
  isPromoteurInternalCode,
  matchesFeedCategory,
  projectTypeLabel,
} from "@/lib/taxonomy";

const PROJECT_TYPE_ICONS: Record<string, LucideIcon> = {
  projet_residentiel: Home,
  lotissement: MapIcon,
  residence: Building2,
  complexe_immobilier: Building,
  projet_commercial: Store,
  projet_hotelier: Hotel,
  projet_industriel: Factory,
  projet_mixte: Building2,
  usine: Factory,
  centre_commercial: Store,
  bureau: Briefcase,
  hotel: Hotel,
  equipement_prive: Landmark,
  equipement_collectif: Landmark,
  infrastructure_projet: HardHat,
};

/** Categories shown by the Catégories button while the Projets tab is active. */
const PROJECT_TYPE_OPTIONS: CategoryOption[] = PROJECT_TYPES.map((item) => ({
  id: item.id,
  label: item.label,
  Icon: PROJECT_TYPE_ICONS[item.id] || Ellipsis,
}));

type MockItem = DiscoverItem;

/** First paint + scroll pages — keep small so nested taxonomy joins stay fast. */
const DISCOVER_PAGE_SIZE = 12;

/** Map Discover category chips → server filters (avoids client-side sparse paging). */
const discoverTaxonomyFilters = (category: string | null, sub: string | null) => {
  if (!category || category === "tout") {
    return { feedCategory: null as string | null, feedSubCategory: null as string | null, promoteurOnly: false, fournisseurOnly: false };
  }
  if (category === PROMOTEUR_CATEGORY_ID) {
    return { feedCategory: null, feedSubCategory: null, promoteurOnly: true, fournisseurOnly: false };
  }
  if (category === FOURNISSEUR_CATEGORY_ID) {
    return { feedCategory: null, feedSubCategory: null, promoteurOnly: false, fournisseurOnly: true };
  }
  return {
    feedCategory: category,
    feedSubCategory: sub || null,
    promoteurOnly: false,
    fournisseurOnly: false,
  };
};

const subCategoryLabel = (item: MockItem) => feedSubCategoryBySlug(item.feed_sub_category)?.subCategory.label || "";

type SearchType = "services" | "projets" | "comptes";

const SEARCH_TYPES: { id: SearchType; label: string }[] = [
  { id: "comptes", label: "Entreprises" },
  { id: "projets", label: "Projets" },
  { id: "services", label: "Services" },
];

const matchesQuery = (item: MockItem, query: string) => {
  if (!query) return true;
  const hay = `${item.profileName} ${item.username || ""} ${item.title} ${item.city} ${item.blurb || ""} ${item.description || ""} ${(item.highlights || []).join(" ")}`.toLowerCase();
  return hay.includes(query);
};

const matchesCity = (item: MockItem, city: string) => {
  if (!city.trim()) return true;
  const needle = city.trim().toLowerCase();
  const hay = (item.city || "").toLowerCase();
  if (!hay) return false;
  if (hay.includes(needle)) return true;
  return hay
    .split(/[\n,;/|]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .some((part) => part === needle || part.startsWith(needle) || needle.startsWith(part));
};

const detailLine = (item: MockItem) => {
  if (item.blurb) return item.blurb;
  return [item.price, item.surface, item.beds != null ? `${item.beds} ch.` : ""]
    .filter(Boolean)
    .join(" · ");
};

const ResultCard = ({ item, onOpen }: { item: MockItem; onOpen: (item: MockItem) => void }) => {
  const profile = (
    <span className="flex items-center gap-2.5">
      <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-2xl object-cover" />
      <span className="min-w-0">
        <span className="flex min-w-0 items-center gap-1">
          <span className="truncate text-[15px] font-semibold text-neutral-950">{item.profileName}</span>
          <VerifiedBadge verified={item.is_verified} className="h-4 w-4" />
        </span>
        <span className="block truncate text-xs text-neutral-500">{item.city}</span>
      </span>
    </span>
  );
  const copy = (
    <>
      <span className="mt-2 block text-[15px] font-semibold text-neutral-950">{item.title}</span>
      {detailLine(item) ? <span className="mt-0.5 block text-sm text-neutral-600">{detailLine(item)}</span> : null}
    </>
  );

  if (item.kind === "bien") {
    return (
      <button type="button" onClick={() => onOpen(item)} className="flex w-full items-center gap-3 px-3 py-3 text-left">
        <span className="min-w-0 flex-1">
          {profile}
          {copy}
        </span>
        <img src={item.image} alt="" className="h-24 w-36 shrink-0 rounded-lg object-cover" />
      </button>
    );
  }

  return (
    <button type="button" onClick={() => onOpen(item)} className="block w-full px-3 py-3 text-left">
      {profile}
      <span className="relative mt-2 block">
        <img src={item.image} alt="" className="h-28 w-full rounded-lg object-cover" />
      </span>
      {copy}
    </button>
  );
};

const PromoteurNetworkGate = ({ onJoin }: { onJoin: () => void }) => (
  <div className="mx-1 mt-6 rounded-2xl border border-[#174f43]/20 bg-[#174f43]/5 px-4 py-5 text-center sm:px-6">
    <p className="text-base leading-relaxed text-neutral-800">
      Seuls les partenaires accèdent au réseau étendu des promoteurs, avec l&apos;ensemble de leurs détails.
    </p>
    <button
      type="button"
      onClick={onJoin}
      className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#174f43] px-5 py-3 text-base font-semibold text-white transition hover:bg-[#123d34]"
    >
      Deviens notre partenaire!
    </button>
  </div>
);

/** Top banner for Projets: open-dossier notice + partner CTA in one bordered block. */
const ProjetDossierPartnerBanner = ({ onJoin }: { onJoin: () => void }) => (
  <div className="mx-1 mt-4 rounded-2xl border border-[#174f43]/20 bg-[#174f43]/5 px-4 py-4 sm:px-5">
    <p className="text-sm leading-relaxed text-neutral-800">
      Les trois premiers dossiers sont ouverts : leur équipe et leurs documents sont consultables. Pour tous les autres
      projets, ces sections restent réservées aux partenaires.
    </p>
    <p className="mt-3 text-sm leading-relaxed text-neutral-800">
      Seuls les partenaires accèdent au réseau étendu des promoteurs, avec l&apos;ensemble de leurs détails.
    </p>
    <button
      type="button"
      onClick={onJoin}
      className="mt-3 inline-flex items-center justify-center rounded-xl bg-[#174f43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123d34]"
    >
      Deviens notre partenaire!
    </button>
  </div>
);

const DISCOVER_PROJECTS_CAP = 40;

const AccountRow = ({
  name,
  image,
  city,
  typeLabel,
  isVerified,
  followed,
  onFollow,
  onOpen,
}: {
  name: string;
  image: string;
  city: string;
  typeLabel: string;
  isVerified?: boolean;
  followed: boolean;
  onFollow: () => void;
  onOpen: () => void;
}) => (
  <div className="flex items-center gap-4 border-b border-neutral-100 px-3 py-4 sm:gap-5 sm:py-5">
    <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-4 text-left sm:gap-5">
      <img
        src={image || resolveAvatarUrl(null)}
        alt=""
        className="h-16 w-16 shrink-0 rounded-2xl object-cover bg-neutral-100 sm:h-[4.5rem] sm:w-[4.5rem]"
        onError={(e) => {
          const el = e.currentTarget;
          const fallback = resolveAvatarUrl(null);
          if (el.src !== fallback) el.src = fallback;
        }}
      />
      <span className="min-w-0">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-lg font-semibold text-neutral-950 sm:text-xl">{name}</span>
          <VerifiedBadge verified={isVerified} className="h-5 w-5 sm:h-6 sm:w-6" />
        </span>
        <span className="mt-1 block truncate text-base text-neutral-400 sm:text-lg">{typeLabel} · {city}</span>
      </span>
    </button>
    <button
      type="button"
      onClick={onFollow}
      className={`shrink-0 rounded-full px-4 py-2.5 text-base font-semibold transition sm:px-5 sm:text-lg ${
        followed ? "bg-[#174f43] text-white" : "border border-[#174f43] text-[#174f43]"
      }`}
    >
      {followed ? "Suivi" : "Suivre"}
    </button>
  </div>
);

/** Vertical sliding segmented control over the project stages:
 *  Tout -> Sur plan -> Construction -> Prêt à livrer -> Livré. */
const StageSlider = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
  const stops = [{ id: "", label: "Tout" }, ...PROJECT_MILESTONES];
  const count = stops.length;
  return (
    <div className="relative flex flex-col rounded-[2.2vh] bg-neutral-100 p-[0.5vh]" role="group" aria-label="État du projet">
      <span
        aria-hidden
        className="absolute left-[0.5vh] right-[0.5vh] rounded-[1.8vh] bg-[#174f43] shadow-sm transition-all duration-200 ease-out"
        style={{
          height: `calc((100% - 1vh) / ${count})`,
          top: `calc(0.5vh + ${value} * (100% - 1vh) / ${count})`,
        }}
      />
      {stops.map((stop, index) => (
        <button
          key={stop.label}
          type="button"
          onClick={() => onChange(index)}
          aria-pressed={index === value}
          className={`relative z-[1] w-full whitespace-nowrap rounded-[1.8vh] px-[1.8vh] py-[1.1vh] text-left text-[1.55vh] font-semibold leading-none transition-colors duration-200 ${
            index === value ? "text-white" : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          {stop.label}
        </button>
      ))}
    </div>
  );
};

const CardList = ({
  items,
  onOpen,
  serviceRows,
  projectRows,
  lockDossiers = false,
}: {
  items: MockItem[];
  onOpen: (item: MockItem) => void;
  serviceRows: ServiceRow[];
  projectRows: any[];
  lockDossiers?: boolean;
}) => {
  const wideGrid =
    items.length > 0 && items.every((item) => item.kind === "projet" || item.kind === "annonce");
  return (
  <ul
    className={`mt-3 grid items-start gap-3 lg:relative lg:left-1/2 lg:-translate-x-1/2 ${
      wideGrid
        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 lg:w-[min(96rem,calc(100vw-19rem))]"
        : "grid-cols-1 lg:grid-cols-2 lg:w-[min(80rem,calc(100vw-19rem))]"
    }`}
  >
    {items.map((item) => {
      if (item.kind === "projet") {
        const project = projectRows.find((row) => row.id === item.id);
        if (project) {
          return (
            <li key={item.id} className="min-w-0 transition duration-150 hover:scale-[0.98]">
              <ProjectCard
                row={project}
                dossier={
                  project.open_dossier
                    ? "open"
                    : project.dossier_locked || lockDossiers
                      ? "locked"
                      : undefined
                }
              />
            </li>
          );
        }
      }
      if (item.kind === "annonce") {
        const service = serviceRows.find((row) => row.id === item.id);
        if (service) {
          return (
            <li key={item.id} className="min-w-0 transition duration-150 hover:scale-[0.98]">
              <ServiceCard
                row={{
                  id: service.id,
                  firm: serviceFirmName(service),
                  userId: service.user_id,
                  offer: offerFromRow(service),
                  isVerified: serviceIsVerified(service),
                }}
              />
            </li>
          );
        }
      }
      return (
        <li
          key={item.id}
          className="min-w-0 overflow-hidden rounded-xl border border-neutral-300 bg-white transition duration-150 hover:scale-[0.98] hover:border-neutral-400"
        >
          <ResultCard item={item} onOpen={onOpen} />
        </li>
      );
    })}
  </ul>
  );
};

const Explore = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [draft, setDraft] = useState(params.get("q") || "");
  const [committedQuery, setCommittedQuery] = useState((params.get("q") || "").trim());
  const [searchType, setSearchType] = useState<SearchType>("comptes");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState("");
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [projectStageIdx, setProjectStageIdx] = useState(0);
  const [projectCommercial, setProjectCommercial] = useState<string | null>(null);
  const [projectType, setProjectType] = useState<string | null>(null);
  const projectStage = projectStageIdx === 0 ? null : PROJECT_MILESTONES[projectStageIdx - 1].id;
  const activeProjectFilters = (projectStageIdx > 0 ? 1 : 0) + (projectCommercial ? 1 : 0);
  const [liveServices, setLiveServices] = useState<ServiceRow[]>([]);
  const [liveProjects, setLiveProjects] = useState<any[]>([]);
  const [liveProfiles, setLiveProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [hasMoreServices, setHasMoreServices] = useState(true);
  const [hasMoreProfiles, setHasMoreProfiles] = useState(true);
  const [servicesBooted, setServicesBooted] = useState(false);
  const [catalogBooted, setCatalogBooted] = useState(false);
  const [serverCounts, setServerCounts] = useState<{
    comptes: number | null;
    services: number | null;
    projets: number | null;
  }>({ comptes: null, services: null, projets: null });

  const servicesOffsetRef = useRef(0);
  const profilesOffsetRef = useRef(0);
  const hasMoreServicesRef = useRef(true);
  const hasMoreProfilesRef = useRef(true);
  const loadingMoreProfilesRef = useRef(false);
  const loadingMoreServicesRef = useRef(false);
  const servicesBootedRef = useRef(false);
  const catalogBootedRef = useRef(false);
  /** Per-stream tickets so Services boot never strands Entreprises loading. */
  const profilesTicket = useRef(0);
  const servicesTicket = useRef(0);
  const catalogTicket = useRef(0);

  const typedQuery = committedQuery.toLowerCase();

  useEffect(() => {
    const q = params.get("q") || "";
    setDraft(q);
    setCommittedQuery(q.trim());
  }, [params]);

  // Live server search while typing (same idea as category filters — no client-side sparse paging).
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setCommittedQuery(draft.trim());
    }, 350);
    return () => window.clearTimeout(handle);
  }, [draft]);

  const appendUnique = <T extends { id: string }>(prev: T[], next: T[]) => {
    const seen = new Set(prev.map((row) => row.id));
    return [...prev, ...next.filter((row) => !seen.has(row.id))];
  };

  const cityFilter = selectedCity.trim() || null;
  const taxonomyFilters = useMemo(
    () => discoverTaxonomyFilters(selectedCategory, subCategory),
    [selectedCategory, subCategory],
  );
  const promoterBatch = taxonomyFilters.promoteurOnly;
  // Projets always load the promoteur dossier network (open_dossier first).
  // Category filters on Comptes must not change this. Server redacts équipe/docs
  // for unsigned / non-partner viewers.
  const showDossierGate = searchType === "projets";
  const profilePageSize = promoterBatch ? 50 : DISCOVER_PAGE_SIZE;

  const loadMoreServices = useCallback(async () => {
    if (loadingMoreServicesRef.current || !hasMoreServicesRef.current) return;
    const ticket = ++servicesTicket.current;
    loadingMoreServicesRef.current = true;
    setLoadingMore(true);
    try {
      const page = await serviceService.listServices(DISCOVER_PAGE_SIZE, servicesOffsetRef.current, {
        city: cityFilter,
        query: committedQuery || null,
        ...taxonomyFilters,
      });
      if (servicesTicket.current !== ticket) return;
      servicesOffsetRef.current += DISCOVER_PAGE_SIZE;
      const more = page.length >= DISCOVER_PAGE_SIZE;
      hasMoreServicesRef.current = more;
      setHasMoreServices(more);
      setLiveServices((prev) => appendUnique(prev, page));
    } catch (error) {
      if (servicesTicket.current !== ticket) return;
      console.error("Error loading more services:", error);
      hasMoreServicesRef.current = false;
      setHasMoreServices(false);
    } finally {
      loadingMoreServicesRef.current = false;
      if (servicesTicket.current === ticket) setLoadingMore(false);
    }
  }, [cityFilter, taxonomyFilters, committedQuery]);

  const loadMoreProfiles = useCallback(async () => {
    if (loadingMoreProfilesRef.current || !hasMoreProfilesRef.current) return;
    const ticket = ++profilesTicket.current;
    loadingMoreProfilesRef.current = true;
    setLoadingMore(true);
    try {
      const { rows: page, nextOffset } = await profileService.listProfessionals(
        profilePageSize,
        profilesOffsetRef.current,
        { city: cityFilter, query: committedQuery || null, ...taxonomyFilters },
      );
      if (profilesTicket.current !== ticket) return;
      profilesOffsetRef.current = nextOffset;
      const more = promoterBatch ? false : page.length >= profilePageSize;
      hasMoreProfilesRef.current = more;
      setHasMoreProfiles(more);
      setLiveProfiles((prev) => appendUnique(prev, page));
    } catch (error) {
      if (profilesTicket.current !== ticket) return;
      console.error("Error loading more professionals:", error);
      hasMoreProfilesRef.current = false;
      setHasMoreProfiles(false);
    } finally {
      loadingMoreProfilesRef.current = false;
      if (profilesTicket.current === ticket) setLoadingMore(false);
    }
  }, [cityFilter, taxonomyFilters, committedQuery, profilePageSize, promoterBatch]);

  // Professionnels — reload on city, query, or category/sub change (filters are server-side).
  useEffect(() => {
    let cancelled = false;
    const bootProfiles = async () => {
      const ticket = ++profilesTicket.current;
      loadingMoreProfilesRef.current = false;
      setLoadingProfiles(true);
      setLiveProfiles([]);
      profilesOffsetRef.current = 0;
      hasMoreProfilesRef.current = true;
      setHasMoreProfiles(true);
      try {
        const { rows: profiles, nextOffset } = await profileService.listProfessionals(profilePageSize, 0, {
          city: cityFilter,
          query: committedQuery || null,
          ...taxonomyFilters,
        });
        if (cancelled || profilesTicket.current !== ticket) return;
        profilesOffsetRef.current = nextOffset;
        const more = promoterBatch ? false : profiles.length >= profilePageSize;
        hasMoreProfilesRef.current = more;
        setHasMoreProfiles(more);
        setLiveProfiles(profiles);
      } catch (error) {
        if (!cancelled && profilesTicket.current === ticket) {
          console.error("Error loading professionals:", error);
        }
      } finally {
        // Always clear when this effect is superseded/unmounted — shared tickets used to strand "Chargement…".
        if (cancelled || profilesTicket.current === ticket) setLoadingProfiles(false);
      }
    };
    void bootProfiles();
    return () => {
      cancelled = true;
    };
  }, [cityFilter, taxonomyFilters, committedQuery, profilePageSize, promoterBatch]);

  // Prefetch services with the same filters so the tab count stays accurate (and tab switches stay instant).
  useEffect(() => {
    let cancelled = false;
    const bootServices = async () => {
      const ticket = ++servicesTicket.current;
      loadingMoreServicesRef.current = false;
      setLoadingServices(true);
      setLiveServices([]);
      servicesOffsetRef.current = 0;
      hasMoreServicesRef.current = true;
      setHasMoreServices(true);
      servicesBootedRef.current = false;
      setServicesBooted(false);
      try {
        const services = await serviceService.listServices(DISCOVER_PAGE_SIZE, 0, {
          city: cityFilter,
          query: committedQuery || null,
          ...taxonomyFilters,
        });
        if (cancelled || servicesTicket.current !== ticket) return;
        servicesOffsetRef.current = DISCOVER_PAGE_SIZE;
        const more = services.length >= DISCOVER_PAGE_SIZE;
        hasMoreServicesRef.current = more;
        setHasMoreServices(more);
        setLiveServices(services);
        servicesBootedRef.current = true;
        setServicesBooted(true);
      } catch (error) {
        if (!cancelled && servicesTicket.current === ticket) {
          console.error("Error loading services:", error);
        }
      } finally {
        if (cancelled || servicesTicket.current === ticket) setLoadingServices(false);
      }
    };
    void bootServices();
    return () => {
      cancelled = true;
    };
  }, [cityFilter, taxonomyFilters, committedQuery]);

  // Prefetch projects with filters so tab counts stay useful.
  useEffect(() => {
    let cancelled = false;
    const bootCatalog = async () => {
      const ticket = ++catalogTicket.current;
      setLoadingCatalog(true);
      catalogBootedRef.current = false;
      setCatalogBooted(false);
      try {
        // Cap Discover projets at 40. listProjects prioritizes open dossiers then
        // non-Chridari covers. Dossier lock/redaction stays server-side.
        const projects = await catalogService.listProjects(DISCOVER_PROJECTS_CAP, 0, {
          city: cityFilter,
          projectType,
          featuredPromoters: promoterBatch,
        });
        if (cancelled || catalogTicket.current !== ticket) return;
        const withImages = projects.slice(0, DISCOVER_PROJECTS_CAP);
        setLiveProjects(withImages);
        setServerCounts((prev) => ({ ...prev, projets: withImages.length }));
        catalogBootedRef.current = true;
        setCatalogBooted(true);
      } catch (error) {
        if (!cancelled && catalogTicket.current === ticket) {
          console.error("Error loading catalog:", error);
        }
      } finally {
        if (cancelled || catalogTicket.current === ticket) setLoadingCatalog(false);
      }
    };
    void bootCatalog();
    return () => {
      cancelled = true;
    };
  }, [cityFilter, projectType, promoterBatch]);

  // Exact totals from Supabase (not the currently loaded page).
  useEffect(() => {
    let cancelled = false;
    const loadCounts = async () => {
      setServerCounts({ comptes: null, services: null, projets: null });
      try {
        const [comptes, services, projets] = await Promise.all([
          profileService.countProfessionals({
            city: cityFilter,
            query: committedQuery || null,
            ...taxonomyFilters,
          }),
          serviceService.countServices({
            city: cityFilter,
            query: committedQuery || null,
            ...taxonomyFilters,
          }),
          // Same imaged + priority rules as the Projets list (no empty covers).
          catalogService
            .listProjects(DISCOVER_PROJECTS_CAP, 0, {
              city: cityFilter,
              projectType,
              featuredPromoters: promoterBatch,
            })
            .then((rows) => rows.length),
        ]);
        if (cancelled) return;
        setServerCounts({ comptes, services, projets });
      } catch (error) {
        if (!cancelled) console.error("Error loading Discover counts:", error);
      }
    };
    void loadCounts();
    return () => {
      cancelled = true;
    };
  }, [cityFilter, taxonomyFilters, committedQuery, projectType, promoterBatch]);

  const catalogItems = useMemo(() => {
    const services: MockItem[] = liveServices.map((row) => {
      const offer = offerFromRow(row);
      const tags = serviceFeedTags(row);
      return {
        id: row.id,
        feed_category: tags.feed_category,
        feed_sub_category: tags.feed_sub_category,
        is_promoteur: tags.is_promoteur,
        is_fournisseur: tags.is_fournisseur,
        kind: "annonce" as const,
        profileName: serviceFirmName(row),
        username: (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles)?.username || "",
        image: serviceMainImage(offer),
        title: offer.title,
        city: zoneLabel(offer),
        price: priceLabel(offer),
        description: offer.description,
        highlights: offer.included.slice(0, 4),
        is_verified: serviceIsVerified(row),
      };
    });
    const projects: MockItem[] = liveProjects
      .map((row) => {
        const gallery = Array.isArray(row.images)
          ? row.images.map(String).filter((url) => /^https?:\/\//i.test(url.trim()))
          : [];
        const cover = String(row.cover_image || "").trim();
        const image = (/^https?:\/\//i.test(cover) ? cover : "") || gallery[0] || "";
        return {
          id: row.id,
          feed_category: "",
          feed_sub_category: "",
          kind: "projet" as const,
          profileName: row.promoter_name || row.title || "Projet",
          image,
          title: row.title || "Projet",
          city: row.city || "",
          progress: Number(row.progress) || 0,
          description: row.description || "",
        };
      })
      .filter((item) => Boolean(item.image));
    const accounts: MockItem[] = liveProfiles.map((row) => {
      const extras = Array.isArray(row.profile_internal_categories) ? row.profile_internal_categories : [];
      const codes = [
        row.internal_categories?.code,
        ...extras.map((link: any) => link?.internal_categories?.code),
      ].filter(Boolean) as string[];
      const feed =
        extras.find((link: any) => link?.is_primary)?.internal_categories?.feed_sub_categories ||
        row.internal_categories?.feed_sub_categories;
      return {
        id: row.id,
        feed_category: feed?.categories?.slug || "",
        feed_sub_category: feed?.slug || "",
        is_promoteur: codes.some((code) => isPromoteurInternalCode(code)),
        is_fournisseur:
          codes.some((code) => isFournisseurInternalCode(code)) || feed?.slug === "fournisseurs",
        kind: "agence" as const,
        profileName: row.full_name || row.username || "Entreprise",
        username: row.username || "",
        image: resolveAvatarUrl(row.avatar_url, row.profile_type),
        title: row.full_name || row.username || "Entreprise",
        city: row.location || "",
        description: row.profession || "",
        is_verified: Boolean(row.is_verified),
      };
    });
    return [...DISCOVER_ITEMS, ...accounts, ...projects, ...services];
  }, [liveServices, liveProjects, liveProfiles]);

  const searched = useMemo(
    () =>
      catalogItems.filter((item) => {
        // Professionnels / Services: category + text query are applied server-side.
        // Projets: filtered by project type, not feed category.
        const categoryOk =
          searchType === "comptes" || searchType === "services" || (item.kind === "projet" && searchType === "projets")
            ? true
            : matchesFeedCategory(selectedCategory, subCategory, item);
        const queryOk =
          searchType === "comptes" || searchType === "services" ? true : matchesQuery(item, typedQuery);
        // City is applied server-side when loading; keep client match as a soft check
        // but always allow nationwide services labeled "Maroc".
        const cityOk =
          !selectedCity.trim() ||
          (item.city || "").trim().toLowerCase() === "maroc" ||
          matchesCity(item, selectedCity);
        return categoryOk && queryOk && cityOk;
      }),
    [catalogItems, typedQuery, selectedCategory, subCategory, selectedCity, searchType],
  );
  // Stage (sur plan -> livre), commercial status and type per live project,
  // for the Projets tab filters.
  const projectFilterData = useMemo(() => {
    const map = new Map<string, { stage: number; commercial: string; type: string }>();
    liveProjects.forEach((row) => {
      const project = dossierFromRow(row);
      map.set(row.id, {
        stage: milestoneReachedIndex(project),
        commercial: project.commercialStatus || "",
        type: String(row.project_type || "").trim(),
      });
    });
    return map;
  }, [liveProjects]);

  const matchesProjectFilters = useCallback(
    (item: MockItem) => {
      if (item.kind !== "projet") return false;
      const data = projectFilterData.get(item.id);
      if (projectType && (!data || data.type !== projectType)) return false;
      if (projectStage && (!data || PROJECT_MILESTONES[data.stage]?.id !== projectStage)) return false;
      if (projectCommercial && (!data || data.commercial !== projectCommercial)) return false;
      return true;
    },
    [projectFilterData, projectType, projectStage, projectCommercial],
  );

  const searchResults = searched.filter((item) => {
    if (searchType === "services") return item.kind === "annonce";
    if (searchType === "projets") return matchesProjectFilters(item);
    return false;
  });
  const accounts = useMemo(() => searched.filter((item) => item.kind === "agence"), [searched]);

  const tabCountText = (id: SearchType): string | null => {
    const value = serverCounts[id];
    if (value == null) return null;
    if (id === "projets") return String(Math.min(value, DISCOVER_PROJECTS_CAP));
    return String(value);
  };

  const selectedLabel = feedCategoryLabel(selectedCategory);

  // The Catégories button lists project types while the Projets tab is active.
  const pickerLabel =
    searchType === "projets" ? (projectType ? projectTypeLabel(projectType) : null) : selectedLabel;

  const hasMoreForTab =
    searchType === "comptes" ? hasMoreProfiles : searchType === "services" ? hasMoreServices : false;

  const loadMoreForTab = useCallback(() => {
    if (searchType === "comptes") void loadMoreProfiles();
    else if (searchType === "services") void loadMoreServices();
  }, [searchType, loadMoreProfiles, loadMoreServices]);

  const tabLoading =
    (searchType === "comptes" && loadingProfiles) ||
    (searchType === "services" && (loadingServices || !servicesBooted)) ||
    (searchType === "projets" && (loadingCatalog || !catalogBooted));

  const openItem = (item: MockItem) => {
    window.scrollTo(0, 0);
    if (item.kind === "projet") {
      navigate(`/projet/${item.id}`);
      return;
    }
    if (item.kind === "annonce") {
      navigate(`/service/${item.id}`);
      return;
    }
    if (item.kind === "actualite") {
      navigate(`/post/${item.id}`);
      return;
    }
    navigate(`/profile/${item.username || item.id}`);
  };

  const searchFields = (
    <div className="w-full">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const next = draft.trim();
          navigate(next ? `/explore?q=${encodeURIComponent(next)}` : "/explore");
        }}
      >
        <div className="relative min-w-0">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Rechercher entreprises, catégories…"
            className="h-14 w-full rounded-full border border-neutral-300 bg-white pl-12 pr-4 text-base text-neutral-900 shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-orange-400 sm:text-lg"
          />
        </div>
      </form>
      <div className="mt-4">
        <CategoryPicker
          open={false}
          onToggle={() => setCategoriesOpen(true)}
          selectedLabel={pickerLabel}
          categories={FEED_PICKER_CATEGORIES}
          onSelect={() => {}}
          size="lg"
        />
        {searchType !== "projets" ? (
          <SubCategoryChips
            category={selectedCategory}
            value={subCategory}
            onChange={setSubCategory}
            size="lg"
          />
        ) : null}
        <div className="mt-4 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setCitySheetOpen(true)}
            className="flex h-14 min-w-0 flex-1 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-left shadow-sm transition hover:border-[#174f43]"
          >
            <MapPin className="h-5 w-5 shrink-0 text-neutral-500" />
            <span className={`min-w-0 flex-1 truncate text-base sm:text-lg ${selectedCity ? "font-medium text-neutral-900" : "text-neutral-400"}`}>
              {selectedCity || "Filtrer par ville"}
            </span>
            <ChevronDown className="h-5 w-5 shrink-0 text-neutral-500" />
          </button>
          {selectedCity ? (
            <button
              type="button"
              onClick={() => setSelectedCity("")}
              className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
              aria-label="Effacer la ville"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>
        <RegionCitySheet
          open={citySheetOpen}
          onClose={() => setCitySheetOpen(false)}
          onSelect={setSelectedCity}
        />
      </div>
      <div className="mt-5 flex border-b border-neutral-200">
        {SEARCH_TYPES.map((item) => {
          const active = searchType === item.id;
          const count = tabCountText(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSearchType(item.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 border-b-2 pb-3 sm:flex-row sm:justify-center sm:gap-2 ${
                active ? "border-[#174f43] text-[#174f43]" : "border-transparent text-neutral-500"
              }`}
            >
              <span className="text-base font-semibold sm:text-lg">{item.label}</span>
              {count != null ? (
                <span
                  className={`text-sm font-semibold tabular-nums sm:text-base ${
                    active ? "text-[#174f43]/80" : "text-neutral-400"
                  }`}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (categoriesOpen) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto w-full max-w-2xl px-3">
          <CategoryPicker
            open
            onToggle={() => setCategoriesOpen(false)}
            selectedLabel={pickerLabel}
            categories={searchType === "projets" ? PROJECT_TYPE_OPTIONS : FEED_PICKER_CATEGORIES}
            size="lg"
            onSelect={(id) => {
              if (searchType === "projets") {
                setProjectType(id === "tout" ? null : id);
              } else {
                setSelectedCategory(id);
                setSubCategory(null);
              }
              setCategoriesOpen(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <DesktopRailFrame className="min-h-screen bg-white pb-20 lg:pb-0">
      <div className="mx-auto w-full max-w-2xl px-3 pt-4 lg:mx-0 lg:max-w-none lg:px-0 lg:pt-0">
        {searchFields}
        <div className="mt-4 flex items-center justify-end gap-2 pb-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-base font-medium ${
                viewMode === "list" ? "bg-[#174f43] text-white" : "bg-neutral-100 text-neutral-900"
              }`}
            >
              <List className="h-5 w-5" />
              Liste
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-base font-medium ${
                viewMode === "map" ? "bg-[#174f43] text-white" : "bg-neutral-100 text-neutral-900"
              }`}
            >
              <MapIcon className="h-5 w-5" />
              Carte
            </button>
          </div>
        </div>

        {searchType === "projets" && viewMode === "list" ? (
          <div className="mt-[1vh]">
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-base font-semibold shadow-sm transition ${
                activeProjectFilters > 0
                  ? "border-[#174f43] text-[#174f43]"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-[#174f43] hover:text-[#174f43]"
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
              Filtres
              {activeProjectFilters > 0 ? (
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#174f43] px-1.5 text-sm font-bold text-white">
                  {activeProjectFilters}
                </span>
              ) : null}
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-300 ${filtersOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="flex max-w-full items-start gap-[1.5vh] pt-[1.2vh]">
                  <div className="w-[24vh] max-w-[48%] shrink-0">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 sm:text-sm">
                      État du projet
                    </p>
                    <StageSlider value={projectStageIdx} onChange={setProjectStageIdx} />
                  </div>
                  <div className="w-[24vh] max-w-[48%] shrink-0">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 sm:text-sm">
                      Commercialisation
                    </p>
                    <div className="flex flex-col rounded-[2.2vh] bg-neutral-100 p-[0.5vh]">
                {[
                  { id: null as string | null, label: "Tous" },
                  ...COMMERCIAL_STATUSES.filter(
                    (status) => status.id === "en_commercialisation" || status.id === "commercialise",
                  ).map((status) => ({ id: status.id as string | null, label: status.label })),
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setProjectCommercial(option.id)}
                    aria-pressed={projectCommercial === option.id}
                    className={`w-full whitespace-nowrap rounded-[1.8vh] px-[1.8vh] py-[1.1vh] text-left text-[1.55vh] font-semibold leading-none transition ${
                      projectCommercial === option.id
                        ? "bg-[#174f43] text-white shadow-sm"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {viewMode === "map" ? (
          <div className="px-3 py-4">
            <MapView />
          </div>
        ) : tabLoading &&
          ((searchType === "comptes" && accounts.length === 0) ||
            (searchType === "services" && searchResults.length === 0) ||
            (searchType !== "comptes" && searchType !== "services" && searchResults.length === 0)) ? (
          <p className="px-4 py-8 text-center text-base text-muted-foreground sm:text-lg">Chargement…</p>
        ) : searchType === "comptes" ? (
          accounts.length === 0 && !hasMoreProfiles && !loadingProfiles ? (
            <>
              <p className="px-4 py-8 text-center text-base text-muted-foreground sm:text-lg">Aucune entreprise pour cette recherche</p>
              {promoterBatch ? <PromoteurNetworkGate onJoin={() => setPartnerOpen(true)} /> : null}
            </>
          ) : (
            <>
              <ul>
                {accounts.map((item) => {
                  const username = item.username || item.id;
                  return (
                    <li key={item.id}>
                      <AccountRow
                        name={item.profileName}
                        image={item.image}
                        city={item.city}
                        typeLabel={subCategoryLabel(item) || item.description || "Entreprise"}
                        isVerified={item.is_verified}
                        followed={Boolean(followed[username])}
                        onFollow={() => setFollowed((current) => ({ ...current, [username]: !current[username] }))}
                        onOpen={() => openItem(item)}
                      />
                    </li>
                  );
                })}
              </ul>
              <InfiniteScrollSentinel hasMore={hasMoreForTab} loading={loadingMore} onLoadMore={loadMoreForTab} />
              {promoterBatch ? <PromoteurNetworkGate onJoin={() => setPartnerOpen(true)} /> : null}
            </>
          )
        ) : searchResults.length === 0 &&
          !(searchType === "services" && (hasMoreServices || loadingServices)) &&
          !tabLoading ? (
          <>
            <p className="px-4 py-8 text-center text-base text-muted-foreground sm:text-lg">Aucun résultat pour cette recherche</p>
            {showDossierGate ? <ProjetDossierPartnerBanner onJoin={() => setPartnerOpen(true)} /> : null}
          </>
        ) : (
          <>
            {showDossierGate ? <ProjetDossierPartnerBanner onJoin={() => setPartnerOpen(true)} /> : null}
            <CardList
              items={
                searchType === "projets" ? searchResults.slice(0, DISCOVER_PROJECTS_CAP) : searchResults
              }
              onOpen={openItem}
              serviceRows={liveServices}
              projectRows={liveProjects}
              lockDossiers={showDossierGate}
            />
            {searchType === "services" ? (
              <InfiniteScrollSentinel hasMore={hasMoreForTab} loading={loadingMore || loadingServices} onLoadMore={loadMoreForTab} />
            ) : null}
          </>
        )}
        <PartnerDemandDialog open={partnerOpen} onOpenChange={setPartnerOpen} />
      </div>
    </DesktopRailFrame>
  );
};

export default Explore;
