import { useState } from "react";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { OwnerDeleteButton } from "@/components/OwnerDeleteButton";
import InquiryDialog from "@/components/InquiryDialog";
import { SafeImage } from "@/components/SafeImage";
import VerifiedBadge from "@/components/VerifiedBadge";
import {
  priceLabel,
  SERVICE_COVER_FALLBACK,
  serviceCoverIsLogo,
  serviceMainImage,
  zoneLabel,
  type ServiceOffer,
} from "@/lib/serviceOffer";
import { devisPath } from "@/services/devisService";
import { serviceService } from "@/services/serviceService";

export { serviceCoverIsLogo, SERVICE_COVER_FALLBACK };

export type ServiceCardProps = {
  row: { id: string; firm: string; offer: ServiceOffer; userId?: string; isVerified?: boolean };
  onDeleted?: () => void;
};

export const ServiceCard = ({
  row,
  onDeleted,
}: ServiceCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [removed, setRemoved] = useState(false);
  const isOwn = Boolean(user && row.userId && user.id === row.userId);
  const { offer } = row;
  const place = zoneLabel(offer);
  const [contactOpen, setContactOpen] = useState(false);
  const logoCover = serviceCoverIsLogo(offer);
  const src = serviceMainImage(offer, SERVICE_COVER_FALLBACK);

  const openService = () => {
    window.scrollTo(0, 0);
    navigate(`/service/${row.id}`);
  };

  const openDevis = () => {
    navigate(
      devisPath({
        sellerId: row.userId,
        sellerName: row.firm,
        serviceId: row.id,
        fromLabel: "Carte service",
      }),
    );
  };

  if (removed) return null;

  return (
    <article className="relative flex w-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-left shadow-sm">
      {isOwn && user ? (
        <OwnerDeleteButton
          onDelete={async () => {
            await serviceService.deleteService(row.id, user.id);
            setRemoved(true);
            onDeleted?.();
          }}
        />
      ) : null}
      <button type="button" onClick={openService} className="block w-full text-left">
        <span
          className={`relative block aspect-[16/10] w-full overflow-hidden ${
            logoCover ? "bg-[#eef2ef]" : "bg-neutral-100"
          }`}
        >
          <SafeImage
            src={src}
            fallback={SERVICE_COVER_FALLBACK}
            alt=""
            className={
              logoCover
                ? "absolute inset-0 m-auto max-h-[70%] max-w-[70%] object-contain"
                : "absolute inset-0 h-full w-full object-cover"
            }
          />
          {offer.category ? (
            <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1.5 text-sm font-semibold text-neutral-800 shadow-sm sm:text-base">
              {offer.category}
            </span>
          ) : null}
        </span>
        <span className="flex flex-col gap-2 px-3.5 py-3">
          <span className="text-[17px] font-semibold leading-tight text-neutral-950">{offer.title}</span>
          <span className="inline-flex min-w-0 items-center gap-1 text-sm text-neutral-600">
            <span className="truncate">{row.firm}</span>
            <VerifiedBadge verified={row.isVerified} className="h-4 w-4" />
          </span>
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
        <button
          type="button"
          onClick={isOwn ? () => navigate(`/service/${row.id}/modifier`) : openDevis}
          className="h-10 rounded-lg bg-[#174f43] text-sm font-semibold text-white"
        >
          {isOwn ? "Modifier" : "Demander devis"}
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
