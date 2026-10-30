import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { moderationService } from "@/services/moderationService";
import {
  analyticsService,
  type AnalyticsRange,
  type VisitorAnalytics,
} from "@/services/analyticsService";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const RANGES: Array<{ id: AnalyticsRange; label: string }> = [
  { id: "active", label: "En cours" },
  { id: "today", label: "Aujourd'hui" },
  { id: "yesterday", label: "Hier" },
  { id: "week", label: "7 jours" },
  { id: "month", label: "30 jours" },
];

/** 15 min, 30 min, then every hour through 24 h. */
const ACTIVE_WINDOWS = [15, 30, ...Array.from({ length: 24 }, (_, hour) => (hour + 1) * 60)];

const activeWindowLabel = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return hours === 1 ? "1 h" : `${hours} h`;
};

const activeWindowPhrase = (minutes: number) => {
  if (minutes < 60) return `les ${minutes} dernières minutes`;
  if (minutes === 60) return "la dernière heure";
  return `les ${minutes / 60} dernières heures`;
};

const formatDuration = (ms: number) => {
  const totalSec = Math.max(0, Math.round(Number(ms || 0) / 1000));
  if (totalSec < 60) return `${totalSec}s`;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min < 60) return `${min}m ${sec}s`;
  const h = Math.floor(min / 60);
  const remMin = min % 60;
  return `${h}h ${remMin}m`;
};

const StatCard = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => (
  <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
    <p className="mt-2 text-3xl font-semibold tabular-nums text-neutral-950">{value}</p>
    {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
  </div>
);

const AdminAnalytics = () => {
  const { user } = useAuth();
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<AnalyticsRange>("today");
  const [activeMinutes, setActiveMinutes] = useState(15);
  const [data, setData] = useState<VisitorAnalytics | null>(null);
  const requestSeq = useRef(0);

  const load = async (nextRange: AnalyticsRange = range, minutes: number = activeMinutes) => {
    if (!user) return;
    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const moderator = await moderationService.isModerator(user.id);
      if (seq !== requestSeq.current) return;
      setIsModerator(moderator);
      if (!moderator) {
        setData(null);
        return;
      }
      const next = await analyticsService.getOverview(nextRange, minutes);
      if (seq !== requestSeq.current) return;
      setData(next);
    } catch (error) {
      if (seq !== requestSeq.current) return;
      console.error("Error loading analytics:", error);
      toast({ title: "Erreur", description: "Impossible de charger les statistiques visiteurs." });
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void load(range, activeMinutes), 180);
    return () => window.clearTimeout(timer);
  }, [user?.id, range, activeMinutes]);

  if (!user) {
    return <div className="p-6 text-muted-foreground">Connexion requise.</div>;
  }

  if (!loading && !isModerator) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold">Accès refusé</h1>
        <p className="mt-2 text-muted-foreground">Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-16 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#174f43]">Admin</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">Analytics visiteurs</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Sessions, inscriptions, catégories, temps passé et clics.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/moderation">Modération</Link>
          </Button>
          <Button type="button" variant="outline" onClick={() => void load(range, activeMinutes)} disabled={loading}>
            Actualiser
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {RANGES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setRange(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              range === item.id
                ? "bg-[#174f43] text-white"
                : "border border-neutral-200 bg-white text-neutral-700 hover:border-[#174f43]/40"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="col-span-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Navigateurs actifs</p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums text-neutral-950">{data.active_sessions}</p>
                </div>
                <p className="text-sm font-semibold text-[#174f43]">{activeWindowLabel(activeMinutes)}</p>
              </div>
              <label className="mt-4 block">
                <span className="sr-only">Fenêtre des navigateurs actifs</span>
                <input
                  type="range"
                  min={0}
                  max={ACTIVE_WINDOWS.length - 1}
                  step={1}
                  value={Math.max(0, ACTIVE_WINDOWS.indexOf(activeMinutes))}
                  onChange={(event) => setActiveMinutes(ACTIVE_WINDOWS[Number(event.target.value)] ?? 15)}
                  aria-valuetext={activeWindowLabel(activeMinutes)}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-[#174f43]"
                />
              </label>
              <div className="mt-1 flex justify-between text-[11px] font-medium text-neutral-400">
                <span>15 min</span>
                <span>1 h</span>
                <span>6 h</span>
                <span>12 h</span>
                <span>24 h</span>
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Navigateurs distincts vus pendant {activeWindowPhrase(activeMinutes)} (localhost compte aussi)
              </p>
            </div>
            <StatCard
              label={range === "active" ? "Navigateurs (période)" : "Sessions (navigateurs)"}
              value={data.sessions}
              hint="1 session = 1 navigateur / cookie, pas chaque clic"
            />
            <StatCard label="Visiteurs uniques" value={data.visitors} />
            <StatCard label="Pages vues" value={data.page_views} />
            <StatCard label="Inscrits (cookie lié)" value={data.signed_up} hint="Membres + invités connectés" />
            <StatCard label="Comptes pros" value={data.members} />
            <StatCard label="Invités (particuliers)" value={data.guest_visitors} />
            <StatCard label="Visiteurs anonymes" value={data.regular_visitors} hint="Sans compte" />
            <StatCard label="Clics" value={data.clicks} />
            <StatCard label="Temps total" value={formatDuration(data.watch_ms_total)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-950">Catégories (comptes pros actifs)</h2>
              {data.categories.length ? (
                <ul className="mt-4 divide-y divide-neutral-100">
                  {data.categories.map((row) => (
                    <li key={row.category} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="min-w-0 truncate text-neutral-800">{row.category}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-neutral-950">{row.members}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-neutral-500">Aucune catégorie pour cette période.</p>
              )}
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm lg:col-span-1">
              <h2 className="text-lg font-semibold text-neutral-950">Pages</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="pb-2 font-semibold">Page</th>
                      <th className="pb-2 font-semibold">Vues</th>
                      <th className="pb-2 font-semibold">Uniques</th>
                      <th className="pb-2 font-semibold">Temps moy.</th>
                      <th className="pb-2 font-semibold">Temps tot.</th>
                      <th className="pb-2 font-semibold">Clics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {data.pages.length ? (
                      data.pages.map((row) => (
                        <tr key={row.path}>
                          <td className="max-w-[14rem] truncate py-2.5 font-medium text-neutral-900" title={row.path}>
                            {row.path}
                          </td>
                          <td className="py-2.5 tabular-nums">{row.views}</td>
                          <td className="py-2.5 tabular-nums">{row.unique_visitors}</td>
                          <td className="py-2.5 tabular-nums">{formatDuration(row.watch_ms_avg)}</td>
                          <td className="py-2.5 tabular-nums">{formatDuration(row.watch_ms_total)}</td>
                          <td className="py-2.5 tabular-nums">{row.clicks}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-neutral-500">
                          Pas encore de pages pour cette période.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <p className="text-xs text-neutral-400">
            Généré le {data.generated_at ? new Date(data.generated_at).toLocaleString("fr-MA") : "—"} · période{" "}
            {data.from ? new Date(data.from).toLocaleString("fr-MA") : "—"} →{" "}
            {data.to ? new Date(data.to).toLocaleString("fr-MA") : "—"}
          </p>
        </>
      ) : null}
    </div>
  );
};

export default AdminAnalytics;
