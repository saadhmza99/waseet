const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

export const SHOWCASE_PROFILE_USERNAME = "rahma_immobilier";

export type ShowcasePost = {
  id: string;
  user_id: string;
  description: string;
  images: string[];
  single_image_url: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_sponsored: boolean;
  created_at: string;
  post_type: "standard";
  city: string;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    location: string;
    profession: string;
    is_verified: boolean;
    phone: string;
  };
};

const post = (
  id: string,
  firm: string,
  username: string,
  profession: string,
  city: string,
  createdAt: string,
  description: string,
  images: string[],
): ShowcasePost => ({
  id,
  user_id: `showcase-${username}`,
  description,
  images,
  single_image_url: images[0] || "",
  likes_count: 0,
  comments_count: 0,
  shares_count: 0,
  is_sponsored: false,
  created_at: createdAt,
  post_type: "standard",
  city,
  profiles: {
    id: `showcase-${username}`,
    username: SHOWCASE_PROFILE_USERNAME,
    full_name: firm,
    avatar_url: images[0] || "",
    location: city,
    profession,
    is_verified: true,
    phone: "",
  },
});

export const SHOWCASE_POSTS: ShowcasePost[] = [
  post(
    "showcase-post-chb",
    "CHB Architects",
    "chbarchitects",
    "Architecture",
    "Casablanca",
    "2026-09-28T09:30:00.000Z",
    "Le siège de bureaux conçu pour BMCE à Casablanca réunit environ 6 000 m² sur 26 m de haut. Le bâtiment compte dix niveaux : deux sous-sols, un rez-de-chaussée et sept étages.\n\nLes sous-sols accueillent le parking, les locaux techniques et les archives. Le rez-de-chaussée rassemble l'accueil, les salles de réunion, la cafétéria, le fitness et la maintenance. La façade associe verre, inox, alucobond et ardoise agrafée. La maîtrise d'œuvre est celle de CHB Architects, le cabinet de Hakim Benjelloun, au 2, rue des Moineaux.",
    [
      photo("photo-1486406146926-c627a92ad1ab"),
      photo("photo-1497366216548-37526070297c"),
      photo("photo-1497366811353-6870744d04b2"),
      photo("photo-1497366754035-f200968a6e72"),
      photo("photo-1524758631624-e2822e304c36"),
    ],
  ),
  post(
    "showcase-post-tgcc",
    "TGCC",
    "tgcc",
    "Construction",
    "Béni Mellal",
    "2026-09-20T11:00:00.000Z",
    "TGCC tient le lot 2 du CHU de Béni Mellal, gros œuvre et étanchéité, sur le site d'Adouz / Foum El Anceur. L'hôpital n'est pas ouvert. Le programme publié porte sur environ 25 hectares, près de 107 360 m² et 520 lits.\n\nLes quantités annoncées pour ce lot comprennent 176 000 m³ de terrassement, 82 000 m³ de béton, 8 500 tonnes d'acier et plus de 50 000 m² d'étanchéité. L'estimation du lot est d'environ 497,4 MDH. Un point d'étape situe l'ensemble du projet autour de 20 %, avec un horizon 2027.",
    [
      photo("photo-1541888946425-d81bb19240f5"),
      photo("photo-1504307651254-35680f356dfd"),
      photo("photo-1590494165264-1ebe3602eb80"),
      photo("photo-1503387762-592deb58ef4e"),
      photo("photo-1581094794329-c8112a89af12"),
    ],
  ),
  post(
    "showcase-post-cgi",
    "Compagnie Générale Immobilière",
    "cgi",
    "Immobilier",
    "Casablanca",
    "2026-09-14T08:45:00.000Z",
    "La Compagnie Générale Immobilière, filiale de la Caisse de Dépôt et de Gestion, développe et commercialise des programmes résidentiels et tertiaires sur l'ensemble du Maroc. Le métier couvre le montage de l'opération, la mise en vente des lots et le suivi jusqu'à la livraison.\n\nLe prix d'un logement ou d'un plateau est celui du programme, indiqué dans le dossier de vente. Il n'y a pas d'honoraires de prestation séparés. Les acquéreurs et les partenaires d'une opération sont reçus sur le dossier du programme concerné.",
    [
      photo("photo-1545324418-cc1a3fa10c00"),
      photo("photo-1460317442991-0ec209397118"),
      photo("photo-1600596542815-ffad4c1539a9"),
      photo("photo-1600585154340-be6161a56a0c"),
      photo("photo-1600607687939-ce8a6c25118c"),
    ],
  ),
  post(
    "showcase-post-interstyle",
    "Interstyle Design",
    "interstyledesign",
    "Rénovation & Aménagement",
    "Casablanca",
    "2026-09-08T16:15:00.000Z",
    "Interstyle Design, cabinet fondé par Wafaa Elkass et installé à Massira, reprend les appartements à Casablanca à partir de 60 m². Les bureaux et les locaux sont étudiés au cas par cas.\n\nUn seul interlocuteur coordonne les corps d'état, de la maçonnerie aux finitions : électricité, plomberie, revêtements et menuiseries. Le cabinet intervient aussi sur les biens livrés bruts, les villas en construction et les plateaux à aménager. Le montant dépend de l'état du bien et du niveau de finition. Il est remis sur devis.",
    [
      photo("photo-1600210492486-724fe5c67fb0"),
      photo("photo-1600566753190-17f0baa2a6c3"),
      photo("photo-1600607687939-ce8a6c25118c"),
      photo("photo-1600585154340-be6161a56a0c"),
      photo("photo-1576013551627-0cc20b96c2a7"),
    ],
  ),
  post(
    "showcase-post-betam",
    "BETAM",
    "betam",
    "Foncier & Conseil",
    "Casablanca",
    "2026-08-27T10:00:00.000Z",
    "BETAM assure les études techniques et le suivi de réalisation pour des maîtres d'ouvrage. La mission part du dossier d'études et se poursuit sur le chantier, jusqu'au contrôle de l'exécution.\n\nC'est dans ce cadre que le bureau a porté les études et le suivi du siège de bureaux de l'OFPPT à Casablanca. Le périmètre — structure, fluides, économie, ordonnancement — est fixé contrat par contrat. Les honoraires sont sur devis. Le suivi peut se faire au Maroc, y compris à distance lorsque le dossier le permet.",
    [
      photo("photo-1497366216548-37526070297c"),
      photo("photo-1497366811353-6870744d04b2"),
      photo("photo-1503387762-592deb58ef4e"),
      photo("photo-1486406146926-c627a92ad1ab"),
      photo("photo-1524758631624-e2822e304c36"),
    ],
  ),
  post(
    "showcase-post-hajji",
    "Hajji & Associés",
    "hajjiassocies",
    "Notaires & Juridique",
    "Casablanca",
    "2026-08-18T15:20:00.000Z",
    "Hajji & Associés, cabinet d'avocats d'affaires, accompagne les ventes et les baux immobiliers. La mission couvre l'audit des titres et des autorisations, la promesse, le contrat de vente et les baux commerciaux, puis la coordination avec le notaire pour l'acte authentique.\n\nLe cabinet intervient pour des promoteurs, des agences, des investisseurs et des entreprises, à Casablanca et à Rabat. L'examen des pièces peut se faire à distance. Les honoraires sont établis sur devis, selon le dossier.",
    [
      photo("photo-1450101499163-c8848c66ca85"),
      photo("photo-1521587760476-6c12a4b040da"),
      photo("photo-1454165804606-c3d57bc86b40"),
      photo("photo-1497366754035-f200968a6e72"),
      photo("photo-1497366811353-6870744d04b2"),
    ],
  ),
];

export const showcasePost = (id: string) => SHOWCASE_POSTS.find((item) => item.id === id) || null;
