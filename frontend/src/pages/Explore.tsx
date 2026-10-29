import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Map as MapIcon, MapPin, Search, X } from "lucide-react";
import { DesktopRailFrame } from "@/components/FeedDesktopRail";
import PartnerDemandDialog, { PAID_PLAN_REQUEST } from "@/components/PartnerDemandDialog";
import InfiniteScrollSentinel from "@/components/InfiniteScrollSentinel";
import MapView from "@/components/MapView";
import { CategoryPicker, FEED_PICKER_CATEGORIES } from "@/components/CategoryPicker";
import { RegionCitySheet } from "@/components/RegionCitySheet";
import { SubCategoryChips } from "@/components/FilterChips";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ServiceCard } from "@/components/service/ServiceCard";
import VerifiedBadge from "@/components/VerifiedBadge";
import { resolveAvatarUrl } from "@/lib/avatar";
import { DISCOVER_ITEMS, type DiscoverItem } from "@/lib/showcaseDiscover";
import { featuredFirmsForDiscover } from "@/lib/recommendedFirms";
import { RecommendedFirmsGrid } from "@/components/FeedSpotlight";
import { offerFromRow, priceLabel, serviceMainImage, zoneLabel } from "@/lib/serviceOffer";
import { profileService } from "@/services/profileService";
import { serviceFirmName, serviceFeedTags, serviceIsVerified, serviceService, type ServiceRow } from "@/services/serviceService";
import {
  FOURNISSEUR_CATEGORY_ID,
  INGENIERIE_ETUDES_SUB_SLUG,
  PROMOTEUR_CATEGORY_ID,
  feedCategoryLabel,
  feedSubCategoryBySlug,
  isFournisseurInternalCode,
  isPromoteurInternalCode,
  matchesFeedCategory,
  normalizeIngenierieFilterCodes,
} from "@/lib/taxonomy";

type MockItem = DiscoverItem;

/** First paint + scroll pages — keep small so nested taxonomy joins stay fast. */
const DISCOVER_PAGE_SIZE = 12;

/** Map Discover category chips → server filters (avoids client-side sparse paging). */
const discoverTaxonomyFilters = (
  category: string | null,
  sub: string | null,
  betCodes: string[] = [],
) => {
  if (!category || category === "tout") {
    return {
      feedCategory: null as string | null,
      feedSubCategory: null as string | null,
      internalCodes: null as string[] | null,
      promoteurOnly: false,
      fournisseurOnly: false,
    };
  }
  if (category === PROMOTEUR_CATEGORY_ID) {
    return {
      feedCategory: null,
      feedSubCategory: null,
      internalCodes: null,
      promoteurOnly: true,
      fournisseurOnly: false,
    };
  }
  if (category === FOURNISSEUR_CATEGORY_ID) {
    return {
      feedCategory: null,
      feedSubCategory: null,
      internalCodes: null,
      promoteurOnly: false,
      fournisseurOnly: true,
    };
  }
  const codes =
    sub === INGENIERIE_ETUDES_SUB_SLUG
      ? normalizeIngenierieFilterCodes(betCodes)
      : betCodes.map((c) => c.trim()).filter(Boolean);
  return {
    feedCategory: category,
    feedSubCategory: sub || null,
    internalCodes: codes.length ? codes : null,
    promoteurOnly: false,
    fournisseurOnly: false,
  };
};

const subCategoryLabel = (item: MockItem) => feedSubCategoryBySlug(item.feed_sub_category)?.subCategory.label || "";

type SearchType = "services" | "comptes";

const SEARCH_TYPES: { id: SearchType; label: string }[] = [
  { id: "comptes", label: "Entreprises" },
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
      Seuls les partenaires accèdent au réseau étendu des promoteurs, avec l&apos;ensemble de leurs détails. {PAID_PLAN_REQUEST}
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

const AccountRow = ({
  name,
  image,
  city,
  typeLabel,
  isVerified,
  showFollow = false,
  followed,
  onFollow,
  onOpen,
}: {
  name: string;
  image: string;
  city: string;
  typeLabel: string;
  isVerified?: boolean;
  showFollow?: boolean;
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
    {showFollow ? (
      <button
        type="button"
        onClick={onFollow}
        className={`shrink-0 rounded-full px-4 py-2.5 text-base font-semibold transition sm:px-5 sm:text-lg ${
          followed ? "bg-[#174f43] text-white" : "border border-[#174f43] text-[#174f43]"
        }`}
      >
        {followed ? "Suivi" : "Suivre"}
      </button>
    ) : null}
  </div>
);

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
                dossier={project.dossier_locked || lockDossiers ? "locked" : undefined}
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
  const [betCodes, setBetCodes] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [liveServices, setLiveServices] = useState<ServiceRow[]>([]);
  const [featuredServices, setFeaturedServices] = useState<ServiceRow[]>([]);
  const [liveProfiles, setLiveProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [partnerNote, setPartnerNote] = useState(PAID_PLAN_REQUEST);
  const openPartner = (note: string) => {
    setPartnerNote(note);
    setPartnerOpen(true);
  };
  const [hasMoreServices, setHasMoreServices] = useState(true);
  const [hasMoreProfiles, setHasMoreProfiles] = useState(true);
  const [servicesBooted, setServicesBooted] = useState(false);
  const [serverCounts, setServerCounts] = useState<{
    comptes: number | null;
    services: number | null;
  }>({ comptes: null, services: null });

  const servicesOffsetRef = useRef(0);
  const profilesOffsetRef = useRef(0);
  const hasMoreServicesRef = useRef(true);
  const hasMoreProfilesRef = useRef(true);
  const loadingMoreProfilesRef = useRef(false);
  const loadingMoreServicesRef = useRef(false);
  const servicesBootedRef = useRef(false);
  /** Per-stream tickets so Services boot never strands Entreprises loading. */
  const profilesTicket = useRef(0);
  const servicesTicket = useRef(0);

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
    () => discoverTaxonomyFilters(selectedCategory, subCategory, betCodes),
    [selectedCategory, subCategory, betCodes],
  );
  const promoterBatch = taxonomyFilters.promoteurOnly;
  // Projets always load the promoteur dossier network (open_dossier first).
  // Category filters on Comptes must not change this. Server redacts équipe/docs
  // for unsigned / non-partner viewers.
  const showDossierGate = false;
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

  // Exact totals from Supabase (not the currently loaded page).
  useEffect(() => {
    let cancelled = false;
    const loadCounts = async () => {
      setServerCounts({ comptes: null, services: null });
      try {
        const [comptes, services] = await Promise.all([
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
        ]);
        if (cancelled) return;
        setServerCounts({ comptes, services });
      } catch (error) {
        if (!cancelled) console.error("Error loading Discover counts:", error);
      }
    };
    void loadCounts();
    return () => {
      cancelled = true;
    };
  }, [cityFilter, taxonomyFilters, committedQuery]);

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
        profile_type: row.profile_type || null,
      };
    });
    return [...DISCOVER_ITEMS, ...accounts, ...services];
  }, [liveServices, liveProfiles]);

  const searched = useMemo(
    () =>
      catalogItems.filter((item) => {
        // Professionnels / Services: category + text query are applied server-side.
        const categoryOk =
          searchType === "comptes" || searchType === "services"
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

  const searchResults = searched.filter((item) => {
    if (searchType === "services") return item.kind === "annonce";
    return false;
  });
  const accounts = useMemo(() => searched.filter((item) => item.kind === "agence"), [searched]);
  const featuredAccounts = useMemo(
    () =>
      featuredFirmsForDiscover({
        category: selectedCategory,
        sub: subCategory,
        city: selectedCity,
        query: committedQuery,
      }),
    [selectedCategory, subCategory, selectedCity, committedQuery],
  );
  const featuredFirmKey = featuredAccounts.map((firm) => firm.id).join(",");
  useEffect(() => {
    let cancelled = false;
    const ids = featuredFirmKey ? featuredFirmKey.split(",") : [];
    if (!ids.length) {
      setFeaturedServices([]);
      return;
    }
    void serviceService.listServicesByUsers(ids).then(
      (rows) => {
        if (!cancelled) setFeaturedServices(rows);
      },
      (error) => {
        if (!cancelled) {
          console.error("Error loading recommended services:", error);
          setFeaturedServices([]);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [featuredFirmKey]);
  const featuredServiceIds = useMemo(
    () => new Set(featuredServices.map((row) => row.id)),
    [featuredServices],
  );
  const directoryServices = searchResults.filter((item) => !featuredServiceIds.has(item.id));
  const featuredIds = useMemo(() => new Set(featuredAccounts.map((firm) => firm.id)), [featuredAccounts]);
  const featuredUsernames = useMemo(
    () => new Set(featuredAccounts.map((firm) => firm.username)),
    [featuredAccounts],
  );
  const directoryAccounts = useMemo(
    () => accounts.filter((item) => !featuredIds.has(item.id) && !featuredUsernames.has(item.username || "")),
    [accounts, featuredIds, featuredUsernames],
  );

  const tabCountText = (id: SearchType): string | null => {
    const value = serverCounts[id];
    if (value == null) return null;
    return String(value);
  };

  const selectedLabel = feedCategoryLabel(selectedCategory);
  const pickerLabel = selectedLabel;

  const hasMoreForTab =
    searchType === "comptes" ? hasMoreProfiles : searchType === "services" ? hasMoreServices : false;

  const loadMoreForTab = useCallback(() => {
    if (searchType === "comptes") void loadMoreProfiles();
    else if (searchType === "services") void loadMoreServices();
  }, [searchType, loadMoreProfiles, loadMoreServices]);

  const tabLoading =
    (searchType === "comptes" && loadingProfiles) ||
    (searchType === "services" && (loadingServices || !servicesBooted));

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
        <div className="flex items-center gap-2">
          <div className="w-[80%] min-w-0">
            <CategoryPicker
              open={false}
              onToggle={() => setCategoriesOpen(true)}
              selectedLabel={pickerLabel}
              categories={FEED_PICKER_CATEGORIES}
              onSelect={() => {}}
              size="lg"
            />
          </div>
          <div className="relative w-[20%] min-w-0">
            <button
              type="button"
              onClick={() => setCitySheetOpen(true)}
              aria-label={selectedCity ? `Ville : ${selectedCity}` : "Ville"}
              className={`flex h-16 w-full items-center rounded-2xl border border-neutral-200 bg-white text-left shadow-sm transition hover:border-[#174f43] ${
                selectedCity ? "justify-start px-2.5 pr-9 sm:gap-1.5" : "justify-center px-2 sm:justify-start sm:gap-1.5 sm:px-2.5"
              }`}
            >
              <MapPin className={`h-5 w-5 shrink-0 ${selectedCity ? "text-[#174f43]" : "text-neutral-500"}`} />
              <span className={`hidden min-w-0 flex-1 truncate text-sm font-semibold sm:inline sm:text-base ${selectedCity ? "text-neutral-900" : "text-neutral-400"}`}>
                {selectedCity || "Ville"}
              </span>
            </button>
            {selectedCity ? (
              <button
                type="button"
                onClick={() => setSelectedCity("")}
                className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                aria-label="Effacer la ville"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
        <SubCategoryChips
          category={selectedCategory}
          value={subCategory}
          onChange={(id) => {
            setSubCategory(id);
            setBetCodes([]);
          }}
          betCodes={betCodes}
          onBetCodesChange={setBetCodes}
          size="lg"
        />
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
            categories={FEED_PICKER_CATEGORIES}
            size="lg"
            onSelect={(id) => {
              setSelectedCategory(id);
              setSubCategory(null);
              setBetCodes([]);
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

        {viewMode === "map" ? (
          <div className="px-3 py-4">
            <MapView />
          </div>
        ) : tabLoading &&
          ((searchType === "comptes" && accounts.length === 0 && featuredAccounts.length === 0) ||
            (searchType === "services" && searchResults.length === 0 && featuredServices.length === 0) ||
            (searchType !== "comptes" && searchType !== "services" && searchResults.length === 0)) ? (
          <p className="px-4 py-8 text-center text-base text-muted-foreground sm:text-lg">Chargement…</p>
        ) : searchType === "comptes" ? (
          directoryAccounts.length === 0 && featuredAccounts.length === 0 && !hasMoreProfiles && !loadingProfiles ? (
            <>
              <p className="px-4 py-8 text-center text-base text-muted-foreground sm:text-lg">Aucune entreprise pour cette recherche</p>
              {promoterBatch ? <PromoteurNetworkGate onJoin={() => openPartner(PAID_PLAN_REQUEST)} /> : null}
            </>
          ) : (
            <>
              {featuredAccounts.length ? (
                <div className="border-b border-neutral-200 px-3 pb-4 sm:px-0">
                  <h2 className="px-0 pb-3 pt-4 text-lg font-semibold text-neutral-950 sm:text-xl">
                    Entreprises recommandées
                  </h2>
                  <RecommendedFirmsGrid firms={featuredAccounts} />
                </div>
              ) : null}
              {directoryAccounts.length ? (
                <h2 className="px-3 pt-4 text-lg font-semibold text-neutral-950 sm:px-0 sm:text-xl">Résultats</h2>
              ) : null}
              <ul>
                {directoryAccounts.map((item) => {
                  const username = item.username || item.id;
                  return (
                    <li key={item.id}>
                      <AccountRow
                        name={item.profileName}
                        image={item.image}
                        city={item.city}
                        typeLabel={subCategoryLabel(item) || item.description || "Entreprise"}
                        isVerified={item.is_verified}
                        showFollow={item.profile_type === "enterprise" && Boolean(item.is_verified)}
                        followed={Boolean(followed[username])}
                        onFollow={() => setFollowed((current) => ({ ...current, [username]: !current[username] }))}
                        onOpen={() => openItem(item)}
                      />
                    </li>
                  );
                })}
              </ul>
              <InfiniteScrollSentinel hasMore={hasMoreForTab} loading={loadingMore} onLoadMore={loadMoreForTab} />
              {promoterBatch ? <PromoteurNetworkGate onJoin={() => openPartner(PAID_PLAN_REQUEST)} /> : null}
            </>
          )
        ) : searchType === "services" ? (
          directoryServices.length === 0 && featuredServices.length === 0 && !hasMoreServices && !loadingServices && !tabLoading ? (
            <p className="px-4 py-8 text-center text-base text-muted-foreground sm:text-lg">Aucun résultat pour cette recherche</p>
          ) : (
            <>
              {featuredServices.length ? (
                <div className="border-b border-neutral-200 px-3 pb-4 sm:px-0">
                  <h2 className="px-0 pb-3 pt-4 text-lg font-semibold text-neutral-950 sm:text-xl">À la une</h2>
                  <ul className="grid grid-cols-1 items-start gap-3 md:grid-cols-2">
                    {featuredServices.map((service) => (
                      <li key={service.id} className="min-w-0">
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
                    ))}
                  </ul>
                </div>
              ) : null}
              {directoryServices.length ? (
                <h2 className="px-3 pt-4 text-lg font-semibold text-neutral-950 sm:px-0 sm:text-xl">Résultats</h2>
              ) : null}
              <CardList
                items={directoryServices}
                onOpen={openItem}
                serviceRows={liveServices}
                projectRows={[]}
                lockDossiers={showDossierGate}
              />
              <InfiniteScrollSentinel hasMore={hasMoreForTab} loading={loadingMore || loadingServices} onLoadMore={loadMoreForTab} />
            </>
          )
        ) : searchResults.length === 0 && !tabLoading ? (
          <>
            <p className="px-4 py-8 text-center text-base text-muted-foreground sm:text-lg">Aucun résultat pour cette recherche</p>
          </>
        ) : (
          <>
            <CardList
              items={searchResults}
              onOpen={openItem}
              serviceRows={liveServices}
              projectRows={[]}
              lockDossiers={showDossierGate}
            />
          </>
        )}
        <PartnerDemandDialog
          open={partnerOpen}
          onOpenChange={setPartnerOpen}
          title="Débloquer les bonnes affaires"
          description={partnerNote}
          successTitle="Demande reçue"
          successMessage="Merci. Nous vous enverrons les détails du plan payant."
          submitLabel="Envoyer ma demande"
        />
      </div>
    </DesktopRailFrame>
  );
};

export default Explore;
