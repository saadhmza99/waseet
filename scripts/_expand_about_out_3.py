# -*- coding: utf-8 -*-
"""Append unique extra paragraphs so each about_html reaches 120–200 visible words."""
import json
import re
from pathlib import Path

base = Path(r"c:\Users\Hamza\Downloads\waseet\scripts")
out_path = base / "_about_out_3.json"
rows = json.loads(out_path.read_text(encoding="utf-8"))
summary = {r["id"]: r for r in json.loads((base / "_about_batch_3_summary.json").read_text(encoding="utf-8"))}

# Unique closing blocks (French), keyed by username — not a fill-in template.
EXTRA = {
    "abgm": "<p>Sur le marché marrakchi, ABGM se distingue par sa capacité à importer des standards européens tout en adaptant les détails aux contraintes locales : climat, acoustique des riads et exigences esthétiques des villas contemporaines. Les clients bénéficient d’un interlocuteur unique du calepinage à la réception des plafonds.</p>",
    "addoha": "<p>Au-delà des chiffres, Addoha structure des quartiers entiers et accompagne des parcours d’accession variés. Les visiteurs Sifarah peuvent consulter les opérations référencées, comparer les typologies et identifier les programmes correspondant à leur budget et à leur ville d’implantation.</p>",
    "afripinte": "<p>Sur les chantiers, la différence se joue aussi dans la préparation des supports et le choix des systèmes de peinture adaptés à chaque exposition. AFRIPINTE forme ses équipes à ces gestes techniques afin de livrer des surfaces homogènes, durables et conformes aux attentes des maîtres d’ouvrage.</p>",
    "ags-groupe": "<p>À Marrakech, chaque villa ou riad impose des choix structurels particuliers liés au sol, à l’architecture traditionnelle et aux volumes contemporains. AGS Groupe dialogue avec les architectes pour anticiper ces contraintes et livrer des ossatures prêtes pour les lots de finition.</p>",
    "ajenatec": "<p>Un chantier bien équipé gagne en sécurité et en productivité. Ajenatec sélectionne donc des références d’outillage et d’équipements pensées pour les conditions réelles des sites marocains, avec un suivi commercial capable de répondre rapidement aux urgences d’approvisionnement.</p>",
    "alliances-developpement-immobilier-a-d-i": "<p>Alliances Développement Immobilier s’appuie sur une organisation nationale pour concevoir des programmes qui tiennent compte des attentes des familles et des investisseurs. Les fiches projets sur Sifarah facilitent la découverte des opérations et la prise de contact commerciale.</p>",
    "ama-light": "<p>Un bon projet d’éclairage commence par la compréhension des usages : circulation, accueil, mise en valeur des matériaux. AMA Light combine catalogue de luminaires et savoir-faire d’installation pour obtenir des ambiances cohérentes, sans surconsommation ni points d’ombre gênants.</p>",
    "anir-carreaux": "<p>Le showroom et le conseil produit jouent un rôle central : formats, teintes, joints et robinetterie doivent dialoguer. Anir Carreaux aide à composer des salles de bains où la matière et l’eau s’accordent, avec des références adaptées au climat et aux goûts d’Agadir.</p>",
    "archiculte": "<p>Chaque mission Archiculte commence par une lecture fine du site et du programme. L’agence explore ensuite des scénarios spatiaux où mobilier, lumière et circulation renforcent l’identité du lieu, qu’il s’agisse d’un appartement casablancais ou d’un ensemble urbain plus large.</p>",
    "atiba-architecture": "<p>À Berrechid et dans sa région, la réussite d’un projet dépend souvent de la fluidité administrative autant que du dessin. ATIBA Architecture sécurise ces étapes pour que le client avance sereinement, du premier croquis jusqu’à l’autorisation d’occuper les lieux.</p>",
    "awa-architects": "<p>Les projets AWA cherchent la lumière naturelle, la sobriété des volumes et une relation franche avec le paysage marrakchi. L’agence documente chaque étape pour garder une cohérence entre intention architecturale, détails techniques et réalité du chantier.</p>",
    "b-saad": "<p>Pour un promoteur de taille plus agile, la proximité avec le client et la clarté de l’offre comptent autant que le volume livré. B. Saad mise sur cette relation directe à Rabat, en s’appuyant sur Sifarah pour rendre son projet visible et compréhensible.</p>",
    "bechix": "<p>Les installateurs et architectes apprécient de pouvoir s’appuyer sur un stock expérimenté et un conseil de gamme. Bechix cultive cette culture du métier sanitaire, où la disponibilité des pièces et la pertinence des références accélèrent réellement les chantiers.</p>",
    "beton-cire-maroc": "<p>Avant chaque application, l’équipe étudie supports, humidité et usages afin de choisir le bon système de béton ciré. Cette préparation évite les pathologies et garantit un rendu uniforme, qu’il s’agisse d’un sol circulé ou d’un habillage mural décoratif.</p>",
    "boucetta-installation": "<p>La maison connectée n’a de sens que si le socle électrique est sain et normé. Boucetta Installation commence donc par sécuriser tableaux et circuits, puis intègre progressivement les usages intelligents selon le budget et les priorités du client à Mohammedia.</p>",
    "cap-fer": "<p>Sur un marché où les délais de structure conditionnent tout le planning, CAP FER joue le rôle de fournisseur de confiance. Coupes, quantités et nuances d’acier sont traitées avec méthode pour limiter les ruptures de stock sur les chantiers casablancais.</p>",
    "ceramex": "<p>Composer une salle de bain réussie demande de croiser formats, textures et robinetterie. Les équipes Ceramex guident ce choix en showroom, puis assurent une logistique adaptée aux professionnels qui doivent synchroniser livraison et pose.</p>",
    "chic-decoration": "<p>Le détail d’un papier peint, d’une moulure ou d’un parquet change la perception d’un volume. Chic Décoration accompagne cette lecture décorative avec des matériaux sélectionnés et une pose attentive, pour des intérieurs casablancais cohérents et durables.</p>",
    "clairo": "<p>Une piscine performante repose sur un équilibre entre hydraulique, traitement et automatismes. Clairo forme ses équipes à diagnostiquer ces systèmes, recommander les bons produits et intervenir rapidement sur les sites de Casablanca, Marrakech et Agadir.</p>",
    "companiamed": "<p>Lorsque plusieurs lots techniques cohabitent, la coordination évite les conflits de réseaux et les reprises coûteuses. Companiamed organise cette lecture globale à Tanger, du dimensionnement initial jusqu’aux contrats de maintenance pluriannuels.</p>",
    "corinto-sarl": "<p>Chaque type de fermeture répond à un flux, une contrainte thermique ou une exigence de sécurité incendie. Corinto aide à faire ce choix, puis assure pose et entretien pour que rideaux et portes industrielles restent opérationnels au quotidien.</p>",
    "dar-pvc": "<p>À Khouribga, Dar PVC mise sur la proximité : prise de cotes, fabrication et pose sont suivies par la même équipe. Les clients gagnent ainsi en réactivité et en cohérence entre le devis annoncé et le résultat installé sur façade ou en intérieur.</p>",
    "dec-engineering": "<p>Les dossiers DEC sont conçus pour être actionnables sur chantier : métrés clairs, phasage réaliste et alertes sécurité incendie intégrées. Cette culture opérationnelle rassure les maîtres d’ouvrage rabatins qui pilotent des opérations complexes.</p>",
    "dismetal": "<p>Qu’il s’agisse d’équiper un commerce d’un rideau métallique ou de fournir une charpente, Dismetal articule stock et atelier. Cette double capacité réduit les délais et permet d’ajuster les pièces aux plans fournis par les entreprises de Casablanca.</p>",
    "dsbtm": "<p>Les collectivités et promoteurs apprécient la capacité de DSBTM à produire vite sans sacrifier la rigueur des plans. Le devis sous 24 heures n’est qu’un point d’entrée : ensuite, l’équipe structure un livrable technique prêt pour consultation ou exécution.</p>",
    "el-manar-trefilage": "<p>La régularité du fil conditionne la productivité des clients industriels. El Manar Tréfilage contrôle donc ses process pour garantir des diamètres stables, des conditionnements adaptés et une réactivité logistique depuis Casablanca.</p>",
    "elite-wood": "<p>Les projets haut de gamme exigent des assemblages invisibles et des finitions sans défaut. Elite Wood organise son atelier autour de ces exigences, en dialoguant avec architectes et décorateurs pour respecter les tolérances et les textures souhaitées à Fès.</p>",
    "ematus": "<p>Pour un électricien, perdre une demi-journée à chercher une référence coûte cher. EMATUS structure son offre pour réduire ce temps perdu : conseil de marque, disponibilité et services associés au matériel électrique courant à Casablanca.</p>",
    "ermaf": "<p>Les façades aluminium demandent précision d’usinage et pose irréprochable. ERMAF capitalise sur près de trois décennies pour anticiper dilatations, étanchéité et esthétique, en documentant ses chantiers casablancais auprès des promoteurs et architectes.</p>",
    "eurotex": "<p>Formuler une peinture industrielle adaptée au climat de Tanger et aux supports locaux est un métier exigeant. Eurotex Maroc s’appuie sur le savoir-faire du groupe espagnol pour proposer des systèmes cohérents, du primaire à la finition.</p>",
    "explomar": "<p>Choisir un marbre, c’est aussi anticiper veines, formats et contraintes de pose. Explomar accompagne les professionnels dans cette lecture matière, avec une logistique d’import/export rodée et un catalogue orienté qualité architecturale à Rabat.</p>",
    "fadl-energy": "<p>La rentabilité d’une installation solaire dépend d’un dimensionnement honnête et d’une maintenance simple. Fadl Energy explique clairement production attendue, contraintes de toiture et options de chauffe-eau, pour des décisions éclairées à Témara.</p>",
    "ferraille-fer": "<p>Le ferraillage ne tolère pas l’approximation des diamètres. Ferraille Fer sécurise cet approvisionnement en s’appuyant sur des marques reconnues et une disponibilité concrète, pour que les armatures arrivent au rythme des coulages.</p>",
    "fortis-travaux": "<p>Sur un immeuble ou un site industriel, fragmenter électricité, réseaux et sécurité multiplie les interfaces. Fortis Travaux propose au contraire une lecture intégrée, utile aux promoteurs casablancais qui veulent un seul responsable technique.</p>",
    "garden-factory": "<p>Un jardin réussi se décide sur plan autant que sur le terrain. Garden Factory produit des études et visualisations qui aident à trancher plantations, circulations et matériaux avant les premiers terrassements à Rabat et alentours.</p>",
    "gec-engineering": "<p>Des études électriques solides évitent les sous-dimensionnements coûteux. GEC Engineering documente calculs, schémas et automatismes pour que la réalisation et la maintenance restent cohérentes, où que se trouve le site au Maroc.</p>",
    "geocapital": "<p>Sans topographie fiable, les erreurs d’implantation se paient cash. Geocapital livre des plans et coordonnées exploitables, avec un langage clair pour les non-spécialistes comme pour les bureaux d’études casablancais.</p>",
    "gobo-design": "<p>L’éclairage architectural transforme la perception des volumes et des matériaux. Gobo Design sélectionne donc des solutions capables de servir à la fois le confort visuel, la mise en scène et la maintenance des installations professionnelles.</p>",
    "groupe-ryham": "<p>À Fès, le groupe Ryham développe une offre de proximité, adaptée aux attentes locales en matière d’habitat. La fiche projet sur Sifarah permet d’accéder rapidement aux informations essentielles et d’engager la conversation commerciale.</p>",
    "ham-archi": "<p>Dirigée par Houssine Abdallaoui Maane, HAM-ARCHI cultive une relation directe avec le client. Les choix d’espace, de lumière et de matériaux sont discutés sans filtre, pour des projets casablancais fidèles au brief initial.</p>",
    "hbs-etude-et-ingenierie": "<p>Un BET utile livre des documents que le chantier comprend. HBS Étude et Ingénierie travaille dans cet esprit : conception lisible, hypothèses explicites et accompagnement lorsque les arbitrages techniques doivent être tranchés rapidement.</p>",
    "hitech-info": "<p>À Khémisset, la demande en vidéosurveillance et réseaux croît avec les commerces et les habitats. Hitech-Info répond par des installations dimensionnées au juste besoin, sans suréquiper, et avec une maintenance accessible localement.</p>",
    "iadis": "<p>Gagner du temps sur le sourcing, c’est souvent gagner le planning du chantier. IADIS capitalise sur sa connaissance des marques techniques pour proposer des alternatives pertinentes lorsque la référence demandée n’est pas disponible immédiatement.</p>",
    "import-protection": "<p>Des EPI inadaptés sont vite abandonnés sur le terrain. Import Protection insiste donc sur le confort et la conformité, afin que casques, gants et vêtements soient réellement portés par les équipes casablancaises au quotidien.</p>",
    "innoplatre": "<p>La certification Classe 1 ouvre la porte aux marchés publics exigeants. Innoplâtre s’organise pour honorer ces engagements : stock, conseils techniques et réactivité logistique depuis Meknès vers l’ensemble du territoire.</p>",
    "iswood": "<p>Travailler le cèdre et les panneaux dérivés du bois suppose une filière maîtrisée. ISWOOD valorise cette continuité, de l’approvisionnement forestier à la fabrication, pour offrir aux menuisiers casablancais des supports stables et nobles.</p>",
    "jbel-annour": "<p>Produire 1 000 tonnes par jour impose une discipline industrielle stricte. Jbel Annour s’appuie sur ses certifications ISO pour garantir la régularité des briques et rassurer les grands comptes du BTP autour de Mohammedia.</p>",
    "kitchen-ma": "<p>Entre le premier plan et la pose finale, Kitchen.ma gère les interfaces avec plomberie, électricité et électroménager. Cette coordination évite les mauvaises surprises et livre une cuisine réellement utilisable dès le premier jour à Casablanca.</p>",
    "l-etanchiete-du-casa-nord": "<p>Chaleur du foyer et étanchéité de toiture relèvent du même souci de confort durable. L’Étanchéité du Casa Nord relie ces deux expertises pour proposer des solutions cohérentes aux maisons et villas de la région casablancaise.</p>",
    "laboratoire-laboratory-civil-engineering": "<p>Les essais de laboratoire n’ont de valeur que s’ils sont interprétés dans le contexte du chantier. LCE à Salé travaille avec cette exigence pédagogique, pour que résultats et recommandations soient actionnables par les entreprises du BTP.</p>",
    "ledcom": "<p>Un automatisme mal dimensionné devient vite une source d’incidents. LEDCOM insiste sur l’étude préalable, la qualité des motorisations et un SAV capable d’intervenir sur les sites tertiaires et industriels de Casablanca.</p>",
    "lightme": "<p>Une image 3D convaincante accélère les décisions d’investissement. Lightme peaufine lumières, matières et cadrages pour que promoteurs et architectes marrakchis disposent d’outils de vente et de validation à la hauteur de leurs projets.</p>",
    "locarad-ma": "<p>Louer un Manitou avec conducteur, c’est aussi sécuriser la manœuvre. Locarad sélectionne des opérateurs expérimentés et planifie les créneaux pour coller aux phases critiques de levage, du BTP à l’événementiel depuis Témara.</p>",
    "m-y-mod": "<p>La régularité du béton et des blocs conditionne la vitesse de montage. Prefalia (M’Y MOD) surveille ses centrales et ses formulaires pour livrer à Settat et alentours des produits prêts à poser sans surprises dimensionnelles.</p>",
    "makrodoor": "<p>Dans un entrepôt, chaque minute d’ouverture de quai compte. Makrodoor dimensionne portes et équipements pour ces flux, avec une installation soignée et des options adaptées à la logistique casablancaise contemporaine.</p>",
    "maro-reno": "<p>Les cabinets médicaux imposent des contraintes d’hygiène, de circulation et de confidentialité. Maro Reno connaît ces codes et orchestre les corps d’état pour livrer des espaces prêts à accueillir patients et praticiens à Fès.</p>",
    "materiox": "<p>Les tendances de cladding évoluent vite ; encore faut-il des produits posables et durables. Materiox filtre son catalogue pour les architectes et agenceurs casablancais, avec un conseil technique sur les systèmes de pose.</p>",
    "meksa": "<p>Choisir une fenêtre, c’est arbitrer isolation, sécurité et esthétique de façade. MEKSA expose ces critères clairement et s’appuie sur des partenaires reconnus pour proposer des gammes adaptées aux logements casablancais.</p>",
    "mesos-architecture": "<p>L’expérience internationale de Mesos nourrit des références contemporaines, tandis que l’ancrage rabatien assure la maîtrise des procédures locales. Ce double regard produit des projets ambitieux mais réalisables.</p>",
    "microtopographie": "<p>Dans le relief du Rif, la précision topographique est stratégique. Microtopographie combine levés classiques et outils numériques pour livrer des données exploitables, du cadastre au suivi d’ouvrages à Al Hoceïma.</p>",
    "mooua-design": "<p>Freelance ne veut pas dire isolé : Mooua Design collabore étroitement avec les équipes projet pour intégrer retours clients et évolutions de programme. Les livrables restent ainsi alignés sur la réalité commerciale du projet casablancais.</p>",
    "multilum": "<p>Posséder conception, fabrication et pose en interne réduit les pertes d’information. Multilum tire parti de cette organisation pour livrer des ensembles aluminium-verre cohérents, du simple châssis au mur rideau complexe à Casablanca.</p>",
    "n-waccess": "<p>À Tanger, les projets résidentiels et industriels demandent des solutions aluminium robustes face au climat côtier. N&W Access adapte ses systèmes à ces contraintes, avec un suivi de pose et de réception structuré.</p>",
    "nbr-centre": "<p>Depuis 1994, NBR a vu évoluer normes et méthodes d’essai. Le laboratoire d’Agadir met cette mémoire au service de diagnostics sols/matériaux fiables, indispensables avant de lancer des ouvrages sensibles.</p>",
    "nuevo-lighting": "<p>Les composants d’éclairage déterminent la durée de vie des installations. Nuevo Lighting sélectionne des références stables pour les intégrateurs, afin d’éviter les ruptures de gamme et les maintenances chronophages.</p>",
    "oratek-smart-solutions": "<p>Vingt ans sur le terrain forgent une culture du détail technique. ORATEK Smart Solutions applique cette exigence aux bâtiments d’Agadir, où électricité et usages intelligents doivent rester simples à exploiter au quotidien.</p>",
    "parm": "<p>Représenter ARDEX exclusives impose formation et disponibilité produit. PARM à Agadir organise cette transmission auprès des poseurs, pour que les systèmes d’étanchéité et de carrelage soient mis en œuvre selon les règles de l’art.</p>",
    "pladis": "<p>Le second œuvre souffre souvent de ruptures de stock en fin de chantier. PLADIS anticipe ces besoins via ses dépôts Casablanca et Tanger, pour que les revêtements de sol arrivent lorsque les équipes sont prêtes à poser.</p>",
    "polio-carrelage-sanitaire": "<p>À Salé, Polio aide à croiser catalogues et contraintes budgétaires sans sacrifier le style. Grès cérame, imitations marbre et sanitaires sont présentés pour composer des salles d’eau cohérentes du sol au plafond.</p>",
    "preprint": "<p>Une palissade bien habillée protège le chantier et porte l’image du promoteur. Preprint à Casablanca traite ces supports comme de véritables médias, avec des impressions résistantes et des découpes adaptées aux structures.</p>",
    "project-pvc": "<p>Les profilés REHAU associés à une fabrication locale offrent le meilleur des deux mondes. Project PVC à Mohammedia insiste sur l’étanchéité à l’air et à l’eau, critiques pour le confort des logements contemporains au Maroc.</p>",
    "quincaillerie-anasse": "<p>La quincaillerie est le dernier maillon qui fait tenir portes, placards et équipements. Anasse à Casablanca cultive un stock utile et un conseil de terrain pour éviter les retours inutiles au magasin en pleine pose.</p>",
    "readybat": "<p>Depuis 1993, Readybat a accompagné l’évolution des normes de structure et de sécurité. Cette longévité se traduit par des dossiers techniques solides et un conseil de maîtrise d’œuvre apprécié à Marrakech.</p>",
    "roch-deco": "<p>Un bon placo se juge à la planéité et à la préparation peinture. Roch Déco à Agadir soigne ces étapes, tout en intégrant l’isolation phonique là où les cloisons séparent des usages sensibles.</p>",
    "s-o-s-thermique": "<p>En génie climatique, le dépannage rapide sauve souvent la saison. S.O.S Thermique organise ses interventions casablancaises pour diagnostiquer, réparer et conseiller des évolutions d’équipement lorsque le système atteint ses limites.</p>",
    "sahara-stores": "<p>Face au soleil d’Agadir, un store mal dimensionné s’use vite. Sahara Stores conseille toiles, motorisations et fixations adaptées, qu’il s’agisse d’une terrasse résidentielle ou d’une protection commerciale.</p>",
    "saniworld": "<p>Distribuer des composants piscine depuis 24 ans, c’est connaître les références qui tiennent. Saniworld à Casablanca capitalise sur ce retour d’expérience pour orienter installateurs et gestionnaires vers des solutions éprouvées.</p>",
    "saroutech": "<p>La serrure connectée doit rester simple pour toute la famille ou l’équipe. Saroutech configure les modes d’accès et forme les utilisateurs, afin que la technologie renforce la sécurité sans créer de friction à Casablanca.</p>",
    "sebou-peinture": "<p>Art Home (Sebou Peinture) à Kénitra aime les projets où intérieur et extérieur se répondent. Couleurs, revêtements et aménagements de terrasse sont pensés ensemble pour un résultat harmonieux et durable.</p>",
    "sisomo-building-technology": "<p>L’ouate de cellulose offre un excellent bilan thermo-acoustique lorsqu’elle est correctement densifiée. Sisomo / Isocell à Tanger maîtrise soufflage et projection pour atteindre ces performances sans ponts thermiques négligés.</p>",
    "smartvolts": "<p>Les sites publics et industriels exigent des interventions planifiées et documentées. SMARTVolts à Casablanca structure ses prestations CVC dans cet esprit, avec un discours clair sur les options de climatisation et de chauffage.</p>",
    "societe-wassim-de-materiaux-de-construct": "<p>Un négoce de matériaux utile connaît les cadences de chantier. La Société Wassim organise ses ventes pour répondre aux commandes urgentes comme aux approvisionnements planifiés, avec un conseil sur les produits adaptés à chaque phase.</p>",
    "sonajib": "<p>Trois showrooms à Casablanca permettent de toucher le carrelage et de comparer les sanitaires en conditions réelles. Sonajib complète cette expérience par une distribution nationale capable de suivre les chantiers hors agglomération.</p>",
    "stamtech": "<p>Sécurité électronique et informatique doivent parler le même langage sur un site. STAMTECH à Casablanca commercialise et installe ces briques pour bâtir des dispositifs cohérents, du contrôle d’accès au poste de supervision.</p>",
    "ste-reda-et-naoual": "<p>À Taza, trouver un atelier capable d’aluminium, d’inox et de ferronnerie dans la même équipe est un atout. Reda & Naoual cultive cette polyvalence pour livrer des ouvrages sur mesure sans multiplier les sous-traitants.</p>",
    "sterixis-engineering-bureau-d-etudes-tec": "<p>BIM, audits énergétiques et calculs de structure se renforcent mutuellement lorsqu’ils sont menés par la même équipe. Sterixis à Casablanca tire parti de cette transversalité pour proposer des arbitrages techniques lucides.</p>",
    "sufalum": "<p>Une menuiserie aluminium réussie se joue dans les tolérances et l’étanchéité périphérique. Sufalum à Casablanca soigne ces détails de fabrication et de pose pour des ouvrants durables face au vent et aux embruns urbains.</p>",
    "synergy-solutions": "<p>Dépasser le mégawatt installé impose process et SAV. Synergy Solutions à Agadir industrialise cette expérience pour accompagner villas, usines et hôtels avec la même exigence de suivi après mise en service.</p>",
    "tanalt-stone": "<p>Du bloc à la plaque, Tanalt Stone contrôle la transformation pour préserver la beauté de la pierre. Architectes et marbriers casablancais y trouvent un partenaire capable de parler esthétique et contraintes de pose.</p>",
    "tecnovamed": "<p>Intervenir à Dakhla sur des lots techniques aussi variés demande logistique et polyvalence. Tecnovamed organise ses équipes pour assurer conception, installation et maintenance malgré l’éloignement des grands centres industriels.</p>",
    "the-architect": "<p>Une architecture intemporelle se construit dans le dialogue avec le client et le site. The Architect à Casablanca documente ce processus pour que chaque villa ou immeuble conserve une identité claire du concept à la livraison.</p>",
    "trading-partnerships": "<p>Trente ans de présence à Mohammedia créent un réseau de confiance. Trading Partnerships s’en sert pour conseiller équipements de cuisine et climatisations adaptés aux usages réels des professionnels et des collectivités.</p>",
    "ultrapro-confec": "<p>Confectionner des EPI à Meknès permet d’ajuster coupes et grammages aux métiers marocains. Ultrapro Confec écoute ces retours terrain pour livrer des tenues portables, protectrices et disponibles à l’échelle nationale.</p>",
    "usi-cuisine": "<p>USI Cuisine transforme les contraintes techniques — électroménager, plomberie, rangements — en opportunités de design. Le résultat à Casablanca est une cuisine agréable à vivre, pas seulement belle sur plan.</p>",
    "vetco": "<p>À Biougra, VETCO produit au plus près des chantiers du Souss. Cette proximité industrielle réduit les délais de livraison d’agglos, hourdis et aciers, tout en maintenant la conformité aux normes marocaines.</p>",
    "vital-fer": "<p>La distribution métallurgique à Agadir exige stock et connaissance des usages locaux. Vital Fer combine les deux pour servir ferronniers et entreprises générales avec des délais compatibles avec le rythme des chantiers du Sud.</p>",
    "wislane-beton": "<p>Le préfabriqué accélère le gros œuvre lorsque les pièces sont régulières. Wislane Béton à Meknès concentre sa production sur cette constance, pour que agglos, hourdis et planchers s’assemblent sans perte de temps.</p>",
    "z-b-r-metal": "<p>Forge industrielle et décoration métallique partagent la même exigence de finition. ZBR Metal à Tanger travaille ces deux registres, de la pièce technique à l’ouvrage ornemental, avec pose et entretien pour pérenniser le résultat.</p>",
}


def word_count(html: str) -> int:
    t = re.sub(r"<[^>]+>", " ", html)
    return len(re.sub(r"\s+", " ", t).strip().split())


missing = []
for row in rows:
    u = row["username"]
    if u not in EXTRA:
        missing.append(u)
        continue
    # Insert extra before end; avoid duplicating if re-run
    marker = "<!--x-->"
    if marker in row["about_html"]:
        continue
    row["about_html"] = row["about_html"] + marker + EXTRA[u]
    # strip marker for clean output
    row["about_html"] = row["about_html"].replace(marker, "")

if missing:
    raise SystemExit(f"missing extras: {missing}")

issues = []
for i, row in enumerate(rows):
    wc = word_count(row["about_html"])
    if wc < 120 or wc > 200:
        issues.append(f"{i} {row['username']}: {wc} words")
    if len(row["bio"]) > 220:
        issues.append(f"{i} {row['username']}: bio {len(row['bio'])}")

out_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"wrote {len(rows)} entries")
if issues:
    print("ISSUES:")
    for x in issues:
        print(x)
else:
    print("all word counts in 120-200; bios OK")
