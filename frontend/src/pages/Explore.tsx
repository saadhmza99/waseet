import { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Building2, ChevronLeft, Cpu, Ellipsis, FileText, Hammer, HardHat, Home, Landmark, List, Map as MapIcon, PenTool, Search } from "lucide-react";
import MapView from "@/components/MapView";
import { CategoryPicker } from "@/components/CategoryPicker";

type DiscoverKind = "actualite" | "biens-projets" | "annonces";
type CategoryId =
  | "foncier"
  | "gestion"
  | "biens"
  | "construction"
  | "renovation"
  | "architecture"
  | "notaires"
  | "immotech"
  | "autres";
type Deal = "all" | "sale" | "rent";
type ItemKind = "actualite" | "bien" | "projet" | "annonce" | "agence";

type MockItem = {
  id: string;
  category: CategoryId;
  kind: ItemKind;
  profileName: string;
  image: string;
  title: string;
  city: string;
  price?: string;
  surface?: string;
  beds?: number;
  deal?: "sale" | "rent";
  blurb?: string;
  progress?: number;
  baths?: number;
  description?: string;
  highlights?: string[];
};

const KINDS: { id: DiscoverKind; label: string }[] = [
  { id: "actualite", label: "Actualité" },
  { id: "biens-projets", label: "Biens projets" },
  { id: "annonces", label: "Services" },
];

const CATEGORIES: { id: CategoryId; label: string; Icon: typeof Building2 }[] = [
  { id: "foncier", label: "Foncier & Conseil", Icon: Landmark },
  { id: "gestion", label: "Gestion Immobilière", Icon: Building2 },
  { id: "biens", label: "Biens & Projets", Icon: Home },
  { id: "construction", label: "Construction", Icon: HardHat },
  { id: "renovation", label: "Rénovation & Aménagement", Icon: Hammer },
  { id: "architecture", label: "Architecture", Icon: PenTool },
  { id: "notaires", label: "Notaires & Juridiques", Icon: FileText },
  { id: "immotech", label: "Immotech", Icon: Cpu },
  { id: "autres", label: "Autres", Icon: Ellipsis },
];

const WITH_BIENS = new Set<CategoryId>(["biens", "gestion"]);

type SearchType = "biens" | "services" | "projets" | "comptes";

const SEARCH_TYPES: { id: SearchType; label: string }[] = [
  { id: "comptes", label: "Professionnels" },
  { id: "projets", label: "Projets" },
  { id: "biens", label: "Biens" },
  { id: "services", label: "Services" },
];

const DEALS: { id: Deal; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "sale", label: "Vente" },
  { id: "rent", label: "Location" },
];

const ITEMS: MockItem[] = [
  {
    id: "villa-agadir",
    category: "biens",
    kind: "bien",
    profileName: "Rahma Aamrani",
    image: "/feed-banners/villa-jardin.webp",
    title: "Villa avec jardin",
    city: "Agadir",
    price: "2 400 000 DH",
    surface: "180 m²",
    beds: 4,
    baths: 3,
    deal: "sale",
    description:
      "Villa contemporaine sur un terrain arboré de 400 m², à dix minutes de la corniche d'Agadir. Le séjour ouvre sur une terrasse couverte et une piscine de 8 m, avec un jardin planté d'orangers et d'un gazon déjà en place.\n\nAu rez-de-chaussée : salon double, cuisine équipée, suite parentale et un bureau. À l'étage, trois chambres, deux salles d'eau et une buanderie. Titre foncier disponible, construction de 2019, chauffage solaire et climatisation dans les pièces de vie. Idéale en résidence principale ou en location saisonnière haut de gamme.",
    highlights: ["Piscine et jardin clos", "Titre foncier", "Suite parentale", "Cuisine équipée", "Climatisation"],
  },
  {
    id: "appart-plage",
    category: "biens",
    kind: "bien",
    profileName: "Nour Immobilier",
    image: "/feed-banners/agadir-plage.png",
    title: "Appartement vue mer",
    city: "Agadir",
    price: "890 000 DH",
    surface: "72 m²",
    beds: 2,
    baths: 1,
    deal: "sale",
    description:
      "Appartement traversant au 6e étage d'une résidence gardée face à la baie d'Agadir. Le séjour et la chambre principale donnent sur un balcon de 8 m², avec vue mer dégagée du lever au coucher du soleil.\n\nRésidence de 2016 avec ascenseur, parking en sous-sol et gardien 24h/24. Cuisine ouverte aménagée, salle de bain avec douche à l'italienne, dressing. Charges de copropriété d'environ 350 DH par mois. Convient à un premier achat ou à un investissement locatif meublé, à deux pas de la promenade.",
    highlights: ["Vue mer", "Résidence gardée", "Parking sous-sol", "Ascenseur", "Balcon"],
  },
  {
    id: "riad-location",
    category: "biens",
    kind: "bien",
    profileName: "Rahma Aamrani",
    image: "/feed-banners/riad-patio.jpg",
    title: "Riad à louer",
    city: "Agadir",
    price: "8 000 DH / mois",
    surface: "140 m²",
    beds: 3,
    baths: 2,
    deal: "rent",
    description:
      "Riad restauré dans la médina, proposé en location longue durée. Patio central avec bassin, salon marocain, cuisine fermée et trois chambres réparties sur deux niveaux. Le toit-terrasse est aménagé pour les soirées, avec un coin repas ombragé.\n\nMeublé avec soin, linge et vaisselle compris. Eau chaude solaire, fibre optique déjà tirée. Le bail est d'un an renouvelable, dépôt de deux mois. Quartier calme, accessible à pied aux commerces, tout en restant à l'écart du passage touristique.",
    highlights: ["Patio et toit-terrasse", "Meublé", "Bail 12 mois", "Fibre", "Trois chambres"],
  },
  {
    id: "residence-marina",
    category: "biens",
    kind: "projet",
    profileName: "Nour Immobilier",
    image: "/feed-banners/palais-piscine.webp",
    title: "Résidence Marina",
    city: "Casablanca",
    price: "1 200 000 DH",
    surface: "95 m²",
    beds: 3,
    baths: 2,
    progress: 60,
    description:
      "Résidence de 48 appartements en bord de marina, livrée en deux tranches. Le gros œuvre est terminé, les façades et les menuiseries extérieures sont posées. Il reste les finitions intérieures, les parties communes et la piscine du jardin.\n\nChaque logement dispose d'un séjour ouvert, de trois chambres et d'une loggia. Parkings en sous-sol, local vélos et gardiennage prévus au règlement. Les prix indiqués correspondent au T3 de 95 m², avec choix des revêtements encore ouvert pour les acquéreurs de cette tranche. Livraison estimée dans huit mois.",
    highlights: ["Gros œuvre terminé", "Livraison dans 8 mois", "Parking inclus", "Piscine en parties communes", "Choix des finitions"],
  },
  {
    id: "agence-rahma",
    category: "gestion",
    kind: "agence",
    profileName: "Rahma Aamrani",
    image: "/feed-banners/villa-jardin.webp",
    title: "Agence Rahma Aamrani",
    city: "Agadir",
    description:
      "Agence indépendante installée à Agadir depuis 2012. Rahma Aamrani accompagne les ventes de villas et d'appartements, ainsi que la gestion locative de riads et de résidences secondaires.\n\nL'équipe de quatre personnes prend en charge les visites, la rédaction des mandats, le suivi chez le notaire et la remise des clés. Les biens sont photographiés et décrits avant mise en ligne, avec un point hebdomadaire pour chaque propriétaire.",
    highlights: ["Vente et location", "Gestion locative", "Suivi notaire", "Agadir et région"],
  },
  {
    id: "agence-nour",
    category: "gestion",
    kind: "agence",
    profileName: "Nour Immobilier",
    image: "/feed-banners/palais-piscine.webp",
    title: "Agence Nour Immobilier",
    city: "Casablanca",
    description:
      "Promoteur et commercialisateur basé à Casablanca. Nour Immobilier porte des résidences neuves, de la réservation sur plan jusqu'à la livraison, et revend des lots déjà réservés.\n\nLes acquéreurs reçoivent un échéancier, les plans d'exécution et un interlocuteur unique pour les appels de fonds. L'agence suit aussi la gestion des parties communes la première année après la réception.",
    highlights: ["Vente sur plan", "Résidences neuves", "Échéancier clair", "Casablanca et marina"],
  },
  {
    id: "reno-villa",
    category: "renovation",
    kind: "projet",
    profileName: "Atlas Rénovation",
    image: "/agadir-welcome.png",
    title: "Rénovation d'une villa",
    city: "Agadir",
    price: "180 000 DH",
    surface: "160 m²",
    progress: 100,
    description:
      "Reprise complète d'une villa des années 1990 à Agadir : étanchéité de la toiture, réfection des salles d'eau, remplacement des menuiseries et nouvelle cuisine. Les réseaux d'eau et d'électricité ont été repris à neuf, avec un tableau divisionnaire et des prises dédiées à la climatisation.\n\nLe chantier a duré quatorze semaines. Les enduits extérieurs ont été refaits en deux couches, la terrasse carrelée et le jardin remis à niveau. Le client a emménagé à la réception, après un procès-verbal de levée des réserves signé sans retenue.",
    highlights: ["Toiture et étanchéité", "Salles d'eau neuves", "Électricité reprise", "Réception sans réserve"],
  },
  {
    id: "reno-appt",
    category: "renovation",
    kind: "projet",
    profileName: "Atlas Rénovation",
    image: "/welcome-morocco.jpg",
    title: "Remise à neuf d'un appartement",
    city: "Agadir",
    price: "65 000 DH",
    surface: "70 m²",
    beds: 2,
    baths: 1,
    progress: 35,
    description:
      "Appartement occupé, rénové pièce par pièce pour limiter le relogement. La dépose des anciens revêtements est faite, les cloisons de la salle d'eau sont ouvertes et le nouveau plan de plomberie est validé.\n\nIl reste la pose du carrelage, la cuisine en kit sur mesure, les peintures et la menuiserie intérieure. Planning tenu : trois semaines pour le second œuvre, une semaine de finitions. Le montant couvre fournitures milieu de gamme et main-d'œuvre, hors électroménager.",
    highlights: ["Chantier en site occupé", "Salle d'eau en cours", "Cuisine sur mesure à poser", "Finitions dans 4 semaines"],
  },
  {
    id: "immeuble",
    category: "construction",
    kind: "projet",
    profileName: "Bâtiment Sud",
    image: "/feed-banners/palais-piscine.webp",
    title: "Immeuble de bureaux",
    city: "Agadir",
    price: "4 500 000 DH",
    surface: "900 m²",
    progress: 80,
    description:
      "Immeuble R+3 de bureaux en structure béton, en zone d'activité au nord d'Agadir. Les plateaux sont livrés bruts de second œuvre, avec gaines techniques, colonnes montantes et réservations pour la climatisation centralisée.\n\nLe clos et couvert est achevé. Les équipes posent les faux plafonds du hall et les menuiseries aluminium de la façade ouest. Deux niveaux sont déjà réservés par une société de services. Livraison des plateaux restants prévue avant la fin du trimestre, avec dossier de sécurité incendie déposé.",
    highlights: ["Plateaux bruts aménageables", "R+3", "Deux niveaux déjà réservés", "Climatisation prévue", "Livraison ce trimestre"],
  },
  {
    id: "cuisine",
    category: "renovation",
    kind: "projet",
    profileName: "Atelier Bois",
    image: "/welcome-morocco.jpg",
    title: "Cuisine sur mesure",
    city: "Agadir",
    price: "42 000 DH",
    surface: "18 m²",
    progress: 100,
    description:
      "Cuisine en chêne clair réalisée sur mesure pour une villa à Agadir. L'îlot central intègre la plaque et un rangement à casseroles, les colonnes montent jusqu'au plafond et cachent le réfrigérateur.\n\nPlans validés après relevé sur place, façades laquées mates, plan de travail en quartz et crédence en zellige. Pose en cinq jours, électroménager encastré fourni par le client. Le chantier est réceptionné, avec une notice d'entretien et une garantie de deux ans sur les ferrures.",
    highlights: ["Chêne et quartz", "Îlot central", "Pose en 5 jours", "Garantie ferrures 2 ans"],
  },
  {
    id: "elec",
    category: "autres",
    kind: "projet",
    profileName: "Lumière Elec",
    image: "/feed-banners/agadir-plage.png",
    title: "Installation électrique",
    city: "Marrakech",
    price: "28 000 DH",
    surface: "110 m²",
    progress: 20,
    description:
      "Mise aux normes d'une maison de ville à Marrakech : remplacement du tableau, séparation des circuits prises et éclairage, et tirage d'une ligne dédiée pour la climatisation de chaque chambre.\n\nLe diagnostic est rendu. Les saignées du rez-de-chaussée sont ouvertes, le nouveau tableau est commandé. L'étage sera traité la semaine suivante pour laisser les pièces de vie utilisables. Le devis comprend les appareillages, la terre et le consuel en fin de chantier.",
    highlights: ["Tableau neuf", "Circuits séparés", "Lignes climatisation", "Mise à la terre"],
  },
  {
    id: "agent-villa",
    category: "biens",
    kind: "bien",
    profileName: "Sara Bennani",
    image: "/feed-banners/villa-jardin.webp",
    title: "Villa palmeraie",
    city: "Marrakech",
    price: "3 100 000 DH",
    surface: "220 m²",
    beds: 5,
    baths: 4,
    deal: "sale",
    description:
      "Villa d'un seul niveau dans une palmeraie close, sur un hectare planté. Cinq suites ouvrent sur une galerie couverte, le séjour donne sur une piscine longue et un pool house.\n\nLa propriété est livrée meublée. Puits, assainissement autonome et groupe électrogène sont en place. Le gardien loge dans une dépendance indépendante. Titre en cours de morcellement, compromis possible sous condition suspensive de purge. Sara Bennani organise les visites sur rendez-vous, tôt le matin pour éviter la chaleur.",
    highlights: ["1 hectare planté", "Piscine et pool house", "Meublée", "Dépendance gardien", "Visites sur rendez-vous"],
  },
  {
    id: "agent-projet",
    category: "biens",
    kind: "projet",
    profileName: "Sara Bennani",
    image: "/feed-banners/riad-patio.jpg",
    title: "Résidence Palmeraie",
    city: "Marrakech",
    price: "1 450 000 DH",
    surface: "88 m²",
    beds: 2,
    baths: 2,
    progress: 40,
    description:
      "Petite résidence de 18 villas mitoyennes en palmeraie, pensée pour une occupation saisonnière. Les fondations et le rez-de-chaussée de la première rangée sont coulés. La seconde rangée est encore au terrassement.\n\nChaque villa comprendra deux chambres, un patio privé et une place de stationnement. Les parties communes prévoient un bassin partagé et un cheminement piéton sous les palmiers existants, qui sont conservés. Commercialisation ouverte sur les lots de la première rangée, acte chez le notaire à Marrakech.",
    highlights: ["18 villas mitoyennes", "Patio privé", "Palmiers conservés", "Première rangée en commercialisation"],
  },
  {
    id: "agent-agence",
    category: "gestion",
    kind: "agence",
    profileName: "Sara Bennani",
    image: "/feed-banners/palais-piscine.webp",
    title: "Cabinet Bennani",
    city: "Marrakech",
    description:
      "Cabinet spécialisé dans les villas de palmeraie et les petites résidences à Marrakech. Sara Bennani travaille en mandat exclusif, avec estimation argumentée et visites accompagnées.\n\nLe cabinet prépare les dossiers pour le notaire, vérifie les titres et suit les conditions suspensives jusqu'à la signature. Une sélection courte de biens est présentée à chaque acquéreur, plutôt qu'un catalogue large.",
    highlights: ["Mandat exclusif", "Villas et résidences", "Vérification des titres", "Marrakech"],
  },
  {
    id: "avocat-dossier",
    category: "notaires",
    kind: "projet",
    profileName: "Maître El Fassi",
    image: "/welcome-morocco.jpg",
    title: "Contentieux immobilier",
    city: "Casablanca",
    price: "Sur devis",
    progress: 70,
    description:
      "Dossier de contestation d'une vente immobilière à Casablanca : vice caché sur l'état de la structure et désaccord sur le prix de reprise. Les conclusions en demande sont déposées, l'expertise judiciaire est ordonnée.\n\nMaître El Fassi a réuni les rapports de l'architecte et les échanges de mails antérieurs à la signature. L'audience de mise en état est fixée. Le cabinet tient le client informé après chaque dépôt et prépare la transaction si l'expert chiffre un accord acceptable.",
    highlights: ["Expertise judiciaire en cours", "Conclusions déposées", "Suivi d'audience", "Casablanca"],
  },
  {
    id: "notaire-acte",
    category: "notaires",
    kind: "projet",
    profileName: "Étude Benkirane",
    image: "/agadir-welcome.png",
    title: "Acte de vente",
    city: "Rabat",
    price: "Sur devis",
    progress: 100,
    description:
      "Vente d'un appartement à Rabat menée de la promesse jusqu'à l'inscription à la conservation foncière. L'étude a vérifié l'origine de propriété, levé les hypothèques et calculé les droits d'enregistrement.\n\nLes deux parties ont signé le même jour. Les fonds ont transité par le compte de l'étude, les clés ont été remises contre quittance, et l'attestation de propriété a été retirée trois semaines plus tard. Dossier clos et archivé.",
    highlights: ["Promesse et acte", "Purge des hypothèques", "Conservation foncière", "Dossier clos"],
  },
  {
    id: "tech-app",
    category: "immotech",
    kind: "projet",
    profileName: "Lina Digital",
    image: "/feed-banners/agadir-plage.png",
    title: "Plateforme de gestion",
    city: "Casablanca",
    price: "Sur devis",
    progress: 55,
    description:
      "Outil de gestion locative pour une agence de Casablanca : quittances, relances, état des lieux et tableau des impayés. La partie bailleurs est en test avec douze lots réels, l'espace locataire est en cours de branchement sur les paiements.\n\nLina Digital a repris les fichiers Excel existants, dédoublonné les lots et formé deux personnes de l'agence. Prochaine étape : signatures électroniques des baux et export comptable mensuel. Le déploiement complet est prévu sur l'ensemble du parc, soit environ 200 lots.",
    highlights: ["Quittances et relances", "12 lots en test", "Import des fichiers existants", "Déploiement sur 200 lots"],
  },
  {
    id: "actu-rahma",
    category: "biens",
    kind: "actualite",
    profileName: "Rahma Aamrani",
    image: "/feed-banners/riad-patio.jpg",
    title: "Visite de la villa jardin",
    city: "Agadir",
    blurb: "Nouvelle visite ouverte ce weekend à Agadir.",
    description:
      "Visite ouverte samedi et dimanche, de 10 h à 13 h, pour la villa jardin d'Agadir. Rahma Aamrani sera sur place avec les plans, le titre et le détail des charges.\n\nLes visiteurs peuvent parcourir le jardin, la piscine et l'étage sans rendez-vous préalable. Une deuxième visite privée reste possible en semaine pour les acquéreurs qui veulent revenir avec un architecte.",
  },
  {
    id: "actu-atlas",
    category: "renovation",
    kind: "actualite",
    profileName: "Atlas Rénovation",
    image: "/agadir-welcome.png",
    title: "Chantier en cours",
    city: "Agadir",
    blurb: "Fin des travaux de la villa prévue le mois prochain.",
    description:
      "Le chantier de la villa rénovée entre dans les finitions. Peintures du séjour terminées, pose des derniers luminaires cette semaine, nettoyage de réception prévu en fin de mois.\n\nAtlas Rénovation publiera les photos avant / après dès la levée des réserves. Les propriétaires qui ont un projet comparable à Agadir peuvent demander le même devis type, adapté à la surface.",
  },
  {
    id: "annonce-reno",
    category: "renovation",
    kind: "annonce",
    profileName: "realestate",
    image: "/welcome-morocco.jpg",
    title: "Rénovateur",
    city: "Agadir",
    price: "Prix sur demande",
    description:
      "Entreprise générale de rénovation à Agadir. Interventions sur villas et appartements : second œuvre, peinture, plomberie légère et coordination des corps d'état.\n\nDevis après visite, délai annoncé par écrit, un conducteur de travaux comme seul interlocuteur. Les chantiers en cours sont visibles sur rendez-vous pour les clients qui veulent juger le niveau de finition avant de s'engager.",
    highlights: ["Second œuvre", "Un seul interlocuteur", "Visite de chantier possible"],
  },
  {
    id: "annonce-bois",
    category: "autres",
    kind: "annonce",
    profileName: "Atelier Bois",
    image: "/feed-banners/riad-patio.jpg",
    title: "Menuiserie sur mesure",
    city: "Agadir",
    price: "À partir de 3 000 DH",
    description:
      "Atelier de menuiserie à Agadir : cuisines, dressings, portes intérieures et habillages de murs. Le bois est choisi avec le client à l'atelier, les plans sont dessinés avant toute découpe.\n\nDélai habituel de trois à cinq semaines selon la complexité. Pose comprise dans Agadir, déplacement facturé au-delà. Un acompte de 40 % lance la fabrication, le solde à la pose.",
    highlights: ["Cuisines et dressings", "Plans avant découpe", "Pose à Agadir", "Délai 3 à 5 semaines"],
  },
  {
    id: "foncier-conseil",
    category: "foncier",
    kind: "projet",
    profileName: "Cabinet Idrissi",
    image: "/welcome-morocco.jpg",
    title: "Conseil en foncier",
    city: "Casablanca",
    price: "Sur devis",
    progress: 45,
    description:
      "Étude de faisabilité pour un terrain à lotir en périphérie de Casablanca. Le cabinet vérifie le zonage, les servitudes et la capacité de raccordement avant toute promesse d'achat.\n\nLe relevé topographique est fait. Il reste l'avis de la commune sur la voirie et une note de cubature pour estimer le nombre de lots. Le client reçoit un mémo à chaque étape, avec les pièces à demander au propriétaire actuel.",
    highlights: ["Zonage et servitudes", "Relevé topo réalisé", "Avis de voirie en attente", "Note de cubature"],
  },
  {
    id: "archi-villa",
    category: "architecture",
    kind: "projet",
    profileName: "Atelier Ligne",
    image: "/feed-banners/villa-jardin.webp",
    title: "Villa contemporaine",
    city: "Rabat",
    price: "Sur devis",
    surface: "240 m²",
    beds: 4,
    baths: 3,
    progress: 30,
    description:
      "Maison de plain-pied en cours d'études pour un terrain en pente à Rabat. Le plan organise quatre chambres autour d'un patio, avec un séjour largement vitré vers l'ouest et un garage en contrebas.\n\nL'esquisse est validée. Atelier Ligne prépare le dossier de permis : coupes, façades, note de surface et insertion dans le règlement du lotissement. Le client choisira les matériaux de façade au prochain rendez-vous, entre enduit clair et pierre locale. Le chantier pourra démarrer après l'autorisation, estimée à trois mois.",
    highlights: ["Plain-pied autour d'un patio", "Dossier de permis en cours", "Terrain en pente", "4 chambres"],
  },
  {
    id: "agence-ligne",
    category: "architecture",
    kind: "agence",
    profileName: "Atelier Ligne",
    image: "/feed-banners/villa-jardin.webp",
    title: "Atelier Ligne",
    city: "Rabat",
    description:
      "Agence d'architecture à Rabat. Atelier Ligne conçoit des maisons individuelles et de petites opérations de logements, du premier croquis jusqu'au suivi de chantier.\n\nL'équipe de trois architectes remet une esquisse, un avant-projet chiffré avec un économiste partenaire, puis le dossier de permis. Le suivi d'exécution est proposé à la vacation ou au forfait, avec un compte-rendu photo chaque semaine. Les projets en cours comprennent une villa contemporaine à Rabat et une réhabilitation d'immeuble de rapport.",
    highlights: ["Maisons et petits collectifs", "Permis de construire", "Suivi de chantier", "Rabat"],
  },
  {
    id: "agence-atlas",
    category: "renovation",
    kind: "agence",
    profileName: "Atlas Rénovation",
    image: "/agadir-welcome.png",
    title: "Atlas Rénovation",
    city: "Agadir",
    description:
      "Entreprise de rénovation et d'aménagement à Agadir. Atlas Rénovation reprend des villas et des appartements : étanchéité, second œuvre, cuisines et coordination des artisans.\n\nChaque affaire a un conducteur de travaux, un planning affiché et des avenants écrits si le client change un choix en cours de route. Les chantiers terminés restent visitables quelques jours avant la remise des clés, pour que les nouveaux clients voient le niveau de finition réel.",
    highlights: ["Villas et appartements", "Conducteur de travaux dédié", "Avenants écrits", "Agadir"],
  },
  {
    id: "agence-lina",
    category: "immotech",
    kind: "agence",
    profileName: "Lina Digital",
    image: "/feed-banners/agadir-plage.png",
    title: "Lina Digital",
    city: "Casablanca",
    description:
      "Studio immotech à Casablanca. Lina Digital construit les outils des agences et des syndics : gestion locative, états des lieux, relances et tableaux de bord.\n\nLe studio part des fichiers déjà utilisés par l'agence, les reprend sans tout ressaisir, puis forme les équipes sur place. Les projets se livrent par étapes, avec un lot pilote avant le déploiement sur l'ensemble du parc. Maintenance et petites évolutions sont incluses les trois premiers mois.",
    highlights: ["Gestion locative", "États des lieux", "Reprise des fichiers existants", "Casablanca"],
  },
];

const matchesQuery = (item: MockItem, query: string) => {
  if (!query) return true;
  const hay = `${item.profileName} ${item.title} ${item.city} ${item.blurb || ""} ${item.description || ""} ${(item.highlights || []).join(" ")}`.toLowerCase();
  return hay.includes(query);
};

const detailLine = (item: MockItem) => {
  if (item.blurb) return item.blurb;
  return [item.price, item.surface, item.beds != null ? `${item.beds} ch.` : ""]
    .filter(Boolean)
    .join(" · ");
};

const projectStatus = (progress = 0) => (progress >= 100 ? "Terminé" : "En cours");

const ResultCard = ({ item, onOpen }: { item: MockItem; onOpen: (item: MockItem) => void }) => {
  const profile = (
    <span className="flex items-center gap-2.5">
      <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold text-neutral-950">{item.profileName}</span>
        <span className="block truncate text-xs text-neutral-500">{item.city}</span>
      </span>
    </span>
  );
  const copy = (
    <>
      <span className="mt-2 block text-[15px] font-semibold text-neutral-950">{item.title}</span>
      {detailLine(item) ? <span className="mt-0.5 block text-sm text-neutral-600">{detailLine(item)}</span> : null}
    </>
  );

  if (item.kind === "bien") {
    return (
      <button type="button" onClick={() => onOpen(item)} className="flex w-full items-center gap-3 px-3 py-3 text-left">
        <span className="min-w-0 flex-1">
          {profile}
          {copy}
        </span>
        <img src={item.image} alt="" className="h-24 w-36 shrink-0 rounded-lg object-cover" />
      </button>
    );
  }

  return (
    <button type="button" onClick={() => onOpen(item)} className="block w-full px-3 py-3 text-left">
      {profile}
      <span className="relative mt-2 block">
        <img src={item.image} alt="" className="h-28 w-full rounded-lg object-cover" />
        {item.kind === "projet" ? (
          <span className="absolute right-2 top-2 rounded bg-neutral-500 px-2 py-1 text-xs font-semibold text-white">
            {projectStatus(item.progress)}
          </span>
        ) : null}
      </span>
      {item.kind === "projet" ? (
        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-neutral-200">
          <span className="block h-full bg-[#174f43]" style={{ width: `${Math.min(100, item.progress ?? 0)}%` }} />
        </span>
      ) : null}
      {copy}
    </button>
  );
};

const AccountRow = ({
  name,
  username,
  image,
  city,
  typeLabel,
  followed,
  onFollow,
  onOpen,
}: {
  name: string;
  username: string;
  image: string;
  city: string;
  typeLabel: string;
  followed: boolean;
  onFollow: () => void;
  onOpen: () => void;
}) => (
  <div className="flex items-center gap-3 border-b border-neutral-100 px-3 py-3">
    <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
      <img src={image} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold text-neutral-950">{name}</span>
        <span className="block truncate text-sm text-neutral-500">@{username}</span>
        <span className="block truncate text-xs text-neutral-400">{typeLabel} · {city}</span>
      </span>
    </button>
    <button
      type="button"
      onClick={onFollow}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
        followed ? "bg-[#174f43] text-white" : "border border-[#174f43] text-[#174f43]"
      }`}
    >
      {followed ? "Suivi" : "Suivre"}
    </button>
  </div>
);

const CardList = ({ items, onOpen }: { items: MockItem[]; onOpen: (item: MockItem) => void }) => (
  <ul className="mt-3 flex flex-col gap-3">
    {items.map((item) => (
      <li
        key={item.id}
        className="overflow-hidden rounded-xl border border-neutral-300 bg-white transition duration-150 hover:scale-[0.98] hover:border-neutral-400"
      >
        <ResultCard item={item} onOpen={onOpen} />
      </li>
    ))}
  </ul>
);

const Explore = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim().toLowerCase();
  const [draft, setDraft] = useState(params.get("q") || "");
  const [searchType, setSearchType] = useState<SearchType>("comptes");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "tout" | null>(null);
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [kind, setKind] = useState<DiscoverKind>("actualite");
  const [kindSlide, setKindSlide] = useState<"left" | "right">("right");
  const kindDrag = useRef<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [filterOpen, setFilterOpen] = useState(false);
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [deal, setDeal] = useState<Deal>("all");
  const [opened, setOpened] = useState<MockItem | null>(null);

  const kindIndex = Math.max(0, KINDS.findIndex((item) => item.id === kind));
  const moveKind = (nextIndex: number) => {
    const count = KINDS.length;
    const wrapped = (nextIndex + count) % count;
    if (wrapped === kindIndex) return;
    const forward = (wrapped - kindIndex + count) % count;
    const backward = (kindIndex - wrapped + count) % count;
    setKindSlide(forward <= backward ? "right" : "left");
    setKind(KINDS[wrapped].id);
  };

  const typedQuery = draft.trim().toLowerCase();
  const searched = useMemo(
    () =>
      ITEMS.filter((item) => {
        if (selectedCategory && selectedCategory !== "tout" && item.category !== selectedCategory) return false;
        return matchesQuery(item, typedQuery);
      }),
    [typedQuery, selectedCategory]
  );
  const searchResults = searched.filter((item) => {
    if (searchType === "biens") return item.kind === "bien";
    if (searchType === "services") return item.kind === "annonce";
    if (searchType === "projets") return item.kind === "projet";
    return false;
  });
  const accounts = useMemo(() => {
    const seen = new Map<string, MockItem>();
    searched.forEach((item) => {
      const current = seen.get(item.profileName);
      if (!current || (item.kind === "agence" && current.kind !== "agence")) seen.set(item.profileName, item);
    });
    return [...seen.values()];
  }, [searched]);
  const selectedLabel =
    selectedCategory === "tout" ? "Tout" : CATEGORIES.find((item) => item.id === selectedCategory)?.label || null;

  const categoryItems = searched.filter((item) => item.category === category);
  const biens = categoryItems.filter(
    (item) => item.kind === "bien" && (deal === "all" || item.deal === deal)
  );
  const projets = categoryItems.filter((item) => item.kind === "projet");
  const agences = categoryItems.filter((item) => item.kind === "agence");
  const categoryLabel = CATEGORIES.find((item) => item.id === category)?.label || "";

  const openCategory = (id: CategoryId) => {
    setCategory(id);
    setDeal("all");
    setFilterOpen(false);
    setOpened(null);
  };

  const searchFields = (
    <div className="w-full">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const next = draft.trim();
          navigate(next ? `/explore?q=${encodeURIComponent(next)}` : "/explore");
        }}
      >
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Rechercher entreprises, catégories…"
            className="h-11 w-full rounded-full border border-neutral-300 bg-white pl-9 pr-3 text-sm text-neutral-900 shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-orange-400"
          />
        </div>
      </form>
      <div className="mt-3">
        <CategoryPicker
          open={false}
          onToggle={() => setCategoriesOpen(true)}
          selectedLabel={selectedLabel}
          categories={CATEGORIES}
          onSelect={() => {}}
        />
      </div>
      <div className="mt-4 flex border-b border-neutral-200">
        {SEARCH_TYPES.map((item) => {
          const active = searchType === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSearchType(item.id)}
              className={`flex-1 border-b-2 pb-2.5 text-sm font-semibold ${
                active ? "border-[#174f43] text-[#174f43]" : "border-transparent text-neutral-500"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (categoriesOpen) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto w-full max-w-2xl px-3">
          <CategoryPicker
            open
            onToggle={() => setCategoriesOpen(false)}
            selectedLabel={selectedLabel}
            categories={CATEGORIES}
            onSelect={(id) => {
              setSelectedCategory(id as CategoryId | "tout");
              setCategoriesOpen(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="mx-auto w-full max-w-2xl px-3 pt-4">
        {searchFields}
        <div className="mt-3 flex items-center justify-end gap-2 pb-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${
                viewMode === "list" ? "bg-[#174f43] text-white" : "bg-neutral-100 text-neutral-900"
              }`}
            >
              <List className="h-4 w-4" />
              Liste
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${
                viewMode === "map" ? "bg-[#174f43] text-white" : "bg-neutral-100 text-neutral-900"
              }`}
            >
              <MapIcon className="h-4 w-4" />
              Carte
            </button>
          </div>
        </div>

        {viewMode === "map" ? (
          <div className="px-3 py-4">
            <MapView />
          </div>
        ) : searchType === "comptes" ? (
          accounts.length === 0 ? (
            <p className="px-4 py-8 text-center text-muted-foreground">Aucun professionnel pour cette recherche</p>
          ) : (
            <ul>
              {accounts.map((item) => {
                const username = item.profileName.toLowerCase().replace(/\s+/g, "");
                return (
                  <li key={item.profileName}>
                    <AccountRow
                      name={item.profileName}
                      username={username}
                      image={item.image}
                      city={item.city}
                      typeLabel={CATEGORIES.find((category) => category.id === item.category)?.label || ""}
                      followed={Boolean(followed[username])}
                      onFollow={() => setFollowed((current) => ({ ...current, [username]: !current[username] }))}
                      onOpen={() => setOpened(item)}
                    />
                  </li>
                );
              })}
            </ul>
          )
        ) : searchResults.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted-foreground">Aucun résultat pour cette recherche</p>
        ) : (
          <CardList items={searchResults} onOpen={setOpened} />
        )}
      </div>

      {category ? (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-white pb-24">
          <div className="mx-auto w-full max-w-2xl">
            <div className="flex items-center gap-2 border-b border-neutral-200 px-2 py-3">
              <button
                type="button"
                aria-label="Retour"
                onClick={() => setCategory(null)}
                className="inline-flex h-9 w-9 items-center justify-center"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="text-lg font-semibold text-neutral-950">{categoryLabel}</h1>
            </div>

            {WITH_BIENS.has(category) ? (
              <section className="mx-3 mt-3 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200">
                <p className="px-3 py-2 text-sm font-semibold text-neutral-950">Biens</p>
                <div className="flex gap-2 px-3 pb-3">
                  {DEALS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDeal(item.id)}
                      className={`h-9 flex-1 rounded-full text-[13px] font-semibold ${
                        deal === item.id ? "bg-[#174f43] text-white" : "bg-neutral-100 text-neutral-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                {biens.length === 0 ? (
                  <p className="px-3 pb-4 text-sm text-neutral-500">Aucun bien</p>
                ) : (
                  <CardList items={biens} onOpen={setOpened} />
                )}
              </section>
            ) : null}

            <section className="mx-3 mt-3 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200">
              <p className="px-3 py-2 text-sm font-semibold text-neutral-950">Projets</p>
              {projets.length === 0 ? (
                <p className="px-3 py-4 text-sm text-neutral-500">Aucun projet</p>
              ) : (
                <CardList items={projets} onOpen={setOpened} />
              )}
            </section>

            {WITH_BIENS.has(category) ? (
              <section className="mx-3 mt-3 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200">
                <p className="px-3 py-2 text-sm font-semibold text-neutral-950">Agences</p>
                {agences.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-neutral-500">Aucune agence</p>
                ) : (
                  <CardList items={agences} onOpen={setOpened} />
                )}
              </section>
            ) : null}
          </div>
        </div>
      ) : null}

      {opened ? (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-white pb-24">
          <div className="mx-auto w-full max-w-2xl">
            <div className="flex items-center gap-2 px-2 py-3">
              <button
                type="button"
                aria-label="Retour"
                onClick={() => setOpened(null)}
                className="inline-flex h-9 w-9 items-center justify-center"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="truncate text-lg font-semibold text-neutral-950">{opened.title}</h1>
            </div>
            <img src={opened.image} alt="" className="h-56 w-full object-cover" />
            <div className="px-4 py-4">
              <div className="flex items-center gap-2.5">
                <img src={opened.image} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="text-[15px] font-semibold text-neutral-950">{opened.profileName}</p>
                  <p className="text-xs text-neutral-500">
                    {CATEGORIES.find((item) => item.id === opened.category)?.label} · {opened.city}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xl font-semibold text-neutral-950">{opened.title}</p>
              {detailLine(opened) ? <p className="mt-1 text-base text-neutral-700">{detailLine(opened)}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  opened.surface,
                  opened.beds != null ? `${opened.beds} chambres` : "",
                  opened.baths != null ? `${opened.baths} sdb` : "",
                  opened.deal === "sale" ? "Vente" : opened.deal === "rent" ? "Location" : "",
                ]
                  .filter(Boolean)
                  .map((fact) => (
                    <span key={fact} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                      {fact}
                    </span>
                  ))}
              </div>
              {opened.kind === "projet" ? (
                <div className="mt-4">
                  <p className="mb-1 text-sm font-semibold text-neutral-700">{projectStatus(opened.progress)}</p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
                    <div className="h-full bg-[#174f43]" style={{ width: `${Math.min(100, opened.progress ?? 0)}%` }} />
                  </div>
                </div>
              ) : null}
              {opened.description ? (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">{opened.description}</p>
              ) : null}
              {opened.highlights?.length ? (
                <ul className="mt-4 list-disc space-y-2 pl-5">
                  {opened.highlights.map((item) => (
                    <li key={item} className="text-sm text-neutral-800">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Explore;
