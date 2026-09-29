import { useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { MapPin, Maximize2, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import FeatureAmenityGrid from "@/components/FeatureAmenityGrid";
import PhoneInput from "@/components/PhoneInput";
import { CityPicker, RegionSelect } from "@/components/CityPicker";
import { isCompletePhone } from "@/lib/phone";
import { isShortMapsLink, mapLinkPlaceQuery, parseMapLink, resolveShortMapLink } from "@/lib/mapLink";
import { citiesForRegion } from "@/lib/moroccoPlaces";
import {
  AGE_OPTIONS,
  emptyPropertyDetails,
  FEATURE_GROUPS,
  FLOORING_OPTIONS,
  LISTING_CATEGORIES,
  ORIENTATIONS,
  PROPERTY_CONDITIONS,
  PROPERTY_KINDS,
  PROPERTY_STANDINGS,
  PROPERTY_STATUSES,
  PropertyDetails,
} from "@/lib/propertyListing";

type WizardResult = {
  details: PropertyDetails;
  files: File[];
};

interface PropertyListingWizardProps {
  onCancel: () => void;
  onComplete: (result: WizardResult) => Promise<void> | void;
  submitLabel?: string;
  stepTitle?: string;
}

const ChoiceGrid = ({
  options,
  value,
  onChange,
  placeholder = "Sélectionnez",
}: {
  options: readonly { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}) => {
  const listId = useId();
  const selectedLabel = options.find((option) => option.id === value)?.label ?? "";
  const [text, setText] = useState(selectedLabel);

  useEffect(() => {
    setText(selectedLabel);
  }, [selectedLabel]);

  return (
    <div>
      <input
        list={listId}
        value={text}
        placeholder={placeholder}
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          const match = options.find((option) => option.label === next);
          onChange(match ? match.id : "");
        }}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-accent"
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option.id} value={option.label} />
        ))}
      </datalist>
    </div>
  );
};

const TILE_SIZE = 256;
const PREVIEW_ZOOM = 15;
const MIN_ZOOM = 5;
const MAX_ZOOM = 19;
const DRAG_THRESHOLD = 8;

type LatLng = { lat: number; lng: number };

const clampZoom = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

const roundPoint = (lat: number, lng: number): LatLng => ({
  lat: Number(Math.min(85, Math.max(-85, lat)).toFixed(6)),
  lng: Number(((((lng + 180) % 360) + 360) % 360 - 180).toFixed(6)),
});

const project = (lat: number, lng: number, zoom: number) => {
  const scale = TILE_SIZE * 2 ** zoom;
  const x = ((lng + 180) / 360) * scale;
  const sinLat = Math.min(0.9999, Math.max(-0.9999, Math.sin((lat * Math.PI) / 180)));
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return { x, y, scale };
};

const worldToPoint = (x: number, y: number, scale: number): LatLng => {
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return roundPoint(lat, lng);
};

const mapTiles = (lat: number, lng: number, width: number, height: number, zoom: number, buffer: number) => {
  if (width < 1 || height < 1) return [];
  const { x: centerX, y: centerY } = project(lat, lng, zoom);
  const left = centerX - width / 2 - buffer;
  const top = centerY - height / 2 - buffer;
  const n = 2 ** zoom;
  const x0 = Math.floor(left / TILE_SIZE);
  const y0 = Math.floor(top / TILE_SIZE);
  const x1 = Math.floor((left + width + buffer * 2 - 1) / TILE_SIZE);
  const y1 = Math.floor((top + height + buffer * 2 - 1) / TILE_SIZE);
  const tiles: { key: string; src: string; left: number; top: number }[] = [];
  for (let tileX = x0; tileX <= x1; tileX += 1) {
    const wrappedX = ((tileX % n) + n) % n;
    for (let tileY = y0; tileY <= y1; tileY += 1) {
      if (tileY < 0 || tileY >= n) continue;
      tiles.push({
        key: `${zoom}-${tileX}-${tileY}`,
        src: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${tileY}.png`,
        left: tileX * TILE_SIZE - left - buffer,
        top: tileY * TILE_SIZE - top - buffer,
      });
    }
  }
  return tiles;
};

const useFrameSize = (ref: RefObject<HTMLDivElement | null>, active: boolean) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, active]);
  return size;
};

const MapTiles = ({
  lat,
  lng,
  zoom,
  width,
  height,
  buffer = 0,
}: {
  lat: number;
  lng: number;
  zoom: number;
  width: number;
  height: number;
  buffer?: number;
}) => (
  <>
    {mapTiles(lat, lng, width, height, zoom, buffer).map((tile) => (
      <img
        key={tile.key}
        src={tile.src}
        alt=""
        width={TILE_SIZE}
        height={TILE_SIZE}
        draggable={false}
        className="pointer-events-none absolute max-w-none select-none"
        style={{ left: tile.left, top: tile.top, width: TILE_SIZE, height: TILE_SIZE }}
      />
    ))}
  </>
);

const Pin = ({ left, top }: { left: number; top: number }) => (
  <MapPin
    className="pointer-events-none absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-full text-red-600"
    style={{
      left,
      top,
      filter: "drop-shadow(0 1px 1px white) drop-shadow(0 2px 2px rgba(0,0,0,.45))",
    }}
  />
);

const InteractiveMap = ({
  view,
  pin,
  zoom,
  onViewChange,
  onPinChange,
  onZoomChange,
}: {
  view: LatLng;
  pin: LatLng;
  zoom: number;
  onViewChange: (next: LatLng) => void;
  onPinChange: (next: LatLng) => void;
  onZoomChange: (zoom: number) => void;
}) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const frame = useFrameSize(frameRef, true);
  const gesture = useRef({
    pointers: new Map<number, { x: number; y: number }>(),
    dragId: null as number | null,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    moved: false,
    pinching: false,
    consumed: false,
    pinchStart: 1,
    pinchScale: 1,
  });

  const applyTransform = (x: number, y: number, scale = 1) => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  };

  useLayoutEffect(() => {
    const current = gesture.current;
    applyTransform(current.x, current.y, current.pinching ? current.pinchScale : 1);
  });

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      onZoomChange(clampZoom(zoom + (event.deltaY > 0 ? -1 : 1)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onZoomChange, zoom]);

  const pointFromClient = (clientX: number, clientY: number) => {
    const el = frameRef.current;
    if (!el) return view;
    const rect = el.getBoundingClientRect();
    const origin = project(view.lat, view.lng, zoom);
    const x = origin.x + (clientX - rect.left - el.clientLeft - el.clientWidth / 2);
    const y = origin.y + (clientY - rect.top - el.clientTop - el.clientHeight / 2);
    return worldToPoint(x, y, origin.scale);
  };

  const commitZoom = () => {
    const current = gesture.current;
    const next = clampZoom(zoom + Math.round(Math.log2(current.pinchScale)));
    current.pinchScale = 1;
    current.x = 0;
    current.y = 0;
    if (next !== zoom) onZoomChange(next);
    else applyTransform(0, 0, 1);
  };

  const origin = project(view.lat, view.lng, zoom);
  const marker = project(pin.lat, pin.lng, zoom);

  return (
    <div
      ref={frameRef}
      role="application"
      aria-label="Carte"
      tabIndex={0}
      className="absolute inset-0 cursor-grab touch-none select-none overflow-hidden bg-[#d5d0c8] active:cursor-grabbing"
      onContextMenu={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        const current = gesture.current;
        current.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        event.currentTarget.setPointerCapture(event.pointerId);
        if (current.pointers.size >= 2) {
          const [a, b] = [...current.pointers.values()];
          current.pinching = true;
          current.moved = true;
          current.x = 0;
          current.y = 0;
          current.pinchStart = Math.hypot(a.x - b.x, a.y - b.y) || 1;
          current.pinchScale = 1;
          return;
        }
        current.dragId = event.pointerId;
        current.startX = event.clientX;
        current.startY = event.clientY;
        current.x = 0;
        current.y = 0;
        current.moved = false;
      }}
      onPointerMove={(event) => {
        const current = gesture.current;
        if (!current.pointers.has(event.pointerId)) return;
        current.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (current.pinching && current.pointers.size >= 2) {
          const [a, b] = [...current.pointers.values()];
          current.pinchScale = Math.hypot(a.x - b.x, a.y - b.y) / current.pinchStart;
          applyTransform(0, 0, current.pinchScale);
          return;
        }
        if (current.dragId !== event.pointerId || current.pinching) return;
        current.x = event.clientX - current.startX;
        current.y = event.clientY - current.startY;
        if (Math.hypot(current.x, current.y) > DRAG_THRESHOLD) current.moved = true;
        applyTransform(current.x, current.y, 1);
      }}
      onPointerUp={(event) => {
        const current = gesture.current;
        current.pointers.delete(event.pointerId);
        if (current.pinching && current.pointers.size < 2) {
          commitZoom();
          current.pinching = false;
          current.consumed = true;
          current.moved = true;
          current.dragId = null;
          return;
        }
        if (current.pointers.size > 0) return;
        const consumed = current.consumed;
        const moved = current.moved;
        const dx = current.x;
        const dy = current.y;
        current.consumed = false;
        current.moved = false;
        current.dragId = null;
        current.x = 0;
        current.y = 0;
        if (consumed || !moved) applyTransform(0, 0, 1);
        if (consumed) return;
        if (!moved) {
          onPinChange(pointFromClient(event.clientX, event.clientY));
          return;
        }
        onViewChange(worldToPoint(origin.x - dx, origin.y - dy, origin.scale));
      }}
      onPointerCancel={(event) => {
        const current = gesture.current;
        current.pointers.delete(event.pointerId);
        current.pinching = false;
        current.consumed = false;
        current.moved = false;
        current.dragId = null;
        current.x = 0;
        current.y = 0;
        current.pinchScale = 1;
        applyTransform(0, 0, 1);
      }}
    >
      <div ref={layerRef} className="absolute inset-0 will-change-transform" style={{ transformOrigin: "center center" }}>
        <MapTiles lat={view.lat} lng={view.lng} zoom={zoom} width={frame.width} height={frame.height} buffer={TILE_SIZE} />
        <Pin left={frame.width / 2 + (marker.x - origin.x)} top={frame.height / 2 + (marker.y - origin.y)} />
      </div>
      <div className="absolute right-3 top-3 z-20 flex flex-col overflow-hidden rounded-md border border-black/10 bg-white shadow">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-muted"
          aria-label="Zoom avant"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onZoomChange(clampZoom(zoom + 1))}
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center border-t border-border text-foreground hover:bg-muted"
          aria-label="Zoom arrière"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onZoomChange(clampZoom(zoom - 1))}
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-2 right-2 z-20 rounded bg-white/85 px-1.5 py-0.5 text-[10px] text-black/70"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        © OpenStreetMap
      </a>
    </div>
  );
};

const MapsLinkField = ({
  value,
  onValue,
}: {
  value: string;
  onValue: (value: string, announce: boolean) => void;
}) => (
  <div>
    <Label className="mb-1 block">Lien Google Maps</Label>
    <Input
      value={value}
      placeholder="Collez un lien Google Maps"
      onChange={(event) => onValue(event.target.value, false)}
      onBlur={() => onValue(value, true)}
      onPaste={(event) => {
        const text = event.clipboardData.getData("text");
        if (!text.trim()) return;
        event.preventDefault();
        onValue(text, true);
      }}
    />
  </div>
);

const LocationPicker = ({
  lat,
  lng,
  onChange,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const preview = useFrameSize(previewRef, true);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(16);
  const [view, setView] = useState<LatLng>({ lat, lng });
  const [pin, setPin] = useState<LatLng>({ lat, lng });
  const [mapsUrl, setMapsUrl] = useState("");
  const announced = useRef("");
  const skipViewSync = useRef(false);
  const geoAbort = useRef<AbortController | null>(null);
  const shortLinkTicket = useRef(0);

  useEffect(() => {
    setPin({ lat, lng });
    if (skipViewSync.current) {
      skipViewSync.current = false;
      return;
    }
    setView({ lat, lng });
  }, [lat, lng]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const placePin = (next: LatLng) => {
    setPin(next);
    if (next.lat === lat && next.lng === lng) return;
    skipViewSync.current = true;
    onChange(next.lat, next.lng);
  };

  const applyLink = (value: string, announce: boolean) => {
    setMapsUrl(value);
    const trimmed = value.trim();
    if (!trimmed) return;
    const point = parseMapLink(trimmed);
    if (point) {
      geoAbort.current?.abort();
      shortLinkTicket.current += 1;
      announced.current = trimmed;
      setZoom(17);
      onChange(point.lat, point.lng);
      return;
    }
    if (!announce || announced.current === trimmed) return;
    announced.current = trimmed;
    if (!/^https?:/i.test(trimmed)) {
      toast({ title: "Position non reconnue", description: "Collez un lien Google Maps ou des coordonnées, par exemple 30.42, -9.59." });
      return;
    }
    if (isShortMapsLink(trimmed)) {
      const ticket = ++shortLinkTicket.current;
      void resolveShortMapLink(trimmed).then((point) => {
        if (ticket !== shortLinkTicket.current) return;
        if (!point) {
          announced.current = "";
          toast({
            title: "Lien trop court",
            description: "Impossible de lire les coordonnées de ce lien.",
          });
          return;
        }
        setZoom(17);
        onChange(point.lat, point.lng);
      });
      return;
    }
    const query = mapLinkPlaceQuery(trimmed);
    if (!query) {
      toast({ title: "Lien non reconnu", description: "Ce lien Google Maps ne contient pas de coordonnées." });
      return;
    }
    geoAbort.current?.abort();
    shortLinkTicket.current += 1;
    const controller = new AbortController();
    geoAbort.current = controller;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data) => {
        const found = data?.[0];
        if (!found) {
          toast({ title: "Position introuvable", description: "Aucune coordonnée pour ce lien." });
          return;
        }
        setZoom(16);
        onChange(Number(found.lat), Number(found.lon));
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        toast({ title: "Position introuvable", description: "Impossible de lire ce lien pour le moment." });
      });
  };

  return (
    <div className="min-w-0 space-y-2">
      <p className="text-sm text-muted-foreground">Cliquez sur la carte pour l'agrandir et placer le bien.</p>
      <div
        ref={previewRef}
        role="button"
        tabIndex={0}
        className="relative block h-48 w-full cursor-pointer overflow-hidden rounded-lg border border-border bg-[#d5d0c8]"
        onClick={() => {
          setView({ lat, lng });
          setPin({ lat, lng });
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setView({ lat, lng });
            setPin({ lat, lng });
            setOpen(true);
          }
        }}
      >
        <MapTiles lat={lat} lng={lng} zoom={PREVIEW_ZOOM} width={preview.width} height={preview.height} />
        <Pin left={preview.width / 2} top={preview.height / 2} />
        <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
          <Maximize2 className="h-3 w-3" />
          Agrandir
        </span>
        <span className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
          <MapPin className="h-3 w-3" />
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </div>
      <MapsLinkField value={mapsUrl} onValue={applyLink} />
      <Button
        type="button"
        className="bg-[#174f43] text-white hover:bg-[#123d34]"
        onClick={() => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition(
            (pos) => onChange(pos.coords.latitude, pos.coords.longitude),
            () => toast({ title: "Localisation", description: "Impossible d'obtenir votre position." })
          );
        }}
      >
        Utiliser ma position
      </Button>
      {open
        ? createPortal(
            <div className="fixed inset-0 z-[240] flex flex-col bg-background" role="dialog" aria-modal="true" aria-label="Placer le bien">
              <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center border-b border-border px-3 py-3">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
                  aria-label="Fermer"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="truncate text-center text-base font-bold">Placer le bien</h2>
                <span />
              </div>
              <div className="space-y-2 px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Maintenez et glissez pour déplacer la carte, puis cliquez sur l'endroit du bien.
                </p>
                <MapsLinkField value={mapsUrl} onValue={applyLink} />
              </div>
              <div className="relative min-h-0 flex-1">
                <InteractiveMap
                  view={view}
                  pin={pin}
                  zoom={zoom}
                  onViewChange={setView}
                  onPinChange={placePin}
                  onZoomChange={setZoom}
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
                </span>
                <Button type="button" className="bg-[#174f43] text-white hover:bg-[#123d34]" onClick={() => setOpen(false)}>
                  Valider la position
                </Button>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
};

const PropertyListingWizard = ({
  onCancel,
  onComplete,
  submitLabel = "Créer mon service",
  stepTitle = "Créer service",
}: PropertyListingWizardProps) => {
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<PropertyDetails>(emptyPropertyDetails);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const update = (patch: Partial<PropertyDetails>) => {
    setStepError(null);
    setDetails((prev) => ({ ...prev, ...patch }));
  };

  const toggleFeature = (id: string) => {
    const next = details.features.includes(id)
      ? details.features.filter((item) => item !== id)
      : [...details.features, id];
    update({
      features: next,
      parkingPlaces: id === "garage" && next.includes("garage") && !details.parkingPlaces ? "1" : details.parkingPlaces,
    });
  };

  const addPhotos = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list);
    setFiles((prev) => [...prev, ...next]);
    next.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviews((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (current: number) => {
    if (current === 1) {
      if (!details.category || !details.propertyKind || !details.condition) {
        return "Choisissez la catégorie, le type de bien et l'état.";
      }
      if (!details.region || !details.city.trim()) {
        return "Indiquez la région et la ville.";
      }
    }
    if (current === 2) {
      if (!details.builtSurface.trim()) {
        return "Indiquez la surface construite.";
      }
    }
    if (current === 3 && files.length === 0) {
      return "Ajoutez au moins une photo.";
    }
    if (current === 4) {
      if (!details.title.trim() || details.title.length > 50) {
        return "Titre requis (50 caractères max).";
      }
      if (!details.description.trim() || details.description.length > 5000) {
        return "Description requise (5000 caractères max).";
      }
      if (!details.priceDh.trim()) {
        return "Indiquez le prix en DH.";
      }
      const phone = details.phones[0]?.trim() || "";
      if (!isCompletePhone(phone)) {
        return "Entrez un numéro de téléphone valide pour l'indicatif choisi.";
      }
    }
    return null;
  };

  const goNext = (event?: MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    const error = validateStep(step);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handleSubmit = async (event?: MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    const error = validateStep(4);
    if (error || saving) {
      if (error) setStepError(error);
      return;
    }
    setSaving(true);
    try {
      await onComplete({
        details: {
          ...details,
          phones: details.phones.map((phone) => phone.trim()).filter(Boolean),
        },
        files,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col bg-card">
      <div className="shrink-0">
        <h3 className="text-lg font-semibold text-card-foreground">{stepTitle}: Étape {step}</h3>
        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                if (n < step) {
                  setStepError(null);
                  setStep(n);
                  return;
                }
                if (n === step + 1) goNext();
              }}
              className={`h-8 w-8 rounded-full text-sm font-bold ${
                n === step
                  ? "bg-[#174f43] text-white"
                  : n < step
                    ? "bg-[#174f43]/20 text-[#174f43]"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="mt-4 space-y-3">
          <div>
            <Label className="mb-1 block">Catégorie *</Label>
            <ChoiceGrid options={LISTING_CATEGORIES} value={details.category} onChange={(category) => update({ category })} />
          </div>
          <div>
            <Label className="mb-1 block">Type de bien *</Label>
            <ChoiceGrid options={PROPERTY_KINDS} value={details.propertyKind} onChange={(propertyKind) => update({ propertyKind })} />
          </div>
          <div>
            <Label className="mb-1 block">État *</Label>
            <ChoiceGrid options={PROPERTY_CONDITIONS} value={details.condition} onChange={(condition) => update({ condition })} />
          </div>
          <div>
            <Label className="mb-1 block">Standing</Label>
            <ChoiceGrid options={PROPERTY_STANDINGS} value={details.standing} onChange={(standing) => update({ standing })} />
          </div>
          <div>
            <Label className="mb-1 block">Statut</Label>
            <ChoiceGrid options={PROPERTY_STATUSES} value={details.status} onChange={(status) => update({ status })} />
          </div>
          {details.status === "en_construction" && (
            <div>
              <Label className="mb-1 block">Livraison</Label>
              <Input value={details.delivery} onChange={(e) => update({ delivery: e.target.value })} placeholder="ex: Décembre 2027" />
            </div>
          )}
          <div>
            <Label className="mb-1 block">Région *</Label>
            <RegionSelect
              required
              value={details.region}
              onChange={(region) => {
                const nextCity = citiesForRegion(region).includes(details.city) ? details.city : "";
                update({ region, city: nextCity });
              }}
            />
          </div>
          <div>
            <Label className="mb-1 block">Ville *</Label>
            <CityPicker
              required
              region={details.region}
              value={details.city}
              onChange={(city) => update({ city })}
              placeholder="Ville"
            />
          </div>
          <div>
            <Label className="mb-1 block">Adresse</Label>
            <Input value={details.address} onChange={(e) => update({ address: e.target.value })} placeholder="Adresse" />
          </div>
          <div className="border-t border-border pt-4">
            <Label className="mb-2 block">Carte</Label>
            <LocationPicker
              lat={details.lat || 30.4278}
              lng={details.lng || -9.5981}
              onChange={(lat, lng) => update({ lat, lng })}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-4 space-y-6">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="mb-2 block">Surface construite *</Label>
              <Input value={details.builtSurface} onChange={(e) => update({ builtSurface: e.target.value })} placeholder="m²" />
            </div>
            <div>
              <Label className="mb-2 block">Surface de la parcelle</Label>
              <Input value={details.plotSurface} onChange={(e) => update({ plotSurface: e.target.value })} placeholder="m²" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="mb-2 block">Années</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={details.age} onChange={(e) => update({ age: e.target.value })}>
                <option value="">Sélectionnez</option>
                {AGE_OPTIONS.map((age) => <option key={age} value={age}>{age}</option>)}
              </select>
            </div>
            <div>
              <Label className="mb-2 block">Type du sol</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={details.flooring} onChange={(e) => update({ flooring: e.target.value })}>
                <option value="">Sélectionnez</option>
                {FLOORING_OPTIONS.map((floor) => <option key={floor} value={floor}>{floor}</option>)}
              </select>
            </div>
            <div>
              <Label className="mb-2 block">Nombre d'étages</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={details.floors} onChange={(e) => update({ floors: e.target.value })}>
                <option value="">Sélectionnez</option>
                {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={String(n)}>{n}</option>)}
              </select>
            </div>
            <div>
              <Label className="mb-2 block">Orientation</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={details.orientation} onChange={(e) => update({ orientation: e.target.value })}>
                <option value="">Sélectionnez</option>
                {ORIENTATIONS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="mb-2 block">Pièces *</Label>
              <Input type="number" min={0} value={details.pieces} onChange={(e) => update({ pieces: Number(e.target.value) || 0 })} />
            </div>
            <div>
              <Label className="mb-2 block">Chambres *</Label>
              <Input type="number" min={0} value={details.beds} onChange={(e) => update({ beds: Number(e.target.value) || 0 })} />
            </div>
            <div>
              <Label className="mb-2 block">Salles de bains *</Label>
              <Input type="number" min={0} value={details.baths} onChange={(e) => update({ baths: Number(e.target.value) || 0 })} />
            </div>
          </div>
          {FEATURE_GROUPS.map((group) => (
            <div key={group.title} className="pt-2">
              <p className="mb-6 text-base font-semibold text-card-foreground">{group.title}</p>
              <FeatureAmenityGrid
                items={group.items}
                selected={details.features}
                onToggle={toggleFeature}
                extras={{
                  jardin: (
                    <div className="text-left">
                      <Label className="mb-1 block text-xs">Surface: <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <Input value={details.gardenSurface} onChange={(e) => update({ gardenSurface: e.target.value })} className="pr-8" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">m²</span>
                      </div>
                    </div>
                  ),
                  terrasse: (
                    <div className="text-left">
                      <Label className="mb-1 block text-xs">Surface: <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <Input value={details.terraceSurface} onChange={(e) => update({ terraceSurface: e.target.value })} className="pr-8" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">m²</span>
                      </div>
                    </div>
                  ),
                  garage: (
                    <div className="text-left">
                      <Label className="mb-1 block text-xs">Places: <span className="text-destructive">*</span></Label>
                      <div className="flex h-10 items-center overflow-hidden rounded-md border border-input">
                        <button
                          type="button"
                          className="h-full w-8 text-lg"
                          onClick={() => update({ parkingPlaces: String(Math.max(1, Number(details.parkingPlaces || 1) - 1)) })}
                        >
                          –
                        </button>
                        <input
                          className="h-full w-full bg-transparent text-center text-sm outline-none"
                          value={details.parkingPlaces}
                          onChange={(e) => update({ parkingPlaces: e.target.value })}
                        />
                        <button
                          type="button"
                          className="h-full w-8 text-lg"
                          onClick={() => update({ parkingPlaces: String(Math.min(100, Number(details.parkingPlaces || 1) + 1)) })}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ),
                }}
              />
            </div>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">Téléchargez des photos. La première est la photo principale.</p>
          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {previews.map((src, index) => (
                <div key={`${src}-${index}`} className="relative">
                  <img src={src} alt="" className="h-32 w-full rounded-lg object-cover" />
                  {index === 0 && (
                    <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-white">Principale</span>
                  )}
                  <button type="button" onClick={() => removePhoto(index)} className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <Plus className="h-4 w-4" />
            {previews.length ? "Ajouter" : "Télécharger des photos"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(e.target.files)} />
          </label>
        </div>
      )}

      {step === 4 && (
        <div className="mt-4 space-y-3">
          <div>
            <Label className="mb-2 block">Titre * (50 caractères max.)</Label>
            <Input maxLength={50} value={details.title} onChange={(e) => update({ title: e.target.value })} />
            <p className="mt-1 text-xs text-muted-foreground">{details.title.length}/50</p>
          </div>
          <div>
            <Label className="mb-2 block">Description * (5000 caractères max.)</Label>
            <Textarea maxLength={5000} rows={6} value={details.description} onChange={(e) => update({ description: e.target.value })} />
            <p className="mt-1 text-xs text-muted-foreground">{details.description.length}/5000</p>
          </div>
          {details.phones.map((phone, index) => (
            <div key={`phone-${index}`}>
              <Label className="mb-2 block">Téléphone {index === 0 ? "*" : ""}</Label>
              <div className="flex gap-2">
                <PhoneInput
                  className="min-w-0 flex-1"
                  value={phone}
                  onChange={(next) => {
                    const phones = [...details.phones];
                    phones[index] = next;
                    update({ phones });
                  }}
                />
                {index > 0 && (
                  <Button type="button" variant="outline" onClick={() => update({ phones: details.phones.filter((_, i) => i !== index) })}>
                    Retirer
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => update({ phones: [...details.phones, ""] })}>
            + Ajouter un autre téléphone
          </Button>
          <div>
            <Label className="mb-2 block">Prix *</Label>
            <div className="flex items-center gap-2">
              <Input value={details.priceDh} onChange={(e) => update({ priceDh: e.target.value })} placeholder="858000" />
              <span className="font-semibold">DH</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex shrink-0 items-center justify-between gap-3 pt-4">
        <Button type="button" variant="outline" onClick={step === 1 ? onCancel : () => setStep((prev) => prev - 1)}>
          {step === 1 ? "Annuler" : "Retour"}
        </Button>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
          {stepError ? <p className="text-right text-sm text-destructive">{stepError}</p> : null}
          {step < 4 ? (
            <Button type="button" className="bg-[#174f43] text-white hover:bg-[#123d34]" onClick={goNext}>
              Vers étape {step + 1}
            </Button>
          ) : (
            <Button
              type="button"
              className="bg-[#174f43] text-white hover:bg-[#123d34]"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Publication..." : submitLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyListingWizard;
