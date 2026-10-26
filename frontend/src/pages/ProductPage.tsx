import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Heart, Info, MapPin, PackageCheck, ShieldCheck, Tag, Truck } from "lucide-react";
import InquiryDialog from "@/components/InquiryDialog";
import { getDefaultAvatar } from "@/lib/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useVisitorGate } from "@/contexts/VisitorGateContext";
import { savedService } from "@/services/savedService";
import { savedToast } from "@/lib/savedToast";
import { toast } from "@/components/ui/use-toast";
import {
  productCategoryLabel,
  productFirmName,
  productPhotos,
  productPriceLabel,
  productProfile,
  productService,
  productTechnicalSpecsPair,
  productUnitLabel,
  type ProductRow,
} from "@/services/productService";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, visitorUser } = useAuth();
  const { requestVisitor } = useVisitorGate();
  const [row, setRow] = useState<ProductRow | null>(null);
  const [peers, setPeers] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const saverId = user?.id || visitorUser?.id;
    if (!saverId) {
      setSaved(false);
      return;
    }
    let cancelled = false;
    savedService.isProductSaved(saverId, id).then((value) => {
      if (!cancelled) setSaved(value);
    });
    return () => {
      cancelled = true;
    };
  }, [id, user?.id, visitorUser?.id]);

  const toggleSave = async () => {
    if (!id) return;
    const saver = await requestVisitor();
    if (!saver) return;
    try {
      if (saved) {
        await savedService.unsaveProduct(saver.id, id);
        setSaved(false);
      } else {
        await savedService.saveProduct(saver.id, id);
        setSaved(true);
        savedToast();
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour les favoris." });
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!id) {
        setRow(null);
        setPeers([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await productService.getProduct(id);
        if (cancelled) return;
        setRow(data);
        setActivePhoto(0);
        if (data) {
          const same = await productService.listSameProductOffers(data);
          if (!cancelled) setPeers(same);
        } else {
          setPeers([]);
        }
      } catch (error) {
        console.error("Error loading product:", error);
        if (!cancelled) {
          setRow(null);
          setPeers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const photos = useMemo(() => (row ? productPhotos(row) : []), [row]);
  const suppliers = useMemo(() => {
    if (!row) return [] as ProductRow[];
    const byUser = new Map<string, ProductRow>();
    byUser.set(row.user_id, row);
    for (const peer of peers) {
      if (!byUser.has(peer.user_id)) byUser.set(peer.user_id, peer);
    }
    return [...byUser.values()];
  }, [row, peers]);

  if (loading) {
    return <div className="px-4 py-16 text-center text-sm text-neutral-500">Chargement…</div>;
  }

  if (!row) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-neutral-600">Ce produit n'est plus disponible.</p>
        <button type="button" onClick={() => navigate(-1)} className="mt-4 text-sm font-semibold text-[#174f43]">
          Retour
        </button>
      </div>
    );
  }

  const category = productCategoryLabel(row);
  const unit = productUnitLabel(row);
  const { detailed: specsDetailed, original: specsOriginal } = productTechnicalSpecsPair(row);
  const mainImage = photos[Math.min(activePhoto, Math.max(0, photos.length - 1))] || "";
  const thumbs = photos.filter((_, index) => index !== activePhoto);
  const deliveryOk = Array.isArray(row.delivery_cities) && row.delivery_cities.some(Boolean);
  const amount = Number(row.price);
  const hasPrice = Number.isFinite(amount) && amount > 0;
  const priceHighlight = productPriceLabel(row);
  const bannerTitle = `${row.title} — prix au Maroc`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#f6f5f3] pb-10 text-neutral-900">
      <div className="mx-auto w-full max-w-6xl px-3 pt-4 sm:px-4">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start">
          <div>
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-[#eceef0]">
              {mainImage ? (
                <img src={mainImage} alt="" className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square items-center justify-center text-sm text-neutral-400">Produit</div>
              )}
            </div>
            {thumbs.length ? (
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
                {photos.map((url, index) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActivePhoto(index)}
                    className={`overflow-hidden rounded-lg border ${
                      index === activePhoto ? "border-[#174f43]" : "border-transparent"
                    }`}
                  >
                    <img src={url} alt="" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#174f43] hover:underline"
              >
                ← {category || "Produits"}
              </button>
              <button
                type="button"
                onClick={() => void toggleSave()}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold ${
                  saved
                    ? "border-[#174f43] bg-[#174f43] text-white"
                    : "border-neutral-300 bg-white text-neutral-800"
                }`}
              >
                <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
                {saved ? "Enregistré" : "Favoris"}
              </button>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">{row.title}</h1>

            {hasPrice ? (
              <div className="mt-4 rounded-xl border border-[#f0d4b8] bg-[#fff4e8] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600">{bannerTitle}</p>
                <p className="mt-1 text-sm text-neutral-800">
                  <span className="font-bold">{priceHighlight}</span>
                  <span className="text-neutral-500">
                    {" "}
                    (selon le fournisseur · {suppliers.length} fournisseur
                    {suppliers.length > 1 ? "s" : ""})
                  </span>
                </p>
              </div>
            ) : null}

            {row.brand ? (
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-neutral-700">
                <Tag className="h-4 w-4 text-neutral-400" />
                Marque : <span className="font-semibold text-neutral-900">{row.brand}</span>
              </p>
            ) : null}

            <div className="mt-4 rounded-xl border border-neutral-200 bg-white px-4 py-4">
              {hasPrice ? (
                <p className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
                  FROM{" "}
                  <span className="text-3xl font-bold text-[#174f43] sm:text-4xl">
                    {new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(
                      Math.min(
                        amount,
                        ...suppliers
                          .map((s) => Number(s.price))
                          .filter((n) => Number.isFinite(n) && n > 0),
                      ),
                    )}
                  </span>{" "}
                  {(row.currency || "MAD").trim() || "MAD"}
                  {unit ? ` / ${unit}` : ""}
                </p>
              ) : (
                <p className="text-2xl font-bold text-[#174f43]">Prix sur demande</p>
              )}
            </div>

            {row.description ? (
              <p className="mt-5 text-[15px] leading-relaxed text-neutral-700">{row.description}</p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              {unit ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-neutral-700">
                  <Box className="h-3.5 w-3.5" />
                  Unit: {unit}
                </span>
              ) : null}
              {category ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-neutral-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {category}
                </span>
              ) : null}
              {row.min_quantity ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-neutral-700">
                  <Info className="h-3.5 w-3.5" />
                  Min quantity: {row.min_quantity}
                </span>
              ) : null}
              {deliveryOk ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f3ee] px-3 py-1.5 text-sm font-medium text-[#174f43]">
                  <Truck className="h-3.5 w-3.5" />
                  Delivery available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-neutral-600">
                  <PackageCheck className="h-3.5 w-3.5" />
                  Sur devis
                </span>
              )}
            </div>

            {specsDetailed ? (
              <div className="mt-6">
                <h2 className="text-base font-semibold text-neutral-900">Caractéristiques techniques</h2>
                <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-700">
                  {specsDetailed}
                </p>
              </div>
            ) : null}
            {specsOriginal ? (
              <div className="mt-4">
                <h2 className="text-base font-semibold text-neutral-900">Spécifications (source)</h2>
                <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-700">
                  {specsOriginal}
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#e07a32] text-base font-semibold text-white transition hover:bg-[#d06c28]"
            >
              Demander un devis →
            </button>
          </div>
        </div>

        <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-neutral-900">Fournisseurs qui fournissent ce produit</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {suppliers.length} fournisseur{suppliers.length > 1 ? "s" : ""}
          </p>
          <ul className="mt-4 space-y-3">
            {suppliers.map((offer) => {
              const supplier = productProfile(offer);
              const username = supplier?.username || "";
              const name = productFirmName(offer);
              const place =
                (Array.isArray(offer.delivery_cities) && offer.delivery_cities[0]) || supplier?.location || "";
              return (
                <li
                  key={offer.user_id}
                  className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-[#f8faf8] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (username) navigate(`/profile/${username}`);
                    }}
                    className="flex min-w-0 items-center gap-3 text-left"
                  >
                    <img
                      src={supplier?.avatar_url || getDefaultAvatar("enterprise")}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-2xl object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold text-neutral-950">{name}</span>
                      {supplier?.profession ? (
                        <span className="block truncate text-sm text-neutral-500">{supplier.profession}</span>
                      ) : null}
                      {place ? (
                        <span className="mt-0.5 inline-flex items-center gap-1 text-sm text-neutral-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {place}
                        </span>
                      ) : null}
                    </span>
                  </button>
                  <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                    <span className="text-sm font-semibold text-[#174f43]">{productPriceLabel(offer)}</span>
                    {offer.id !== row.id ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/produits/${offer.id}`)}
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold"
                      >
                        Voir l'offre
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <InquiryDialog
          open={contactOpen}
          onOpenChange={setContactOpen}
          type="service"
          sellerId={row.user_id}
          sellerName={productFirmName(row)}
        />
      </div>
    </div>
  );
};

export default ProductPage;
