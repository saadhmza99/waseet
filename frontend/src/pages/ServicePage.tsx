import { useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ExternalLink, MapPin } from "lucide-react";
import InquiryDialog from "@/components/InquiryDialog";
import { priceLabel, zoneLabel } from "@/lib/serviceOffer";
import { showcaseService } from "@/lib/showcaseServices.ts";

const ServicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const service = id ? showcaseService(id) : null;
  const [missing, setMissing] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  useLayoutEffect(() => {
    setMissing(!service);
  }, [service]);

  if (!service || missing) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-neutral-600">Ce service n'est plus disponible.</p>
        <button type="button" onClick={() => navigate(-1)} className="mt-4 text-sm font-semibold text-[#174f43]">
          Retour
        </button>
      </div>
    );
  }

  const { offer } = service;
  const images = [offer.cover, ...offer.gallery].filter(Boolean);
  const audiences = [...offer.audiences.filter((item) => item !== "Autres"), offer.audienceOther].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#f4f6f3] pb-8 text-neutral-900">
      <div className="mx-auto w-full max-w-6xl px-3 pt-3 sm:px-4">
        <button type="button" onClick={() => navigate(-1)} className="mb-3 text-sm text-neutral-600">
          ← Retour
        </button>
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          {offer.cover ? (
            <div className="relative aspect-[16/8] bg-neutral-100 sm:aspect-[21/8]">
              <img src={offer.cover} alt="" className="h-full w-full object-cover" />
              <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold text-neutral-800">
                {offer.category}
              </span>
            </div>
          ) : null}
          <div className="space-y-6 p-4 sm:p-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{offer.title}</h1>
              <p className="mt-1 text-sm font-medium text-neutral-800">{service.firm}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-sm text-neutral-500">
                <MapPin className="h-4 w-4" />
                {zoneLabel(offer)}
                {offer.travel ? " · Déplacement possible" : ""}
                {offer.remote ? " · À distance" : ""}
              </p>
              <p className="mt-3 text-sm font-semibold text-[#174f43]">
                {priceLabel(offer)}
                {offer.duration ? ` · ${offer.duration}` : ""}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => setContactOpen(true)} className="h-11 rounded-lg bg-[#174f43] text-sm font-semibold text-white">
                Contacter
              </button>
              <button type="button" onClick={() => setContactOpen(true)} className="h-11 rounded-lg border border-neutral-300 text-sm font-semibold">
                Demander plus d'informations
              </button>
            </div>
            {offer.kinds.length ? (
              <div className="flex flex-wrap gap-2">
                {offer.kinds.map((kind) => (
                  <span key={kind} className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700">
                    {kind}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">{offer.description}</p>
            {offer.included.length ? (
              <div>
                <h2 className="text-sm font-semibold">Ce qui est inclus</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-neutral-700">
                  {offer.included.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#174f43]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {offer.options.length ? (
              <div>
                <h2 className="text-sm font-semibold">Options</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-neutral-700">
                  {offer.options.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {audiences.length ? (
              <p className="text-sm text-neutral-700">
                <span className="font-semibold">Pour </span>
                {audiences.join(", ")}
              </p>
            ) : null}
            {images.length > 1 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {images.slice(1).map((url) => (
                  <img key={url} src={url} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
                ))}
              </div>
            ) : null}
            <p className="text-xs text-neutral-500">Le contact se fait par le profil de l'entreprise.</p>
            <InquiryDialog
              open={contactOpen}
              onOpenChange={setContactOpen}
              type="service"
              sellerId="showcase"
              sellerName={service.firm}
            />
            {service.sourceUrl ? (
              <a href={service.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#174f43]">
                Présentation publique
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePage;
