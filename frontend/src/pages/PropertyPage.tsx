import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { iconUrl } from "@/assets/icons";
import { FEATURE_ICON_FILES } from "@/components/FeatureAmenityGrid";
import {
  featureLabel,
  formatSurface,
  labelOf,
  LISTING_CATEGORIES,
  PROPERTY_CONDITIONS,
  PROPERTY_STANDINGS,
  PROPERTY_STATUSES,
  propertyKindLabel,
  propertyViewFromRow,
} from "@/lib/propertyListing";
import { propertyPriceLabel } from "@/components/property/PropertyCard";
import { catalogService } from "@/services/catalogService";

const OutlineIcon = ({ file, className = "h-8 w-8" }: { file: string; className?: string }) => (
  <span
    aria-hidden
    className={`block shrink-0 bg-neutral-900 ${className}`}
    style={{
      maskImage: `url("${iconUrl(file)}")`,
      WebkitMaskImage: `url("${iconUrl(file)}")`,
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskPosition: "center",
      maskSize: "contain",
      WebkitMaskSize: "contain",
    }}
  />
);

const countLine = (count: number, one: string, many: string) => `${count} ${count > 1 ? many : one}`;

const placesLine = (value: string) => {
  const count = Number(value);
  if (!count) return value;
  return countLine(count, "Place", "Places");
};

const PropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<ReturnType<typeof propertyViewFromRow> | null>(null);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!id) {
        setProperty(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const row = await catalogService.getProperty(id);
        if (!cancelled) setProperty(row ? propertyViewFromRow(row) : null);
      } catch (error) {
        console.error("Error loading property:", error);
        if (!cancelled) setProperty(null);
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

  if (!property) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-neutral-600">Ce bien n'est plus disponible.</p>
        <button type="button" onClick={() => navigate(-1)} className="mt-4 text-sm font-semibold text-[#174f43]">
          Retour
        </button>
      </div>
    );
  }

  const { details } = property;
  const kind = propertyKindLabel(details.propertyKind);
  const place = [details.address, details.city].filter(Boolean);
  const location = place.length > 1 ? `${place[0]} à ${place.slice(1).join(", ")}` : place[0] || details.region;
  const price = propertyPriceLabel(details);
  const category = labelOf(LISTING_CATEGORIES, details.category);
  const metrics = [
    details.builtSurface ? { icon: "triangle.svg", label: `${details.builtSurface}m²` } : null,
    details.pieces ? { icon: "house-boxes.svg", label: countLine(details.pieces, "Pièce", "Pièces") } : null,
    details.beds ? { icon: "bed.svg", label: countLine(details.beds, "Chambre", "Chambres") } : null,
    details.baths ? { icon: "bath.svg", label: countLine(details.baths, "Salle de bains", "Salles de bains") } : null,
  ].filter(Boolean) as { icon: string; label: string }[];
  const characteristics = [
    kind ? { icon: "house.svg", label: "Type de bien", value: kind } : null,
    details.condition ? { icon: "hammer.svg", label: "État", value: labelOf(PROPERTY_CONDITIONS, details.condition) } : null,
    details.age ? { icon: "sand-clock.svg", label: "Années", value: details.age } : null,
    details.floors ? { icon: "go-up.svg", label: "Étage du bien", value: details.floors === "1" ? "1er" : details.floors } : null,
    details.flooring ? { icon: "floor.svg", label: "Type du sol", value: details.flooring } : null,
    details.standing ? { icon: "home.svg", label: "Standing", value: labelOf(PROPERTY_STANDINGS, details.standing) } : null,
    details.orientation ? { icon: "compass.svg", label: "Orientation", value: details.orientation } : null,
    details.plotSurface ? { icon: "exteriorFacade.svg", label: "Surface de la parcelle", value: formatSurface(details.plotSurface) } : null,
    details.status ? { icon: "hand-key.svg", label: "Statut", value: labelOf(PROPERTY_STATUSES, details.status) } : null,
    details.status === "en_construction" && details.delivery
      ? { icon: "sand-clock.svg", label: "Livraison", value: details.delivery }
      : null,
  ].filter(Boolean) as { icon: string; label: string; value: string }[];
  const featureNote = (featureId: string) => {
    if (featureId === "terrasse") return formatSurface(details.terraceSurface);
    if (featureId === "jardin") return formatSurface(details.gardenSurface);
    if (featureId === "garage") return placesLine(details.parkingPlaces);
    return "";
  };

  return (
    <div className="min-h-screen bg-white pb-8 text-neutral-900">
      <div className="mx-auto w-full max-w-3xl px-4 pt-3">
        <button type="button" onClick={() => navigate(-1)} className="mb-3 text-sm text-neutral-600">
          ← Retour
        </button>
        <div className="overflow-hidden">
          <div className="relative aspect-[16/9] bg-neutral-100">
            {property.images[0] ? <img src={property.images[0]} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          <div className="space-y-5 py-5">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{details.title}</h1>
              {price ? (
                <p className="mt-2 text-base font-semibold text-[#174f43]">
                  {category ? `${category} · ${price}` : price}
                </p>
              ) : null}
            </div>
            {location ? <p className="text-lg text-neutral-700">{location}</p> : null}
            {metrics.length ? (
              <div className="flex items-start justify-between gap-2">
                {metrics.map((item) => (
                  <div key={item.label} className="flex w-[4.75rem] flex-col items-center gap-1.5 text-center">
                    <OutlineIcon file={item.icon} className="h-7 w-7" />
                    <span className="text-[13px] leading-tight text-neutral-800">{item.label}</span>
                  </div>
                ))}
              </div>
            ) : null}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">{details.description}</p>
            {characteristics.length ? (
              <div className="border-t border-neutral-200 pt-5">
                <h2 className="text-lg font-semibold">Caractéristiques générales</h2>
                <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
                  {characteristics.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <OutlineIcon file={item.icon} className="h-9 w-9" />
                      <div className="min-w-0">
                        <p className="text-sm text-neutral-600">{item.label}</p>
                        <p className="font-semibold leading-tight">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {details.features.length ? (
              <div className="flex flex-wrap gap-x-5 gap-y-4 border-t border-neutral-200 pt-5">
                {details.features.map((feature) => {
                  const file = FEATURE_ICON_FILES[feature];
                  const note = featureNote(feature);
                  if (!file) return null;
                  return (
                    <div key={feature} className="flex items-center gap-2">
                      <OutlineIcon file={file} className="h-7 w-7" />
                      <div className="text-sm leading-tight">
                        <p>{featureLabel(feature)}</p>
                        {note ? <p className="text-neutral-600">{note}</p> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
            {property.images.length > 1 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {property.images.slice(1).map((url) => (
                  <img key={url} src={url} alt="" className="aspect-[4/3] w-full object-cover" />
                ))}
              </div>
            ) : null}
            <p className="text-xs text-neutral-500">Le contact se fait par le profil de l'annonceur.</p>
            {property.sourceUrl ? (
              <a href={property.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#174f43]">
                Annonce publique
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPage;
