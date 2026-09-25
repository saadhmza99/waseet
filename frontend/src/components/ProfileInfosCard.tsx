import { useEffect, useRef, useState } from "react";
import { Briefcase, ChevronLeft, ChevronRight, Eye, Globe, Mail, MapPin, Pencil, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import FullScreenPopup from "@/components/FullScreenPopup";

const websiteLinksFrom = (value?: string | null) =>
  (value || "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const hrefForWebsite = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

export const locationsFrom = (value?: string | null) =>
  (value || "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

export type InfosField = "profession" | "location" | "email" | "phone" | "website";

const shortLocationName = (line: string) => line.split(",")[0]?.trim() || line;

const CitySnapBar = ({
  queries,
  selected,
  onSelect,
}: {
  queries: string[];
  selected: number | null;
  onSelect: (index: number) => void;
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(0);

  const scrollTo = (index: number) => {
    const node = scrollerRef.current;
    const next = Math.min(queries.length - 1, Math.max(0, index));
    if (!node) return;
    node.scrollTo({ left: next * node.clientWidth, behavior: "smooth" });
    setVisible(next);
  };

  useEffect(() => {
    if (selected == null) return;
    scrollTo(selected);
  }, [selected]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
      <div className="pointer-events-auto flex w-[min(16.5rem,calc(100%-1rem))] items-center gap-1.5">
        <button
          type="button"
          onClick={() => scrollTo(visible - 1)}
          disabled={visible === 0}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-md hover:bg-muted disabled:opacity-30"
          aria-label="Ville précédente"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <div
            ref={scrollerRef}
            onScroll={(event) => {
              const el = event.currentTarget;
              if (!el.clientWidth) return;
              setVisible(Math.round(el.scrollLeft / el.clientWidth));
            }}
            className="flex w-full snap-x snap-mandatory overflow-x-auto rounded-full border border-border bg-white shadow-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {queries.map((item, index) => (
              <button
                key={`${item}-${index}`}
                type="button"
                onClick={() => onSelect(index)}
                className={`flex w-full min-w-full shrink-0 basis-full snap-center items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition hover:bg-muted active:scale-[0.98] ${
                  selected === index ? "text-accent" : "text-foreground"
                }`}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {shortLocationName(item)}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => scrollTo(visible + 1)}
          disabled={visible === queries.length - 1}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-md hover:bg-muted disabled:opacity-30"
          aria-label="Ville suivante"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

const osmEmbed = (lat: number, lng: number, delta = 0.04) =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;

const geocodePlace = (
  query: string,
  signal: AbortSignal
): Promise<{ lat: number; lng: number } | null> =>
  fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
    { headers: { Accept: "application/json" }, signal }
  )
    .then((response) => response.json())
    .then((data) =>
      data?.[0] ? { lat: Number(data[0].lat), lng: Number(data[0].lon) } : null
    )
    .catch(() => null);

const LocationMapPreview = ({ queries }: { queries: string[] }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [previewCoords, setPreviewCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [open, setOpen] = useState(false);
  const needsChoice = queries.length > 1;
  const firstQuery = queries[0] || "";
  const query = selected == null ? "" : queries[selected] || "";

  const closeMap = () => {
    setOpen(false);
    setSelected(null);
    setCoords(null);
  };

  const openMap = () => {
    setOpen(true);
    if (!needsChoice) setSelected(0);
  };

  useEffect(() => {
    if (!firstQuery) return;
    const controller = new AbortController();
    let cancelled = false;
    geocodePlace(firstQuery, controller.signal).then((point) => {
      if (cancelled || !point) return;
      setPreviewCoords(point);
    });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [firstQuery]);

  useEffect(() => {
    if (!open || !query) return;
    let cancelled = false;
    const controller = new AbortController();
    geocodePlace(query, controller.signal).then((point) => {
      if (cancelled || !point) return;
      setCoords(point);
    });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [open, query]);

  const previewLat = previewCoords?.lat ?? 30.4278;
  const previewLng = previewCoords?.lng ?? -9.5981;
  const lat = coords?.lat ?? previewLat;
  const lng = coords?.lng ?? previewLng;
  const previewSrc = osmEmbed(previewLat, previewLng);
  const embedSrc = osmEmbed(lat, lng);
  const waitingForCity = needsChoice && selected == null;

  return (
    <>
      <div className="relative mt-2 h-28 w-[calc(100%+2rem)] max-w-none -translate-x-4 overflow-hidden bg-muted sm:h-32 sm:w-[calc(100%+3rem)] sm:-translate-x-6 md:w-[calc(100%+4rem)] md:-translate-x-8">
        <iframe
          title="Aperçu de la carte"
          src={previewSrc}
          className="pointer-events-none h-[140%] w-[140%] -translate-x-[14%] -translate-y-[14%] scale-110 border-0 blur-[2px] brightness-95"
        />
        <button
          type="button"
          onClick={openMap}
          className="absolute left-1/2 top-1/2 z-10 inline-flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-md hover:bg-muted"
          aria-label="Voir la carte"
        >
          <Eye className="h-5 w-5" />
        </button>
      </div>
      <FullScreenPopup open={open} onClose={closeMap}>
        <div className="relative h-full w-full bg-muted">
          <iframe
            title={waitingForCity ? "Aperçu de la carte" : "Carte du lieu"}
            src={waitingForCity ? previewSrc : embedSrc}
            className={`h-full w-full border-0 ${
              waitingForCity ? "pointer-events-none scale-110 blur-[2px] brightness-95" : ""
            }`}
          />
          {needsChoice ? (
            <CitySnapBar queries={queries} selected={selected} onSelect={setSelected} />
          ) : null}
        </div>
      </FullScreenPopup>
    </>
  );
};

type ProfileInfosCardProps = {
  profile: any;
  isOwnProfile: boolean;
  userEmail?: string | null;
  rating: number;
  reviewCount: number;
  layout?: "sidebar" | "wide";
  onEdit: (field?: InfosField) => void;
};

export const ProfileDetailsFields = ({
  profile,
  isOwnProfile,
  userEmail,
  onEdit,
}: {
  profile: any;
  isOwnProfile: boolean;
  userEmail?: string | null;
  onEdit: (field?: InfosField) => void;
}) => {
  const email = (profile.email || (isOwnProfile ? userEmail : "") || "").trim();
  const websites = websiteLinksFrom(profile.website_url);
  const lieux = locationsFrom(profile.location);
  const [showAllLieux, setShowAllLieux] = useState(false);

  return (
    <div className="min-w-0 break-words text-base space-y-6">
      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Profession & lieu
        </h3>
        <ul className="space-y-2.5 text-card-foreground">
          <li className="flex items-start gap-2">
            <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            {profile.profession ? (
              <span>{profile.profession}</span>
            ) : isOwnProfile ? (
              <button type="button" onClick={() => onEdit("profession")} className="text-left text-accent hover:underline">
                Ajouter une profession
              </button>
            ) : (
              <span className="text-muted-foreground">Profession non renseignée</span>
            )}
          </li>
          {lieux.length > 0 ? (
            <li className="space-y-1.5">
              {!showAllLieux ? (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 leading-snug">
                    {lieux[0]}
                    {lieux.length > 1 ? (
                      <>
                        {" "}
                        <span className="text-muted-foreground">...</span>{" "}
                        <button
                          type="button"
                          onClick={() => setShowAllLieux(true)}
                          className="text-xs font-semibold text-accent hover:underline"
                        >
                          Voir plus de localisations
                        </button>
                      </>
                    ) : null}
                  </span>
                </div>
              ) : (
                <>
                  {lieux.map((lieu, index) => (
                    <div key={`${lieu}-${index}`} className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 leading-snug">
                        {lieu}
                        {index === lieux.length - 1 ? (
                          <>
                            {" "}
                            <button
                              type="button"
                              onClick={() => setShowAllLieux(false)}
                              className="text-xs font-semibold text-accent hover:underline"
                            >
                              Voir moins
                            </button>
                          </>
                        ) : null}
                      </span>
                    </div>
                  ))}
                </>
              )}
              {isOwnProfile ? (
                <button
                  type="button"
                  onClick={() => onEdit("location")}
                  className="pl-6 text-left text-xs text-accent hover:underline"
                >
                  Ajouter un lieu
                </button>
              ) : null}
              {lieux.length > 0 ? <LocationMapPreview queries={lieux} /> : null}
            </li>
          ) : (
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              {isOwnProfile ? (
                <button type="button" onClick={() => onEdit("location")} className="text-left text-accent hover:underline">
                  Ajouter un lieu
                </button>
              ) : (
                <span className="text-muted-foreground">Localisation non renseignée</span>
              )}
            </li>
          )}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contact</h3>
        <ul className="space-y-2.5 text-card-foreground">
          <li className="flex items-start gap-2">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            {email ? (
              <a href={`mailto:${email}`} className="break-all text-accent hover:underline">
                {email}
              </a>
            ) : isOwnProfile ? (
              <button type="button" onClick={() => onEdit("email")} className="text-left text-accent hover:underline">
                Ajouter un email
              </button>
            ) : (
              <span className="text-muted-foreground">Email non renseigné</span>
            )}
          </li>
          <li className="flex items-start gap-2">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            {profile.phone ? (
              <a href={`tel:${profile.phone}`} className="text-accent hover:underline">
                {profile.phone}
              </a>
            ) : isOwnProfile ? (
              <button type="button" onClick={() => onEdit("phone")} className="text-left text-accent hover:underline">
                Ajouter un téléphone
              </button>
            ) : (
              <span className="text-muted-foreground">Téléphone non renseigné</span>
            )}
          </li>
          {websites.length > 0 ? (
            websites.map((link) => (
              <li key={link} className="flex items-start gap-2">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <a
                  href={hrefForWebsite(link)}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-accent hover:underline"
                >
                  {link}
                </a>
              </li>
            ))
          ) : (
            <li className="flex items-start gap-2">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              {isOwnProfile ? (
                <button type="button" onClick={() => onEdit("website")} className="text-left text-accent hover:underline">
                  Ajouter un site web
                </button>
              ) : (
                <span className="text-muted-foreground">Aucun lien</span>
              )}
            </li>
          )}
        </ul>
      </section>
    </div>
  );
};

const ProfileInfosCard = ({
  isOwnProfile,
  onEdit,
}: ProfileInfosCardProps) => {
  if (!isOwnProfile) return null;

  return (
    <div className="min-w-0 overflow-hidden border-b border-border bg-card p-4 sm:rounded-lg sm:border">
      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={() => onEdit()}>
          <Pencil className="mr-1 h-3.5 w-3.5" />
          Modifier
        </Button>
      </div>
    </div>
  );
};

export default ProfileInfosCard;
