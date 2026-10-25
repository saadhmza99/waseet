import { useEffect, useLayoutEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ExternalLink, MapPin } from "lucide-react";
import InquiryDialog from "@/components/InquiryDialog";
import {
  priceLabel,
  serviceCoverIsLogo,
  serviceMainImage,
  servicePhotos,
  offerFromRow,
  zoneLabel,
} from "@/lib/serviceOffer";
import { serviceFirmName, serviceService, type ServiceRow } from "@/services/serviceService";

const ServicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [row, setRow] = useState<ServiceRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!id) {
        setRow(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await serviceService.getService(id);
        if (!cancelled) setRow(data);
      } catch (error) {
        console.error("Error loading service:", error);
        if (!cancelled) setRow(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <div className="px-4 py-16 text-center text-sm text-neutral-500">Chargement…</div>;
  }

  if (!row) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-neutral-600">Ce service n'est plus disponible.</p>
        <button type="button" onClick={() => navigate(-1)} className="mt-4 text-sm font-semibold text-[#174f43]">
          Retour
        </button>
      </div>
    );
  }

  const offer = offerFromRow(row);
  const firm = serviceFirmName(row);
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const photos = servicePhotos(offer);
  const mainImage = serviceMainImage(offer);
  const logoCover = serviceCoverIsLogo(offer);
  /** Gallery under Mission: all photos when hero is a logo; otherwise skip the hero photo. */
  const galleryPhotos = logoCover ? photos : photos.slice(1);
  const audiences = [...offer.audiences.filter((item) => item !== "Autres"), offer.audienceOther].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#f4f6f3] pb-8 text-neutral-900">
      <div className="mx-auto w-full max-w-6xl px-3 pt-3 sm:px-4">
        <button type="button" onClick={() => navigate(-1)} className="mb-3 text-sm text-neutral-600">
          ← Retour
        </button>
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          {mainImage ? (
            <div
              className={`relative aspect-[16/9] overflow-hidden sm:aspect-[21/9] ${
                logoCover ? "bg-[#eef2ef]" : "bg-neutral-100"
              }`}
            >
              <img
                src={mainImage}
                alt=""
                className={
                  logoCover
                    ? "absolute inset-0 m-auto max-h-[55%] max-w-[40%] object-contain"
                    : "absolute inset-0 h-full w-full object-cover"
                }
              />
              {offer.category ? (
                <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold text-neutral-800">
                  {offer.category}
                </span>
              ) : null}
            </div>
          ) : null}
          <div className="space-y-6 p-4 sm:p-6 text-base">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{offer.title}</h1>
              {profile?.username ? (
                <Link to={`/profile/${profile.username}`} className="mt-1 block text-base font-medium text-[#174f43]">
                  {firm}
                </Link>
              ) : (
                <p className="mt-1 text-base font-medium text-neutral-800">{firm}</p>
              )}
              <p className="mt-2 inline-flex items-center gap-1 text-base text-neutral-500">
                <MapPin className="h-4 w-4" />
                {zoneLabel(offer)}
                {offer.travel ? " · Déplacement possible" : ""}
                {offer.remote ? " · À distance" : ""}
              </p>
              <p className="mt-3 text-base font-semibold text-[#174f43]">
                {priceLabel(offer)}
                {offer.duration ? ` · ${offer.duration}` : ""}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => setContactOpen(true)} className="h-11 rounded-lg bg-[#174f43] text-base font-semibold text-white">
                Demander un devis
              </button>
              <button type="button" onClick={() => setContactOpen(true)} className="h-11 rounded-lg border border-neutral-300 text-base font-semibold">
                Demander plus d'informations
              </button>
            </div>
            {offer.kinds.length ? (
              <div className="flex flex-wrap gap-2">
                {offer.kinds.map((kind) => (
                  <span key={kind} className="rounded-md border border-neutral-200 px-2.5 py-1 text-sm font-medium text-neutral-700">
                    {kind}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="max-w-3xl whitespace-pre-wrap text-base leading-relaxed text-neutral-700">{offer.description}</p>
            {offer.included.length ? (
              <div>
                <h2 className="text-base font-semibold">Ce qui est inclus</h2>
                <ul className="mt-2 space-y-1.5 text-base text-neutral-700">
                  {offer.included.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#174f43]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {offer.options.length ? (
              <div>
                <h2 className="text-base font-semibold">Options</h2>
                <ul className="mt-2 space-y-1.5 text-base text-neutral-700">
                  {offer.options.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {audiences.length || offer.missions?.length ? (
              <div className="space-y-1 text-base text-neutral-700">
                {audiences.length ? (
                  <p>
                    <span className="font-semibold">Pour </span>
                    {audiences.join(", ")}
                  </p>
                ) : null}
                {offer.missions?.length ? (
                  <p>
                    <span className="font-semibold">Mission </span>
                    {offer.missions.join(" · ")}
                  </p>
                ) : null}
              </div>
            ) : null}
            {galleryPhotos.length ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {galleryPhotos.map((url) => (
                  <img key={url} src={url} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
                ))}
              </div>
            ) : null}
            {(profile?.phone || profile?.email) && (
              <div className="rounded-xl border border-neutral-200 bg-[#f8faf8] px-4 py-3 text-base text-neutral-700">
                <p className="font-semibold text-neutral-900">Contact</p>
                {profile.phone ? (
                  <p className="mt-1.5">
                    <a href={`tel:${profile.phone}`} className="font-medium text-[#174f43]">
                      {profile.phone}
                    </a>
                  </p>
                ) : null}
                {profile.email ? (
                  <p className="mt-1">
                    <a href={`mailto:${profile.email}`} className="font-medium text-[#174f43]">
                      {profile.email}
                    </a>
                  </p>
                ) : null}
              </div>
            )}
            <InquiryDialog
              open={contactOpen}
              onOpenChange={setContactOpen}
              type="service"
              sellerId={row.user_id}
              sellerName={firm}
            />
            {profile?.website_url ? (
              <a href={profile.website_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-base font-semibold text-[#174f43]">
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
