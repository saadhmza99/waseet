import { useState } from "react";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InquiryDialog from "@/components/InquiryDialog";
import { priceLabel, zoneLabel, type ServiceOffer } from "@/lib/serviceOffer";

const coverFallback =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="#e7ebe8"/><text x="50%" y="50%" text-anchor="middle" fill="#8b948e" font-family="sans-serif" font-size="18">Service</text></svg>`
  );

export const ServiceCard = ({ row }: { row: { id: string; firm: string; offer: ServiceOffer; userId?: string } }) => {
  const navigate = useNavigate();
  const { offer } = row;
  const place = zoneLabel(offer);
  const [contactOpen, setContactOpen] = useState(false);

  const openService = () => {
    window.scrollTo(0, 0);
    navigate(`/service/${row.id}`);
  };

  return (
    <article className="flex w-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-left shadow-sm">
      <button type="button" onClick={openService} className="block w-full text-left">
        <span className="relative block aspect-[16/10] bg-neutral-100">
          <img src={offer.cover || coverFallback} alt="" className="h-full w-full object-cover" />
          {offer.category ? (
            <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold text-neutral-800 shadow-sm">
              {offer.category}
            </span>
          ) : null}
        </span>
        <span className="flex flex-col gap-2 px-3.5 py-3">
          <span className="text-[17px] font-semibold leading-tight text-neutral-950">{offer.title}</span>
          <span className="text-sm text-neutral-600">{row.firm}</span>
          {place ? (
            <span className="inline-flex items-center gap-1 text-sm text-neutral-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {place}
            </span>
          ) : null}
          <span className="text-sm font-medium text-[#174f43]">{priceLabel(offer)}</span>
        </span>
      </button>
      <div className="flex flex-col gap-2 px-3.5 pb-3.5">
        <button type="button" onClick={() => setContactOpen(true)} className="h-10 rounded-lg bg-[#174f43] text-sm font-semibold text-white">
          Contacter
        </button>
        <button type="button" onClick={() => setContactOpen(true)} className="h-10 rounded-lg border border-neutral-300 text-sm font-semibold">
          Demander plus d'informations
        </button>
      </div>
      <InquiryDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        type="service"
        sellerId={row.userId || "showcase"}
        sellerName={row.firm}
      />
    </article>
  );
};
