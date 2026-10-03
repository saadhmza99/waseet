import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatSurface, labelOf, PROPERTY_KINDS, type PropertyDetails } from "@/lib/propertyListing";

const coverFallback =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="#e7ebe8"/><text x="50%" y="50%" text-anchor="middle" fill="#8b948e" font-family="sans-serif" font-size="18">Bien</text></svg>`
  );

export const propertyPriceLabel = (details: PropertyDetails) => {
  const amount = Number(String(details.priceDh).replace(/\s/g, ""));
  if (!amount) return "";
  const formatted = `${amount.toLocaleString("fr-FR")} DH`;
  return details.category === "location" || details.category === "location_vacances" ? `${formatted} / mois` : formatted;
};

export const PropertyCard = ({ row }: { row: { id: string; images: string[]; details: PropertyDetails } }) => {
  const navigate = useNavigate();
  const { details } = row;
  const place = [details.address, details.city].filter(Boolean).join(" · ");

  return (
    <button
      type="button"
      onClick={() => {
        window.scrollTo(0, 0);
        navigate(`/bien/${row.id}`);
      }}
      className="flex w-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-left shadow-sm transition hover:border-neutral-300"
    >
      <span className="relative block aspect-[16/10] bg-neutral-100">
        <img src={row.images[0] || coverFallback} alt="" className="h-full w-full object-cover" />
        <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold text-neutral-800 shadow-sm">
          {labelOf(PROPERTY_KINDS, details.propertyKind)}
        </span>
      </span>
      <span className="flex flex-col gap-2 px-3.5 py-3">
        <span className="text-[17px] font-semibold leading-tight text-neutral-950">{details.title}</span>
        {place ? (
          <span className="inline-flex items-center gap-1 text-sm text-neutral-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {place}
          </span>
        ) : null}
        <span className="text-sm text-neutral-600">
          {[formatSurface(details.builtSurface), details.beds ? `${details.beds} ch.` : "", details.baths ? `${details.baths} sdb` : ""].filter(Boolean).join(" · ")}
        </span>
        <span className="text-sm font-medium text-[#174f43]">{propertyPriceLabel(details)}</span>
      </span>
    </button>
  );
};
