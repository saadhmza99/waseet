import { useMemo, useState } from "react";
import { DesktopRailFrame } from "@/components/FeedDesktopRail";
import {
  Briefcase,
  ChevronRight,
  FileText,
  Handshake,
  HardHat,
  Lightbulb,
  MapPin,
  Megaphone,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Wrench,
} from "lucide-react";

type CategoryId =
  | "tous"
  | "projets"
  | "partenariats"
  | "emplois"
  | "investissement"
  | "foncier"
  | "sous-traitance"
  | "proptech"
  | "appels";

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

const CATEGORIES: { id: CategoryId; label: string; Icon: typeof LayoutGrid }[] = [
  { id: "tous", label: "Tous", Icon: LayoutGrid },
  { id: "projets", label: "Projets", Icon: HardHat },
  { id: "partenariats", label: "Partenariats", Icon: Handshake },
  { id: "emplois", label: "Emplois", Icon: Briefcase },
  { id: "investissement", label: "Investissement", Icon: TrendingUp },
  { id: "foncier", label: "Foncier", Icon: MapPin },
  { id: "appels", label: "Appels d'offres", Icon: Megaphone },
  { id: "sous-traitance", label: "Sous-traitance", Icon: Wrench },
  { id: "proptech", label: "PropTech", Icon: Lightbulb },
];

const OPPORTUNITIES: {
  id: string;
  category: Exclude<CategoryId, "tous">;
  eyebrow: string;
  title: string;
  description: string;
  city: string;
  meta: string;
  tag: string;
  tagClass: string;
  files: string;
  image: string;
}[] = [
  {
    id: "eco-quartier-agadir",
    category: "projets",
    eyebrow: "Appels à projets",
    title: "Construction d'un éco-quartier à Agadir",
    description: "Appel à projets pour la réalisation d'un quartier résidentiel durable de 150 logements.",
    city: "Agadir, Maroc",
    meta: "Clôture : 30 juin 2025",
    tag: "Résidentiel",
    tagClass: "bg-emerald-50 text-emerald-700",
    files: "+3 fichiers",
    image: photo("photo-1541888946425-d81bb19240f5"),
  },
  {
    id: "partenaires-retail",
    category: "partenariats",
    eyebrow: "Partenariats",
    title: "Recherche de partenaires – Projet retail",
    description: "Un promoteur cherche des partenaires pour développer un centre commercial à Marrakech.",
    city: "Marrakech, Maroc",
    meta: "En continu",
    tag: "Commercial",
    tagClass: "bg-sky-50 text-sky-700",
    files: "+1 document",
    image: photo("photo-1521791136064-7986c2920216"),
  },
  {
    id: "ingenieur-cdi",
    category: "emplois",
    eyebrow: "Offres professionnelles",
    title: "Ingénieur(e) structure – CDI",
    description: "Cabinet d'architecture recrute un ingénieur structure avec 2 à 5 ans d'expérience.",
    city: "Rabat, Maroc",
    meta: "Publié il y a 3 jours",
    tag: "CDI",
    tagClass: "bg-violet-50 text-violet-700",
    files: "+1 document",
    image: photo("photo-1497366216548-37526070297c"),
  },
  {
    id: "residences-taghazout",
    category: "investissement",
    eyebrow: "Investissement",
    title: "Opportunité d'investissement – Résidences touristiques",
    description: "Projet de développement de résidences haut de gamme à Taghazout avec rendement attractif.",
    city: "Taghazout, Maroc",
    meta: "En continu",
    tag: "Touristique",
    tagClass: "bg-amber-50 text-amber-700",
    files: "+2 fichiers",
    image: photo("photo-1507525428034-b723cf961d3e"),
  },
  {
    id: "terrain-tanger",
    category: "foncier",
    eyebrow: "Foncier",
    title: "Terrain à vendre – Zone industrielle",
    description: "Terrain de 5 hectares, idéal pour projet industriel ou logistique.",
    city: "Tanger, Maroc",
    meta: "Publié il y a 5 jours",
    tag: "Industriel",
    tagClass: "bg-orange-50 text-orange-700",
    files: "+1 document",
    image: photo("photo-1500382017468-9049fed747ef"),
  },
];

const Opportunities = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId>("tous");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return OPPORTUNITIES.filter((item) => {
      if (category !== "tous" && item.category !== category) return false;
      if (!needle) return true;
      return [item.title, item.description, item.city, item.eyebrow, item.tag]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [query, category]);

  return (
    <DesktopRailFrame className="min-h-screen bg-[#f6f5f3] pb-20 lg:pb-0">
      <div className="mx-auto w-full max-w-2xl px-4 pb-6 pt-1 lg:mx-0 lg:max-w-none lg:px-0 lg:pt-0">
        {/* <p className="mb-3 text-lg font-semibold leading-relaxed text-neutral-800">

          Sifarah — «Ambassade» de l’écosystème immobilier, construction & BTP  au marché et au monde. Pour construire le futur ensemble.
        </p> */}
       <br></br> <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">Sifarah Business</h1>

          <br></br>
        <div className="mt-4 flex items-center gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2.5 shadow-sm">
            <Search className="h-4 w-4 shrink-0 text-neutral-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une opportunité..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
            />
          </label>
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-label={filtersOpen ? "Masquer les filtres" : "Afficher les filtres"}
            onClick={() => setFiltersOpen((open) => !open)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-sm transition ${
              filtersOpen ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-700"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {CATEGORIES.map((item) => {
                const selected = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    className={`inline-flex w-fit flex-col items-center gap-1.5 rounded-2xl px-3.5 py-2.5 text-center text-xs font-medium leading-none transition ${
                      selected ? "bg-neutral-900 text-white shadow-sm" : "bg-[#f3f1ef] text-neutral-800"
                    }`}
                  >
                    <item.Icon className="h-5 w-5 shrink-0" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {visible.length === 0 ? (
            <p className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-neutral-500 shadow-sm">
              Aucune opportunité pour le moment.
            </p>
          ) : (
            visible.map((item) => {
              const CategoryIcon = CATEGORIES.find((entry) => entry.id === item.category)?.Icon ?? FileText;
              return (
              <article key={item.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <div className="relative w-[6.75rem] shrink-0 self-stretch overflow-hidden rounded-xl bg-neutral-200">
                  <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    <FileText className="h-3 w-3" />
                    {item.files}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col py-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex min-w-0 items-center gap-1 text-[11px] text-neutral-500">
                      <CategoryIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.eyebrow}</span>
                    </p>
                    <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" />
                  </div>
                  <h2 className="mt-1 text-sm font-semibold leading-snug text-neutral-900">{item.title}</h2>
                  <p className="mt-1 line-clamp-2 text-xs leading-snug text-neutral-500">{item.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <p className="flex min-w-0 items-center gap-2 text-[11px] text-neutral-500">
                      <span className="flex min-w-0 items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{item.city}</span>
                      </span>
                      <span className="shrink-0">{item.meta}</span>
                    </p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${item.tagClass}`}>
                      {item.tag}
                    </span>
                  </div>
                </div>
              </article>
              );
            })
          )}
        </div>
      </div>
    </DesktopRailFrame>
  );
};

export default Opportunities;
