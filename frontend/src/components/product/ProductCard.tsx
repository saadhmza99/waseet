import { useState } from "react";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { OwnerDeleteButton } from "@/components/OwnerDeleteButton";
import {
  productCategoryLabel,
  productFirmName,
  productFirmUsername,
  productPriceLabel,
  productService,
  type ProductRow,
} from "@/services/productService";
import { devisPath } from "@/services/devisService";

const coverFallback =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="#e7ebe8"/><text x="50%" y="50%" text-anchor="middle" fill="#8b948e" font-family="sans-serif" font-size="18">Produit</text></svg>`,
  );

export type ProductCardProps = {
  row: ProductRow;
  onDeleted?: () => void;
};

export const ProductCard = ({ row, onDeleted }: ProductCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [removed, setRemoved] = useState(false);
  const isOwn = Boolean(user && row.user_id === user.id);
  const firm = productFirmName(row);
  const username = productFirmUsername(row);
  const category = productCategoryLabel(row);
  const place = Array.isArray(row.delivery_cities) && row.delivery_cities[0] ? row.delivery_cities[0] : "";
  const src = row.cover || (Array.isArray(row.gallery) && row.gallery[0]) || coverFallback;

  const openProduct = () => {
    window.scrollTo(0, 0);
    navigate(`/produits/${row.id}`);
  };

  if (removed) return null;

  return (
    <article className="relative flex h-full min-w-0 w-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-left shadow-sm">
      {isOwn && user ? (
        <OwnerDeleteButton
          onDelete={async () => {
            await productService.deleteProduct(row.id, user.id);
            setRemoved(true);
            onDeleted?.();
          }}
        />
      ) : null}
      <button type="button" onClick={openProduct} className="block min-w-0 w-full flex-1 text-left">
        <span className="relative block aspect-[16/10] w-full overflow-hidden bg-neutral-100">
          <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
          {category ? (
            <span className="absolute left-2.5 top-2.5 max-w-[75%] truncate rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold text-neutral-800 shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:text-xs">
              {category}
            </span>
          ) : null}
        </span>
        <span className="flex min-w-0 flex-col gap-1.5 px-3 py-3 sm:gap-2 sm:px-4 sm:py-3.5">
          <span className="line-clamp-2 text-base font-semibold leading-tight text-neutral-950 sm:text-lg">{row.title}</span>
          {row.brand ? <span className="truncate text-xs font-medium text-neutral-400 sm:text-sm">{row.brand}</span> : null}
          <span className="truncate text-sm text-neutral-600 sm:text-base">{firm}</span>
          {place ? (
            <span className="inline-flex min-w-0 items-center gap-1 text-sm text-neutral-500 sm:text-base">
              <MapPin className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="truncate">{place}</span>
            </span>
          ) : null}
          <span className="text-sm font-semibold text-[#174f43] sm:text-base">{productPriceLabel(row)}</span>
        </span>
      </button>
      <div className="mt-auto flex min-w-0 flex-col gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
        {isOwn ? (
          <button
            type="button"
            onClick={() => {
              window.scrollTo(0, 0);
              navigate(`/produit/${row.id}/modifier`);
            }}
            className="h-10 w-full rounded-lg bg-[#174f43] text-sm font-semibold text-white sm:h-11 sm:text-base"
          >
            Modifier
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              navigate(
                devisPath({
                  sellerId: row.user_id,
                  sellerName: firm,
                  productId: row.id,
                  projectType: "achat-materiaux",
                  fromLabel: "Carte produit",
                }),
              )
            }
            className="h-10 w-full rounded-lg bg-[#174f43] text-sm font-semibold text-white sm:h-11 sm:text-base"
          >
            Demander devis
          </button>
        )}
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:gap-2.5">
          <button
            type="button"
            onClick={openProduct}
            className="h-10 w-full rounded-lg border border-neutral-300 text-sm font-semibold text-neutral-800 sm:h-11 sm:flex-1 sm:text-base"
          >
            Voir le produit
          </button>
          {username ? (
            <button
              type="button"
              onClick={() => {
                window.scrollTo(0, 0);
                navigate(`/profile/${username}`);
              }}
              className="h-10 w-full shrink-0 rounded-lg border border-neutral-300 px-3 text-sm font-semibold text-neutral-800 sm:h-11 sm:w-auto sm:px-3.5 sm:text-base"
            >
              Fournisseur
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
};
