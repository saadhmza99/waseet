import type { ProjectDossier, ProjectDocument, ProjectMedia, ProjectPartner, ProjectTeamMember } from "@/lib/projectDossier";

export type KerixShowcaseMeta = {
  subtitle?: string;
  description_short?: string;
  cover_image?: string;
  commercial_status?: string;
  postal_code?: string;
  latitude?: string;
  longitude?: string;
  promoter?: { id: string; name: string; website: string };
  urls?: { project: string; canonical: string; promoter: string };
  provenance?: {
    sources: string[];
    niveau: string;
    date_extraction: string;
    date_consolidation: string;
    equipe_mentions: string;
  };
};

export type KerixShowcaseRow = {
  id: string;
  user_id: string;
  title: string;
  subtitle?: string;
  description: string;
  description_short?: string;
  city: string;
  region: string;
  cover_image?: string;
  images: string[];
  commercial_status?: string;
  postal_code?: string;
  latitude?: string;
  longitude?: string;
  promoter?: KerixShowcaseMeta["promoter"];
  urls?: KerixShowcaseMeta["urls"];
  provenance?: KerixShowcaseMeta["provenance"];
  details: { dossier: ProjectDossier; meta?: KerixShowcaseMeta };
};

const ROLE_MAP: Record<string, string> = {
  architect: "Architecte",
  bet: "BET / Ingénieur",
  eg: "Entreprise générale",
  subcontractor: "Sous-traitant",
  promoteur: "Promoteur",
};

const cleanDocTitle = (title: string) => {
  const stripped = title
    .replace(/<[^>]*>/g, " ")
    .replace(/class=\\?"[^"]*\\?"/g, " ")
    .replace(/xmlns=\\?"[^"]*\\?"/g, " ")
    .replace(/height=\\?"[^"]*\\?"/g, " ")
    .replace(/TÉLÉCHARGEMENT/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!stripped || stripped.length < 3) return "Document";
  if (/dépliant|brochure|plaquette/i.test(stripped)) {
    const match = stripped.match(/(Dépliant|Brochure|Plaquette)[^|]{0,60}/i);
    if (match) return match[0].trim();
  }
  return stripped.slice(0, 100);
};

const mapTeam = (rows: Array<{ id: string; role: string; name: string; website?: string; description?: string; logo?: string }>): ProjectTeamMember[] =>
  rows.map((row) => ({
    id: row.id,
    role: ROLE_MAP[row.role] || row.role,
    name: row.name,
    website: row.website || "",
    description: row.description || "",
    logo: row.logo || "",
  }));

const mapDocs = (rows: Array<{ id: string; title: string; type?: string; url: string; privacy?: string }>): ProjectDocument[] =>
  rows.map((row) => ({
    id: row.id,
    title: cleanDocTitle(row.title),
    type: row.type === "brochure" || !row.type ? "Brochure commerciale" : row.type,
    url: row.url,
    privacy: row.privacy === "private" ? "private" : "public",
  }));

const mapMedia = (rows: Array<{ url: string; caption?: string; category?: string }>): ProjectMedia[] =>
  rows.map((row) => ({
    url: row.url,
    caption: row.caption || "",
    category: row.category === "cover" ? "Couverture" : row.category === "gallery" ? "Galerie" : row.category || "Galerie",
  }));

const akenzaImages = [
  "https://www.alliancescreations.ma/wp-content/uploads/2026/08/Akenza-lot-villa-marrakech.jpg",
  "https://www.alliancescreations.ma/wp-content/uploads/2026/08/Akenza-lot-villa-marrakech.jpg",
];

const portesImages = [
  "https://www.groupeaddoha.com/wp-content/uploads/2026/03/Pers-PDM--scaled.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/03/Pers-PDM--scaled.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/03/villa-1-scaled.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR-1.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR-5.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR-6.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR-7-1.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR-8.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR-10.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR-11.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR-15.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR-17.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR-22-scaled.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR-20-scaled.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR00001-scaled.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR00020-scaled.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR00021-scaled.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR00004-scaled.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR00005-scaled.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR00002-scaled.webp",
  "https://www.groupeaddoha.com/wp-content/uploads/2026/05/XPR00009-scaled.webp",
];

const mehdiaImages = [
  "https://alliancesdarna.ma/wp-content/uploads/facade-immeuble.jpg",
  "https://alliancesdarna.ma/wp-content/uploads/facade-immeuble.jpg",
  "https://alliancesdarna.ma/wp-content/uploads/salon-mehdia-appart-2-1.jpg",
  "https://alliancesdarna.ma/wp-content/uploads/cuisine-equipe-2.jpg",
  "https://alliancesdarna.ma/wp-content/uploads/chambre-amis-2.jpg",
  "https://alliancesdarna.ma/wp-content/uploads/chambre-a-coucher-mehdia.jpg",
  "https://alliancesdarna.ma/wp-content/uploads/chambre-acoucher-mehdia-2.jpg",
  "https://alliancesdarna.ma/wp-content/uploads/jardin-facade-immeuble-mehdia-2.jpg",
  "https://alliancesdarna.ma/wp-content/uploads/police-1.png",
  "https://alliancesdarna.ma/wp-content/uploads/hamam.png",
  "https://alliancesdarna.ma/wp-content/uploads/mosque.png",
  "https://alliancesdarna.ma/wp-content/uploads/sante.png",
  "https://alliancesdarna.ma/wp-content/uploads/four-1.png",
  "https://alliancesdarna.ma/wp-content/uploads/hanout.png",
  "https://alliancesdarna.ma/wp-content/uploads/ecole.png",
  "https://alliancesdarna.ma/wp-content/uploads/menzah-benslimane-lot-terrain-a-vendre-rch2-.jpg",
  "https://alliancesdarna.ma/wp-content/uploads/RIAD-MARRAKECH2-340x194.jpg",
  "https://alliancesdarna.ma/wp-content/uploads/BNIMELLAL-340x194.jpg",
  "https://alliancesdarna.ma/wp-content/uploads/MENZAH2-340x194.jpg",
  "https://alliancesdarna.ma/wp-content/uploads/COLLINE2-340x194.jpg",
  "https://alliancesdarna.ma/wp-content/uploads/ALBASSATIN2-340x194.jpg",
];

const akenza: KerixShowcaseRow = {
  id: "KRX-PRJ-0661e901ab0f",
  user_id: "showcase",
  title: "lots de Terrain Villa à Marrakech, Terrain pour Villa à Marrakech",
  subtitle: "lots de Terrain Villa à Marrakech, Terrain pour Villa à Marrakech",
  description:
    "Découvrez des lots de terrains, des villas jumelées ou isolées à Marrakech au sein d’une résidence fermée et sécurisée, offrant un cadre de vie exclusif à proximité du boulevard Mohamed VI.",
  description_short:
    "Découvrez des lots de terrains, des villas jumelées ou isolées à Marrakech au sein d’une résidence fermée et sécurisée, offrant un cadre de vie exclusif à proximité du boulevard Mohamed VI.",
  city: "Marrakech",
  region: "Marrakech-Safi",
  cover_image: akenzaImages[0],
  images: akenzaImages,
  commercial_status: "non_determine",
  postal_code: "40000",
  promoter: {
    id: "KRX-PRM-aghouatim-al-baraka",
    name: "Aghouatim Al Baraka",
    website: "https://www.alliancescreations.ma",
  },
  urls: {
    project: "https://www.alliancescreations.ma/akenza-golf-resort-marrakech/",
    canonical: "https://www.alliancescreations.ma/akenza-golf-resort-marrakech/",
    promoter: "https://www.alliancescreations.ma",
  },
  provenance: {
    sources: [
      "site_promoteur_kerix_2026-10-15",
      "akenza_alliances_creations_page",
      "dossier_schema_cleanup_2026-10-19",
    ],
    niveau: "C",
    date_extraction: "2026-10-16",
    date_consolidation: "2026-10-19",
    equipe_mentions: "Architecte parcours golf: Kyle Phillips | Maître d'ouvrage / promoteur: Alliances Créations",
  },
  details: {
    meta: {
      subtitle: "lots de Terrain Villa à Marrakech, Terrain pour Villa à Marrakech",
      description_short:
        "Découvrez des lots de terrains, des villas jumelées ou isolées à Marrakech au sein d’une résidence fermée et sécurisée, offrant un cadre de vie exclusif à proximité du boulevard Mohamed VI.",
      cover_image: akenzaImages[0],
      commercial_status: "non_determine",
      postal_code: "40000",
      promoter: {
        id: "KRX-PRM-aghouatim-al-baraka",
        name: "Aghouatim Al Baraka",
        website: "https://www.alliancescreations.ma",
      },
      urls: {
        project: "https://www.alliancescreations.ma/akenza-golf-resort-marrakech/",
        canonical: "https://www.alliancescreations.ma/akenza-golf-resort-marrakech/",
        promoter: "https://www.alliancescreations.ma",
      },
      provenance: {
        sources: ["site_promoteur_kerix_2026-10-15", "akenza_alliances_creations_page", "dossier_schema_cleanup_2026-10-19"],
        niveau: "C",
        date_extraction: "2026-10-16",
        date_consolidation: "2026-10-19",
        equipe_mentions: "Architecte parcours golf: Kyle Phillips | Maître d'ouvrage / promoteur: Alliances Créations",
      },
    },
    dossier: {
      version: 2,
      category: "immobilier",
      subtype: "Villa",
      projectType: "projet_mixte",
      status: "livre",
      country: "Maroc",
      neighborhood: "",
      address: "16 rue Ali Abderrazak",
      startDate: "",
      expectedEnd: "",
      actualEnd: "",
      progress: 100,
      fields: {
        usage: "mixte",
        destination: "mixte",
        builtArea: "600",
        landArea: "1400",
        typologies: "Villa | Lot de terrain",
        equipment: "Sécurité | Piscine",
        nearby: "Golf",
        priceOnRequest: "true",
        currency: "MAD",
      },
      choices: ["Sécurité", "Piscine"],
      units: [],
      team: mapTeam([
        { id: "team-1", role: "architect", name: "Kyle Phillips", description: "Kyle Phillips (parcours golf)" },
        { id: "team-2", role: "bet", name: "Alliances", description: "Alliances (études internes / MOD — loose)" },
        {
          id: "team-3",
          role: "eg",
          name: "Groupe Alliances / Alliances Créations-Résidences",
          description: "Groupe Alliances / Alliances Créations-Résidences (promoteur-constructeur — loose)",
        },
        { id: "team-4", role: "subcontractor", name: "Kyle Phillips", description: "Kyle Phillips (architecte de golf Akenza)" },
      ]),
      partners: [
        {
          id: "KRX-PRM-aghouatim-al-baraka",
          name: "Aghouatim Al Baraka",
          website: "https://www.alliancescreations.ma",
          logo: "",
        },
      ] as ProjectPartner[],
      phases: [],
      documents: mapDocs([
        {
          id: "doc-1",
          title: "Dépliant Akenza Golf Resort",
          type: "brochure",
          url: "https://www.alliancescreations.ma/wp-content/uploads/2026/08/Brochure akenza la Roseraie-lot-terrain-villa-a-vendre-marrakech.pdf",
        },
        {
          id: "doc-2",
          title: "Dépliant IKEN PARK",
          type: "brochure",
          url: "https://www.alliancescreations.ma/wp-content/uploads/2024/Depliant/DEP-IKEN-PARK-Y-A5-1-compressed.pdf",
        },
        {
          id: "doc-3",
          title: "Dépliant CDP",
          type: "brochure",
          url: "https://www.alliancescreations.ma/wp-content/uploads/2024/Depliant/CDP-A5-Y-compressed.pdf",
        },
        {
          id: "wp-457",
          title: "BROCHURE-NINE-VILLAS-marrakech",
          type: "brochure",
          url: "https://www.alliancescreations.ma/wp-content/uploads/2026/04/BROCHURE-NINE-VILLAS-marrakech.pdf",
        },
      ]),
      updates: [],
      media: mapMedia([
        { url: akenzaImages[0], category: "cover" },
        { url: akenzaImages[1], category: "gallery" },
      ]),
    },
  },
};

const portesTeam = mapTeam([
  { id: "team-1", role: "architect", name: "HBA STUDIO", website: "https://www.findinmarrakech.com/architectes/hba-studio", description: "HBA STUDIO (lien SERP loose)" },
  { id: "team-2", role: "architect", name: "SAHARA D'INGÉNIEURIE ET D'INNOVATION", website: "https://www.facebook.com/groups/516662499147250/posts/1686525228827632", description: "SERP loose" },
  { id: "team-3", role: "architect", name: "TESLA INGENERIE ET CONSULTING", website: "https://lechantier.ma/pros/profil/tesla-ingenerie-et-consulting", description: "SERP loose" },
  { id: "team-4", role: "architect", name: "Structures Valley", website: "https://www.instagram.com/p/DB9nbAGul67", description: "SERP loose" },
  { id: "team-5", role: "architect", name: "ACT BET", website: "https://tachrone.ma/fr/profil/act-bet/7206", description: "SERP loose" },
  { id: "team-6", role: "architect", name: "Studio bach - Société de construction", website: "https://bati.ma/architecte-interieur/marrakech", description: "SERP loose" },
  { id: "team-7", role: "bet", name: "Direction des études architecturales — Douja Promotion Groupe Addoha", description: "interne" },
  { id: "team-8", role: "bet", name: "Ste Marocaine de l'ingénierie et de la topographie (SOMITOP)", website: "https://et.cybo.com/MA/marrakech/land-surveying-office", description: "SERP loose" },
  { id: "team-9", role: "eg", name: "Douja Promotion Groupe Addoha", description: "promoteur-constructeur intégré — loose" },
  { id: "team-10", role: "eg", name: "Q Building", website: "https://www.instagram.com/reel/DeHXR0xIDQa", description: "SERP loose" },
  { id: "team-11", role: "eg", name: "STE TIRFART WORKS SARL AU", website: "https://tachrone.ma/fr/projet/immeuble-residentiel/588", description: "SERP loose" },
  { id: "team-12", role: "eg", name: "ALJISSAR TRAVAUX", website: "https://www.instagram.com/reel/DdZbh7WMyrp", description: "SERP loose" },
  { id: "team-13", role: "eg", name: "Bendaoud Ingenierie", website: "https://lechantier.ma/villes/marrakech/constructeur", description: "SERP loose" },
  { id: "team-14", role: "eg", name: "CKR WORLD SERVICES", website: "https://tachrone.ma/fr/profil/ckr-world-services/3807", description: "SERP loose" },
  { id: "team-15", role: "eg", name: "Benapro", website: "https://lechantier.ma/villes/marrakech/constructeur", description: "SERP loose" },
  { id: "team-16", role: "eg", name: "NanoProtects", website: "https://tachrone.ma/fr/profil/nanoprotects/7502", description: "SERP loose" },
  { id: "team-17", role: "eg", name: "3L Elec", website: "https://interimmo.ma/services/construction/marrakech", description: "SERP loose" },
  { id: "team-18", role: "eg", name: "Abdou Alum", website: "https://www.facebook.com/Lateliermarrakech/videos/villa-finition-expert-marrakec", description: "SERP loose" },
  { id: "team-19", role: "eg", name: "Abda Energie Services", website: "https://interimmo.ma/services/construction/marrakech", description: "SERP loose" },
  { id: "team-20", role: "eg", name: "Al Yousr Wa Rizk", website: "https://www.tiktok.com/@second.work_ma/video/7692116095557307680", description: "SERP loose" },
  { id: "team-21", role: "eg", name: "AlHamra Céramique", website: "https://www.telecontact.ma/liens/carrelages/marrakech.php", description: "SERP loose" },
  { id: "team-22", role: "eg", name: "Marrakech Plombier", website: "https://ma.indeed.com/q-plomberie-l-marrakech-emplois.html", description: "SERP loose" },
  { id: "team-23", role: "subcontractor", name: "Sani Red Home", website: "https://www.instagram.com/reel/DXb5G-6DDox", description: "SERP loose" },
  { id: "team-24", role: "subcontractor", name: "EUROPELLES", website: "https://lechantier.ma/pros/profil/europelles", description: "SERP loose" },
  { id: "team-25", role: "subcontractor", name: "STE SMLALA", website: "https://www.tiktok.com/@second.work_ma/video/7605700845707054358", description: "SERP loose" },
  { id: "team-26", role: "subcontractor", name: "VIA BIS travauy", website: "https://www.instagram.com/reel/DNh308HMvSA", description: "SERP loose" },
  { id: "team-27", role: "subcontractor", name: "aharkous aziz", website: "https://tachrone.ma/fr/projet/restaurant-mandala/770", description: "SERP loose" },
  { id: "team-28", role: "subcontractor", name: "STE STORE ACCESS", website: "https://www.facebook.com/groups/430078702068113/posts/1234380104971298", description: "SERP loose" },
  { id: "team-29", role: "subcontractor", name: "AJENATEC", website: "https://tachrone.ma/fr/profil/ajenatec/7240", description: "SERP loose" },
  { id: "team-30", role: "subcontractor", name: "Afous", website: "https://www.booking.com/hotel/ma/riad-afous.fr.html", description: "SERP loose" },
  { id: "team-31", role: "subcontractor", name: "Société ALUSA", website: "https://www.instagram.com/reel/DNRH6r0tN7P", description: "SERP loose" },
  { id: "team-32", role: "subcontractor", name: "Cogetis (Comptoir de l'étanchéité)", website: "https://halaman-kuning.cybo.com/MA-poskod/40100_marrakesh/membeli-belah", description: "SERP loose" },
  { id: "team-33", role: "subcontractor", name: "Société Marrakech Solution Incendie", website: "https://interimmo.ma/services/construction/marrakech", description: "SERP loose" },
  { id: "team-34", role: "subcontractor", name: "Plombier marrakech", website: "https://marrakechplombier.com/", description: "SERP loose" },
  { id: "team-35", role: "subcontractor", name: "IND AOUZAL S.A.R.L - Construction et Rénovation", website: "https://www.facebook.com/100063651747112/posts/rechercher-des-r%C3%A9sultats-sur", description: "SERP loose" },
]);

const portes: KerixShowcaseRow = {
  id: "KRX-PRJ-ad60d8387d59",
  user_id: "showcase",
  title: "Les Portes de Marrakech",
  subtitle: "Les Portes de Marrakech",
  description:
    "Le projet Les Portes de Marrakech, situé au quartier Massira, propose des appartements, des commerces, des bureaux et des terrains, avec l’aide au logement, dans un environnement organisé et proche de toutes les commodités quotidiennes. Découvrez dès maintenant les offres Addoha",
  description_short:
    "Le projet Les Portes de Marrakech, situé au quartier Massira, propose des appartements, des commerces, des bureaux et des terrains, avec l’aide au logement, dans un environnement organisé et proche de toutes les commodités quotidiennes. Déc",
  city: "Marrakech",
  region: "Marrakech-Safi",
  cover_image: portesImages[0],
  images: portesImages,
  commercial_status: "en_commercialisation",
  postal_code: "40000",
  promoter: { id: "KRX-PRM-addoha", name: "Addoha", website: "https://www.groupeaddoha.com" },
  urls: {
    project: "https://www.groupeaddoha.com/fr/projet/les-portes-de-marrakech/",
    canonical: "https://www.groupeaddoha.com/fr/projet/les-portes-de-marrakech/",
    promoter: "https://www.groupeaddoha.com",
  },
  provenance: {
    sources: ["site_promoteur_kerix_2026-10-15", "page_addoha_active", "dossier_schema_cleanup_2026-10-19"],
    niveau: "C",
    date_extraction: "2026-10-16",
    date_consolidation: "2026-10-19",
    equipe_mentions: "Maître d'ouvrage: Groupe Addoha (Douja Promotion) | BET / études architecturales: Direction des études architecturales Douja Promotion (interne)",
  },
  details: {
    meta: {
      subtitle: "Les Portes de Marrakech",
      description_short:
        "Le projet Les Portes de Marrakech, situé au quartier Massira, propose des appartements, des commerces, des bureaux et des terrains, avec l’aide au logement, dans un environnement organisé et proche de toutes les commodités quotidiennes. Déc",
      cover_image: portesImages[0],
      commercial_status: "en_commercialisation",
      postal_code: "40000",
      promoter: { id: "KRX-PRM-addoha", name: "Addoha", website: "https://www.groupeaddoha.com" },
      urls: {
        project: "https://www.groupeaddoha.com/fr/projet/les-portes-de-marrakech/",
        canonical: "https://www.groupeaddoha.com/fr/projet/les-portes-de-marrakech/",
        promoter: "https://www.groupeaddoha.com",
      },
      provenance: {
        sources: ["site_promoteur_kerix_2026-10-15", "page_addoha_active", "dossier_schema_cleanup_2026-10-19"],
        niveau: "C",
        date_extraction: "2026-10-16",
        date_consolidation: "2026-10-19",
        equipe_mentions: "Maître d'ouvrage: Groupe Addoha (Douja Promotion)",
      },
    },
    dossier: {
      version: 2,
      category: "immobilier",
      subtype: "Appartement",
      projectType: "projet_mixte",
      status: "sur_plan",
      country: "Maroc",
      neighborhood: "Massira",
      address: "",
      startDate: "",
      expectedEnd: "",
      actualEnd: "",
      progress: 5,
      fields: {
        usage: "mixte",
        destination: "mixte",
        builtArea: "400",
        typologies: "Appartement | Villa | Lot de terrain | Bureau",
        equipment: "Ascenseur | Jardin | Commerces",
        nearby: "Centre commercial | Golf | Commerces",
        priceMin: "450000",
        priceMax: "1600000",
        priceFrom: "450000",
        currency: "MAD",
        bedroomsMin: "3",
        bedroomsMax: "3",
        bathroomsMin: "2",
        bathroomsMax: "2",
      },
      choices: ["Ascenseur", "Jardin", "Commerces"],
      units: [],
      team: portesTeam,
      partners: [{ id: "KRX-PRM-addoha", name: "Addoha", website: "https://www.groupeaddoha.com", logo: "" }],
      phases: [],
      documents: mapDocs([
        {
          id: "doc-2",
          title: "2026-BROCHURE-ADDOHA-MRE.pdf",
          type: "brochure",
          url: "https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf",
        },
        {
          id: "doc-1",
          title: "Les Portes de Marrakech — brochure",
          type: "brochure",
          url: "https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf#page=16",
        },
        {
          id: "web-1",
          title: "BROCHURE-ADDOHA-MRE-1-1.pdf",
          type: "brochure",
          url: "https://www.groupeaddoha.com/wp-content/uploads/2025/09/BROCHURE-ADDOHA-MRE-1-1.pdf",
        },
        {
          id: "web-2",
          title: "exe-BROCHURE-ADDOHA-MRE-II-1.pdf",
          type: "brochure",
          url: "https://www.groupeaddoha.com/wp-content/uploads/2026/01/exe-BROCHURE-ADDOHA-MRE-II-1.pdf",
        },
        {
          id: "doc-casa",
          title: "BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf",
          type: "brochure",
          url: "https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf",
        },
        {
          id: "wp-1111",
          title: "PLAQUETTE MULTI PROJET REGION-MARRAKECH",
          type: "brochure",
          url: "https://www.groupeaddoha.com/wp-content/uploads/2026/03/PLAQUETTE-MULTI-PROJET-REGION-MARRAKECH-1.pdf",
        },
        {
          id: "wp-1263",
          title: "exe-BROCHURE-ADDOHA-MRE-II-1",
          type: "brochure",
          url: "https://www.groupeaddoha.com/wp-content/uploads/2026/03/exe-BROCHURE-ADDOHA-MRE-II-1.pdf",
        },
      ]),
      updates: [],
      media: mapMedia(portesImages.map((url, index) => ({ url, category: index === 0 ? "cover" : "gallery" }))),
    },
  },
};

const mehdia: KerixShowcaseRow = {
  id: "KRX-PRJ-212ab9b6df14",
  user_id: "showcase",
  title: "Appartements Économique et Commerces à Mehdia, Kénitra",
  subtitle: "Appartements Économique et Commerces à Mehdia, Kénitra",
  description: "Veuillez saisir votre Nom. Veuillez saisir votre Téléphone. Veuillez saisir votre adresse e-mail.",
  description_short: "Veuillez saisir votre Nom. Veuillez saisir votre Téléphone. Veuillez saisir votre adresse e-mail.",
  city: "Kénitra",
  region: "Rabat-Salé-Kénitra",
  cover_image: mehdiaImages[0],
  images: mehdiaImages,
  commercial_status: "non_determine",
  postal_code: "14000",
  promoter: { id: "KRX-PRM-alliances-darna", name: "Alliances Darna", website: "https://alliancesdarna.ma" },
  urls: {
    project: "https://alliancesdarna.ma/mehdia/",
    canonical: "https://alliancesdarna.ma/mehdia/",
    promoter: "https://alliancesdarna.ma",
  },
  provenance: {
    sources: ["site_promoteur_kerix_2026-10-15", "alliances_darna_social", "dossier_schema_cleanup_2026-10-19"],
    niveau: "C",
    date_extraction: "2026-10-16",
    date_consolidation: "2026-10-19",
    equipe_mentions: "Maître d'ouvrage: Alliances Darna | Architectes: Mohamed Kadiri, Hicham Rih",
  },
  details: {
    meta: {
      subtitle: "Appartements Économique et Commerces à Mehdia, Kénitra",
      description_short: "Veuillez saisir votre Nom. Veuillez saisir votre Téléphone. Veuillez saisir votre adresse e-mail.",
      cover_image: mehdiaImages[0],
      commercial_status: "non_determine",
      postal_code: "14000",
      promoter: { id: "KRX-PRM-alliances-darna", name: "Alliances Darna", website: "https://alliancesdarna.ma" },
      urls: {
        project: "https://alliancesdarna.ma/mehdia/",
        canonical: "https://alliancesdarna.ma/mehdia/",
        promoter: "https://alliancesdarna.ma",
      },
      provenance: {
        sources: ["site_promoteur_kerix_2026-10-15", "alliances_darna_social", "dossier_schema_cleanup_2026-10-19"],
        niveau: "C",
        date_extraction: "2026-10-16",
        date_consolidation: "2026-10-19",
        equipe_mentions: "Maître d'ouvrage: Alliances Darna | Architectes: Mohamed Kadiri, Hicham Rih",
      },
    },
    dossier: {
      version: 2,
      category: "immobilier",
      subtype: "Appartement",
      projectType: "projet_mixte",
      status: "livre",
      country: "Maroc",
      neighborhood: "bien desservie par les transports publics",
      address: "e-mail. J’ai lu et accepté les conditions générales d’utilisation, notamment la mention relative à la protection des don",
      startDate: "",
      expectedEnd: "",
      actualEnd: "",
      progress: 100,
      fields: {
        usage: "commercial",
        destination: "commercial",
        builtArea: "20",
        floors: "1",
        typologies: "Appartement | Villa | Local commercial | Lot de terrain | Bureau",
        equipment: "Jardin | Commerces | Mosquée",
        nearby: "Mosquée | Centre commercial | Plage | Commerces",
        priceMin: "200000",
        priceMax: "200000",
        priceFrom: "200000",
        currency: "MAD",
      },
      choices: ["Jardin", "Commerces", "Mosquée"],
      units: [],
      team: mapTeam([
        { id: "team-1", role: "architect", name: "Mohamed Kadiri" },
        { id: "team-2", role: "architect", name: "Hicham Rih", description: "Hicham Rih (Concept.4 / Rabat)" },
        { id: "team-3", role: "architect", name: "Mohamed Fayçal Miss" },
        { id: "team-4", role: "architect", name: "Youssef Bennani — YB Architecture", description: "Mehdia 1/2 portfolio" },
        { id: "team-5", role: "bet", name: "Alliances Darna / Groupe Alliances", description: "études — loose" },
        { id: "team-6", role: "eg", name: "Alliances Darna", description: "promoteur-constructeur — loose" },
        { id: "team-7", role: "subcontractor", name: "EMT Routes", description: "voirie / assainissement — Mehdia II" },
      ]),
      partners: [{ id: "KRX-PRM-alliances-darna", name: "Alliances Darna", website: "https://alliancesdarna.ma", logo: "" }],
      phases: [],
      documents: mapDocs([
        {
          id: "darna-1",
          title: "PLAQUETTE MEHDIA A5.pdf",
          type: "brochure",
          url: "https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/PLAQUETTE%20MEHDIA%20A5.pdf",
        },
      ]),
      updates: [],
      media: mapMedia(mehdiaImages.map((url, index) => ({ url, category: index === 0 ? "cover" : "gallery" }))),
    },
  },
};

export const KERIX_TEST_PROJECTS: KerixShowcaseRow[] = [akenza, portes, mehdia];
