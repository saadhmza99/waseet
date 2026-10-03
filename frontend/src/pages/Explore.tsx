import { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Building2, ChevronLeft, Cpu, Ellipsis, FileText, Hammer, HardHat, Home, Landmark, List, Map as MapIcon, PenTool, Search } from "lucide-react";
import MapView from "@/components/MapView";
import { CategoryPicker } from "@/components/CategoryPicker";
import { DISCOVER_ITEMS } from "@/lib/showcaseDiscover";
import { SHOWCASE_PROFILE_USERNAME } from "@/lib/showcasePosts";

type DiscoverKind = "actualite" | "biens-projets" | "annonces";
type CategoryId =
  | "foncier"
  | "gestion"
  | "biens"
  | "construction"
  | "renovation"
  | "architecture"
  | "notaires"
  | "immotech"
  | "autres";
type Deal = "all" | "sale" | "rent";
type ItemKind = "actualite" | "bien" | "projet" | "annonce" | "agence";

type MockItem = {
  id: string;
  category: CategoryId;
  kind: ItemKind;
  profileName: string;
  image: string;
  title: string;
  city: string;
  price?: string;
  surface?: string;
  beds?: number;
  deal?: "sale" | "rent";
  blurb?: string;
  progress?: number;
  baths?: number;
  description?: string;
  highlights?: string[];
};

const KINDS: { id: DiscoverKind; label: string }[] = [
  { id: "actualite", label: "Actualité" },
  { id: "biens-projets", label: "Biens projets" },
  { id: "annonces", label: "Services" },
];

const CATEGORIES: { id: CategoryId; label: string; Icon: typeof Building2 }[] = [
  { id: "foncier", label: "Foncier & Conseil", Icon: Landmark },
  { id: "gestion", label: "Gestion Immobilière", Icon: Building2 },
  { id: "biens", label: "Biens & Projets", Icon: Home },
  { id: "construction", label: "Construction", Icon: HardHat },
  { id: "renovation", label: "Rénovation & Aménagement", Icon: Hammer },
  { id: "architecture", label: "Architecture", Icon: PenTool },
  { id: "notaires", label: "Notaires & Juridiques", Icon: FileText },
  { id: "immotech", label: "Immotech", Icon: Cpu },
  { id: "autres", label: "Autres", Icon: Ellipsis },
];

const WITH_BIENS = new Set<CategoryId>(["biens", "gestion"]);

type SearchType = "biens" | "services" | "projets" | "comptes";

const SEARCH_TYPES: { id: SearchType; label: string }[] = [
  { id: "comptes", label: "Professionnels" },
  { id: "projets", label: "Projets" },
  { id: "biens", label: "Biens" },
  { id: "services", label: "Services" },
];

const DEALS: { id: Deal; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "sale", label: "Vente" },
  { id: "rent", label: "Location" },
];

const ITEMS: MockItem[] = DISCOVER_ITEMS;

const matchesQuery = (item: MockItem, query: string) => {
  if (!query) return true;
  const hay = `${item.profileName} ${item.title} ${item.city} ${item.blurb || ""} ${item.description || ""} ${(item.highlights || []).join(" ")}`.toLowerCase();
  return hay.includes(query);
};

const detailLine = (item: MockItem) => {
  if (item.blurb) return item.blurb;
  return [item.price, item.surface, item.beds != null ? `${item.beds} ch.` : ""]
    .filter(Boolean)
    .join(" · ");
};

const projectStatus = (progress = 0) => (progress >= 100 ? "Terminé" : "En cours");

const ResultCard = ({ item, onOpen }: { item: MockItem; onOpen: (item: MockItem) => void }) => {
  const profile = (
    <span className="flex items-center gap-2.5">
      <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold text-neutral-950">{item.profileName}</span>
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

  if (item.kind === "projet") {
    const facts = [item.profileName, item.city].filter(Boolean);
    return (
      <button type="button" onClick={() => onOpen(item)} className="block w-full text-left">
        <span className="relative block">
          <img src={item.image} alt="" className="aspect-[16/10] w-full object-cover" />
          <span className="absolute right-3 top-3 rounded bg-neutral-900/75 px-2 py-1 text-xs font-semibold text-white">
            {projectStatus(item.progress)}
          </span>
        </span>
        <span className="block px-3 py-3">
          <span className="block text-[17px] font-semibold leading-tight text-neutral-950">{item.title}</span>
          <span className="mt-1 block text-sm text-neutral-600">{facts.join(" · ")}</span>
          <span className="mt-3 flex items-center justify-between text-sm">
            <span className="text-neutral-500">Avancement</span>
            <span className="font-semibold text-[#174f43]">{Math.min(100, item.progress ?? 0)} %</span>
          </span>
          <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-neutral-200">
            <span className="block h-full bg-[#174f43]" style={{ width: `${Math.min(100, item.progress ?? 0)}%` }} />
          </span>
          {item.highlights?.length ? (
            <span className="mt-2 block text-sm font-medium text-neutral-800">{item.highlights.join(" · ")}</span>
          ) : null}
        </span>
      </button>
    );
  }

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

const AccountRow = ({
  name,
  username,
  image,
  city,
  typeLabel,
  followed,
  onFollow,
  onOpen,
}: {
  name: string;
  username: string;
  image: string;
  city: string;
  typeLabel: string;
  followed: boolean;
  onFollow: () => void;
  onOpen: () => void;
}) => (
  <div className="flex items-center gap-3 border-b border-neutral-100 px-3 py-3">
    <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
      <img src={image} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold text-neutral-950">{name}</span>
        <span className="block truncate text-sm text-neutral-500">@{username}</span>
        <span className="block truncate text-xs text-neutral-400">{typeLabel} · {city}</span>
      </span>
    </button>
    <button
      type="button"
      onClick={onFollow}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
        followed ? "bg-[#174f43] text-white" : "border border-[#174f43] text-[#174f43]"
      }`}
    >
      {followed ? "Suivi" : "Suivre"}
    </button>
  </div>
);

const CardList = ({ items, onOpen }: { items: MockItem[]; onOpen: (item: MockItem) => void }) => (
  <ul className="mt-3 flex flex-col gap-3">
    {items.map((item) => (
      <li
        key={item.id}
        className="overflow-hidden rounded-xl border border-neutral-300 bg-white transition duration-150 hover:scale-[0.98] hover:border-neutral-400"
      >
        <ResultCard item={item} onOpen={onOpen} />
      </li>
    ))}
  </ul>
);

const Explore = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim().toLowerCase();
  const [draft, setDraft] = useState(params.get("q") || "");
  const [searchType, setSearchType] = useState<SearchType>("comptes");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "tout" | null>(null);
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [kind, setKind] = useState<DiscoverKind>("actualite");
  const [kindSlide, setKindSlide] = useState<"left" | "right">("right");
  const kindDrag = useRef<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [filterOpen, setFilterOpen] = useState(false);
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [deal, setDeal] = useState<Deal>("all");
  const [opened, setOpened] = useState<MockItem | null>(null);

  const kindIndex = Math.max(0, KINDS.findIndex((item) => item.id === kind));
  const moveKind = (nextIndex: number) => {
    const count = KINDS.length;
    const wrapped = (nextIndex + count) % count;
    if (wrapped === kindIndex) return;
    const forward = (wrapped - kindIndex + count) % count;
    const backward = (kindIndex - wrapped + count) % count;
    setKindSlide(forward <= backward ? "right" : "left");
    setKind(KINDS[wrapped].id);
  };

  const typedQuery = draft.trim().toLowerCase();
  const searched = useMemo(
    () =>
      ITEMS.filter((item) => {
        if (selectedCategory && selectedCategory !== "tout" && item.category !== selectedCategory) return false;
        return matchesQuery(item, typedQuery);
      }),
    [typedQuery, selectedCategory]
  );
  const searchResults = searched.filter((item) => {
    if (searchType === "biens") return item.kind === "bien";
    if (searchType === "services") return item.kind === "annonce";
    if (searchType === "projets") return item.kind === "projet";
    return false;
  });
  const accounts = useMemo(() => {
    const seen = new Map<string, MockItem>();
    searched.forEach((item) => {
      const current = seen.get(item.profileName);
      if (!current || (item.kind === "agence" && current.kind !== "agence")) seen.set(item.profileName, item);
    });
    return [...seen.values()];
  }, [searched]);
  const selectedLabel =
    selectedCategory === "tout" ? "Tout" : CATEGORIES.find((item) => item.id === selectedCategory)?.label || null;

  const categoryItems = searched.filter((item) => item.category === category);
  const biens = categoryItems.filter(
    (item) => item.kind === "bien" && (deal === "all" || item.deal === deal)
  );
  const projets = categoryItems.filter((item) => item.kind === "projet");
  const agences = categoryItems.filter((item) => item.kind === "agence");
  const categoryLabel = CATEGORIES.find((item) => item.id === category)?.label || "";

  const openCategory = (id: CategoryId) => {
    setCategory(id);
    setDeal("all");
    setFilterOpen(false);
    setOpened(null);
  };

  const openItem = (item: MockItem) => {
    window.scrollTo(0, 0);
    if (item.kind === "projet") {
      navigate(`/projet/${item.id}`);
      return;
    }
    if (item.kind === "bien") {
      navigate(`/bien/${item.id}`);
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
    navigate(`/profile/${SHOWCASE_PROFILE_USERNAME}`);
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
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Rechercher entreprises, catégories…"
            className="h-11 w-full rounded-full border border-neutral-300 bg-white pl-9 pr-3 text-sm text-neutral-900 shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-orange-400"
          />
        </div>
      </form>
      <div className="mt-3">
        <CategoryPicker
          open={false}
          onToggle={() => setCategoriesOpen(true)}
          selectedLabel={selectedLabel}
          categories={CATEGORIES}
          onSelect={() => {}}
        />
      </div>
      <div className="mt-4 flex border-b border-neutral-200">
        {SEARCH_TYPES.map((item) => {
          const active = searchType === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSearchType(item.id)}
              className={`flex-1 border-b-2 pb-2.5 text-sm font-semibold ${
                active ? "border-[#174f43] text-[#174f43]" : "border-transparent text-neutral-500"
              }`}
            >
              {item.label}
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
            selectedLabel={selectedLabel}
            categories={CATEGORIES}
            onSelect={(id) => {
              setSelectedCategory(id as CategoryId | "tout");
              setCategoriesOpen(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="mx-auto w-full max-w-2xl px-3 pt-4">
        {searchFields}
        <div className="mt-3 flex items-center justify-end gap-2 pb-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${
                viewMode === "list" ? "bg-[#174f43] text-white" : "bg-neutral-100 text-neutral-900"
              }`}
            >
              <List className="h-4 w-4" />
              Liste
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${
                viewMode === "map" ? "bg-[#174f43] text-white" : "bg-neutral-100 text-neutral-900"
              }`}
            >
              <MapIcon className="h-4 w-4" />
              Carte
            </button>
          </div>
        </div>

        {viewMode === "map" ? (
          <div className="px-3 py-4">
            <MapView />
          </div>
        ) : searchType === "comptes" ? (
          accounts.length === 0 ? (
            <p className="px-4 py-8 text-center text-muted-foreground">Aucun professionnel pour cette recherche</p>
          ) : (
            <ul>
              {accounts.map((item) => (
                  <li key={item.profileName}>
                    <AccountRow
                      name={item.profileName}
                      username={SHOWCASE_PROFILE_USERNAME}
                      image={item.image}
                      city={item.city}
                      typeLabel={CATEGORIES.find((category) => category.id === item.category)?.label || ""}
                      followed={Boolean(followed[SHOWCASE_PROFILE_USERNAME])}
                      onFollow={() => setFollowed((current) => ({ ...current, [SHOWCASE_PROFILE_USERNAME]: !current[SHOWCASE_PROFILE_USERNAME] }))}
                      onOpen={() => openItem(item)}
                    />
                  </li>
                ))}
            </ul>
          )
        ) : searchResults.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted-foreground">Aucun résultat pour cette recherche</p>
        ) : (
          <CardList items={searchResults} onOpen={openItem} />
        )}
      </div>

      {category ? (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-white pb-24">
          <div className="mx-auto w-full max-w-2xl">
            <div className="flex items-center gap-2 border-b border-neutral-200 px-2 py-3">
              <button
                type="button"
                aria-label="Retour"
                onClick={() => setCategory(null)}
                className="inline-flex h-9 w-9 items-center justify-center"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="text-lg font-semibold text-neutral-950">{categoryLabel}</h1>
            </div>

            {WITH_BIENS.has(category) ? (
              <section className="mx-3 mt-3 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200">
                <p className="px-3 py-2 text-sm font-semibold text-neutral-950">Biens</p>
                <div className="flex gap-2 px-3 pb-3">
                  {DEALS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDeal(item.id)}
                      className={`h-9 flex-1 rounded-full text-[13px] font-semibold ${
                        deal === item.id ? "bg-[#174f43] text-white" : "bg-neutral-100 text-neutral-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                {biens.length === 0 ? (
                  <p className="px-3 pb-4 text-sm text-neutral-500">Aucun bien</p>
                ) : (
                  <CardList items={biens} onOpen={openItem} />
                )}
              </section>
            ) : null}

            <section className="mx-3 mt-3 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200">
              <p className="px-3 py-2 text-sm font-semibold text-neutral-950">Projets</p>
              {projets.length === 0 ? (
                <p className="px-3 py-4 text-sm text-neutral-500">Aucun projet</p>
              ) : (
                <CardList items={projets} onOpen={openItem} />
              )}
            </section>

            {WITH_BIENS.has(category) ? (
              <section className="mx-3 mt-3 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200">
                <p className="px-3 py-2 text-sm font-semibold text-neutral-950">Agences</p>
                {agences.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-neutral-500">Aucune agence</p>
                ) : (
                  <CardList items={agences} onOpen={openItem} />
                )}
              </section>
            ) : null}
          </div>
        </div>
      ) : null}

      {opened ? (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-white pb-24">
          <div className="mx-auto w-full max-w-2xl">
            <div className="flex items-center gap-2 px-2 py-3">
              <button
                type="button"
                aria-label="Retour"
                onClick={() => setOpened(null)}
                className="inline-flex h-9 w-9 items-center justify-center"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="truncate text-lg font-semibold text-neutral-950">{opened.title}</h1>
            </div>
            <img src={opened.image} alt="" className="h-56 w-full object-cover" />
            <div className="px-4 py-4">
              <div className="flex items-center gap-2.5">
                <img src={opened.image} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="text-[15px] font-semibold text-neutral-950">{opened.profileName}</p>
                  <p className="text-xs text-neutral-500">
                    {CATEGORIES.find((item) => item.id === opened.category)?.label} · {opened.city}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xl font-semibold text-neutral-950">{opened.title}</p>
              {detailLine(opened) ? <p className="mt-1 text-base text-neutral-700">{detailLine(opened)}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  opened.surface,
                  opened.beds != null ? `${opened.beds} chambres` : "",
                  opened.baths != null ? `${opened.baths} sdb` : "",
                  opened.deal === "sale" ? "Vente" : opened.deal === "rent" ? "Location" : "",
                ]
                  .filter(Boolean)
                  .map((fact) => (
                    <span key={fact} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                      {fact}
                    </span>
                  ))}
              </div>
              {opened.kind === "projet" ? (
                <div className="mt-4">
                  <p className="mb-1 text-sm font-semibold text-neutral-700">{projectStatus(opened.progress)}</p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
                    <div className="h-full bg-[#174f43]" style={{ width: `${Math.min(100, opened.progress ?? 0)}%` }} />
                  </div>
                </div>
              ) : null}
              {opened.description ? (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">{opened.description}</p>
              ) : null}
              {opened.highlights?.length ? (
                <ul className="mt-4 list-disc space-y-2 pl-5">
                  {opened.highlights.map((item) => (
                    <li key={item} className="text-sm text-neutral-800">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Explore;
