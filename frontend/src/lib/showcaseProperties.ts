import { emptyPropertyDetails, type PropertyDetails } from "@/lib/propertyListing";

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

export type ShowcaseProperty = {
  id: string;
  sourceUrl: string;
  images: string[];
  details: PropertyDetails;
};

const bien = (id: string, sourceUrl: string, images: string[], details: Partial<PropertyDetails>): ShowcaseProperty => ({
  id,
  sourceUrl,
  images,
  details: { ...emptyPropertyDetails(), lat: null, lng: null, phones: [], ...details },
});

export const SHOWCASE_PROPERTIES: ShowcaseProperty[] = [
  bien(
    "showcase-anfa-place-129",
    "https://www.mubawab.ma/fr/b/7297/anfaplace-living-resort",
    [
      photo("photo-1571896349842-33c89424de2d"),
      photo("photo-1460317442991-0ec209397118"),
      photo("photo-1600607687939-ce8a6c25118c"),
      photo("photo-1600210492486-724fe5c67fb0"),
      photo("photo-1600566753190-17f0baa2a6c3"),
      photo("photo-1576013551627-0cc20b96c2a7"),
    ],
    {
      title: "Appartement 129 m², Anfa Place Living Resort",
      description:
        "Appartement de 129 m², deux chambres et deux salles de bains, mis en vente dans Anfa Place Living Resort, à Anfa. Le complexe a été livré en juin 2023. Il est annoncé haut standing et finalisé, sur une assiette de 7 hectares.\n\nLa résidence réunit piscines, spa, salle de sport, terrains, restaurants et boutiques, avec une conciergerie et un site sécurisé. Le prix affiché pour ce lot est de 3 850 000 DH.",
      category: "vente",
      propertyKind: "appartement",
      condition: "jamais_habite",
      standing: "haut_standing",
      status: "disponible",
      address: "Anfa Place Living Resort",
      region: "Casablanca-Settat",
      city: "Casablanca",
      builtSurface: "129",
      age: "Moins de 5 ans",
      pieces: 3,
      beds: 2,
      baths: 2,
      features: ["piscine", "concierge", "securite"],
      priceDh: "3850000",
    },
  ),
  bien(
    "showcase-tours-vegetales-148",
    "https://agenz.ma/fr/annonces/immo-casablanca/vente-appartements/finance-city/405268",
    [
      photo("photo-1600596542815-ffad4c1539a9"),
      photo("photo-1600585154340-be6161a56a0c"),
      photo("photo-1600607687939-ce8a6c25118c"),
      photo("photo-1497366754035-f200968a6e72"),
      photo("photo-1600566753190-17f0baa2a6c3"),
      photo("photo-1460317442991-0ec209397118"),
    ],
    {
      title: "Appartement 148 m², Les Tours Végétales",
      description:
        "Appartement neuf et livré de 148 m² à Casablanca Finance City, dans Les Tours Végétales, programme de Yasmine Signature. Deux chambres, deux salles de bains, dont deux suites. Il occupe le premier étage d'un pavillon de quatre niveaux. Terrasse de 58 m², cave de 4 m², une place de parking titrée. Orientation sud. Non meublé. Résidence sécurisée.\n\nLes pavillons restent bas, quatre étages. Les logements du programme annoncent des sols en marbre ou en carrelage grand format, des menuiseries aluminium, une cuisine équipée et une climatisation centralisée. Prix affiché : 2 990 000 DH.",
      category: "vente",
      propertyKind: "appartement",
      condition: "jamais_habite",
      standing: "haut_standing",
      status: "disponible",
      address: "Casablanca Finance City",
      region: "Casablanca-Settat",
      city: "Casablanca",
      builtSurface: "148",
      terraceSurface: "58",
      parkingPlaces: "1",
      age: "Neuf",
      floors: "4",
      orientation: "Sud",
      beds: 2,
      baths: 2,
      features: ["terrasse", "garage", "entre_seul", "securite", "cuisine_equipee", "clim"],
      priceDh: "2990000",
    },
  ),
  bien(
    "showcase-dar-tounsi",
    "http://immo-maroc.com/vente-villa-marrakech-palmeraie-palmariva-dar-tounsi-3393598",
    [
      photo("photo-1551882547-ff40c63fe5fa"),
      photo("photo-1564501049412-61c2a3083791"),
      photo("photo-1576013551627-0cc20b96c2a7"),
      photo("photo-1600596542815-ffad4c1539a9"),
      photo("photo-1600210492486-724fe5c67fb0"),
      photo("photo-1600585154340-be6161a56a0c"),
    ],
    {
      title: "Palais 1 429 m², Dar Tounsi",
      description:
        "Propriété en vente à Dar Tounsi, dans la Palmeraie de Marrakech. Huit suites, 1 429 m² habitables, sur un parc paysager de 10 000 m². Le secteur est celui de Palmariva.\n\nLe prix demandé est de 53 509 500 DH. La fiche publique ne détaille pas le nombre de salles de bains ni l'année de construction.",
      category: "vente",
      propertyKind: "villa",
      standing: "luxe",
      status: "disponible",
      address: "Palmariva, Dar Tounsi",
      region: "Marrakech-Safi",
      city: "Marrakech",
      builtSurface: "1429",
      plotSurface: "10000",
      beds: 8,
      priceDh: "53509500",
    },
  ),
  bien(
    "showcase-cfc-bureau-161",
    "https://www.century21casa.immo/propriete/location-bureaux-haut-standing-quartier-cfc/",
    [
      photo("photo-1497366216548-37526070297c"),
      photo("photo-1497366811353-6870744d04b2"),
      photo("photo-1497366754035-f200968a6e72"),
      photo("photo-1524758631624-e2822e304c36"),
      photo("photo-1486406146926-c627a92ad1ab"),
      photo("photo-1503387762-592deb58ef4e"),
    ],
    {
      title: "Bureau 161 m², Casablanca Finance City",
      description:
        "Plateau de bureaux de 161 m² à louer au 6e étage d'un immeuble récent, à Casablanca Finance City. Surface libre de poteaux, deux entrées indépendantes, deux places de parking. Une station de tramway est au pied de l'immeuble.\n\nLe loyer affiché est de 39 500 DH par mois.",
      category: "location",
      propertyKind: "bureau",
      standing: "haut_standing",
      status: "disponible",
      address: "Casablanca Finance City",
      region: "Casablanca-Settat",
      city: "Casablanca",
      builtSurface: "161",
      parkingPlaces: "2",
      features: ["garage"],
      priceDh: "39500",
    },
  ),
  bien(
    "showcase-riad-mouassine",
    "https://maison26-immomarrakech.com/bien-immobilier/riad-dexception-situe-a-mouassine/",
    [
      photo("photo-1539020140153-e479b8c22e70"),
      photo("photo-1597212618440-806262de4f6b"),
      photo("photo-1600210492486-724fe5c67fb0"),
      photo("photo-1600607687939-ce8a6c25118c"),
      photo("photo-1600566753190-17f0baa2a6c3"),
    ],
    {
      title: "Riad 350 m², Mouassine",
      description:
        "Riad titré, rénové, en vente à Mouassine, dans la médina de Marrakech. Il est exploité en maison d'hôtes. Six chambres avec salle de bains, 350 m² habitables, 170 m² au sol. Orientation sud-ouest.\n\nLe prix annoncé est de 12 800 000 DH, hors frais d'agence de 3 % TTC à la charge de l'acquéreur. Un espace bien-être est indiqué comme pouvant être aménagé : il n'est pas déjà livré.",
      category: "vente",
      propertyKind: "riad",
      condition: "bon_etat",
      standing: "luxe",
      status: "disponible",
      address: "Mouassine",
      region: "Marrakech-Safi",
      city: "Marrakech",
      builtSurface: "350",
      plotSurface: "170",
      beds: 6,
      baths: 6,
      priceDh: "12800000",
    },
  ),
  bien(
    "showcase-cfc-plateau-430",
    "https://www.mubawab.ma/fr/a/7884436/location-plateau-bureau-430m2-cfc-casablanca",
    [
      photo("photo-1497366754035-f200968a6e72"),
      photo("photo-1497366216548-37526070297c"),
      photo("photo-1486406146926-c627a92ad1ab"),
      photo("photo-1503387762-592deb58ef4e"),
      photo("photo-1524758631624-e2822e304c36"),
      photo("photo-1497366811353-6870744d04b2"),
    ],
    {
      title: "Plateau brut 430 m², Casablanca Finance City",
      description:
        "Plateau de bureaux brut à louer à Casablanca Finance City. 430 m², une place de garage. Le loyer est annoncé à 180 DH/m² hors taxes et hors charges, soit 112 875 DH, avant la taxe sur les services communaux de 10,5 % et la TVA de 20 %. Les honoraires d'agence sont d'un mois de loyer.\n\nLe prix affiché ici reprend le loyer hors taxes et hors charges. Il ne comprend pas les charges, la TSC ni la TVA.",
      category: "location",
      propertyKind: "bureau",
      status: "disponible",
      address: "Casablanca Finance City",
      region: "Casablanca-Settat",
      city: "Casablanca",
      builtSurface: "430",
      parkingPlaces: "1",
      features: ["garage"],
      priceDh: "112875",
    },
  ),
];

export const showcaseProperty = (id: string) => SHOWCASE_PROPERTIES.find((item) => item.id === id) || null;
