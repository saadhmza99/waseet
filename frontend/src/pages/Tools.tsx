import { useMemo, useState, type ComponentType } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Bath,
  Boxes,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileCheck,
  Home,
  PaintBucket,
  Scale,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { DesktopRailFrame } from "@/components/FeedDesktopRail";

/* ---------------------------------- utils --------------------------------- */

const fmtNum = (value: number, digits = 0) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: digits }).format(Math.round(value * 10 ** digits) / 10 ** digits);
const fmtMad = (value: number) => `${fmtNum(value)} MAD`;

const inputCls =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-[15px] text-neutral-900 outline-none transition focus:border-[#174f43]";
const labelCls = "mb-1.5 block text-[13px] font-semibold text-neutral-500";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className={labelCls}>{label}</span>
    {children}
  </label>
);

const Stat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="rounded-2xl bg-[#174f43] px-4 py-3.5 text-white">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">{label}</p>
    <p className="mt-0.5 text-lg font-bold leading-tight">{value}</p>
    {sub ? <p className="mt-0.5 text-xs text-white/70">{sub}</p> : null}
  </div>
);

const ToolShell = ({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) => (
  <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
    <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
    <p className="mt-1 text-sm text-neutral-500">{desc}</p>
    <div className="mt-5">{children}</div>
    <p className="mt-6 border-t border-neutral-100 pt-3 text-xs leading-relaxed text-neutral-400">
      Estimation indicative générée automatiquement — demandez des devis à des professionnels Sifarah pour un chiffrage
      engageant.
    </p>
  </div>
);

/* ------------------------------ tool: prix/m² ----------------------------- */

const VILLES: { label: string; coef: number }[] = [
  { label: "Casablanca", coef: 1.15 },
  { label: "Rabat", coef: 1.1 },
  { label: "Marrakech", coef: 1.05 },
  { label: "Tanger", coef: 1.05 },
  { label: "Agadir", coef: 1 },
  { label: "Fès", coef: 0.92 },
  { label: "Meknès", coef: 0.88 },
  { label: "Autre ville", coef: 0.85 },
];

const STANDINGS: { label: string; prix: number }[] = [
  { label: "Économique", prix: 2800 },
  { label: "Moyen standing", prix: 3800 },
  { label: "Haut standing", prix: 5500 },
  { label: "Luxe", prix: 8000 },
];

const PrixM2Tool = () => {
  const [ville, setVille] = useState(0);
  const [standing, setStanding] = useState(1);
  const [surface, setSurface] = useState(120);
  const prixM2 = STANDINGS[standing].prix * VILLES[ville].coef;
  const total = prixM2 * (surface || 0);
  return (
    <ToolShell title="Calculateur prix/m²" desc="Estimez votre budget de construction par ville et standing.">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Ville">
          <select className={inputCls} value={ville} onChange={(e) => setVille(Number(e.target.value))}>
            {VILLES.map((v, i) => (
              <option key={v.label} value={i}>{v.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Standing">
          <select className={inputCls} value={standing} onChange={(e) => setStanding(Number(e.target.value))}>
            {STANDINGS.map((s, i) => (
              <option key={s.label} value={i}>{s.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Surface bâtie (m²)">
          <input type="number" min={0} className={inputCls} value={surface} onChange={(e) => setSurface(Number(e.target.value))} />
        </Field>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Prix estimé / m²" value={fmtMad(prixM2)} sub={`${STANDINGS[standing].label} · ${VILLES[ville].label}`} />
        <Stat label="Budget total estimé" value={fmtMad(total)} />
        <Stat label="Fourchette probable" value={`${fmtMad(total * 0.9)} – ${fmtMad(total * 1.1)}`} sub="±10% selon finitions" />
      </div>
    </ToolShell>
  );
};

/* ----------------------------- tool: matériaux ---------------------------- */

const MateriauxTool = () => {
  const [sol, setSol] = useState(100);
  const [etages, setEtages] = useState(2);
  const batie = (sol || 0) * (etages || 0);
  const rows = [
    { label: "Ciment (sacs de 50 kg)", value: batie * 3.2, unit: "sacs" },
    { label: "Fer à béton", value: batie * 38, unit: "kg", alt: `${fmtNum((batie * 38) / 1000, 1)} tonnes` },
    { label: "Sable", value: batie * 0.25, unit: "m³", digits: 1 },
    { label: "Gravier", value: batie * 0.35, unit: "m³", digits: 1 },
    { label: "Agglos / briques", value: batie * 13, unit: "unités" },
  ];
  return (
    <ToolShell title="Simulateur matériaux" desc="Calculez les quantités de ciment, fer, sable et briques pour le gros œuvre.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Surface au sol (m²)">
          <input type="number" min={0} className={inputCls} value={sol} onChange={(e) => setSol(Number(e.target.value))} />
        </Field>
        <Field label="Nombre d'étages (RDC inclus)">
          <select className={inputCls} value={etages} onChange={(e) => setEtages(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n === 1 ? "RDC seul" : `R+${n - 1}`}</option>
            ))}
          </select>
        </Field>
      </div>
      <p className="mt-4 text-sm text-neutral-500">Surface bâtie totale : <strong className="text-neutral-800">{fmtNum(batie)} m²</strong></p>
      <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-100">
        {rows.map((row, i) => (
          <div key={row.label} className={`flex items-center justify-between px-4 py-3 ${i % 2 ? "bg-white" : "bg-neutral-50"}`}>
            <span className="text-sm text-neutral-600">{row.label}</span>
            <span className="text-sm font-bold text-neutral-900">
              {fmtNum(row.value, row.digits || 0)} {row.unit}
              {row.alt ? <span className="ml-2 font-medium text-neutral-400">({row.alt})</span> : null}
            </span>
          </div>
        ))}
      </div>
    </ToolShell>
  );
};

/* ------------------------------ tool: solaire ----------------------------- */

const SolaireTool = () => {
  const [facture, setFacture] = useState(800);
  const tarif = 1.2; // MAD / kWh moyen
  const consoAnnuelle = ((facture || 0) * 12) / tarif;
  const kwc = Math.max(0.5, Math.round((consoAnnuelle / 1600) * 2) / 2);
  const production = kwc * 1600;
  const autoConso = Math.min(production, consoAnnuelle);
  const economieAn = autoConso * tarif;
  const cout = kwc * 11500;
  const payback = economieAn > 0 ? cout / economieAn : 0;
  return (
    <ToolShell title="Simulateur solaire" desc="Calculez vos économies avec les panneaux solaires (production moyenne au Maroc : 1 600 kWh/kWc/an).">
      <Field label="Facture d'électricité mensuelle moyenne (MAD)">
        <input type="number" min={0} className={inputCls} value={facture} onChange={(e) => setFacture(Number(e.target.value))} />
      </Field>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Puissance conseillée" value={`${fmtNum(kwc, 1)} kWc`} sub={`≈ ${fmtNum(kwc * 5.5, 1)} m² de panneaux`} />
        <Stat label="Coût d'installation estimé" value={fmtMad(cout)} />
        <Stat label="Économies / an" value={fmtMad(economieAn)} sub={`${fmtNum(autoConso)} kWh autoconsommés`} />
        <Stat label="Retour sur investissement" value={`${fmtNum(payback, 1)} ans`} sub={`${fmtMad(economieAn * 25)} d'économies sur 25 ans`} />
      </div>
    </ToolShell>
  );
};

/* ----------------------------- tool: timeline ----------------------------- */

const PHASES: { label: string; pct: number; color: string }[] = [
  { label: "Études & permis", pct: 8, color: "#94a3b8" },
  { label: "Terrassement", pct: 6, color: "#a8a29e" },
  { label: "Fondations", pct: 14, color: "#78716c" },
  { label: "Structure & élévation", pct: 28, color: "#174f43" },
  { label: "Toiture & étanchéité", pct: 10, color: "#2f7d5f" },
  { label: "Maçonnerie & cloisons", pct: 12, color: "#65a30d" },
  { label: "Plomberie & électricité", pct: 9, color: "#0891b2" },
  { label: "Finitions & peinture", pct: 13, color: "#d97706" },
];

const TimelineTool = () => {
  const [mois, setMois] = useState(14);
  return (
    <ToolShell title="Timeline projet" desc="Visualisez le planning phase par phase de votre construction.">
      <Field label={`Durée totale estimée : ${mois} mois`}>
        <input
          type="range"
          min={4}
          max={36}
          step={1}
          value={mois}
          onChange={(e) => setMois(Number(e.target.value))}
          className="w-full accent-[#174f43]"
        />
      </Field>
      <div className="mt-5 flex h-9 w-full overflow-hidden rounded-full">
        {PHASES.map((phase) => (
          <div key={phase.label} style={{ width: `${phase.pct}%`, background: phase.color }} title={`${phase.label} — ${phase.pct}%`} />
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {PHASES.map((phase) => (
          <div key={phase.label} className="flex items-center gap-3 rounded-xl bg-neutral-50 px-3.5 py-2.5">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: phase.color }} />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-700">{phase.label}</span>
            <span className="text-xs text-neutral-400">{phase.pct}%</span>
            <span className="w-24 text-right text-sm font-bold text-neutral-900">{fmtNum((mois * phase.pct) / 100, 1)} mois</span>
          </div>
        ))}
      </div>
    </ToolShell>
  );
};

/* ----------------------------- tool: peinture ----------------------------- */

const PeintureTool = () => {
  const [surface, setSurface] = useState(80);
  const [couches, setCouches] = useState(2);
  const [prixLitre, setPrixLitre] = useState(30);
  const litres = ((surface || 0) * couches) / 9;
  return (
    <ToolShell title="Calculateur peinture" desc="Estimez la quantité et le coût de la peinture (rendement moyen : 9 m²/L par couche).">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Surface à peindre (m²)">
          <input type="number" min={0} className={inputCls} value={surface} onChange={(e) => setSurface(Number(e.target.value))} />
        </Field>
        <Field label="Nombre de couches">
          <select className={inputCls} value={couches} onChange={(e) => setCouches(Number(e.target.value))}>
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>{n} couche{n > 1 ? "s" : ""}</option>
            ))}
          </select>
        </Field>
        <Field label="Prix par litre (MAD)">
          <input type="number" min={0} className={inputCls} value={prixLitre} onChange={(e) => setPrixLitre(Number(e.target.value))} />
        </Field>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Peinture nécessaire" value={`${fmtNum(Math.ceil(litres))} L`} sub={`Calcul exact : ${fmtNum(litres, 1)} L`} />
        <Stat label="Pots de 10 L" value={`${Math.ceil(litres / 10)} pot${Math.ceil(litres / 10) > 1 ? "s" : ""}`} />
        <Stat label="Budget peinture estimé" value={fmtMad(litres * (prixLitre || 0))} />
      </div>
    </ToolShell>
  );
};

/* -------------------------------- tool: SDB ------------------------------- */

const SDB_LINES: { label: string; prix: number }[] = [
  { label: "Démolition & évacuation", prix: 3500 },
  { label: "Plomberie (arrivées / évacuations)", prix: 8500 },
  { label: "Électricité & éclairage", prix: 4000 },
  { label: "Étanchéité", prix: 2800 },
  { label: "Carrelage & faïence", prix: 12000 },
  { label: "Sanitaires (WC, lavabo, douche)", prix: 11500 },
  { label: "Robinetterie", prix: 3800 },
  { label: "Meuble vasque & miroir", prix: 5500 },
  { label: "Peinture & finitions", prix: 2400 },
  { label: "Main-d'œuvre de pose", prix: 7500 },
];

const SdbTool = () => {
  const [checked, setChecked] = useState<boolean[]>(SDB_LINES.map(() => true));
  const [prices, setPrices] = useState<number[]>(SDB_LINES.map((l) => l.prix));
  const sousTotal = SDB_LINES.reduce((sum, _l, i) => sum + (checked[i] ? prices[i] || 0 : 0), 0);
  return (
    <ToolShell title="Estimateur SDB" desc="Budget rénovation salle de bain, ligne par ligne. Cochez et ajustez chaque poste.">
      <div className="overflow-hidden rounded-2xl border border-neutral-100">
        {SDB_LINES.map((line, i) => (
          <div key={line.label} className={`flex items-center gap-3 px-4 py-2.5 ${i % 2 ? "bg-white" : "bg-neutral-50"}`}>
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={(e) => setChecked((prev) => prev.map((v, j) => (j === i ? e.target.checked : v)))}
              className="h-4 w-4 shrink-0 accent-[#174f43]"
            />
            <span className={`min-w-0 flex-1 truncate text-sm ${checked[i] ? "text-neutral-700" : "text-neutral-400 line-through"}`}>
              {line.label}
            </span>
            <input
              type="number"
              min={0}
              value={prices[i]}
              onChange={(e) => setPrices((prev) => prev.map((v, j) => (j === i ? Number(e.target.value) : v)))}
              className="h-9 w-28 rounded-lg border border-neutral-200 bg-white px-2 text-right text-sm font-semibold outline-none focus:border-[#174f43]"
            />
            <span className="text-xs text-neutral-400">MAD</span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Sous-total" value={fmtMad(sousTotal)} />
        <Stat label="Marge imprévus (10%)" value={fmtMad(sousTotal * 0.1)} />
        <Stat label="Budget total estimé" value={fmtMad(sousTotal * 1.1)} />
      </div>
    </ToolShell>
  );
};

/* ------------------------------ tool: Rokhas ------------------------------ */

const ROKHAS: Record<string, { delai: string; taxe: string }> = {
  Casablanca: { delai: "45 à 75 jours", taxe: "Taxe sur les opérations de construction + taxe d'édilité" },
  Rabat: { delai: "40 à 60 jours", taxe: "Taxe sur les opérations de construction + taxe d'édilité" },
  Marrakech: { delai: "45 à 70 jours", taxe: "Taxe sur les opérations de construction + taxe d'édilité" },
  Agadir: { delai: "35 à 55 jours", taxe: "Taxe sur les opérations de construction + taxe d'édilité" },
  Tanger: { delai: "40 à 65 jours", taxe: "Taxe sur les opérations de construction + taxe d'édilité" },
  Fès: { delai: "35 à 55 jours", taxe: "Taxe sur les opérations de construction + taxe d'édilité" },
};

const ROKHAS_DOCS = [
  "Titre foncier ou certificat de propriété",
  "Plan cadastral et coordonnées du terrain",
  "Copie de la CIN du demandeur",
  "Plans architecturaux signés par un architecte agréé",
  "Plan de situation et plan de masse",
  "Note de calcul / étude de structure (bâtiments R+2 et plus)",
  "Engagement de l'architecte et du bureau d'études",
];

const ROKHAS_STEPS = [
  "Création du dossier sur la plateforme Rokhas.ma",
  "Dépôt des plans et pièces justificatives",
  "Instruction par la commission (commune, agence urbaine, protection civile…)",
  "Avis de la commission et éventuelles réserves à lever",
  "Paiement des taxes et redevances",
  "Délivrance de l'autorisation de construire",
];

const RokhasTool = () => {
  const [ville, setVille] = useState("Casablanca");
  const info = ROKHAS[ville];
  return (
    <ToolShell title="Guide permis Rokhas" desc="Documents, étapes et délais pour votre autorisation de construire, par ville.">
      <Field label="Ville du projet">
        <select className={inputCls} value={ville} onChange={(e) => setVille(e.target.value)}>
          {Object.keys(ROKHAS).map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </Field>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Stat label={`Délai moyen à ${ville}`} value={info.delai} sub="Après dépôt d'un dossier complet" />
        <Stat label="Taxes principales" value={info.taxe} />
      </div>
      <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-neutral-400">Documents à préparer</h3>
      <ul className="mt-2 space-y-1.5">
        {ROKHAS_DOCS.map((doc) => (
          <li key={doc} className="flex items-start gap-2 text-sm text-neutral-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#174f43]" />
            {doc}
          </li>
        ))}
      </ul>
      <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-neutral-400">Étapes de la procédure</h3>
      <ol className="mt-2 space-y-2">
        {ROKHAS_STEPS.map((step, i) => (
          <li key={step} className="flex items-start gap-3 text-sm text-neutral-700">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#174f43] text-xs font-bold text-white">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </ToolShell>
  );
};

/* ------------------------------- tool: plans ------------------------------ */

const PLANS: { nom: string; style: string; surface: number; chambres: number; sdb: number; budget: number }[] = [
  { nom: "R+1 Moderne", style: "Moderne", surface: 120, chambres: 4, sdb: 2, budget: 456000 },
  { nom: "R+1 Économique", style: "Moderne", surface: 90, chambres: 3, sdb: 1, budget: 252000 },
  { nom: "R+2 Familial", style: "Moderne", surface: 210, chambres: 6, sdb: 3, budget: 798000 },
  { nom: "Villa Marocaine", style: "Marocain traditionnel", surface: 260, chambres: 5, sdb: 4, budget: 1430000 },
  { nom: "Villa Moderne", style: "Moderne", surface: 220, chambres: 4, sdb: 3, budget: 1210000 },
  { nom: "Duplex Contemporain", style: "Moderne", surface: 140, chambres: 3, sdb: 2, budget: 532000 },
];

const PlansTool = () => (
  <ToolShell title="Plans de maison" desc="Catalogue R+1, R+2, villa — styles moderne et marocain. Budgets de construction estimés.">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {PLANS.map((plan) => (
        <article key={plan.nom} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="flex h-28 items-center justify-center bg-gradient-to-br from-[#174f43] to-[#2f7d5f]">
            <Home className="h-10 w-10 text-white/80" />
          </div>
          <div className="p-4">
            <h4 className="font-bold text-neutral-900">{plan.nom}</h4>
            <p className="text-xs font-medium uppercase tracking-wide text-[#174f43]">{plan.style}</p>
            <dl className="mt-3 space-y-1 text-sm text-neutral-600">
              <div className="flex justify-between"><dt>Surface bâtie</dt><dd className="font-semibold text-neutral-900">{plan.surface} m²</dd></div>
              <div className="flex justify-between"><dt>Chambres</dt><dd className="font-semibold text-neutral-900">{plan.chambres}</dd></div>
              <div className="flex justify-between"><dt>Salles de bain</dt><dd className="font-semibold text-neutral-900">{plan.sdb}</dd></div>
              <div className="flex justify-between border-t border-neutral-100 pt-1.5"><dt>Budget estimé</dt><dd className="font-bold text-[#174f43]">{fmtMad(plan.budget)}</dd></div>
            </dl>
          </div>
        </article>
      ))}
    </div>
  </ToolShell>
);

/* ------------------------------- tool: devis ------------------------------ */

const DevisTool = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ type: "Construction", ville: "Casablanca", surface: "", nom: "", tel: "", desc: "" });
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  if (sent) {
    return (
      <ToolShell title="Comparateur de devis" desc="Recevez et comparez 3 à 5 devis gratuits.">
        <div className="flex flex-col items-center py-8 text-center">
          <CheckCircle2 className="h-14 w-14 text-[#174f43]" />
          <h3 className="mt-3 text-lg font-bold text-neutral-900">Demande envoyée !</h3>
          <p className="mt-1 max-w-md text-sm text-neutral-500">
            Merci {form.nom || ""} — des professionnels de {form.ville} peuvent vous transmettre 3 à 5 devis gratuits
            sous 48 h au {form.tel || "numéro indiqué"}.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-5 rounded-full border border-[#174f43] px-5 py-2.5 text-sm font-semibold text-[#174f43] transition hover:bg-[#174f43] hover:text-white"
          >
            Nouvelle demande
          </button>
        </div>
      </ToolShell>
    );
  }
  return (
    <ToolShell title="Comparateur de devis" desc="Recevez et comparez 3 à 5 devis gratuits de professionnels vérifiés.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Type de travaux">
          <select className={inputCls} value={form.type} onChange={set("type")}>
            {["Construction", "Rénovation", "Extension", "Peinture", "Plomberie", "Électricité", "Autre"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Ville">
          <select className={inputCls} value={form.ville} onChange={set("ville")}>
            {VILLES.map((v) => (
              <option key={v.label} value={v.label}>{v.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Surface concernée (m²)">
          <input type="number" min={0} className={inputCls} value={form.surface} onChange={set("surface")} placeholder="Ex. 120" />
        </Field>
        <Field label="Votre nom">
          <input className={inputCls} value={form.nom} onChange={set("nom")} placeholder="Nom complet" required />
        </Field>
        <Field label="Téléphone">
          <input className={inputCls} value={form.tel} onChange={set("tel")} placeholder="+212 6 …" required />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Décrivez votre projet">
            <textarea className={`${inputCls} h-24 py-2.5`} value={form.desc} onChange={set("desc")} placeholder="Travaux souhaités, délais, finitions…" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <button type="submit" className="h-11 w-full rounded-xl bg-[#174f43] text-[15px] font-semibold text-white transition hover:bg-[#123d34] sm:w-auto sm:px-8">
            Recevoir mes devis gratuits
          </button>
        </div>
      </form>
    </ToolShell>
  );
};

/* --------------------------------- catalog -------------------------------- */

type ToolDef = { id: string; title: string; desc: string; badge?: string; Icon: LucideIcon; Body: ComponentType };

const TOOLS: ToolDef[] = [
  { id: "prix-m2", title: "Calculateur prix/m²", desc: "Estimez votre budget de construction par ville et standing", badge: "Populaire", Icon: Calculator, Body: PrixM2Tool },
  { id: "materiaux", title: "Simulateur matériaux", desc: "Calculez les quantités de ciment, fer, sable et briques", Icon: Boxes, Body: MateriauxTool },
  { id: "solaire", title: "Simulateur solaire", desc: "Calculez vos économies avec les panneaux solaires", badge: "Nouveau", Icon: Sun, Body: SolaireTool },
  { id: "timeline", title: "Timeline projet", desc: "Visualisez le planning phase par phase de votre construction", Icon: CalendarDays, Body: TimelineTool },
  { id: "peinture", title: "Calculateur peinture", desc: "Estimez la quantité et le coût de la peinture", Icon: PaintBucket, Body: PeintureTool },
  { id: "sdb", title: "Estimateur SDB", desc: "Budget rénovation salle de bain ligne par ligne", badge: "Nouveau", Icon: Bath, Body: SdbTool },
  { id: "rokhas", title: "Guide permis Rokhas", desc: "Documents, étapes et délais par ville", Icon: FileCheck, Body: RokhasTool },
  { id: "plans", title: "Plans de maison", desc: "Catalogue R+1, R+2, villa, styles moderne et marocain", Icon: Home, Body: PlansTool },
  { id: "devis", title: "Comparateur de devis", desc: "Recevez et comparez 3 à 5 devis gratuits", Icon: Scale, Body: DevisTool },
];

/* ---------------------------------- page ---------------------------------- */

const Tools = () => {
  const [params, setParams] = useSearchParams();
  const active = useMemo(() => TOOLS.find((t) => t.id === params.get("tool")) || null, [params]);
  const ActiveBody = active?.Body;

  return (
    <DesktopRailFrame className="min-h-screen bg-[#f6f5f3] pb-20 lg:pb-0">
      <div className="mx-auto w-full px-4 py-6 lg:px-2">
        {active && ActiveBody ? (
          <>
            <button
              type="button"
              onClick={() => setParams({})}
              className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-[#174f43] hover:text-[#174f43]"
            >
              <ArrowLeft className="h-4 w-4" />
              Tous les outils
            </button>
            <ActiveBody />
          </>
        ) : (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-neutral-900">Tools</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Calculateurs et guides gratuits pour préparer vos travaux en toute confiance.
              </p>
            </header>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setParams({ tool: tool.id })}
                  className="group relative rounded-3xl border border-neutral-200/80 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#174f43]/40 hover:shadow-md"
                >
                  {tool.badge ? (
                    <span
                      className={`absolute right-4 top-4 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        tool.badge === "Nouveau" ? "bg-orange-100 text-orange-700" : "bg-[#174f43]/10 text-[#174f43]"
                      }`}
                    >
                      {tool.badge}
                    </span>
                  ) : null}
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#174f43]/10 text-[#174f43]">
                    <tool.Icon className="h-6 w-6" />
                  </span>
                  <span className="mt-4 block text-[17px] font-bold leading-tight text-neutral-900">{tool.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-neutral-500">{tool.desc}</span>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#174f43]">
                    Ouvrir l'outil
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </DesktopRailFrame>
  );
};

export default Tools;
