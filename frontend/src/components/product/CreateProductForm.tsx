import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, Package, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { productPhotos, productService, productTechnicalSpecs } from "@/services/productService";
import { partitionByUploadLimit, storageService, uploadMaxLabel } from "@/services/storageService";
import { allMoroccoCities } from "@/lib/moroccoPlaces";
import {
  PRODUCT_PARENT_OPTIONS,
  PRODUCT_TAXONOMY,
  productCategoryById,
  productCategoryFr,
  productCategorySelection,
  productFamilyCategoryValue,
} from "@/lib/productTaxonomy";

const fieldClass =
  "h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-[#174f43]";

/** Nationwide delivery — exclusive of specific cities. */
const DELIVERY_ALL = "Tous";

const Label = ({ children, optional }: { children: string; optional?: boolean }) => (
  <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-neutral-900">
    {children}
    {optional ? <span className="font-normal text-neutral-400">Optionnel</span> : null}
  </span>
);

const CreateProductForm = () => {
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const editing = Boolean(productId);
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(editing);
  const [forbidden, setForbidden] = useState(false);
  const [keptAttributes, setKeptAttributes] = useState<Record<string, unknown>>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [categoryEn, setCategoryEn] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("MAD");
  const [unit, setUnit] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [deliveryCities, setDeliveryCities] = useState<string[]>([]);
  const [cityQuery, setCityQuery] = useState("");
  const [specs, setSpecs] = useState("");
  const hydratedId = useRef<string | null>(null);
  const userId = user?.id;

  const subOptions = useMemo(() => {
    const parent = productCategoryById(parentId);
    return parent?.subs || [];
  }, [parentId]);

  useEffect(() => {
    if (!editing || !productId || !userId) return;
    if (hydratedId.current === productId) return;
    let cancelled = false;
    setLoadingProduct(true);
    productService
      .getProduct(productId)
      .then((row) => {
        if (cancelled) return;
        if (!row || row.user_id !== userId) {
          setForbidden(true);
          return;
        }
        const selection = productCategorySelection(row.category);
        const attrs = row.attributes && typeof row.attributes === "object" ? row.attributes : {};
        setKeptAttributes(attrs);
        setTitle(row.title || "");
        setDescription(row.description || "");
        setParentId(selection.parentId);
        setCategoryEn(selection.en);
        setBrand(row.brand || "");
        setSku(row.sku || "");
        setPrice(row.price != null && Number(row.price) > 0 ? String(row.price) : "");
        setCurrency(row.currency || "MAD");
        setUnit(row.unit || "");
        setMinQuantity(row.min_quantity || "");
        setPhotos(productPhotos(row));
        setDeliveryCities(Array.isArray(row.delivery_cities) ? row.delivery_cities.filter(Boolean) : []);
        setSpecs(productTechnicalSpecs(row));
        hydratedId.current = productId;
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setForbidden(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingProduct(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editing, productId, userId]);

  const citySuggestions = useMemo(() => {
    const needle = cityQuery.trim().toLowerCase();
    return allMoroccoCities()
      .filter((city) => !deliveryCities.includes(city) && (!needle || city.toLowerCase().includes(needle)))
      .slice(0, 10);
  }, [cityQuery, deliveryCities]);

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    const images = [...files].filter((file) => file.type.startsWith("image/"));
    const { accepted, rejected } = partitionByUploadLimit(images);
    if (rejected.length || images.length !== files.length) {
      toast({ title: "Image", description: `Chaque image doit faire ${uploadMaxLabel} maximum.` });
    }
    if (!accepted.length) return;
    try {
      const urls = await storageService.uploadImages(accepted, "products");
      setPhotos((prev) => [...prev, ...urls].slice(0, 12));
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible d'envoyer les images." });
    }
  };

  const canSubmit = Boolean(user && title.trim() && categoryEn.trim());

  const handleSubmit = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!title.trim()) {
      toast({ title: "Titre requis", description: "Donnez un nom à votre produit." });
      return;
    }
    if (!categoryEn.trim()) {
      toast({ title: "Catégorie requise", description: "Choisissez une sous-catégorie produit." });
      return;
    }
    setSaving(true);
    try {
      const priceNum = price.trim() ? Number(String(price).replace(/\s/g, "").replace(",", ".")) : null;
      const nextAttributes: Record<string, unknown> = {
        ...keptAttributes,
        category_fr: productCategoryFr(categoryEn) || categoryEn,
      };
      if (specs.trim()) {
        nextAttributes.technical_specifications_detailed = specs.trim();
        nextAttributes.technical_specifications = specs.trim();
      } else {
        delete nextAttributes.technical_specifications_detailed;
        delete nextAttributes.technical_specifications;
      }
      const input = {
        title: title.trim(),
        description: description.trim() || null,
        category: categoryEn.trim(),
        brand: brand.trim() || null,
        sku: sku.trim() || null,
        price: priceNum != null && Number.isFinite(priceNum) ? priceNum : null,
        currency: currency.trim() || "MAD",
        unit: unit.trim() || null,
        min_quantity: minQuantity.trim() || null,
        cover: photos[0] || null,
        gallery: photos,
        delivery_cities: deliveryCities,
        attributes: nextAttributes,
      };
      const row = editing && productId
        ? await productService.updateProduct(productId, user.id, input)
        : await productService.createProduct(user.id, input);
      toast({
        title: editing ? "Produit mis à jour" : "Produit publié",
        description: editing ? "Les modifications sont en ligne." : "Votre produit est en ligne.",
      });
      navigate(`/produits/${row.id}`);
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: editing ? "Impossible de modifier ce produit." : "Impossible de publier ce produit." });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">Connectez-vous pour publier un produit.</p>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-4 rounded-lg bg-[#174f43] px-4 py-2 text-sm font-semibold text-white"
        >
          Se connecter
        </button>
      </div>
    );
  }

  if (loadingProduct) {
    return <div className="px-4 py-16 text-center text-sm text-neutral-500">Chargement…</div>;
  }

  if (forbidden) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">Vous ne pouvez modifier que vos propres produits.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 rounded-lg bg-[#174f43] px-4 py-2 text-sm font-semibold text-white"
        >
          Retour
        </button>
      </div>
    );
  }

  const family = productCategoryById(parentId);
  const familyValue = productFamilyCategoryValue(parentId);
  const categoryOptions = [
    ...(family && familyValue ? [{ en: familyValue, fr: family.fr }] : []),
    ...subOptions.filter((sub) => sub.en !== familyValue),
    ...(categoryEn &&
    categoryEn !== familyValue &&
    !subOptions.some((sub) => sub.en === categoryEn)
      ? [{ en: categoryEn, fr: productCategoryFr(categoryEn) || categoryEn }]
      : []),
  ];

  return createPortal(
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-white">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="Retour" className="rounded-full p-1.5 hover:bg-neutral-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-base font-semibold text-neutral-900">
            <Package className="h-4 w-4 text-[#174f43]" />
            {editing ? "Modifier le produit" : "Nouveau produit"}
          </p>
          <p className="text-xs text-neutral-500">Champs alignés sur le catalogue produits</p>
        </div>
        <button
          type="button"
          disabled={saving || !canSubmit}
          onClick={() => void handleSubmit()}
          className="rounded-lg bg-[#174f43] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : editing ? "Enregistrer" : "Publier"}
        </button>
      </div>

      <div className="mx-auto max-w-lg space-y-5 px-4 py-5 pb-24">
        <div>
          <Label>Photos</Label>
          <div className="mt-1 flex flex-wrap gap-2">
            {photos.map((url) => (
              <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-neutral-200">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((item) => item !== url))}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                  aria-label="Retirer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {photos.length < 12 ? (
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-300 text-neutral-500 hover:border-[#174f43] hover:text-[#174f43]">
                <ImageIcon className="h-5 w-5" />
                <span className="text-[10px]">Ajouter</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    void uploadImages(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-neutral-400">cover + gallery (max 12)</p>
        </div>

        <div>
          <Label>Titre</Label>
          <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Carrelage grès cérame 60×60" maxLength={160} />
        </div>

        <div>
          <Label optional>Description</Label>
          <textarea
            className={`${fieldClass} h-28 py-2`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez le produit, usage, conditionnement…"
            maxLength={4000}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label>Famille</Label>
            <select
              className={fieldClass}
              value={parentId}
              onChange={(e) => {
                const nextParent = e.target.value;
                const nextFamily = productFamilyCategoryValue(nextParent);
                const nextSubs = productCategoryById(nextParent)?.subs || [];
                setParentId(nextParent);
                setCategoryEn((current) =>
                  current === nextFamily || nextSubs.some((sub) => sub.en === current) ? current : "",
                );
              }}
            >
              <option value="">Choisir</option>
              {PRODUCT_PARENT_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Catégorie (EN stockée)</Label>
            <select
              className={fieldClass}
              value={categoryEn}
              disabled={!parentId}
              onChange={(e) => setCategoryEn(e.target.value)}
            >
              <option value="">Choisir</option>
              {categoryOptions.map((sub) => (
                <option key={sub.en} value={sub.en}>
                  {sub.fr}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label optional>Marque</Label>
            <input className={fieldClass} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="brand" />
          </div>
          <div>
            <Label optional>SKU / Réf.</Label>
            <input className={fieldClass} value={sku} onChange={(e) => setSku(e.target.value)} placeholder="sku" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <Label optional>Prix</Label>
            <input
              className={fieldClass}
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="col-span-1">
            <Label optional>Devise</Label>
            <input className={fieldClass} value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="MAD" maxLength={8} />
          </div>
          <div className="col-span-1">
            <Label optional>Unité</Label>
            <input className={fieldClass} value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="m², u…" />
          </div>
        </div>

        <div>
          <Label optional>Quantité minimale</Label>
          <input
            className={fieldClass}
            value={minQuantity}
            onChange={(e) => setMinQuantity(e.target.value)}
            placeholder="Ex. 10 m² / 1 palette"
          />
        </div>

        <div>
          <Label optional>Villes de livraison</Label>
          <div className="mb-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setDeliveryCities((prev) => (prev.includes(DELIVERY_ALL) ? [] : [DELIVERY_ALL]));
                setCityQuery("");
              }}
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                deliveryCities.includes(DELIVERY_ALL)
                  ? "border-[#174f43] bg-[#174f43]/10 text-[#174f43]"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
              }`}
            >
              Tous
            </button>
            {deliveryCities
              .filter((city) => city !== DELIVERY_ALL)
              .map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setDeliveryCities((prev) => prev.filter((c) => c !== city))}
                  className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-800"
                >
                  {city}
                  <Trash2 className="h-3 w-3 text-neutral-400" />
                </button>
              ))}
          </div>
          {deliveryCities.includes(DELIVERY_ALL) ? (
            <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
              Livraison sur toutes les villes.
            </p>
          ) : (
            <>
              <input
                className={fieldClass}
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="Rechercher une ville"
              />
              {cityQuery.trim() && citySuggestions.length ? (
                <div className="mt-1 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
                  {citySuggestions.map((city) => (
                    <button
                      key={city}
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-50"
                      onClick={() => {
                        setDeliveryCities((prev) => [
                          ...prev.filter((c) => c !== DELIVERY_ALL),
                          city,
                        ]);
                        setCityQuery("");
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 text-[#174f43]" />
                      {city}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>

        <div>
          <Label optional>Spécifications techniques</Label>
          <textarea
            className={`${fieldClass} h-24 py-2`}
            value={specs}
            onChange={(e) => setSpecs(e.target.value)}
            placeholder="Caractéristiques techniques détaillées"
            maxLength={4000}
          />
        </div>

        <p className="text-xs text-neutral-400">
          Catégories disponibles : {PRODUCT_TAXONOMY.length} familles produit.
        </p>
      </div>
    </div>,
    document.body
  );
};

export default CreateProductForm;
