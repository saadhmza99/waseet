import { useState, type MouseEvent } from "react";
import { MapPin, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import FeatureAmenityGrid from "@/components/FeatureAmenityGrid";
import {
  AGE_OPTIONS,
  emptyPropertyDetails,
  FEATURE_GROUPS,
  FLOORING_OPTIONS,
  isValidMoroccoPhone,
  LISTING_CATEGORIES,
  MOROCCO_REGIONS,
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
}

const ChoiceGrid = ({
  options,
  value,
  onChange,
}: {
  options: readonly { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((option) => (
      <button
        key={option.id}
        type="button"
        onClick={() => onChange(option.id)}
        className={`rounded-full border px-3 py-1 text-xs sm:text-sm transition-colors ${
          value === option.id
            ? "border-accent bg-accent text-accent-foreground font-semibold"
            : "border-border text-card-foreground hover:border-accent/50"
        }`}
      >
        {option.label}
      </button>
    ))}
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
  const zoom = 14;
  const width = 640;
  const height = 280;
  const src = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=${lat},${lng},red-pushpin`;

  const unproject = (clientX: number, clientY: number, rect: DOMRect) => {
    const scale = 256 * 2 ** zoom;
    const worldX = ((lng + 180) / 360) * scale;
    const sinLat = Math.sin((lat * Math.PI) / 180);
    const worldY = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
    const dx = ((clientX - rect.left) / rect.width - 0.5) * width;
    const dy = ((clientY - rect.top) / rect.height - 0.5) * height;
    const x = worldX + dx;
    const y = worldY + dy;
    const nextLng = (x / scale) * 360 - 180;
    const n = Math.PI - (2 * Math.PI * y) / scale;
    const nextLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    onChange(Number(nextLat.toFixed(6)), Number(nextLng.toFixed(6)));
  };

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Cliquez sur la carte pour placer le bien.
      </p>
      <button
        type="button"
        className="relative block w-full overflow-hidden rounded-lg border border-border"
        onClick={(e) => unproject(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())}
      >
          <img src={src} alt="Carte" className="h-full max-h-[420px] w-full object-cover" />
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
          <MapPin className="h-3 w-3" />
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </button>
      <Button
        type="button"
        variant="outline"
        className="mt-2"
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
    </div>
  );
};

const PropertyListingWizard = ({
  onCancel,
  onComplete,
  submitLabel = "Créer mon service",
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
      if (!isValidMoroccoPhone(phone)) {
        return "Entrez un numéro marocain valide.";
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card p-4 sm:p-6">
      <div className="shrink-0">
        <h3 className="text-lg font-semibold text-card-foreground">Créer service: Étape {step}</h3>
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
                n === step ? "bg-accent text-accent-foreground" : n < step ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="mt-4 grid min-h-0 flex-1 grid-cols-2 gap-6 overflow-hidden">
          <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
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
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={details.region}
                onChange={(e) => update({ region: e.target.value })}
              >
                <option value="">Sélectionnez</option>
                {MOROCCO_REGIONS.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-1 block">Ville *</Label>
              <Input value={details.city} onChange={(e) => update({ city: e.target.value })} placeholder="Ville" />
            </div>
            <div>
              <Label className="mb-1 block">Adresse</Label>
              <Input value={details.address} onChange={(e) => update({ address: e.target.value })} placeholder="Adresse" />
            </div>
          </div>
          <LocationPicker
            lat={details.lat || 30.4278}
            lng={details.lng || -9.5981}
            onChange={(lat, lng) => update({ lat, lng })}
          />
        </div>
      )}

      {step === 2 && (
        <div className="mt-4 min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
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
        <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-hidden">
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
        <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-hidden">
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
                <Input
                  value={phone}
                  onChange={(e) => {
                    const phones = [...details.phones];
                    phones[index] = e.target.value;
                    update({ phones });
                  }}
                  placeholder="06xxxxxxxx"
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
            <Button type="button" onClick={goNext}>Vers étape {step + 1}</Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={saving}>
              {saving ? "Publication..." : submitLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyListingWizard;
