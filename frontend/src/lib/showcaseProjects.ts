import type { ProjectDossier } from "@/lib/projectDossier";

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

const media = (urls: string[], categories: string[]) =>
  urls.map((url, index) => ({ url, caption: "", category: categories[index] || "Réalisation" }));

type ShowcaseRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  city: string;
  region: string;
  images: string[];
  details: { dossier: ProjectDossier };
};

const faubourgImages = [
  photo("photo-1545324418-cc1a3fa10c00"),
  photo("photo-1460317442991-0ec209397118"),
  photo("photo-1600585154340-be6161a56a0c"),
  photo("photo-1600607687939-ce8a6c25118c"),
  photo("photo-1600566753190-17f0baa2a6c3"),
  photo("photo-1600210492486-724fe5c67fb0"),
  photo("photo-1576013551627-0cc20b96c2a7"),
  photo("photo-1600596542815-ffad4c1539a9"),
];

const beniMellalImages = [
  photo("photo-1541888946425-d81bb19240f5"),
  photo("photo-1503387762-592deb58ef4e"),
  photo("photo-1590494165264-1ebe3602eb80"),
  photo("photo-1504307651254-35680f356dfd"),
  photo("photo-1581094794329-c8112a89af12"),
  photo("photo-1538108149393-fbbd81895907"),
  photo("photo-1586773860418-d37222d8fce3"),
  photo("photo-1576091160550-2173dba999ef"),
];

const renaultImages = [
  photo("photo-1567789884554-0b844b597180"),
  photo("photo-1581091226825-a6a2a5aee158"),
  photo("photo-1581092334651-ddf26d9a09d0"),
  photo("photo-1504328345606-18bbc8c9d7d1"),
  photo("photo-1486262715619-67b85e0b08d3"),
  photo("photo-1586528116311-ad8dd3c8310d"),
  photo("photo-1553413077-190dd305871c"),
  photo("photo-1581094794329-c8112a89af12"),
];

const bmceImages = [
  photo("photo-1486406146926-c627a92ad1ab"),
  photo("photo-1497366216548-37526070297c"),
  photo("photo-1497366811353-6870744d04b2"),
  photo("photo-1497366754035-f200968a6e72"),
  photo("photo-1565008576549-57569a49371d"),
  photo("photo-1524758631624-e2822e304c36"),
  photo("photo-1503387762-592deb58ef4e"),
  photo("photo-1541888946425-d81bb19240f5"),
];

const faubourgs: ShowcaseRow = {
  id: "showcase-faubourgs-anfa",
  user_id: "showcase",
  title: "Les Faubourgs d'Anfa",
  description:
    "Ensemble résidentiel livré à Casa Anfa, en face d'Anfa Park, dans le tissu du CIL. Le programme réunit 391 logements, du studio au quatre pièces, répartis sur sept bâtiments en R+8, avec deux niveaux de stationnement communs et des commerces en pied d'immeuble.\n\nL'écriture est blanche, dans la continuité de Casablanca, et les abords sont plantés pour que la résidence se lise depuis la rue autant que depuis les logements. Les climatiseurs sont reportés en toiture. L'opération a obtenu la mention Excellent au passeport HQE, notamment pour l'isolation acoustique, l'isolation thermique et les panneaux solaires.\n\nLe chantier a démarré en 2015. Les premières livraisons ont eu lieu fin 2016. La troisième et dernière tranche a été livrée en octobre 2018.",
  city: "Casablanca",
  region: "Casablanca-Settat",
  images: faubourgImages,
  details: {
    dossier: {
      version: 2,
      category: "immobilier",
      subtype: "Résidence",
      status: "livre",
      country: "Maroc",
      neighborhood: "Casa Anfa",
      address: "Face à Anfa Park, CIL",
      startDate: "2015-01",
      expectedEnd: "2018-10",
      actualEnd: "2018-10",
      progress: 100,
      fields: {
        usage: "Résidentiel",
        builtArea: "98000",
        buildings: "7",
        floors: "R+8",
        basements: "2",
        apartments: "391",
      },
      choices: ["Espaces verts", "Sécurité", "Commerces", "Aire de jeux"],
      units: [],
      team: [
        { id: "fa-moa", role: "Promoteur", name: "Bouygues Immobilier Maroc", website: "", description: "Maître d'ouvrage du programme", logo: "" },
        { id: "fa-arch", role: "Architecte", name: "Omar Alaoui", website: "http://www.omaralaoui.ma", description: "Conception architecturale", logo: "" },
        { id: "fa-eg", role: "Entreprise générale", name: "Bymaro", website: "https://www.bouyguesbatimentinternational.com", description: "Construction des trois tranches", logo: "" },
      ],
      partners: [],
      phases: [
        { id: "fa-p1", name: "Première tranche", description: "Premiers logements livrés fin 2016.", status: "termine", progress: 100, start: "2015-01-01", end: "2016-12-01", company: "Bymaro" },
        { id: "fa-p2", name: "Deuxième tranche", description: "Poursuite du programme sur le même principe de bâtiments et de parkings communs.", status: "termine", progress: 100, start: "2016-01-01", end: "2017-12-01", company: "Bymaro" },
        { id: "fa-p3", name: "Troisième tranche", description: "Dernière tranche livrée en octobre 2018.", status: "termine", progress: 100, start: "2017-01-01", end: "2018-10-01", company: "Bymaro" },
      ],
      documents: [
        { id: "fa-d1", title: "Fiche de référence", type: "Fiche projet", url: "https://www.bouyguesbatimentinternational.com/fr/reference/les-faubourgs-danfa/", privacy: "public", thumbnail: faubourgImages[0] },
        { id: "fa-d2", title: "Étude de cas HQE", type: "Aperçu technique et durabilité", url: "https://www.construction21.org/maroc/case-studies/h/les-faubourgs-d-anfa.html", privacy: "public", thumbnail: faubourgImages[1] },
      ],
      updates: [
        { id: "fa-u1", date: "2016-12-01", phase: "Livraison", text: "Les premiers logements de la première tranche sont livrés.", images: [faubourgImages[2]] },
        { id: "fa-u2", date: "2018-10-01", phase: "Livraison", text: "La troisième et dernière tranche est livrée. Le programme compte 391 logements.", images: [faubourgImages[0], faubourgImages[3]] },
      ],
      media: media(faubourgImages, ["Réalisation", "Réalisation", "Réalisation", "Réalisation", "Réalisation", "Réalisation", "Réalisation", "Réalisation"]),
    },
  },
};

const beniMellal: ShowcaseRow = {
  id: "showcase-chu-beni-mellal",
  user_id: "showcase",
  title: "CHU de Béni Mellal",
  description:
    "Centre hospitalier universitaire en chantier à Adouz, commune de Foum El Anceur. L'établissement est prévu pour 520 lits sur un terrain de 25 hectares, avec environ 107 360 m² de surface construite. Il n'est pas ouvert.\n\nL'Agence nationale des équipements publics a lancé le concours d'architecture en février 2024. TGCC intervient en entreprise générale sur le lot 2, gros œuvre et étanchéité. Ce lot mobilise 176 000 m³ de terrassement, 82 000 m³ de béton, 8 500 tonnes d'acier et plus de 50 000 m² d'étanchéité. Son estimation publiée est d'environ 497,4 millions de dirhams. Un point de suivi du programme hospitalier situe l'ensemble du projet autour de 20 %, avec un horizon 2027.",
  city: "Béni Mellal",
  region: "Béni Mellal-Khénifra",
  images: beniMellalImages,
  details: {
    dossier: {
      version: 2,
      category: "btp",
      subtype: "Construction neuve",
      status: "construction",
      country: "Maroc",
      neighborhood: "Adouz",
      address: "Commune de Foum El Anceur",
      startDate: "2024-02",
      expectedEnd: "2027",
      actualEnd: "",
      progress: 20,
      fields: {
        destination: "Santé",
        landArea: "250000",
        builtArea: "107360",
        structure: "Béton armé",
      },
      choices: ["Terrassement", "Gros œuvre", "Étanchéité"],
      units: [],
      team: [
        { id: "bm-moa", role: "Maître d'ouvrage", name: "Agence nationale des équipements publics", website: "", description: "Concours et conduite de l'opération", logo: "" },
        { id: "bm-eg", role: "Entreprise générale", name: "TGCC", website: "https://tgcc.ma", description: "Lot 2, gros œuvre et étanchéité", logo: "" },
      ],
      partners: [],
      phases: [
        { id: "bm-p1", name: "Concours et études", description: "Concours architectural lancé en février 2024 pour la conception et le suivi.", status: "termine", progress: 100, start: "2024-02-01", end: "2024-12-01", company: "ANEP" },
        { id: "bm-p2", name: "Gros œuvre et étanchéité", description: "Terrassement, béton, acier et étanchéité du lot 2. Chantier en cours.", status: "en_cours", progress: 20, start: "2025-01-01", end: "", company: "TGCC" },
        { id: "bm-p3", name: "Corps d'état techniques", description: "Lots techniques et aménagements hospitaliers, après la structure.", status: "a_venir", progress: 0, start: "", end: "", company: "" },
      ],
      documents: [
        { id: "bm-d1", title: "Point d'avancement du chantier", type: "Fiche projet", url: "https://santemag.ma/chu-de-beni-mellal-le-futur-etablissement-de-520-lits-prend-forme/", privacy: "public", thumbnail: beniMellalImages[3] },
      ],
      updates: [
        { id: "bm-u1", date: "2024-02-01", phase: "Études", text: "L'ANEP lance le concours pour la conception du CHU et le suivi des travaux.", images: [beniMellalImages[4]] },
        { id: "bm-u2", date: "", phase: "Gros œuvre", text: "Le lot de structure est engagé : terrassement, béton, acier et étanchéité. L'hôpital n'est pas en service.", images: [beniMellalImages[5], beniMellalImages[6]] },
      ],
      media: media(beniMellalImages, ["Chantier", "Plans / rendus", "Chantier", "Chantier", "Plans / rendus", "Plans / rendus", "Plans / rendus", "Plans / rendus"]),
    },
  },
};

const bmce: ShowcaseRow = {
  id: "showcase-bmce-casa",
  user_id: "showcase",
  title: "Siège de bureaux BMCE",
  description:
    "Immeuble de bureaux réalisé à Casablanca pour BMCE Bank, sur près de 6 000 m² et 26 mètres de hauteur. Le bâtiment compte dix niveaux : deux sous-sols, un rez-de-chaussée et sept étages, soit un R+7.\n\nLes sous-sols, desservis par rampes, escaliers et ascenseurs, accueillent le stationnement, les locaux techniques et les archives. Le rez-de-chaussée réunit accueil, salles de réunion, cafétéria, fitness et maintenance. Les étages courants mêlent bureaux paysagers et bureaux cloisonnés, pour les métiers risques, synergie, BMCE Capital, commercial, partenariats et financements internationaux.\n\nLa façade principale joue sur balcons, retraits et saillies. Elle est habillée de verre, d'inox, d'alucobond et d'ardoise agrafée.",
  city: "Casablanca",
  region: "Casablanca-Settat",
  images: bmceImages,
  details: {
    dossier: {
      version: 2,
      category: "btp",
      subtype: "Construction neuve",
      status: "termine",
      country: "Maroc",
      neighborhood: "",
      address: "",
      startDate: "",
      expectedEnd: "",
      actualEnd: "",
      progress: 100,
      fields: {
        destination: "Bureaux",
        builtArea: "6000",
        floors: "R+7",
        basements: "2",
        structure: "Façade verre, inox, alucobond et ardoise",
      },
      choices: ["Gros œuvre", "Façade", "Aménagement intérieur"],
      units: [],
      team: [
        { id: "bc-moa", role: "Maître d'ouvrage", name: "BMCE Bank", website: "", description: "Siège de bureaux", logo: "" },
        { id: "bc-arch", role: "Architecte", name: "CHB Architects", website: "https://www.chbarchitects.net", description: "Hakim Benjelloun", logo: "" },
      ],
      partners: [],
      phases: [
        { id: "bc-p1", name: "Structure et enveloppe", description: "Dix niveaux, façade composée de verre, d'inox, d'alucobond et d'ardoise agrafée.", status: "termine", progress: 100, start: "", end: "", company: "" },
        { id: "bc-p2", name: "Aménagement des plateaux", description: "Bureaux paysagers et cloisonnés, accueil, salles de réunion, cafétéria et fitness au rez-de-chaussée.", status: "termine", progress: 100, start: "", end: "", company: "" },
      ],
      documents: [
        { id: "bc-d1", title: "Présentation de l'immeuble", type: "Présentation du projet", url: "https://www.chbarchitects.net/portfolio/immeuble-de-bureaux-a-casablanca/", privacy: "public", thumbnail: bmceImages[0] },
      ],
      updates: [
        { id: "bc-u1", date: "", phase: "Livraison", text: "L'immeuble est décrit comme réalisé : près de 6 000 m², R+7, deux sous-sols de stationnement, d'archives et de locaux techniques.", images: [bmceImages[0], bmceImages[4]] },
      ],
      media: media(bmceImages, ["Réalisation", "Réalisation", "Réalisation", "Réalisation", "Réalisation", "Réalisation", "Plans / rendus", "Chantier"]),
    },
  },
};

const renaultTanger: ShowcaseRow = {
  id: "showcase-renault-tanger",
  user_id: "showcase",
  title: "Usine Renault Tanger",
  description:
    "Usine automobile de Renault Tanger Méditerranée, en zone franche de Melloussa. Inaugurée le 9 février 2012, elle s'étend sur 300 hectares, dont 37,7 hectares de bâtiments couverts. L'activité réunit la carrosserie-montage, une plate-forme logistique, le châssis et le montage de sous-ensembles. L'investissement annoncé à l'inauguration était de 1,1 milliard d'euros.\n\nLe site a été conçu dans un partenariat entre le Royaume du Maroc, Renault et Veolia Environnement, avec un objectif de zéro émission carbone et de zéro rejet liquide industriel. Il est certifié ISO 9001 et ISO 14001, engagé ISO 50001, et porte le label RHP. Le capital est détenu à 100 % par Renault SA. L'effectif publié est de 6 230 salariés.\n\nLa production 2025 compte 222 257 Sandero, 53 647 Jogger, 20 401 Renault Express et 3 077 Duo. Le site a passé le million de véhicules en 2017 et a produit 318 600 véhicules en 2018. En 2021, il a inauguré la première ligne de presse d'emboutissage High Speed en Afrique. En 2024, il a lancé le Dacia Jogger, premier hybride fabriqué au Maroc.",
  city: "Tanger",
  region: "Tanger-Tétouan-Al Hoceïma",
  images: renaultImages,
  details: {
    dossier: {
      version: 2,
      category: "industriel",
      subtype: "Usine",
      status: "livre",
      country: "Maroc",
      neighborhood: "Melloussa",
      address: "Zone franche de Melloussa",
      startDate: "2008-01",
      expectedEnd: "2012-02",
      actualEnd: "2012-02",
      progress: 100,
      fields: {
        landArea: "3000000",
        builtArea: "377000",
      },
      choices: ["Protection incendie", "Sécurité"],
      units: [],
      team: [
        { id: "rt-moa", role: "Maître d'ouvrage", name: "Renault Tanger Méditerranée", website: "https://www.renaultgroup.com/groupe/implantations/usine-tanger/", description: "Renault SA, 100 % du capital", logo: "" },
        { id: "rt-env", role: "Entreprise spécialisée", name: "Veolia Environnement", website: "https://www.veolia.com", description: "Partenariat environnemental dès la conception", logo: "" },
      ],
      partners: [
        { id: "rt-p1", name: "Royaume du Maroc", website: "", logo: "" },
      ],
      phases: [
        { id: "rt-ph1", name: "Protocole et création", description: "Protocole d'intention le 1er septembre 2007. Création de Renault Tanger Méditerranée le 16 janvier 2008.", status: "termine", progress: 100, start: "2007-09-01", end: "2008-01-16", company: "Renault" },
        { id: "rt-ph2", name: "Construction", description: "Réception du premier pôle en juin 2010. Livraison de l'usine en juillet 2011.", status: "termine", progress: 100, start: "2010-06-01", end: "2011-07-01", company: "" },
        { id: "rt-ph3", name: "Inauguration", description: "Production du Lodgy en janvier 2012, puis inauguration le 9 février 2012. Dokker en mai.", status: "termine", progress: 100, start: "2012-01-01", end: "2012-02-09", company: "Renault" },
        { id: "rt-ph4", name: "Emboutissage High Speed", description: "Première ligne de presse d'emboutissage High Speed en Afrique, inaugurée en 2021.", status: "termine", progress: 100, start: "2021-01-01", end: "", company: "Renault" },
      ],
      documents: [
        { id: "rt-d1", title: "Fiche de l'usine", type: "Fiche projet", url: "https://www.renaultgroup.com/groupe/implantations/usine-tanger/", privacy: "public", thumbnail: renaultImages[0] },
      ],
      updates: [
        { id: "rt-u1", date: "2012-02-09", phase: "Inauguration", text: "L'usine est inaugurée à Melloussa. La production du Lodgy a démarré en janvier.", images: [renaultImages[0]] },
        { id: "rt-u2", date: "", phase: "Production", text: "En 2017, le millionième véhicule sort de l'usine. L'année 2018 établit un record de 318 600 véhicules.", images: [renaultImages[1], renaultImages[2]] },
        { id: "rt-u3", date: "", phase: "Emboutissage", text: "En 2021, inauguration de la première ligne de presse d'emboutissage High Speed en Afrique, et lancement du Renault Express.", images: [renaultImages[3]] },
        { id: "rt-u4", date: "", phase: "Production", text: "En 2024, lancement du Dacia Jogger, premier hybride fabriqué au Maroc.", images: [renaultImages[4]] },
      ],
      media: media(renaultImages, ["Réalisation", "Réalisation", "Réalisation", "Réalisation", "Réalisation", "Plate-forme logistique", "Plate-forme logistique", "Réalisation"]),
    },
  },
};

export const SHOWCASE_PROJECTS: ShowcaseRow[] = [faubourgs, beniMellal, bmce, renaultTanger];

export const showcaseRow = (id: string) => SHOWCASE_PROJECTS.find((item) => item.id === id) || null;
