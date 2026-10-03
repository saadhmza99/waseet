import { sanitizeOffer, type ServiceOffer } from "@/lib/serviceOffer";

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

export type ShowcaseService = {
  id: string;
  firm: string;
  sourceUrl: string;
  offer: ServiceOffer;
};

const offer = (value: ServiceOffer): ServiceOffer => sanitizeOffer(value);

export const SHOWCASE_SERVICES: ShowcaseService[] = [
  {
    id: "showcase-chb-architecture",
    firm: "CHB Architects",
    sourceUrl: "https://www.chbarchitects.net/about-us/",
    offer: offer({
      title: "Maîtrise d'œuvre clé en main",
      category: "Architecture",
      description:
        "Mission d'architecture portée par le cabinet de Hakim Benjelloun, installé au 2, rue des Moineaux à Casablanca. Le cabinet réunit architectes, ingénieurs et designers d'intérieur, après plus de trente ans de pratique, et traite aussi bien une architecture de tradition marocaine qu'une écriture contemporaine.\n\nLa mission va de la conception générale jusqu'à la réalisation : architecture d'intérieur, mobilier et agencement. Le cabinet intervient au Maroc et à l'international, pour des sièges, de l'hospitalité, du logement et des programmes tertiaires. Le tarif est établi sur devis, selon l'échelle et les phases confiées.",
      cover: photo("photo-1487958449943-2429e8be8625"),
      gallery: [
        photo("photo-1503387762-592deb58ef4e"),
        photo("photo-1486406146926-c627a92ad1ab"),
        photo("photo-1497366811353-6870744d04b2"),
        photo("photo-1600607687939-ce8a6c25118c"),
        photo("photo-1497366754035-f200968a6e72"),
      ],
      kinds: ["Étude", "Réalisation", "Accompagnement"],
      included: [
        "Conception générale de l'architecture",
        "Architecture d'intérieur et agencement",
        "Mobilier et design d'objet",
        "Suivi jusqu'à la réalisation",
      ],
      options: ["Mission au Maroc", "Mission à l'international"],
      priceMode: "devis",
      amount: "",
      duration: "Selon les phases confiées",
      zoneMode: "maroc",
      cities: [],
      region: "",
      travel: true,
      remote: false,
      audiences: ["Promoteurs", "Entreprises", "Investisseurs"],
      audienceOther: "",
    }),
  },
  {
    id: "showcase-interstyle-renovation",
    firm: "Interstyle Design",
    sourceUrl: "https://interstyledesign.ma/services/renovation-interieure-casablanca/",
    offer: offer({
      title: "Rénovation intérieure clé en main",
      category: "Rénovation & Aménagement",
      description:
        "Rénovation et aménagement intérieur à Casablanca, portés par Interstyle Design, cabinet fondé par l'architecte d'intérieur Wafaa Elkass. Le bureau est à Massira. Pour les appartements, l'intervention commence à partir de 60 m². Les bureaux et locaux sont étudiés au cas par cas.\n\nUn seul interlocuteur coordonne les corps d'état, de la maçonnerie aux finitions : électricité, plomberie, revêtements, menuiseries. Le cabinet prend aussi les biens livrés bruts, les villas en construction et les plateaux à aménager. Le montant dépend de l'état du bien et du niveau de finition. Il est remis sur devis.",
      cover: photo("photo-1600210492486-724fe5c67fb0"),
      gallery: [
        photo("photo-1600566753190-17f0baa2a6c3"),
        photo("photo-1600607687939-ce8a6c25118c"),
        photo("photo-1600585154340-be6161a56a0c"),
        photo("photo-1600596542815-ffad4c1539a9"),
        photo("photo-1576013551627-0cc20b96c2a7"),
      ],
      kinds: ["Réalisation", "Accompagnement"],
      included: [
        "Appartements à partir de 60 m²",
        "Tous corps d'état, jusqu'aux finitions",
        "Coordination du chantier",
        "Livraison clé en main",
      ],
      options: ["Bien livré brut", "Plateau de bureaux", "Villa en cours de construction"],
      priceMode: "devis",
      amount: "",
      duration: "Selon l'état du bien",
      zoneMode: "villes",
      cities: ["Casablanca"],
      region: "",
      travel: true,
      remote: false,
      audiences: ["Particuliers", "Propriétaires", "Entreprises"],
      audienceOther: "",
    }),
  },
  {
    id: "showcase-cgi-promotion",
    firm: "Compagnie Générale Immobilière",
    sourceUrl: "https://www.cgi.ma",
    offer: offer({
      title: "Développement de programmes immobiliers",
      category: "Immobilier",
      description:
        "La Compagnie Générale Immobilière, filiale de la Caisse de Dépôt et de Gestion, développe et commercialise des programmes résidentiels et tertiaires sur l'ensemble du Maroc. Le métier couvre le montage de l'opération, la mise en vente des lots et le suivi jusqu'à la livraison.\n\nLe service s'adresse aux acquéreurs d'un logement ou d'un plateau, et aux partenaires d'une opération. Le prix d'un lot est celui du programme, communiqué sur le dossier de vente. Il n'y a pas de forfait de prestation séparé.",
      cover: photo("photo-1545324418-cc1a3fa10c00"),
      gallery: [
        photo("photo-1460317442991-0ec209397118"),
        photo("photo-1486406146926-c627a92ad1ab"),
        photo("photo-1600596542815-ffad4c1539a9"),
        photo("photo-1600585154340-be6161a56a0c"),
        photo("photo-1497366216548-37526070297c"),
      ],
      kinds: ["Réalisation", "Accompagnement", "Gestion"],
      included: [
        "Montage du programme",
        "Commercialisation des lots",
        "Suivi jusqu'à la livraison",
      ],
      options: ["Logement", "Plateau tertiaire"],
      priceMode: "devis",
      amount: "",
      duration: "Selon le programme",
      zoneMode: "maroc",
      cities: [],
      region: "",
      travel: true,
      remote: false,
      audiences: ["Particuliers", "Investisseurs", "Entreprises"],
      audienceOther: "",
    }),
  },
  {
    id: "showcase-tgcc-construction",
    firm: "TGCC",
    sourceUrl: "https://tgcc.ma",
    offer: offer({
      title: "Entreprise générale de bâtiments",
      category: "Construction",
      description:
        "TGCC intervient en entreprise générale sur des bâtiments et des ouvrages au Maroc. Selon le marché, le lot couvre le gros œuvre, l'étanchéité et la coordination du chantier. C'est le cadre dans lequel la société tient, par exemple, le lot de structure du CHU de Béni Mellal, encore en travaux.\n\nLa mission est chiffrée sur le dossier de consultation : métrés, planning et périmètre des corps d'état confiés. Aucun prix au mètre carré n'est affiché hors appel d'offres.",
      cover: photo("photo-1541888946425-d81bb19240f5"),
      gallery: [
        photo("photo-1504307651254-35680f356dfd"),
        photo("photo-1590494165264-1ebe3602eb80"),
        photo("photo-1503387762-592deb58ef4e"),
        photo("photo-1581094794329-c8112a89af12"),
        photo("photo-1504917595217-d4dc5ebe6122"),
      ],
      kinds: ["Réalisation"],
      included: [
        "Gros œuvre",
        "Étanchéité",
        "Coordination du lot confié",
      ],
      options: ["Bâtiment hospitalier", "Bâtiment tertiaire", "Ouvrage"],
      priceMode: "devis",
      amount: "",
      duration: "Selon le marché",
      zoneMode: "maroc",
      cities: [],
      region: "",
      travel: true,
      remote: false,
      audiences: ["Promoteurs", "Entreprises"],
      audienceOther: "",
    }),
  },
  {
    id: "showcase-betam-conseil",
    firm: "BETAM",
    sourceUrl: "https://www.betam.ma",
    offer: offer({
      title: "Études techniques et suivi de travaux",
      category: "Foncier & Conseil",
      description:
        "BETAM assure les études techniques et le suivi de réalisation pour des maîtres d'ouvrage. La mission part du dossier d'études et se poursuit sur le chantier, jusqu'au contrôle de l'exécution. C'est dans ce cadre que le bureau a porté les études et le suivi du siège de bureaux de l'OFPPT à Casablanca.\n\nLe périmètre — structure, fluides, économie, ordonnancement — est fixé contrat par contrat. Les honoraires sont sur devis.",
      cover: photo("photo-1497366216548-37526070297c"),
      gallery: [
        photo("photo-1503387762-592deb58ef4e"),
        photo("photo-1497366811353-6870744d04b2"),
        photo("photo-1524758631624-e2822e304c36"),
        photo("photo-1486406146926-c627a92ad1ab"),
        photo("photo-1581094794329-c8112a89af12"),
      ],
      kinds: ["Étude", "Conseil", "Accompagnement"],
      included: [
        "Études techniques",
        "Suivi de la réalisation",
        "Contrôle de l'exécution",
      ],
      options: ["Structure", "Fluides", "Ordonnancement"],
      priceMode: "devis",
      amount: "",
      duration: "Selon le dossier",
      zoneMode: "maroc",
      cities: [],
      region: "",
      travel: true,
      remote: true,
      audiences: ["Promoteurs", "Entreprises", "Architectes / Bureaux d'études"],
      audienceOther: "",
    }),
  },
  {
    id: "showcase-hajji-juridique",
    firm: "Hajji & Associés",
    sourceUrl: "",
    offer: offer({
      title: "Sécurisation des ventes et des baux",
      category: "Notaires & Juridique",
      description:
        "Accompagnement juridique des opérations immobilières par Hajji & Associés, cabinet d'avocats d'affaires. La mission porte sur les titres, les promesses, les contrats de vente et les baux, puis sur la coordination avec le notaire pour l'acte authentique.\n\nLe cabinet intervient pour des promoteurs, des agences, des investisseurs et des entreprises, à Casablanca et à Rabat. L'examen de pièces peut se faire à distance. Les honoraires sont sur devis, selon le dossier.",
      cover: photo("photo-1450101499163-c8848c66ca85"),
      gallery: [
        photo("photo-1521587760476-6c12a4b040da"),
        photo("photo-1454165804606-c3d57bc86b40"),
        photo("photo-1497366754035-f200968a6e72"),
        photo("photo-1497366811353-6870744d04b2"),
        photo("photo-1524758631624-e2822e304c36"),
      ],
      kinds: ["Conseil", "Accompagnement"],
      included: [
        "Audit des titres et des autorisations",
        "Promesse et contrat de vente",
        "Baux commerciaux et professionnels",
        "Coordination avec le notaire",
      ],
      options: ["Revue d'un programme", "Contentieux de la construction"],
      priceMode: "devis",
      amount: "",
      duration: "Selon le dossier",
      zoneMode: "villes",
      cities: ["Casablanca", "Rabat"],
      region: "",
      travel: true,
      remote: true,
      audiences: ["Promoteurs", "Agences immobilières", "Investisseurs", "Entreprises"],
      audienceOther: "",
    }),
  },
];

export const showcaseService = (id: string) => SHOWCASE_SERVICES.find((item) => item.id === id) || null;
