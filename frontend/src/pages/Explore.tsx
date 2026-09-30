import { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Building2, ChevronLeft, Cpu, Ellipsis, FileText, Hammer, HardHat, Home, Landmark, List, Map as MapIcon, PenTool, Search } from "lucide-react";
import MapView from "@/components/MapView";

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
  { id: "comptes", label: "Comptes" },
  { id: "projets", label: "Projets" },
  { id: "biens", label: "Biens" },
  { id: "services", label: "Services" },
];

const DEALS: { id: Deal; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "sale", label: "Vente" },
  { id: "rent", label: "Location" },
];

const ITEMS: MockItem[] = [
  {
    id: "villa-agadir",
    category: "biens",
    kind: "bien",
    profileName: "Rahma Aamrani",
    image: "/feed-banners/villa-jardin.webp",
    title: "Villa avec jardin",
    city: "Agadir",
    price: "2 400 000 DH",
    surface: "180 m²",
    beds: 4,
    deal: "sale",
  },
  {
    id: "appart-plage",
    category: "biens",
    kind: "bien",
    profileName: "Nour Immobilier",
    image: "/feed-banners/agadir-plage.png",
    title: "Appartement vue mer",
    city: "Agadir",
    price: "890 000 DH",
    surface: "72 m²",
    beds: 2,
    deal: "sale",
  },
  {
    id: "riad-location",
    category: "biens",
    kind: "bien",
    profileName: "Rahma Aamrani",
    image: "/feed-banners/riad-patio.jpg",
    title: "Riad à louer",
    city: "Agadir",
    price: "8 000 DH / mois",
    surface: "140 m²",
    beds: 3,
    deal: "rent",
  },
  {
    id: "residence-marina",
    category: "biens",
    kind: "projet",
    profileName: "Nour Immobilier",
    image: "/feed-banners/palais-piscine.webp",
    title: "Résidence Marina",
    city: "Casablanca",
    price: "1 200 000 DH",
    surface: "95 m²",
    beds: 3,
    progress: 60,
  },
  {
    id: "agence-rahma",
    category: "gestion",
    kind: "agence",
    profileName: "Rahma Aamrani",
    image: "/feed-banners/villa-jardin.webp",
    title: "Agence Rahma Aamrani",
    city: "Agadir",
  },
  {
    id: "agence-nour",
    category: "gestion",
    kind: "agence",
    profileName: "Nour Immobilier",
    image: "/feed-banners/palais-piscine.webp",
    title: "Agence Nour Immobilier",
    city: "Casablanca",
  },
  {
    id: "reno-villa",
    category: "renovation",
    kind: "projet",
    profileName: "Atlas Rénovation",
    image: "/agadir-welcome.png",
    title: "Rénovation d'une villa",
    city: "Agadir",
    price: "180 000 DH",
    surface: "160 m²",
    progress: 100,
  },
  {
    id: "reno-appt",
    category: "renovation",
    kind: "projet",
    profileName: "Atlas Rénovation",
    image: "/welcome-morocco.jpg",
    title: "Remise à neuf d'un appartement",
    city: "Agadir",
    price: "65 000 DH",
    surface: "70 m²",
    beds: 2,
    progress: 35,
  },
  {
    id: "immeuble",
    category: "construction",
    kind: "projet",
    profileName: "Bâtiment Sud",
    image: "/feed-banners/palais-piscine.webp",
    title: "Immeuble de bureaux",
    city: "Agadir",
    price: "4 500 000 DH",
    surface: "900 m²",
    progress: 80,
  },
  {
    id: "cuisine",
    category: "renovation",
    kind: "projet",
    profileName: "Atelier Bois",
    image: "/welcome-morocco.jpg",
    title: "Cuisine sur mesure",
    city: "Agadir",
    price: "42 000 DH",
    surface: "18 m²",
    progress: 100,
  },
  {
    id: "elec",
    category: "autres",
    kind: "projet",
    profileName: "Lumière Elec",
    image: "/feed-banners/agadir-plage.png",
    title: "Installation électrique",
    city: "Marrakech",
    price: "28 000 DH",
    surface: "110 m²",
    progress: 20,
  },
  {
    id: "agent-villa",
    category: "biens",
    kind: "bien",
    profileName: "Sara Bennani",
    image: "/feed-banners/villa-jardin.webp",
    title: "Villa palmeraie",
    city: "Marrakech",
    price: "3 100 000 DH",
    surface: "220 m²",
    beds: 5,
    deal: "sale",
  },
  {
    id: "agent-projet",
    category: "biens",
    kind: "projet",
    profileName: "Sara Bennani",
    image: "/feed-banners/riad-patio.jpg",
    title: "Résidence Palmeraie",
    city: "Marrakech",
    price: "1 450 000 DH",
    surface: "88 m²",
    beds: 2,
    progress: 40,
  },
  {
    id: "agent-agence",
    category: "gestion",
    kind: "agence",
    profileName: "Sara Bennani",
    image: "/feed-banners/palais-piscine.webp",
    title: "Cabinet Bennani",
    city: "Marrakech",
  },
  {
    id: "avocat-dossier",
    category: "notaires",
    kind: "projet",
    profileName: "Maître El Fassi",
    image: "/welcome-morocco.jpg",
    title: "Contentieux immobilier",
    city: "Casablanca",
    price: "Sur devis",
    progress: 70,
  },
  {
    id: "notaire-acte",
    category: "notaires",
    kind: "projet",
    profileName: "Étude Benkirane",
    image: "/agadir-welcome.png",
    title: "Acte de vente",
    city: "Rabat",
    price: "Sur devis",
    progress: 100,
  },
  {
    id: "tech-app",
    category: "immotech",
    kind: "projet",
    profileName: "Lina Digital",
    image: "/feed-banners/agadir-plage.png",
    title: "Plateforme de gestion",
    city: "Casablanca",
    price: "Sur devis",
    progress: 55,
  },
  {
    id: "actu-rahma",
    category: "biens",
    kind: "actualite",
    profileName: "Rahma Aamrani",
    image: "/feed-banners/riad-patio.jpg",
    title: "Visite de la villa jardin",
    city: "Agadir",
    blurb: "Nouvelle visite ouverte ce weekend à Agadir.",
  },
  {
    id: "actu-atlas",
    category: "renovation",
    kind: "actualite",
    profileName: "Atlas Rénovation",
    image: "/agadir-welcome.png",
    title: "Chantier en cours",
    city: "Agadir",
    blurb: "Fin des travaux de la villa prévue le mois prochain.",
  },
  {
    id: "annonce-reno",
    category: "renovation",
    kind: "annonce",
    profileName: "realestate",
    image: "/welcome-morocco.jpg",
    title: "Rénovateur",
    city: "Agadir",
    price: "Prix sur demande",
  },
  {
    id: "annonce-bois",
    category: "autres",
    kind: "annonce",
    profileName: "Atelier Bois",
    image: "/feed-banners/riad-patio.jpg",
    title: "Menuiserie sur mesure",
    city: "Agadir",
    price: "À partir de 3 000 DH",
  },
  {
    id: "foncier-conseil",
    category: "foncier",
    kind: "projet",
    profileName: "Cabinet Idrissi",
    image: "/welcome-morocco.jpg",
    title: "Conseil en foncier",
    city: "Casablanca",
    price: "Sur devis",
    progress: 45,
  },
  {
    id: "archi-villa",
    category: "architecture",
    kind: "projet",
    profileName: "Atelier Ligne",
    image: "/feed-banners/villa-jardin.webp",
    title: "Villa contemporaine",
    city: "Rabat",
    price: "Sur devis",
    surface: "240 m²",
    progress: 30,
  },
];

const matchesQuery = (item: MockItem, query: string) => {
  if (!query) return true;
  const hay = `${item.profileName} ${item.title} ${item.city} ${item.blurb || ""}`.toLowerCase();
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
        {item.kind === "projet" ? (
          <span className="absolute right-2 top-2 rounded bg-neutral-500 px-2 py-1 text-xs font-semibold text-white">
            {projectStatus(item.progress)}
          </span>
        ) : null}
      </span>
      {item.kind === "projet" ? (
        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-neutral-200">
          <span className="block h-full bg-[#174f43]" style={{ width: `${Math.min(100, item.progress ?? 0)}%` }} />
        </span>
      ) : null}
      {copy}
    </button>
  );
};

const AccountRow = ({
  name,
  username,
  image,
  city,
  followed,
  onFollow,
}: {
  name: string;
  username: string;
  image: string;
  city: string;
  followed: boolean;
  onFollow: () => void;
}) => (
  <div className="flex items-center gap-3 border-b border-neutral-100 px-3 py-3">
    <img src={image} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
    <div className="min-w-0 flex-1">
      <p className="truncate text-[15px] font-semibold text-neutral-950">{name}</p>
      <p className="truncate text-sm text-neutral-500">@{username}</p>
      <p className="truncate text-xs text-neutral-400">{city}</p>
    </div>
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
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
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
        if (selectedCategory && item.category !== selectedCategory) return false;
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
      if (!seen.has(item.profileName)) seen.set(item.profileName, item);
    });
    return [...seen.values()];
  }, [searched]);
  const selectedLabel = CATEGORIES.find((item) => item.id === selectedCategory)?.label;

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
      <button
        type="button"
        onClick={() => setCategoriesOpen((open) => !open)}
        className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-900 shadow-sm transition duration-150 hover:scale-[0.97] hover:border-[#174f43] hover:text-[#174f43]"
      >
        {selectedLabel ? `Catégorie : ${selectedLabel}` : "Parcourir les catégories"}
      </button>
      {categoriesOpen ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedCategory(item.id);
                setCategoriesOpen(false);
              }}
              className="flex h-16 items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-900 shadow-sm transition duration-150 hover:scale-[0.97] hover:border-[#174f43] hover:text-[#174f43]"
            >
              <item.Icon className="h-5 w-5 shrink-0" />
              <span className="text-left leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
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
            <p className="px-4 py-8 text-center text-muted-foreground">Aucun compte pour cette recherche</p>
          ) : (
            <ul>
              {accounts.map((item) => {
                const username = item.profileName.toLowerCase().replace(/\s+/g, "");
                return (
                  <li key={item.profileName}>
                    <AccountRow
                      name={item.profileName}
                      username={username}
                      image={item.image}
                      city={item.city}
                      followed={Boolean(followed[username])}
                      onFollow={() => setFollowed((current) => ({ ...current, [username]: !current[username] }))}
                    />
                  </li>
                );
              })}
            </ul>
          )
        ) : searchResults.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted-foreground">Aucun résultat pour cette recherche</p>
        ) : (
          <CardList items={searchResults} onOpen={setOpened} />
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
                  <CardList items={biens} onOpen={setOpened} />
                )}
              </section>
            ) : null}

            <section className="mx-3 mt-3 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200">
              <p className="px-3 py-2 text-sm font-semibold text-neutral-950">Projets</p>
              {projets.length === 0 ? (
                <p className="px-3 py-4 text-sm text-neutral-500">Aucun projet</p>
              ) : (
                <CardList items={projets} onOpen={setOpened} />
              )}
            </section>

            {WITH_BIENS.has(category) ? (
              <section className="mx-3 mt-3 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200">
                <p className="px-3 py-2 text-sm font-semibold text-neutral-950">Agences</p>
                {agences.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-neutral-500">Aucune agence</p>
                ) : (
                  <CardList items={agences} onOpen={setOpened} />
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
            <img src={opened.image} alt="" className="h-52 w-full object-cover" />
            <div className="px-4 py-4">
              <div className="flex items-center gap-2.5">
                <img src={opened.image} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="text-[15px] font-semibold text-neutral-950">{opened.profileName}</p>
                  <p className="text-xs text-neutral-500">{opened.city}</p>
                </div>
              </div>
              <p className="mt-4 text-xl font-semibold text-neutral-950">{opened.title}</p>
              {detailLine(opened) ? <p className="mt-1 text-base text-neutral-700">{detailLine(opened)}</p> : null}
              {opened.kind === "projet" ? (
                <div className="mt-4">
                  <p className="mb-1 text-sm font-semibold text-neutral-700">{projectStatus(opened.progress)}</p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
                    <div className="h-full bg-[#174f43]" style={{ width: `${Math.min(100, opened.progress ?? 0)}%` }} />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Explore;
