/**
 * These three stay at the top of Accueil and Discover.
 * Their dossiers stay locked behind the paid plan.
 */
export const PINNED_PROJECT_IDS = [
  "6fe21c9c-5495-5115-9646-6e0cc4e841c4",
  "87785fde-20e9-5a06-925b-629801ade562",
  "bda11875-f11f-5956-88c3-46069f7964d9",
] as const;

const PINNED_RANK = new Map(PINNED_PROJECT_IDS.map((id, index) => [id, index]));

/** Lower rank = earlier. Unpinned projects sort after these three. */
export const pinnedProjectRank = (id: unknown): number => {
  const key = String(id || "");
  return PINNED_RANK.has(key) ? PINNED_RANK.get(key)! : PINNED_PROJECT_IDS.length;
};

/**
 * After the pinned projects, Accueil vue=projets + Discover Projets
 * surface these titles in this order.
 */
export const PROJECT_FEED_PRIORITY_TITLES = [
  "THE NEW ERA",
  "Riad Bernoussi 1 : Appartements Économique et Appartements moyen standing à Anassi Casablanca",
  "Projets Riad Bernoussi 2 à Ain Sbaa",
  "Riad El Kheir : Appartements Économique à Ain El Aouda",
  "Riad Errahma 1 : Appartements Économique Errahma à Casablanca",
  "Riad Louizia : Appartements Économique et commerces à Louizia",
  "Riad Marrakech : Lots pour villa à Marrakech",
  "Riad Mdiq : Locaux commerciaux à M'diq",
  "Riad Nejmat Saiss : Appartements économique, Lots de terrain R+3 et R+2 à Fès",
  "Villa a Vendre Marrakech, Vente Villa Marrakech",
  "Al Maaden Golf Resort Marrakech, Immobilier de Luxe Marrakech",
  "Iken Park Founty Agadir, Résidence de Luxe Agadir",
  "Le Clos des Pins Agdal Rabat",
  "Les Rives d'Al Maaden Marrakech, Lot de Villas Marrakech",
  "Les Terrasses Dar Essalam à Rabat, Appartements de Luxe Rabat",
  "Lixus Beach Resort Larache, Hotel de luxe Larache",
  "Villa de luxe à Vendre Marrakech, Villa à Vendre Marrakech",
  "Résidence Riad Al Yassamine",
  "RESIDENCE AL MOUSTAKBAL",
  "Al Atlassia Majorelle",
  "Horizon Tower",
  "El Alba",
  "Cabo Huerto",
  "Cabo Huerto Del Sol",
  "Cabo Huerto Del Rio",
  "Bianca",
  "Anaé",
  "IRIS PLAGE",
  "COMPLEXE RESIDENTIEL MARINA AGADIR",
  "COMPLEXE RESIDENTIEL DCHEIRA",
  "Al Atlassia centre",
  "ATLASSIA GOLF II",
  "ATLASSIA GOLF I",
  "lots de Terrain Villa à Marrakech, Terrain pour Villa à Marrakech",
  "MIFTAH AL ALIA, UN CADRE DE VIE PRATIQUE À TANGER",
] as const;

const normalizeTitle = (value: unknown) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const PRIORITY_RANK = new Map(
  PROJECT_FEED_PRIORITY_TITLES.map((title, index) => [normalizeTitle(title), index]),
);

/** Lower rank = earlier. Open dossiers stay ahead via separate sort key. */
export const projectFeedPriorityRank = (title: unknown): number => {
  const key = normalizeTitle(title);
  if (!key) return Number.POSITIVE_INFINITY;
  if (PRIORITY_RANK.has(key)) return PRIORITY_RANK.get(key)!;
  // Prefer longest priority title that is a prefix of the row title (or reverse).
  let best: number | null = null;
  let bestLen = -1;
  for (const [priorityKey, rank] of PRIORITY_RANK) {
    if (key === priorityKey || key.startsWith(`${priorityKey} `) || priorityKey.startsWith(`${key} `)) {
      if (priorityKey.length > bestLen) {
        bestLen = priorityKey.length;
        best = rank;
      }
    }
  }
  return best ?? Number.POSITIVE_INFINITY;
};
