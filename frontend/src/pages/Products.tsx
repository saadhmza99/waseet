import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AirVent,
  Bath,
  Boxes,
  BrickWall,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Fence,
  Hammer,
  HardHat,
  Layers,
  Lightbulb,
  MapPin,
  MessageCircle,
  MessageSquare,
  Mountain,
  Package,
  Paintbrush,
  PanelsTopLeft,
  Phone,
  Pipette,
  Plus,
  RotateCcw,
  Search,
  Shield,
  ShowerHead,
  SquareStack,
  TreePine,
  Waves,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { CategoryPicker, type CategoryOption } from "@/components/CategoryPicker";
import { DesktopRailFrame } from "@/components/FeedDesktopRail";
import InquiryDialog from "@/components/InquiryDialog";
import { ProductCard } from "@/components/product/ProductCard";
import { devisPath } from "@/services/devisService";
import { useMyCreateCapabilities } from "@/hooks/useMyCreateCapabilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import {
  PRODUCT_PARENT_OPTIONS,
  PRODUCT_TAXONOMY,
  productMatchesTaxonomy,
  productParentLabel,
  productSubOptions,
} from "@/lib/productTaxonomy";
import {
  productCategoryLabel,
  productFirmName,
  productService,
  type ProductProfile,
  type ProductRow,
} from "@/services/productService";
import { getDefaultAvatar } from "@/lib/avatar";

/* ------------------------------------------------------------------ */
/* Sifarah Matériaux — CategoryPicker (feed style) + left subfilters   */
/* ------------------------------------------------------------------ */

type Mode = "fournisseurs" | "produits";

type SupplierRow = ProductProfile & {
  productCount: number;
  categoryEns: string[];
  deliveryCities: string[];
};

const PAGE_SIZE = 12;

const PRODUCT_CATEGORY_ICONS: Record<string, LucideIcon> = {
  "materiaux-construction": BrickWall,
  "materiel-electrique": Zap,
  "salle-de-bain-sanitaire": Bath,
  "pierre-naturelle": Mountain,
  peinture: Paintbrush,
  epi: HardHat,
  piscine: Waves,
  "revetement-mural": PanelsTopLeft,
  "materiel-chantier": Hammer,
  "revetement-sol": Layers,
  carrelage: SquareStack,
  "amenagement-exterieur": TreePine,
  menuiserie: Fence,
  quincaillerie: Wrench,
  aluminium: Boxes,
  "systeme-surveillance": Shield,
  "batiment-modulaire": Building2,
  "climatisation-chauffage": AirVent,
  cuisine: Package,
  automatisme: Lightbulb,
  "ferronnerie-metallurgie": Fence,
  isolation: Layers,
  plomberie: Pipette,
  vitrerie: PanelsTopLeft,
  platre: ShowerHead,
};

export const PRODUCT_PICKER_CATEGORIES: CategoryOption[] = PRODUCT_TAXONOMY.map((cat) => ({
  id: cat.id,
  label: cat.fr,
  Icon: PRODUCT_CATEGORY_ICONS[cat.id] || Package,
}));

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const toggleIn = (list: string[], value: string) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const toWhatsAppNumber = (phone: string) => {
  const digits = digitsOnly(phone);
  if (digits.startsWith("0")) return `212${digits.slice(1)}`;
  return digits;
};

const profileOf = (row: ProductRow): ProductProfile | null => {
  const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return p || null;
};

const SupplierCallMenu = ({
  phone,
  className = "",
}: {
  phone?: string | null;
  className?: string;
}) => {
  const hasPhone = Boolean(phone && digitsOnly(phone).length >= 6);

  const unavailable = (kind: string) => {
    toast({
      title: "Unavailable",
      description: kind === "whatsapp" ? "This profile has no WhatsApp number." : "This profile has no phone number.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 sm:text-base ${className}`}
        >
          <Phone className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
          Appeler
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            if (!phone || !hasPhone) {
              unavailable("whatsapp");
              return;
            }
            window.open(`https://wa.me/${toWhatsAppNumber(phone)}`, "_blank", "noopener,noreferrer");
          }}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            if (!phone || !hasPhone) {
              unavailable("sms");
              return;
            }
            window.location.href = `sms:${digitsOnly(phone)}`;
          }}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          SMS
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            if (!phone || !hasPhone) {
              unavailable("call");
              return;
            }
            window.location.href = `tel:${digitsOnly(phone)}`;
          }}
        >
          <Phone className="mr-2 h-4 w-4" />
          Phone call
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FilterSection = ({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-200 py-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left text-base font-semibold text-neutral-900"
      >
        {title}
        <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </div>
  );
};

const CheckList = ({
  options,
  selected,
  onToggle,
  searchable = false,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  searchable?: boolean;
}) => {
  const [term, setTerm] = useState("");
  const visible = searchable
    ? options.filter((option) => normalize(option.label).includes(normalize(term)))
    : options;
  return (
    <div>
      {searchable ? (
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Rechercher..."
          className="mb-2 h-11 w-full rounded-lg border border-neutral-200 px-3 text-base outline-none focus:border-[#174f43]"
        />
      ) : null}
      <ul className="max-h-72 space-y-1 overflow-y-auto pr-1">
        {visible.map((option) => {
          const active = selected.includes(option.value);
          return (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => onToggle(option.value)}
                className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-2.5 text-left text-base text-neutral-700 hover:bg-neutral-50"
              >
                <span
                  className={`flex shrink-0 items-center justify-center rounded border ${
                    active ? "border-[#174f43] bg-[#174f43] text-white" : "border-neutral-300 bg-white"
                  }`}
                  style={{ height: 20, width: 20 }}
                >
                  {active ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                </span>
                <span className={active ? "font-semibold text-neutral-900" : ""}>{option.label}</span>
              </button>
            </li>
          );
        })}
        {visible.length === 0 ? <li className="px-1.5 py-1 text-base text-neutral-400">Aucun résultat</li> : null}
      </ul>
    </div>
  );
};

const Products = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { sections: mySections } = useMyCreateCapabilities();
  const [mode, setMode] = useState<Mode>(params.get("type") === "produits" ? "produits" : "fournisseurs");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subKeys, setSubKeys] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [deliveryCities, setDeliveryCities] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryTarget, setInquiryTarget] = useState<{ id: string; name: string } | null>(null);

  const openInquiry = (pro: SupplierRow) => {
    setInquiryTarget({ id: pro.id, name: pro.full_name || pro.username || "Fournisseur" });
    setInquiryOpen(true);
  };

  const openDevis = (pro: SupplierRow) => {
    navigate(
      devisPath({
        sellerId: pro.id,
        sellerName: pro.full_name || pro.username || "Fournisseur",
        projectType: "achat-materiaux",
      }),
    );
  };

  useEffect(() => {
    let cancelled = false;
    productService
      .listProducts(1000, 0)
      .then((rows) => {
        if (cancelled) return;
        setProducts(rows);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading products:", error);
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [mode, query, selectedCategory, subKeys, cities, deliveryCities]);

  useEffect(() => {
    setSubKeys([]);
  }, [selectedCategory]);

  const parentIds = useMemo(() => (selectedCategory ? [selectedCategory] : []), [selectedCategory]);

  const subFilterOptions = useMemo(() => {
    if (!selectedCategory) return [];
    return productSubOptions([selectedCategory]).map((row) => ({
      value: `${row.parentId}::${row.en}`,
      label: row.fr,
    }));
  }, [selectedCategory]);

  const suppliers = useMemo(() => {
    const map = new Map<string, SupplierRow>();
    for (const row of products) {
      const profile = profileOf(row);
      if (!profile?.id) continue;
      const en = (row.category || "").trim();
      const existing = map.get(profile.id);
      if (!existing) {
        map.set(profile.id, {
          ...profile,
          productCount: 1,
          categoryEns: en ? [en] : [],
          deliveryCities: [...(row.delivery_cities || []).filter(Boolean)],
        });
        continue;
      }
      existing.productCount += 1;
      if (en && !existing.categoryEns.includes(en)) existing.categoryEns.push(en);
      for (const city of row.delivery_cities || []) {
        if (city && !existing.deliveryCities.includes(city)) existing.deliveryCities.push(city);
      }
    }
    return [...map.values()].sort((a, b) =>
      (a.full_name || a.username || "").localeCompare(b.full_name || b.username || "", "fr"),
    );
  }, [products]);

  const cityOptions = useMemo(
    () =>
      [...new Set(suppliers.map((s) => (s.location || "").trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "fr"))
        .map((value) => ({ value, label: value })),
    [suppliers],
  );

  const deliveryOptions = useMemo(
    () =>
      [
        ...new Set(
          products.flatMap((row) => row.delivery_cities || []).filter(Boolean) as string[],
        ),
      ]
        .sort((a, b) => a.localeCompare(b, "fr"))
        .map((value) => ({ value, label: value })),
    [products],
  );

  const needle = normalize(query.trim());
  const pickerLabel = selectedCategory
    ? PRODUCT_PARENT_OPTIONS.find((item) => item.id === selectedCategory)?.label || null
    : null;

  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter((pro) => {
        if (needle) {
          const hay = normalize(
            [
              pro.full_name,
              pro.username,
              pro.profession,
              pro.location,
              ...pro.categoryEns.map((en) => productCategoryLabel({ category: en } as ProductRow)),
              ...pro.categoryEns.map((en) => productParentLabel(en)),
            ]
              .filter(Boolean)
              .join(" "),
          );
          if (!hay.includes(needle)) return false;
        }
        if (parentIds.length || subKeys.length) {
          const ok = pro.categoryEns.some((en) => productMatchesTaxonomy(en, parentIds, subKeys));
          if (!ok) {
            const prof = normalize(pro.profession || "");
            const parentHit =
              !subKeys.length &&
              parentIds.some((id) => {
                const label = PRODUCT_PARENT_OPTIONS.find((p) => p.id === id)?.label || "";
                return label && prof.includes(normalize(label));
              });
            if (!parentHit) return false;
          }
        }
        if (cities.length && !cities.includes((pro.location || "").trim())) return false;
        if (deliveryCities.length) {
          const zones =
            pro.deliveryCities.length > 0 ? pro.deliveryCities : [(pro.location || "").trim()];
          if (!deliveryCities.some((city) => zones.includes(city))) return false;
        }
        return true;
      }),
    [suppliers, needle, parentIds, subKeys, cities, deliveryCities],
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((row) => {
        if (needle) {
          const hay = normalize(
            [
              row.title,
              row.brand,
              row.category,
              productCategoryLabel(row),
              productParentLabel(row.category),
              productFirmName(row),
              ...(row.delivery_cities || []),
            ]
              .filter(Boolean)
              .join(" "),
          );
          if (!hay.includes(needle)) return false;
        }
        if ((parentIds.length || subKeys.length) && !productMatchesTaxonomy(row.category, parentIds, subKeys))
          return false;
        if (cities.length) {
          const profile = profileOf(row);
          if (!cities.includes((profile?.location || "").trim())) return false;
        }
        if (deliveryCities.length && !deliveryCities.some((city) => (row.delivery_cities || []).includes(city)))
          return false;
        return true;
      }),
    [products, needle, parentIds, subKeys, cities, deliveryCities],
  );

  const results = mode === "fournisseurs" ? filteredSuppliers : filteredProducts;
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageSuppliers =
    mode === "fournisseurs"
      ? filteredSuppliers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
      : [];
  const pageProducts =
    mode === "produits"
      ? filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
      : [];

  const clearFilters = () => {
    setSelectedCategory(null);
    setSubKeys([]);
    setCities([]);
    setDeliveryCities([]);
    setQuery("");
  };
  const activeFilterCount =
    (selectedCategory ? 1 : 0) + subKeys.length + cities.length + deliveryCities.length;

  const leftFilters = (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-neutral-900">Filtres</h2>
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center gap-1 text-base font-semibold text-[#174f43] hover:underline"
        >
          <RotateCcw className="h-5 w-5" />
          Effacer
        </button>
      </div>

      <FilterSection title="Sous-catégorie" defaultOpen>
        <CheckList
          searchable
          options={subFilterOptions}
          selected={subKeys}
          onToggle={(value) => setSubKeys((current) => toggleIn(current, value))}
        />
      </FilterSection>

      <FilterSection title="Ville">
        <CheckList
          options={cityOptions}
          selected={cities}
          onToggle={(value) => setCities((current) => toggleIn(current, value))}
        />
      </FilterSection>
      <FilterSection title="Ville de livraison">
        <CheckList
          options={deliveryOptions}
          selected={deliveryCities}
          onToggle={(value) => setDeliveryCities((current) => toggleIn(current, value))}
        />
      </FilterSection>
    </div>
  );

  // Full remaining width beside the desktop rail (Produits BTP → Matériaux).
  const railContentClass = "mx-auto w-full max-w-none px-4 lg:px-6 lg:pr-8";

  if (categoriesOpen) {
    return (
      <DesktopRailFrame
        className="min-h-screen bg-white pb-20 lg:pb-0"
        contentClassName={railContentClass}
      >
        <div className="mx-auto w-full pt-4 lg:pt-0">
          <CategoryPicker
            open
            columns={3}
            size="lg"
            onToggle={() => setCategoriesOpen(false)}
            selectedLabel={pickerLabel}
            categories={PRODUCT_PICKER_CATEGORIES}
            onSelect={(id) => {
              setSelectedCategory(id === "tout" ? null : id);
              setSubKeys([]);
              setCategoriesOpen(false);
            }}
          />
        </div>
      </DesktopRailFrame>
    );
  }

  return (
    <DesktopRailFrame className="min-h-screen bg-[#f6f5f3] pb-20 lg:pb-0" contentClassName={railContentClass}>
      <div className="mx-auto w-full pb-6 pt-4 lg:pt-0">
        <h1 className="text-5xl font-semibold tracking-tight text-neutral-900">Sifarah Matériaux</h1>
        <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-neutral-600">
          {mode === "fournisseurs"
            ? "Comparez les fournisseurs de matériaux de construction disponibles au Maroc, consultez leurs profils et demandez un devis."
            : "Parcourez les produits et matériaux proposés par les professionnels, comparez et contactez le fournisseur."}
        </p>

        <div className="mt-6 flex items-start gap-5">
          {selectedCategory ? (
            <aside className="sticky top-4 hidden w-80 shrink-0 rounded-xl border border-neutral-200 bg-white px-5 py-3 lg:block">
              {leftFilters}
            </aside>
          ) : null}

          <div className="min-w-0 flex-1">
            <div className="mb-5 grid h-14 grid-cols-1 items-center gap-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,25rem)_minmax(0,1fr)] sm:gap-3">
              <div className="flex h-14 min-w-0 justify-start">
                <div className="flex h-14 shrink-0 items-stretch gap-0.5 rounded-2xl border border-neutral-200 bg-white p-1">
                  {(
                    [
                      { id: "fournisseurs", label: "Fournisseurs", Icon: Building2 },
                      { id: "produits", label: "Produits", Icon: Package },
                    ] as const
                  ).map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMode(id)}
                      className={`inline-flex h-full items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition sm:gap-2 sm:px-4 sm:text-base ${
                        mode === id ? "bg-[#174f43] text-white" : "text-neutral-700 hover:text-[#174f43]"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                      <span className="whitespace-nowrap">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-14 min-w-0 w-full">
                <CategoryPicker
                  open={false}
                  columns={3}
                  size="lg"
                  onToggle={() => setCategoriesOpen(true)}
                  selectedLabel={pickerLabel}
                  categories={PRODUCT_PICKER_CATEGORIES}
                  onSelect={() => {}}
                />
              </div>

              <div className="flex h-14 min-w-0 w-full items-center gap-2.5">
                <div className="relative h-14 min-w-0 flex-1">
                  <Search className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={mode === "fournisseurs" ? "Rechercher…" : "Rechercher…"}
                    aria-label={mode === "fournisseurs" ? "Rechercher un fournisseur" : "Rechercher un produit"}
                    className="h-14 w-full rounded-2xl border border-neutral-200 bg-white pl-4 pr-11 text-base outline-none focus:border-[#174f43]"
                  />
                </div>
                {selectedCategory ? (
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((open) => !open)}
                    className="inline-flex h-14 shrink-0 items-center gap-1.5 rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-800 sm:text-base lg:hidden"
                  >
                    Filtres
                    {activeFilterCount ? (
                      <span className="rounded-full bg-[#174f43] px-2 text-sm text-white">{activeFilterCount}</span>
                    ) : null}
                  </button>
                ) : null}
              </div>
            </div>

            {selectedCategory && filtersOpen ? (
              <div className="mb-4 rounded-xl border border-neutral-200 bg-white px-4 py-2 lg:hidden">{leftFilters}</div>
            ) : null}

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  {mode === "fournisseurs" ? "Fournisseurs de matériaux" : "Produits & matériaux"}
                </h2>
                <p className="mt-1 text-base text-neutral-500">
                  {loading ? "Chargement…" : `${results.length} résultats trouvés`}
                </p>
              </div>
              {mode === "produits" && mySections.showProduits ? (
                <button
                  type="button"
                  onClick={() => navigate("/produit/nouveau")}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#174f43] px-4 text-sm font-semibold text-white hover:bg-[#123d34]"
                >
                  <Plus className="h-4 w-4" />
                  Créer un produit
                </button>
              ) : null}
            </div>

            {loading ? (
              <p className="py-10 text-center text-base text-neutral-500">Chargement…</p>
            ) : results.length === 0 ? (
              <p className="py-10 text-center text-base text-neutral-500">
                Aucun résultat pour cette recherche.{" "}
                <button type="button" onClick={clearFilters} className="font-semibold text-[#174f43] hover:underline">
                  Effacer les filtres
                </button>
              </p>
            ) : mode === "fournisseurs" ? (
              <ul
                className={`mt-5 grid gap-3 sm:gap-4 ${
                  selectedCategory
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                    : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5"
                }`}
              >
                {pageSuppliers.map((pro) => {
                  const username = pro.username || pro.id;
                  const isFollowed = Boolean(followed[username]);
                  const profession =
                    pro.profession ||
                    (pro.categoryEns[0] ? productParentLabel(pro.categoryEns[0]) : "") ||
                    (pro.categoryEns[0]
                      ? productCategoryLabel({ category: pro.categoryEns[0] } as ProductRow)
                      : "");
                  return (
                    <li
                      key={pro.id}
                      className="flex min-w-0 flex-col rounded-xl border border-neutral-200 bg-white p-3.5 shadow-sm transition hover:border-neutral-300 sm:p-5"
                    >
                      <div className="flex min-w-0 items-start gap-2.5 sm:gap-3.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/profile/${username}`)}
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left sm:gap-3.5"
                        >
                          <img
                            src={pro.avatar_url || getDefaultAvatar("enterprise")}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-2xl object-cover sm:h-14 sm:w-14"
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-base font-semibold text-neutral-950 sm:text-lg">
                              {pro.full_name || "Professionnel"}
                            </span>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFollowed((current) => ({ ...current, [username]: !current[username] }))
                          }
                          className={`shrink-0 rounded-full px-2.5 py-1.5 text-xs font-semibold transition sm:px-3.5 sm:py-2 sm:text-sm ${
                            isFollowed
                              ? "bg-[#174f43] text-white"
                              : "border border-[#174f43] text-[#174f43] hover:bg-[#174f43]/5"
                          }`}
                        >
                          {isFollowed ? "Suivi" : "Suivre"}
                        </button>
                      </div>
                      <p className="mt-3 flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-neutral-500 sm:mt-3.5 sm:gap-2 sm:text-sm">
                        {profession ? (
                          <span className="max-w-full truncate rounded-full bg-[#174f43]/10 px-2 py-0.5 font-semibold text-[#174f43] sm:px-2.5 sm:py-1">
                            {profession}
                          </span>
                        ) : null}
                        {pro.location ? (
                          <span className="inline-flex min-w-0 max-w-full items-center gap-1 truncate">
                            <MapPin className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                            <span className="truncate">{pro.location}</span>
                          </span>
                        ) : null}
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-medium text-neutral-600 sm:px-2.5 sm:py-1">
                          {pro.productCount} produit{pro.productCount > 1 ? "s" : ""}
                        </span>
                      </p>
                      <div className="mt-4 grid grid-cols-1 gap-2 sm:mt-5 sm:gap-2.5">
                        <button
                          type="button"
                          onClick={() => openDevis(pro)}
                          className="w-full rounded-full bg-[#174f43] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123d34] sm:text-base"
                        >
                          Demander devis
                        </button>
                        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                          <button
                            type="button"
                            onClick={() => openInquiry(pro)}
                            className="w-full rounded-full border border-[#174f43] px-3 py-2.5 text-sm font-semibold text-[#174f43] transition hover:bg-[#174f43]/5 sm:text-base"
                          >
                            Contacter
                          </button>
                          <SupplierCallMenu phone={pro.phone} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul
                className={`mt-5 grid gap-3 sm:gap-4 ${
                  selectedCategory
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                    : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5"
                }`}
              >
                {pageProducts.map((row) => (
                  <li key={row.id} className="min-w-0">
                    <ProductCard row={row} />
                  </li>
                ))}
              </ul>
            )}

            {!loading && results.length > PAGE_SIZE ? (
              <nav className="mt-7 flex items-center justify-center gap-2" aria-label="Pagination">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 disabled:opacity-40"
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === pageCount || Math.abs(n - safePage) <= 1)
                  .reduce<(number | "…")[]>((acc, n, i, arr) => {
                    if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("…");
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === "…" ? (
                      <span key={`gap-${i}`} className="px-1 text-neutral-400">
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        className={`h-10 min-w-10 rounded-full px-2.5 text-base font-semibold ${
                          n === safePage
                            ? "bg-[#174f43] text-white"
                            : "border border-neutral-200 bg-white text-neutral-700 hover:border-[#174f43]"
                        }`}
                      >
                        {n}
                      </button>
                    ),
                  )}
                <button
                  type="button"
                  disabled={safePage >= pageCount}
                  onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 disabled:opacity-40"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            ) : null}
          </div>
        </div>
      </div>
      <InquiryDialog
        open={inquiryOpen}
        onOpenChange={(open) => {
          setInquiryOpen(open);
          if (!open) setInquiryTarget(null);
        }}
        type="service"
        sellerId={inquiryTarget?.id}
        sellerName={inquiryTarget?.name}
      />
    </DesktopRailFrame>
  );
};

export default Products;
