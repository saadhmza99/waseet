import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { AlignLeft, ArrowLeft, Building2, Calendar, ChevronDown, CircleDot, Image as ImageIcon, Layers, MapPin, Plus, Trash2, Type, type LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { catalogService } from "@/services/catalogService";
import { storageService } from "@/services/storageService";
import {
  DETAIL_SECTIONS,
  DOCUMENT_TYPES,
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  SUBTYPES,
  TEAM_ROLES,
  PHASE_STATUSES,
  categoryLabel,
  emptyDossier,
  newDocument,
  newPartner,
  newPhase,
  newTeamMember,
  newUpdate,
  phaseStatusLabel,
  rowFromDossier,
  type ProjectCategoryId,
  type ProjectDossier,
} from "@/lib/projectDossier";

const STEPS = ["Informations", "Détails", "Équipe", "Travaux & planning", "Médias & documents", "Vérification"];

const fieldClass =
  "h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-[#174f43]";

const FieldLabel = ({ icon: Icon, children, aside }: { icon?: LucideIcon; children: ReactNode; aside?: ReactNode }) => (
  <span className="mb-1 flex w-full items-center gap-1.5 font-medium">
    {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 text-[#174f43]" /> : null}
    <span>{children}</span>
    {aside ? <span className="ml-auto font-normal text-neutral-400">{aside}</span> : null}
  </span>
);

const CreateProjectWizard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [typeOpen, setTypeOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [dossier, setDossier] = useState<ProjectDossier>(emptyDossier());

  const setField = (key: string, value: string) =>
    setDossier((current) => ({ ...current, fields: { ...current.fields, [key]: value } }));

  const toggleChoice = (value: string) =>
    setDossier((current) => ({
      ...current,
      choices: current.choices.includes(value)
        ? current.choices.filter((item) => item !== value)
        : [...current.choices, value],
    }));

  const addMedia = (urls: string[], category: string) => {
    setImages((current) => [...current, ...urls.filter((url) => !current.includes(url))]);
    setDossier((current) => ({
      ...current,
      media: [
        ...current.media,
        ...urls.map((url) => ({ url, caption: "", category })),
      ],
    }));
  };

  const uploadLogo = async (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 2_000_000) {
      toast({ title: "Logo", description: "Choisissez une image de 2 Mo maximum." });
      return "";
    }
    return storageService.uploadImage(file, "projects");
  };

  const uploadCover = async (file: File) => {
    const url = await storageService.uploadImage(file, "projects");
    setImages((current) => [url, ...current.filter((item) => item !== url)]);
    setDossier((current) => ({
      ...current,
      media: [{ url, caption: "", category: "Réalisation" }, ...current.media.filter((item) => item.url !== url)],
    }));
  };

  const publish = async (draft: boolean) => {
    if (!user) {
      toast({ title: "Connexion requise", description: "Un compte professionnel est nécessaire pour publier un projet." });
      navigate("/login");
      return;
    }
    if (!title.trim() || !dossier.category) {
      toast({ title: "Informations manquantes", description: "Le type et le titre du projet sont requis." });
      setStep(0);
      return;
    }
    setSaving(true);
    try {
      const payload = rowFromDossier(title.trim(), description.trim(), city.trim(), region.trim(), images, {
        ...dossier,
        fields: { ...dossier.fields, draft: draft ? "1" : "" },
      });
      const row = await catalogService.createProject(user.id, payload);
      toast({ title: draft ? "Brouillon enregistré" : "Projet publié" });
      navigate(`/projet/${row.id}`);
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer le projet." });
    } finally {
      setSaving(false);
    }
  };

  const sections = dossier.category ? DETAIL_SECTIONS[dossier.category] : [];

  return createPortal(
    <div className="fixed inset-0 z-[220] flex flex-col bg-[#f6f7f4] text-neutral-900">
      <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center border-b border-neutral-200 bg-white px-3 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-900 hover:bg-neutral-100"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="truncate text-center text-base font-bold text-neutral-950">Créer un projet</h1>
        <span />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-5">
        <p className="text-sm text-neutral-500">
          Présentez une réalisation, un chantier ou un développement et mettez en valeur votre expertise.
        </p>

        <ol className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {STEPS.map((label, index) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => setStep(index)}
                className={`w-full rounded-lg border px-2 py-2 text-left text-[11px] font-semibold leading-tight ${
                  index === step
                    ? "border-[#174f43] bg-white text-[#174f43]"
                    : index < step
                      ? "border-neutral-200 bg-white text-neutral-700"
                      : "border-transparent bg-transparent text-neutral-400"
                }`}
              >
                <span className="block text-[10px]">{String(index + 1).padStart(2, "0")}</span>
                {label}
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
          {step === 0 ? (
            <div className="space-y-4">
              <div className="text-sm">
                <FieldLabel icon={Building2}>Type de projet</FieldLabel>
                <button
                  type="button"
                  onClick={() => setTypeOpen((open) => !open)}
                  className={`${fieldClass} flex items-center justify-between text-left ${dossier.category ? "" : "text-neutral-400"}`}
                >
                  <span>{dossier.category ? categoryLabel(dossier.category) : "Choisir"}</span>
                  <ChevronDown className={`h-4 w-4 text-neutral-500 transition ${typeOpen ? "rotate-180" : ""}`} />
                </button>
                {typeOpen ? (
                  <div className="mt-2 overflow-hidden rounded-lg border border-neutral-200">
                    {PROJECT_CATEGORIES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setDossier((current) => ({ ...current, category: item.id, subtype: "" }));
                          setTypeOpen(false);
                        }}
                        className={`block w-full border-t border-neutral-100 px-3 py-2.5 text-left text-sm first:border-t-0 ${
                          dossier.category === item.id ? "bg-[#174f43]/5 font-medium text-[#174f43]" : "bg-white text-neutral-800"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              {dossier.category ? (
                <label className="block text-sm">
                  <FieldLabel icon={Layers}>Sous-type</FieldLabel>
                  <select className={fieldClass} value={dossier.subtype} onChange={(event) => setDossier((current) => ({ ...current, subtype: event.target.value }))}>
                    <option value="">Choisir</option>
                    {SUBTYPES[dossier.category as ProjectCategoryId].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label className="block text-sm">
                <FieldLabel icon={Type}>Titre du projet</FieldLabel>
                <input className={fieldClass} value={title} maxLength={120} placeholder="Ex : Résidence Atlas" onChange={(event) => setTitle(event.target.value)} />
              </label>
              <label className="block text-sm">
                <FieldLabel icon={AlignLeft} aside={`${description.length}/200`}>Description courte</FieldLabel>
                <textarea className={`${fieldClass} h-24 py-2`} maxLength={200} value={description} placeholder="Une phrase qui résume le projet." onChange={(event) => setDescription(event.target.value)} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm"><FieldLabel icon={MapPin}>Ville</FieldLabel><input className={fieldClass} value={city} onChange={(event) => setCity(event.target.value)} /></label>
                <label className="text-sm"><span className="mb-1 block font-medium">Région</span><input className={fieldClass} value={region} onChange={(event) => setRegion(event.target.value)} /></label>
                <label className="text-sm"><span className="mb-1 block font-medium">Quartier</span><input className={fieldClass} value={dossier.neighborhood} onChange={(event) => setDossier((current) => ({ ...current, neighborhood: event.target.value }))} /></label>
                <label className="text-sm">
                  <FieldLabel icon={CircleDot}>Statut</FieldLabel>
                  <select className={fieldClass} value={dossier.status} onChange={(event) => setDossier((current) => ({ ...current, status: event.target.value as ProjectDossier["status"] }))}>
                    <option value="">Choisir</option>
                    {PROJECT_STATUSES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </label>
                <label className="text-sm"><FieldLabel icon={Calendar}>Début</FieldLabel><input type="month" className={fieldClass} value={dossier.startDate} onChange={(event) => setDossier((current) => ({ ...current, startDate: event.target.value }))} /></label>
                <label className="text-sm"><span className="mb-1 block font-medium">Fin prévue</span><input type="month" className={fieldClass} value={dossier.expectedEnd} onChange={(event) => setDossier((current) => ({ ...current, expectedEnd: event.target.value }))} /></label>
              </div>
              <label className="block text-sm">
                <FieldLabel icon={ImageIcon}>Image de couverture</FieldLabel>
                <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadCover(file); }} />
                {images[0] ? <img src={images[0]} alt="" className="mt-3 h-40 w-full rounded-lg object-cover" /> : null}
              </label>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-6">
              {!dossier.category ? <p className="text-sm text-neutral-500">Choisissez un type de projet à l'étape Informations.</p> : null}
              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-sm font-semibold">{section.title}</h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {section.fields.filter((field) => !field.whenSubtype || field.whenSubtype.includes(dossier.subtype)).map((field) => (
                      <label key={field.key} className="text-sm">
                        <span className="mb-1 block font-medium">{field.label}</span>
                        <input className={fieldClass} inputMode={field.kind === "number" ? "decimal" : "text"} value={dossier.fields[field.key] || ""} onChange={(event) => setField(field.key, event.target.value)} />
                      </label>
                    ))}
                  </div>
                  {section.choices ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {section.choices.map((choice) => {
                        const active = dossier.choices.includes(choice);
                        return (
                          <button key={choice} type="button" onClick={() => toggleChoice(choice)} className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${active ? "border-[#174f43] bg-[#174f43] text-white" : "border-neutral-200 text-neutral-700"}`}>
                            {choice}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </section>
              ))}
              {dossier.category === "immobilier" ? (
                <section>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Typologie des logements</h2>
                    <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-[#174f43]" onClick={() => setDossier((current) => ({ ...current, units: [...current.units, { type: "2 chambres", count: "", min: "", max: "" }] }))}>
                      <Plus className="h-3.5 w-3.5" /> Ajouter
                    </button>
                  </div>
                  <div className="space-y-2">
                    {dossier.units.map((unit, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2">
                        <input className={fieldClass} value={unit.type} placeholder="Type" onChange={(event) => setDossier((current) => ({ ...current, units: current.units.map((row, i) => i === index ? { ...row, type: event.target.value } : row) }))} />
                        <input className={fieldClass} value={unit.count} placeholder="Unités" onChange={(event) => setDossier((current) => ({ ...current, units: current.units.map((row, i) => i === index ? { ...row, count: event.target.value } : row) }))} />
                        <input className={fieldClass} value={unit.min} placeholder="Min m²" onChange={(event) => setDossier((current) => ({ ...current, units: current.units.map((row, i) => i === index ? { ...row, min: event.target.value } : row) }))} />
                        <input className={fieldClass} value={unit.max} placeholder="Max m²" onChange={(event) => setDossier((current) => ({ ...current, units: current.units.map((row, i) => i === index ? { ...row, max: event.target.value } : row) }))} />
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-8">
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Équipe du projet</h2>
                  <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-[#174f43]" onClick={() => setDossier((current) => ({ ...current, team: [...current.team, newTeamMember()] }))}>
                    <Plus className="h-3.5 w-3.5" /> Ajouter
                  </button>
                </div>
                <p className="text-xs text-neutral-500">Tous les rôles sont optionnels. Associez des organisations, pas des profils employés.</p>
                {dossier.team.map((member) => (
                  <div key={member.id} className="grid gap-2 rounded-lg border border-neutral-200 p-3 sm:grid-cols-2">
                    <select className={fieldClass} value={member.role} onChange={(event) => setDossier((current) => ({ ...current, team: current.team.map((row) => row.id === member.id ? { ...row, role: event.target.value } : row) }))}>
                      {TEAM_ROLES.map((role) => <option key={role}>{role}</option>)}
                    </select>
                    <input className={fieldClass} maxLength={120} placeholder="Nom de l'organisation" value={member.name} onChange={(event) => setDossier((current) => ({ ...current, team: current.team.map((row) => row.id === member.id ? { ...row, name: event.target.value } : row) }))} />
                    <input className={fieldClass} maxLength={160} placeholder="Précision, ex. Promoteur" value={member.description} onChange={(event) => setDossier((current) => ({ ...current, team: current.team.map((row) => row.id === member.id ? { ...row, description: event.target.value } : row) }))} />
                    <input className={fieldClass} maxLength={200} placeholder="Site web" value={member.website} onChange={(event) => setDossier((current) => ({ ...current, team: current.team.map((row) => row.id === member.id ? { ...row, website: event.target.value } : row) }))} />
                    <label className="text-xs text-neutral-600">
                      Logo (optionnel)
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block w-full text-xs" onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const url = await uploadLogo(file);
                        if (!url) return;
                        setDossier((current) => ({ ...current, team: current.team.map((row) => row.id === member.id ? { ...row, logo: url } : row) }));
                      }} />
                    </label>
                    <div className="flex items-center justify-between">
                      {member.logo ? <img src={member.logo} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span />}
                      <button type="button" className="inline-flex items-center justify-center gap-1 text-xs text-neutral-500" onClick={() => setDossier((current) => ({ ...current, team: current.team.filter((row) => row.id !== member.id) }))}>
                        <Trash2 className="h-3.5 w-3.5" /> Retirer
                      </button>
                    </div>
                  </div>
                ))}
              </section>
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Partenaires</h2>
                  <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-[#174f43]" onClick={() => setDossier((current) => ({ ...current, partners: [...(current.partners || []), newPartner()] }))}>
                    <Plus className="h-3.5 w-3.5" /> Ajouter
                  </button>
                </div>
                <p className="text-xs text-neutral-500">Les partenaires s'affichent en bandeau de logos, séparément de l'équipe.</p>
                {(dossier.partners || []).map((partner) => (
                  <div key={partner.id} className="grid gap-2 rounded-lg border border-neutral-200 p-3 sm:grid-cols-2">
                    <input className={fieldClass} maxLength={120} placeholder="Nom du partenaire" value={partner.name} onChange={(event) => setDossier((current) => ({ ...current, partners: current.partners.map((row) => row.id === partner.id ? { ...row, name: event.target.value } : row) }))} />
                    <input className={fieldClass} maxLength={200} placeholder="Site web" value={partner.website} onChange={(event) => setDossier((current) => ({ ...current, partners: current.partners.map((row) => row.id === partner.id ? { ...row, website: event.target.value } : row) }))} />
                    <label className="text-xs text-neutral-600">
                      Logo (optionnel)
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block w-full text-xs" onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const url = await uploadLogo(file);
                        if (!url) return;
                        setDossier((current) => ({ ...current, partners: current.partners.map((row) => row.id === partner.id ? { ...row, logo: url } : row) }));
                      }} />
                    </label>
                    <div className="flex items-center justify-between">
                      {partner.logo ? <img src={partner.logo} alt="" className="h-10 w-16 object-contain" /> : <span />}
                      <button type="button" className="inline-flex items-center gap-1 text-xs text-neutral-500" onClick={() => setDossier((current) => ({ ...current, partners: current.partners.filter((row) => row.id !== partner.id) }))}>
                        <Trash2 className="h-3.5 w-3.5" /> Retirer
                      </button>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Avancement global : {dossier.progress} %</span>
                <input type="range" min={0} max={100} value={dossier.progress} className="w-full accent-[#174f43]" onChange={(event) => setDossier((current) => ({ ...current, progress: Number(event.target.value) }))} />
              </label>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Phases</h2>
                <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-[#174f43]" onClick={() => setDossier((current) => ({ ...current, phases: [...current.phases, newPhase()] }))}>
                  <Plus className="h-3.5 w-3.5" /> Ajouter une phase
                </button>
              </div>
              {dossier.phases.map((phase) => (
                <div key={phase.id} className="space-y-2 rounded-lg border border-neutral-200 p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input className={fieldClass} placeholder="Nom de la phase" value={phase.name} onChange={(event) => setDossier((current) => ({ ...current, phases: current.phases.map((row) => row.id === phase.id ? { ...row, name: event.target.value } : row) }))} />
                    <select className={fieldClass} value={phase.status} onChange={(event) => setDossier((current) => ({ ...current, phases: current.phases.map((row) => row.id === phase.id ? { ...row, status: event.target.value as typeof row.status } : row) }))}>
                      {PHASE_STATUSES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                  </div>
                  <textarea className={`${fieldClass} h-20 py-2`} placeholder="Description" value={phase.description} onChange={(event) => setDossier((current) => ({ ...current, phases: current.phases.map((row) => row.id === phase.id ? { ...row, description: event.target.value } : row) }))} />
                  <div className="grid gap-2 sm:grid-cols-3">
                    <input className={fieldClass} type="number" min={0} max={100} placeholder="%" value={phase.progress} onChange={(event) => setDossier((current) => ({ ...current, phases: current.phases.map((row) => row.id === phase.id ? { ...row, progress: Number(event.target.value) } : row) }))} />
                    <input className={fieldClass} type="date" value={phase.start} onChange={(event) => setDossier((current) => ({ ...current, phases: current.phases.map((row) => row.id === phase.id ? { ...row, start: event.target.value } : row) }))} />
                    <input className={fieldClass} type="date" value={phase.end} onChange={(event) => setDossier((current) => ({ ...current, phases: current.phases.map((row) => row.id === phase.id ? { ...row, end: event.target.value } : row) }))} />
                  </div>
                  <p className="text-xs text-neutral-500">{phaseStatusLabel(phase.status)} · {phase.progress} %</p>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2">
                <h2 className="text-sm font-semibold">Journal</h2>
                <button type="button" className="text-xs font-semibold text-[#174f43]" onClick={() => setDossier((current) => ({ ...current, updates: [...current.updates, newUpdate()] }))}>Ajouter une mise à jour</button>
              </div>
              {dossier.updates.map((entry) => (
                <div key={entry.id} className="grid gap-2 sm:grid-cols-[8rem_1fr]">
                  <input type="date" className={fieldClass} value={entry.date} onChange={(event) => setDossier((current) => ({ ...current, updates: current.updates.map((row) => row.id === entry.id ? { ...row, date: event.target.value } : row) }))} />
                  <input className={fieldClass} placeholder="Phase" value={entry.phase} onChange={(event) => setDossier((current) => ({ ...current, updates: current.updates.map((row) => row.id === entry.id ? { ...row, phase: event.target.value } : row) }))} />
                  <textarea className={`${fieldClass} h-20 py-2 sm:col-span-2`} placeholder="Ce qui a été réalisé" value={entry.text} onChange={(event) => setDossier((current) => ({ ...current, updates: current.updates.map((row) => row.id === entry.id ? { ...row, text: event.target.value } : row) }))} />
                </div>
              ))}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Galerie</span>
                <input type="file" accept="image/*" multiple onChange={async (event) => {
                  const files = [...(event.target.files || [])];
                  const urls = await storageService.uploadImages(files, "projects");
                  addMedia(urls, "Chantier");
                }} />
              </label>
              {images.length ? (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((url) => <img key={url} src={url} alt="" className="h-24 w-full rounded-lg object-cover" />)}
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Documents</h2>
                <button type="button" className="text-xs font-semibold text-[#174f43]" onClick={() => setDossier((current) => ({ ...current, documents: [...current.documents, newDocument()] }))}>Ajouter</button>
              </div>
              <p className="text-xs leading-relaxed text-neutral-500">
                Le fichier reste sur le site de l'entreprise, Google Drive, Dropbox ou OneDrive. Sifarah enregistre le titre, le type, l'adresse, la visibilité et une miniature optionnelle.
              </p>
              {dossier.documents.map((doc) => (
                <div key={doc.id} className="grid gap-2 rounded-lg border border-neutral-200 p-3 sm:grid-cols-2">
                  <input className={fieldClass} maxLength={120} placeholder="Titre" value={doc.title} onChange={(event) => setDossier((current) => ({ ...current, documents: current.documents.map((row) => row.id === doc.id ? { ...row, title: event.target.value } : row) }))} />
                  <select className={fieldClass} value={doc.type} onChange={(event) => setDossier((current) => ({ ...current, documents: current.documents.map((row) => row.id === doc.id ? { ...row, type: event.target.value } : row) }))}>
                    {DOCUMENT_TYPES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                  <label className="text-xs text-neutral-600 sm:col-span-2">
                    Adresse du document
                    <input className={`${fieldClass} mt-1`} maxLength={2000} placeholder="https://" value={doc.url} onChange={(event) => setDossier((current) => ({ ...current, documents: current.documents.map((row) => row.id === doc.id ? { ...row, url: event.target.value } : row) }))} />
                  </label>
                  <label className="text-xs text-neutral-600">
                    Visibilité
                    <select className={`${fieldClass} mt-1`} value={doc.privacy} onChange={(event) => setDossier((current) => ({ ...current, documents: current.documents.map((row) => row.id === doc.id ? { ...row, privacy: event.target.value as "public" | "private" } : row) }))}>
                      <option value="public">Public</option>
                      <option value="private">Privé à l'équipe</option>
                    </select>
                    {doc.privacy === "private" ? (
                      <span className="mt-1 block leading-relaxed text-neutral-500">(Pour un document privé, préférez une adresse qui n'ouvre l'accès qu'après approbation, comme un lien Google Drive en attente de validation.)</span>
                    ) : null}
                  </label>
                  <label className="text-xs text-neutral-600">
                    Miniature (adresse, optionnel)
                    <input className={`${fieldClass} mt-1`} maxLength={2000} placeholder="https://" value={doc.thumbnail} onChange={(event) => setDossier((current) => ({ ...current, documents: current.documents.map((row) => row.id === doc.id ? { ...row, thumbnail: event.target.value } : row) }))} />
                  </label>
                </div>
              ))}
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-3 text-sm">
              <h2 className="text-base font-semibold">{title || "Projet sans titre"}</h2>
              <p className="text-neutral-600">{description || "Aucune description."}</p>
              <p>{[city, region].filter(Boolean).join(", ") || "Lieu non renseigné"}</p>
              <p className="text-[#174f43]">{dossier.progress} % d'avancement · {dossier.team.filter((item) => item.name).length} organisations · {dossier.partners.filter((item) => item.name).length} partenaires</p>
              {!title || !dossier.category ? <p className="text-amber-700">Le type et le titre sont encore requis.</p> : <p>Votre projet est prêt à être publié.</p>}
              <div className="flex flex-wrap gap-2 pt-2">
                <button type="button" disabled={saving} onClick={() => void publish(true)} className="h-11 rounded-lg border border-neutral-300 px-4 text-sm font-semibold">Enregistrer le brouillon</button>
                <button type="button" disabled={saving} onClick={() => void publish(false)} className="h-11 rounded-lg bg-[#174f43] px-4 text-sm font-semibold text-white">Publier le projet</button>
              </div>
            </div>
          ) : null}
        </div>

      </div>
      </div>
      {step < 5 ? (
        <div className="flex justify-between border-t border-neutral-200 bg-white px-4 py-3">
          <button type="button" disabled={step === 0} onClick={() => setStep((current) => current - 1)} className="h-11 rounded-lg px-4 text-sm font-semibold text-neutral-600 disabled:opacity-40">Retour</button>
          <button type="button" onClick={() => setStep((current) => current + 1)} className="h-11 rounded-lg bg-[#174f43] px-5 text-sm font-semibold text-white">Suivant</button>
        </div>
      ) : null}
    </div>,
    document.body,
  );
};

export default CreateProjectWizard;
