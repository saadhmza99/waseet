import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { AlignLeft, ArrowLeft, Image as ImageIcon, MapPin, Plus, Trash2, Type, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { listingService } from "@/services/listingService";
import { storageService } from "@/services/storageService";
import { RegionSelect } from "@/components/CityPicker";
import { allMoroccoCities } from "@/lib/moroccoPlaces";
import {
  SERVICE_AUDIENCES,
  SERVICE_CATEGORIES,
  SERVICE_KINDS,
  clearServiceDraft,
  emptyOffer,
  loadServiceDraft,
  offerIsReady,
  priceLabel,
  saveServiceDraft,
  sanitizeOffer,
  zoneLabel,
  type ServiceOffer,
} from "@/lib/serviceOffer";

const STEPS = ["Service", "Détails", "Zone", "Public", "Aperçu"];

const fieldClass =
  "h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-[#174f43]";

const Label = ({ icon: Icon, children, optional }: { icon?: typeof Type; children: string; optional?: boolean }) => (
  <span className="mb-1 flex items-center gap-1.5 text-sm font-medium">
    {Icon ? <Icon className="h-3.5 w-3.5 text-[#174f43]" /> : null}
    {children}
    {optional ? <span className="font-normal text-neutral-400">Optionnel</span> : null}
  </span>
);

const YesNo = ({ value, onChange }: { value: boolean; onChange: (next: boolean) => void }) => (
  <div className="grid grid-cols-2 gap-2">
    {[{ label: "Oui", on: true }, { label: "Non", on: false }].map((item) => (
      <button
        key={item.label}
        type="button"
        onClick={() => onChange(item.on)}
        className={`h-11 rounded-lg border text-sm font-medium ${value === item.on ? "border-[#174f43] bg-[#174f43]/5 text-[#174f43]" : "border-neutral-200 text-neutral-700"}`}
      >
        {item.label}
      </button>
    ))}
  </div>
);

const CreateServiceForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [offer, setOffer] = useState<ServiceOffer>(emptyOffer);
  const draftLoaded = useRef(false);

  useEffect(() => {
    if (!user || draftLoaded.current) return;
    draftLoaded.current = true;
    const draft = loadServiceDraft(user.id);
    if (draft && (draft.title || draft.description || draft.category)) setOffer(draft);
  }, [user]);

  const patch = (partial: Partial<ServiceOffer>) => setOffer((current) => ({ ...current, ...partial }));
  const cities = useMemo(() => {
    const needle = cityQuery.trim().toLowerCase();
    return allMoroccoCities().filter((city) => !offer.cities.includes(city) && (!needle || city.toLowerCase().includes(needle))).slice(0, 8);
  }, [cityQuery, offer.cities]);

  const uploadImages = async (files: File[]) => {
    const accepted = files.filter((file) => file.type.startsWith("image/") && file.size <= 4_000_000);
    if (accepted.length !== files.length) {
      toast({ title: "Image", description: "Chaque image doit faire 4 Mo maximum." });
    }
    if (!accepted.length) return [];
    return storageService.uploadImages(accepted, "services");
  };

  const requireAccount = () => {
    if (user) return true;
    toast({ title: "Connexion requise", description: "Un compte professionnel est nécessaire pour publier un service." });
    navigate("/login");
    return false;
  };

  const saveDraft = () => {
    if (!requireAccount() || !user) return;
    saveServiceDraft(user.id, offer);
    toast({ title: "Brouillon enregistré" });
  };

  const publish = async () => {
    if (!requireAccount() || !user) return;
    const clean = sanitizeOffer(offer);
    if (!offerIsReady(clean)) {
      toast({ title: "Informations manquantes", description: "Le titre, la catégorie, la description et la zone sont requis." });
      setStep(clean.title && clean.category && clean.description ? 2 : 0);
      return;
    }
    setSaving(true);
    try {
      const images = [clean.cover, ...clean.gallery.filter((url) => url !== clean.cover)].filter(Boolean);
      await listingService.createListing(user.id, {
        title: clean.title,
        description: clean.description,
        profession: clean.category,
        location: zoneLabel(clean),
        price_range: priceLabel(clean),
        image_url: images[0] || "",
        image_count: images.length,
        images,
        property_details: { service: clean },
      });
      clearServiceDraft(user.id);
      toast({ title: "Service publié" });
      navigate("/profile?tab=services");
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de publier ce service." });
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (step === 0 && (!offer.title.trim() || !offer.category || !offer.description.trim())) {
      toast({ title: "Informations manquantes", description: "Le titre, la catégorie et la description sont requis." });
      return;
    }
    if (step === 2 && !zoneLabel(offer).trim()) {
      toast({ title: "Zone requise", description: "Indiquez les villes, une région, ou le Maroc." });
      return;
    }
    setStep((current) => Math.min(STEPS.length - 1, current + 1));
  };

  return createPortal(
    <div className="fixed inset-0 z-[220] flex flex-col bg-[#f6f7f4] text-neutral-900">
      <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center border-b border-neutral-200 bg-white px-3 py-3">
        <button type="button" onClick={() => navigate(-1)} className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100" aria-label="Retour">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="truncate text-center text-base font-bold">Créer un service</h1>
        <span />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-5">
          <p className="text-sm text-neutral-500">Présentez une prestation telle qu'elle apparaîtra sur Sifarah.</p>
          <ol className="mt-4 grid grid-cols-5 gap-1">
            {STEPS.map((label, index) => (
              <li key={label}>
                <button type="button" onClick={() => setStep(index)} className={`w-full rounded-lg px-1 py-2 text-left text-[11px] font-semibold leading-tight ${index === step ? "bg-white text-[#174f43] ring-1 ring-[#174f43]" : "text-neutral-400"}`}>
                  <span className="block text-[10px]">{String(index + 1).padStart(2, "0")}</span>
                  {label}
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
            {step === 0 ? (
              <div className="space-y-4">
                <label className="block">
                  <Label icon={Type}>Titre du service</Label>
                  <input className={fieldClass} maxLength={120} placeholder="Ex. Gestion locative complète" value={offer.title} onChange={(event) => patch({ title: event.target.value })} />
                </label>
                <label className="block">
                  <Label>Catégorie</Label>
                  <select className={fieldClass} value={offer.category} onChange={(event) => patch({ category: event.target.value })}>
                    <option value="">Choisir</option>
                    {SERVICE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="block">
                  <Label icon={AlignLeft}>Description</Label>
                  <textarea className={`${fieldClass} h-36 py-2`} maxLength={4000} placeholder="Décrivez votre service, ce qu'il comprend et la valeur apportée au client..." value={offer.description} onChange={(event) => patch({ description: event.target.value })} />
                </label>
                <div>
                  <Label icon={ImageIcon} optional>Image de couverture</Label>
                  {offer.cover ? (
                    <div className="relative">
                      <img src={offer.cover} alt="" className="h-48 w-full rounded-lg object-cover" />
                      <div className="mt-2 flex gap-2">
                        <label className="cursor-pointer text-xs font-semibold text-[#174f43]">
                          Remplacer
                          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            const [url] = await uploadImages([file]);
                            if (url) patch({ cover: url });
                          }} />
                        </label>
                        <button type="button" className="text-xs font-semibold text-neutral-500" onClick={() => patch({ cover: "" })}>Retirer</button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex h-32 cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-300 text-sm text-neutral-500">
                      Ajouter une image
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const [url] = await uploadImages([file]);
                        if (url) patch({ cover: url });
                      }} />
                    </label>
                  )}
                </div>
                <div>
                  <Label optional>Galerie</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {offer.gallery.map((url) => (
                      <div key={url} className="relative">
                        <img src={url} alt="" className="h-24 w-full rounded-lg object-cover" />
                        <button type="button" aria-label="Retirer" className="absolute right-1 top-1 rounded-full bg-white p-0.5" onClick={() => patch({ gallery: offer.gallery.filter((item) => item !== url) })}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <label className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-500">
                      Ajouter
                      <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={async (event) => {
                        const urls = await uploadImages([...(event.target.files || [])]);
                        if (urls.length) patch({ gallery: [...offer.gallery, ...urls].slice(0, 12) });
                      }} />
                    </label>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-5">
                <div>
                  <Label optional>Type de service</Label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_KINDS.map((kind) => {
                      const active = offer.kinds.includes(kind);
                      return (
                        <button key={kind} type="button" onClick={() => patch({ kinds: active ? offer.kinds.filter((item) => item !== kind) : [...offer.kinds, kind] })} className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${active ? "border-[#174f43] bg-[#174f43] text-white" : "border-neutral-200"}`}>
                          {kind}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <LineList label="Ce qui est inclus" optional addLabel="Ajouter une prestation" items={offer.included} onChange={(included) => patch({ included })} />
                <LineList label="Options et prestations complémentaires" optional addLabel="Ajouter une option" items={offer.options} onChange={(options) => patch({ options })} />
                <div>
                  <Label optional>Mode de tarification</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ id: "devis", label: "Sur devis" }, { id: "from", label: "À partir de" }, { id: "fixed", label: "Tarif fixe" }].map((item) => (
                      <button key={item.id} type="button" onClick={() => patch({ priceMode: item.id as ServiceOffer["priceMode"], amount: item.id === "devis" ? "" : offer.amount })} className={`h-11 rounded-lg border px-2 text-xs font-medium ${offer.priceMode === item.id ? "border-[#174f43] bg-[#174f43]/5 text-[#174f43]" : "border-neutral-200"}`}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                  {offer.priceMode !== "devis" ? (
                    <label className="mt-3 block text-sm">
                      <span className="mb-1 block font-medium">Montant</span>
                      <span className="flex items-center gap-2">
                        <input className={fieldClass} inputMode="numeric" maxLength={16} placeholder="12 000" value={offer.amount} onChange={(event) => patch({ amount: event.target.value })} />
                        <span className="text-sm font-medium text-neutral-500">MAD</span>
                      </span>
                    </label>
                  ) : null}
                </div>
                <label className="block">
                  <Label optional>Durée estimée</Label>
                  <input className={fieldClass} maxLength={60} placeholder="1 journée, 2 semaines, 1 à 3 mois, selon le projet" value={offer.duration} onChange={(event) => patch({ duration: event.target.value })} />
                </label>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-5">
                <div>
                  <Label icon={MapPin}>Zone d'intervention</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ id: "villes", label: "Villes" }, { id: "region", label: "Région" }, { id: "maroc", label: "Maroc" }].map((item) => (
                      <button key={item.id} type="button" onClick={() => patch({ zoneMode: item.id as ServiceOffer["zoneMode"] })} className={`h-11 rounded-lg border text-sm font-medium ${offer.zoneMode === item.id ? "border-[#174f43] bg-[#174f43]/5 text-[#174f43]" : "border-neutral-200"}`}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                  {offer.zoneMode === "villes" ? (
                    <div className="mt-3">
                      <input className={fieldClass} placeholder="Rechercher une ville" value={cityQuery} onChange={(event) => setCityQuery(event.target.value)} />
                      {cityQuery.trim() && cities.length ? (
                        <ul className="mt-1 overflow-hidden rounded-lg border border-neutral-200">
                          {cities.map((city) => (
                            <li key={city}>
                              <button type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50" onClick={() => { patch({ cities: [...offer.cities, city].slice(0, 12) }); setCityQuery(""); }}>
                                {city}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {offer.cities.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {offer.cities.map((city) => (
                            <button key={city} type="button" onClick={() => patch({ cities: offer.cities.filter((item) => item !== city) })} className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs">
                              {city}
                              <X className="h-3 w-3" />
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {offer.zoneMode === "region" ? <div className="mt-3"><RegionSelect value={offer.region} onChange={(region) => patch({ region })} /></div> : null}
                  {offer.zoneMode === "maroc" ? <p className="mt-3 text-sm text-neutral-600">Le service est proposé sur l'ensemble du Maroc.</p> : null}
                </div>
                <div>
                  <Label optional>Déplacement possible</Label>
                  <YesNo value={offer.travel} onChange={(travel) => patch({ travel })} />
                </div>
                <div>
                  <Label optional>Service à distance</Label>
                  <YesNo value={offer.remote} onChange={(remote) => patch({ remote })} />
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div>
                <Label optional>Ce service s'adresse à</Label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_AUDIENCES.map((item) => {
                    const active = offer.audiences.includes(item);
                    return (
                      <button key={item} type="button" onClick={() => patch({ audiences: active ? offer.audiences.filter((row) => row !== item) : [...offer.audiences, item] })} className={`rounded-md border px-3 py-2 text-sm ${active ? "border-[#174f43] bg-[#174f43] text-white" : "border-neutral-200"}`}>
                        {item === "Autres" ? "+ Autre" : item}
                      </button>
                    );
                  })}
                </div>
                {offer.audiences.includes("Autres") ? (
                  <input className={`${fieldClass} mt-3`} maxLength={80} placeholder="Précisez le public" value={offer.audienceOther} onChange={(event) => patch({ audienceOther: event.target.value })} />
                ) : null}
              </div>
            ) : null}

            {step === 4 ? (
              <ServicePreview offer={sanitizeOffer(offer)} />
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-neutral-200 bg-white px-4 py-3">
        <button type="button" onClick={saveDraft} className="h-11 rounded-lg px-3 text-sm font-semibold text-neutral-700">Enregistrer comme brouillon</button>
        {step < 4 ? (
          <button type="button" onClick={next} className="h-11 rounded-lg bg-[#174f43] px-5 text-sm font-semibold text-white">Suivant</button>
        ) : (
          <button type="button" disabled={saving} onClick={() => void publish()} className="h-11 rounded-lg bg-[#174f43] px-5 text-sm font-semibold text-white">Publier le service</button>
        )}
      </div>
    </div>,
    document.body,
  );
};

const LineList = ({ label, optional, addLabel, items, onChange }: { label: string; optional?: boolean; addLabel: string; items: string[]; onChange: (items: string[]) => void }) => (
  <div>
    <div className="mb-2 flex items-center justify-between">
      <Label optional={optional}>{label}</Label>
      <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-[#174f43]" onClick={() => onChange([...items, ""])}>
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </button>
    </div>
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input className={fieldClass} maxLength={120} value={item} placeholder="Prestation" onChange={(event) => onChange(items.map((row, i) => i === index ? event.target.value : row))} />
          <button type="button" aria-label="Retirer" className="inline-flex h-11 w-11 items-center justify-center text-neutral-400" onClick={() => onChange(items.filter((_, i) => i !== index))}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  </div>
);

const ServicePreview = ({ offer }: { offer: ServiceOffer }) => (
  <article className="space-y-4 text-sm">
    {offer.cover ? <img src={offer.cover} alt="" className="h-44 w-full rounded-lg object-cover" /> : null}
    {offer.category ? <p className="text-xs font-semibold text-[#174f43]">{offer.category}</p> : null}
    <h2 className="text-lg font-semibold">{offer.title || "Service sans titre"}</h2>
    <p className="whitespace-pre-wrap leading-relaxed text-neutral-700">{offer.description || "Aucune description."}</p>
    {offer.included.filter(Boolean).length ? (
      <div>
        <p className="font-semibold">Ce qui est inclus</p>
        <ul className="mt-1 list-disc pl-4 text-neutral-700">{offer.included.filter(Boolean).map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    ) : null}
    <p><span className="font-semibold">Où : </span>{zoneLabel(offer) || "Zone non renseignée"}</p>
    {offer.audiences.length ? <p><span className="font-semibold">Pour : </span>{[...offer.audiences.filter((item) => item !== "Autres"), offer.audienceOther].filter(Boolean).join(", ")}</p> : null}
    <p><span className="font-semibold">Tarif : </span>{priceLabel(offer)}{offer.duration ? ` · ${offer.duration}` : ""}</p>
    <p className="text-xs text-neutral-500">Le téléphone, l'email, WhatsApp et le site sont ceux du profil de l'entreprise.</p>
    {offerIsReady(offer) ? <p className="font-medium text-[#174f43]">Votre service est prêt à être publié.</p> : <p className="text-amber-700">Le titre, la catégorie, la description et la zone sont encore requis.</p>}
  </article>
);

export default CreateServiceForm;
