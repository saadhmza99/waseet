# -*- coding: utf-8 -*-
"""Expand batch-2 about_html to 120-200 visible words with unique addenda."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "_about_out_2.json"
INP = ROOT / "_about_batch_2.json"

# Extra unique closing blocks (no shared boilerplate). Keyed by username.
EXTRA: dict[str, str] = {
    "abdelrazak-forge-maroc-maitre-ferronnier": """
<p>Sur le terrain, les délais de forge sont annoncés dès le devis, avec un phasage clair entre découpe, assemblage, traitement de surface et pose. Les clients peuvent demander des finitions peintes, thermolaquées ou laissées brutes selon le contexte architectural. Cette exigence artisanale fait d'Abdelrazak Forge Maroc un interlocuteur privilégié dès qu'un ouvrage métallique doit allier sécurité et caractère.</p>
""",
    "act-bet": """
<p>Les livrables sont produits dans un langage compréhensible par le chantier : plans cotés, notes synthétiques et points d'attention signalés en amont. ACT BET intervient aussi bien sur des opérations neuves que sur des renforcements ou des expertises ponctuelles. Cette polyvalence, couplée à une culture du délai, en fait un BET de confiance pour le tissu immobilier et infrastructurel de Marrakech et du Royaume.</p>
""",
    "afcodev": """
<p>Avant pose, un relevé des ouvertures permet d'ajuster les kits et d'éviter les surépaisseurs inesthétiques. Les équipes sensibilisent également les copropriétés aux bonnes pratiques d'entretien du filet afin de conserver transparence et tension dans le temps. AFCODEV se positionne ainsi comme une alternative contemporaine aux grilles traditionnelles, sans compromettre le niveau de protection attendu par les familles.</p>
""",
    "agence-d-architecture-et-d-amenagement-t": """
<p>Les projets 3AT dialoguent souvent avec le tissu urbain casablancais : densités, orientations et contraintes réglementaires sont intégrés dès les premières esquisses. L'agence cultive aussi une culture de chantier, indispensable pour que le dessin résiste aux aléas d'exécution. Cette continuité entre conception et réalisation explique la longévité de la structure et la confiance renouvelée de ses maîtres d'ouvrage.</p>
""",
    "aifox-services": """
<p>Sur les sites complexes, AIFOX SERVICES coordonne ses interventions avec les autres lots techniques afin d'éviter les conflits de cheminement et les reprises coûteuses. Les schémas unifilaires et les plans de câblage sont transmis pour archivage du dossier des ouvrages exécutés. Cette discipline documentaire, associée à une équipe rodée, rassure promoteurs et facility managers sur la durée de vie des installations.</p>
""",
    "alliances-darna": """
<p>La commercialisation s'appuie sur une information transparente concernant surfaces, prestations et calendrier de livraison. Alliances Darna veille à ce que les acquéreurs comprennent les choix architecturaux et les équipements inclus avant de s'engager. Cette pédagogie, rare sur certains marchés, contribue à bâtir une relation de confiance durable entre le promoteur et ses clients à Marrakech.</p>
""",
    "alufactory": """
<p>Les équipes commerciales maîtrisent les critères de performance thermique et d'étanchéité à l'air, essentiels sous le climat marocain. ALUFACTORY peut ainsi orienter vers des ruptures de pont thermique, des vitrages adaptés ou des occultations motorisées selon l'exposition. Cette capacité de conseil différencie le distributeur d'un simple comptoir de profilés et accélère la prise de décision des bureaux d'études.</p>
""",
    "anas-abara-architecture": """
<p>À Tétouan et dans le Nord, le cabinet tient compte des microclimats, des vents et du patrimoine bâti pour proposer des volumes justes. Les missions peuvent s'étendre du permis de construire au suivi de chantier, selon le niveau d'accompagnement choisi. ANAS ABARA ARCHITECTURE cultive une relation de proximité : peu d'intermédiaires, beaucoup d'écoute, et des livrables lisibles pour le client comme pour l'entreprise.</p>
""",
    "ar-solutions": """
<p>La disponibilité du parc est suivie pour limiter les immobilisations inutiles chez le client. AR SOLUTIONS précise les conditions d'utilisation, les assurances et les modalités de restitution afin d'éviter les litiges. Qu'il s'agisse d'un pic d'activité ponctuel ou d'un besoin saisonnier, la location devient un levier de flexibilité pour les entreprises qui refusent de surinvestir dans des engins sous-utilisés.</p>
""",
    "artmood": """
<p>Le parcours client commence par un échange sur les usages quotidiens : rangements, électroménager, circulation. Les plans 3D facilitent la validation avant usinage, ce qui réduit les mauvaises surprises à la pose. artmood assume ainsi un rôle de partenaire global pour la cuisine et le dressing, capable de livrer un résultat homogène du plan de travail aux façades, partout au Maroc.</p>
""",
    "atterra": """
<p>Les études intègrent autant que possible les données locales — sols, ressources en eau, contraintes paysagères — pour éviter des solutions importées inadaptées. ATTERRA collabore avec les acteurs publics et privés qui souhaitent des projets sobres et robustes. En formant les ingénieurs marocains au contact de méthodes éprouvées, le bureau contribue aussi à ancrer durablement l'expertise sur le territoire.</p>
""",
    "azconstruction360": """
<p>Les choix de caméras, lecteurs ou automatismes sont guidés par l'usage réel du site : flux de personnes, horaires, niveau de risque. azconstruction360 privilégie des architectures évolutives pour ajouter des points ultérieurement sans tout reprendre. Cette vision long terme limite le coût total de possession et sécurise les investissements des copropriétés comme des entreprises.</p>
""",
    "beccaprime": """
<p>Les fréquences d'intervention sont ajustées selon l'intensité d'usage des locaux et la saisonnalité des espaces verts. BECCAPRIME peut également fournir les consommables et EPI nécessaires aux équipes internes du client, simplifiant ainsi la logistique. Cette offre « services + produits » crée un interlocuteur unique pour la propreté, le jardin et la protection individuelle à Casablanca.</p>
""",
    "bet-skiredj": """
<p>La culture BIM du bureau facilite la détection des conflits avant le chantier et améliore la coordination avec architectes et entreprises. BET SKIREDJ documente les hypothèses de calcul pour assurer la traçabilité des choix structuraux. Cette rigueur, héritée de quatre décennies de projets, reste le meilleur garant de la sécurité des usagers et de la pérennité des ouvrages livrés.</p>
""",
    "blok-modulaire-maroc": """
<p>Les modules peuvent être reconfigurés ou déplacés lorsque le besoin évolue, ce qui séduit les collectivités et les entreprises en croissance. Blok Modulaire Maroc conseille sur l'isolation, les réseaux et les finitions intérieures pour un confort réel au quotidien. En misant sur la rapidité sans sacrifier l'esthétique, la société propose une alternative crédible au bâtiment traditionnel pour de nombreux programmes.</p>
""",
    "canal-iskane": """
<p>Le promoteur sélectionne ses emplacements en fonction de la desserte, des services de proximité et du potentiel de valorisation. Canal Iskane communique sur les étapes clés — lancement, commercialisation, avancement, livraison — pour limiter l'incertitude des acheteurs. Cette lisibilité est déterminante sur le marché casablancais, où la confiance se gagne autant par la qualité du bâti que par la clarté du discours.</p>
""",
    "celo-fixations-maroc": """
<p>Des fiches techniques et des démonstrations aident les poseurs à choisir la fixation adaptée au support : béton, parpaing, métal ou plaques. CELO FIXATIONS MAROC s'inscrit dans une logique de productivité chantier : moins de temps de pose, moins d'aléas, plus de régularité. Les grossistes et installateurs y trouvent un partenaire industriel dont les standards sont éprouvés à l'échelle internationale.</p>
""",
    "chattal-ingenierie-et-coordination": """
<p>En phase OPC, le bureau clarifie interfaces et responsabilités pour fluidifier les réunions de chantier. Chattal Ingénierie met aussi son expérience multi-technique au service de la cohérence entre structure, fluides et VRD. Cette vision transversale réduit les reprises et aide les promoteurs marrakchis à tenir coûts et délais sur des opérations de plus en plus complexes.</p>
""",
    "cimag": """
<p>Les quantitatifs peuvent être affinés avec les équipes commerciales afin d'éviter les ruptures en cours de coulage ou de montage de plancher. Cimag connaît les rythmes des entreprises casablancaises et adapte retraits et livraisons en conséquence. En restant concentré sur le gros œuvre, le négociant offre une profondeur de gamme et une disponibilité que les circuits généralistes peinent parfois à garantir.</p>
""",
    "co-bureau": """
<p>Les implantations tiennent compte de l'ergonomie, de l'éclairage naturel et des besoins de collaboration ou de confidentialité. Co bureau peut proposer des phases d'équipement progressives pour étaler l'investissement. Du siège de direction à l'open space, l'objectif demeure le même : des postes où l'on travaille mieux, plus longtemps, sans fatigue inutile ni mobilier générique mal adapté.</p>
""",
    "construction-professionals-morocco": """
<p>Les filtres par métier et par zone aident à constituer rapidement une short-list avant de demander des devis. Construction Professionals Morocco ne remplace pas le jugement du maître d'ouvrage, mais accélère la découverte de talents vérifiés. Dans un marché fragmenté, cette mise en relation structurée est un gain de temps pour quiconque lance une villa, une rénovation ou un programme plus ambitieux au Maroc.</p>
""",
    "dalltech-travaux": """
<p>Les terrains de sport sont dimensionnés selon les pratiques visées et les contraintes d'entretien ultérieur. DallTech Travaux insiste sur la préparation des supports : un dallage ou un gazon synthétique ne tient que si le fond de forme est correctement traité. Cette exigence technique, couplée à des finitions soignées, explique la confiance des clubs et collectivités qui recherchent des ouvrages réellement utilisables saison après saison.</p>
""",
    "deante-maroc": """
<p>Les collections couvrent des styles contemporains et plus classiques, facilitant l'harmonie avec le reste de l'aménagement. Deante Maroc accompagne les professionnels sur la disponibilité des pièces détachées et la cohérence des finitions (chromes, noirs, etc.). Pour le particulier, le passage en showroom permet de toucher les produits et d'éviter les déceptions liées aux seuls catalogues en ligne.</p>
""",
    "dfye-decoforyouelite": """
<p>Les projets verre et aluminium demandent une précision millimétrique : dfye organise relevés et validations avant fabrication. L'atelier dialogue avec architectes et décorateurs pour respecter les intentions de lumière et de transparence. À Tanger, où le neuf côtoie la rénovation de standing, cette capacité à livrer des pièces spectaculaires tout en restant fonctionnelles fait la signature DecoForYouÉlite.</p>
""",
    "dromapro": """
<p>Le stock et les commandes sont organisés pour limiter les ruptures sur les références critiques des installateurs. DROMAPRO peut conseiller des bouquets cohérents — par exemple clim et régulation, ou incendie et vidéo — afin d'éviter les incompatibles. Cette approche « panier technique » simplifie la vie des entreprises du Nord qui veulent un seul interlocuteur pour plusieurs familles de produits.</p>
""",
    "effinex": """
<p>Les interventions de maintenance sont planifiées pour réduire les coupures de service et documenter l'historique des équipements. EFFINEX forme aussi ses techniciens aux évolutions des réseaux et des protocoles, héritage d'une culture opérateur. Pour une PME ou une administration casablancaise, disposer d'un partenaire capable de diagnostiquer vite et de remettre en service sans improvisation est un avantage concurrentiel discret mais décisif.</p>
""",
    "eleg-garden-atelier": """
<p>Les palettes végétales sont choisies pour résister à la chaleur et à la rareté de l'eau, sans renoncer à la composition. Eleg Garden Atelier peut intégrer éclairage extérieur, circulation et zones d'ombre dans la même proposition. À Marrakech, où le jardin prolonge le salon, cette vision globale transforme une simple plantation en véritable pièce de vie outdoor.</p>
""",
    "em-etincelle": """
<p>Les références stockées couvrent aussi bien le tableau résidentiel que certains besoins industriels courants. EM ETINCELLE facilite les réapprovisionnements urgents lorsque le chantier ne peut pas attendre une longue importation. En combinant négoce local et circuits d'import-export, la société fluidifie la chaîne d'approvisionnement électrique et d'automatisme sur Casablanca. Domotique et automatisme complètent le rayon pour les installateurs qui cherchent un guichet unique.</p>
""",
    "enras": """
<p>Les contrats de maintenance prévoient contrôles périodiques, réglages et remplacement des pièces d'usure selon le trafic de l'appareil. ENRAS sensibilise les syndics aux bonnes pratiques d'usage pour prolonger la durée de vie des ascenseurs. Moderniser une machinerie obsolète peut aussi améliorer confort et consommation énergétique : l'étude préalable permet d'arbitrer entre réparation lourde et remplacement ciblé.</p>
""",
    "europelles": """
<p>Les machines d'occasion sont inspectées avant mise en vente pour sécuriser l'investissement de l'acheteur. EUROPELLES peut accompagner sur le choix d'accessoires — godets, fourches, brise-roche — selon les applications. Avec une base à Marrakech et une capacité de livraison nationale, le distributeur réduit la distance entre le besoin chantier et la machine opérationnelle.</p>
""",
    "expertsevicelive": """
<p>Les nacelles sont sélectionnées selon hauteur de travail, capacité et contraintes d'accès (ascenseur, sols fragiles, extérieur). Expertsevicelive explique les règles de sécurité essentielles avant mise à disposition. Pour les entreprises de second œuvre casablancaises, louer plutôt qu'acheter évite les coûts de maintenance dormant entre deux chantiers tout en gardant un outil adapté à chaque intervention.</p>
""",
    "fadil-group": """
<p>Les équipes aident à prioriser les postes budgétaires et à anticiper les lead times des matériaux critiques. Fadil Group se positionne comme un facilitateur : moins d'allers-retours entre fournisseurs dispersés, plus de clarté sur ce qui est disponible. Cette approche pragmatique séduit les investisseurs et particuliers qui veulent avancer sans se perdre dans la complexité du BTP casablancais.</p>
""",
    "faw": """
<p>Les automatismes sont réglés pour un usage intensif en contexte résidentiel ou tertiaire, avec un souci du bruit et de la sécurité des usagers. faw coordonne menuiserie et motorisation pour éviter les incompatibilités de quincaillerie. Qu'il s'agisse d'une clinique, d'un bureau ou d'une villa, le résultat vise la même exigence : des ouvrants fluides, étanches et durables.</p>
""",
    "flow-sud": """
<p>Les réseaux sont dimensionnés pour les débits réels et les contraintes d'entretien futur, pas seulement pour le jour de la réception. FLOW SUD documente les parcours et les points de purge afin de faciliter l'exploitation. Dans le contexte agadirien, où la ressource en eau est stratégique, cette rigueur technique n'est pas un luxe : c'est une condition de performance à long terme.</p>
""",
    "frigmar": """
<p>Les techniciens Frigmar interviennent aussi bien sur des dépannages ponctuels que sur des contrats pluriannuels. Le conseil porte sur le dimensionnement des puissances et le choix des technologies adaptées aux locaux. Héritière de 1974, l'entreprise a traversé plusieurs générations d'équipements : cette mémoire technique reste un atout pour diagnostiquer des installations anciennes comme pour déployer des systèmes récents.</p>
""",
    "gc-ceramica": """
<p>Les formats XXL, mosaïques et pièces spéciales sont anticipés dans les plannings d'approvisionnement pour ne pas bloquer les poseurs. GC CERAMICA partage échantillons et conseils de joints/finitions selon le type de support. Architectes et décorateurs apprécient de pouvoir composer des ambiances cohérentes avec un fournisseur qui comprend les enjeux esthétiques autant que logistiques.</p>
""",
    "geoafrique-drillers": """
<p>Les campagnes sont planifiées avec les BET pour coller aux jalons d'études et de permis. GEOAFRIQUE DRILLERS veille à la qualité des prélèvements et à la clarté des rapports destinés aux calculateurs. Sans bonne connaissance du sol, même le meilleur projet architectural prend un risque inutile : G.A.D. existe pour réduire précisément ce risque en amont.</p>
""",
    "gmr-ascenseurs": """
<p>Le suivi après installation inclut la formation des référents site aux gestes simples et aux alertes à transmettre. GMR ASCENSEURS choisit des technologies éprouvées plutôt que des gadgets difficiles à maintenir dans le Sud. Sécurité, confort et praticité restent les critères de décision, car un ascenseur se juge sur dix ou quinze ans d'usage quotidien, pas seulement le jour de la réception.</p>
""",
    "groupe-allali": """
<p>Mohammedia offre un positionnement attractif entre mer et bassins d'emploi casablancais ; le Groupe Allali construit sur cette dynamique. Les acquéreurs bénéficient d'informations régulières sur l'avancement et les modalités d'acquisition. En limitant le portefeuille à des opérations maîtrisées, le promoteur privilégie la qualité d'exécution plutôt que la course au volume. Deux projets déjà visibles sur Sifarah illustrent cette ligne.</p>
""",
    "hagemeyer": """
<p>Les gammes peinture et isolation sont sélectionnées pour tenir face à l'humidité côtière et aux écarts thermiques. Hagemeyer conseille aussi sur les systèmes époxy adaptés aux sols industriels sollicités. En centralisant plusieurs familles de produits, la société réduit le nombre d'interlocuteurs pour les entreprises qui doivent peindre, isoler et finir dans des délais serrés.</p>
""",
    "hba-studio": """
<p>Chaque esquisse cherche l'équilibre entre expression contemporaine et respect du contexte marrakchi — matériaux, ombres, seuils. HBA STUDIO implique le client dans les arbitrages structurants pour éviter les revirements tardifs. Diplômes, inscription à l'Ordre et expérience internationale nourrissent une pratique exigeante, mais toujours au service du vécu quotidien des habitants.</p>
""",
    "hilti-maroc": """
<p>Les équipes Hilti accompagnent les entreprises sur le choix d'ancrages et sur la formation à l'usage sécurisé des outils. Les logiciels et services associés aident à standardiser les méthodes sur les grands chantiers. Au Maroc comme ailleurs, la marque reste synonyme de productivité et de réduction des accidents : un investissement outillage qui se mesure aussi en jours gagnés.</p>
""",
    "i-see-home": """
<p>Les scénarios domotiques sont conçus avec les usagers : présence, absence, nuit, réception. I see home évite la surenchère de gadgets au profit de fonctions réellement utilisées. Vingt ans d'intégration à Casablanca permettent d'anticiper les pièges de câblage et de compatibilité, pour un bâtiment connecté qui reste simple à vivre au quotidien.</p>
""",
    "impair-studio": """
<p>Les délais de production sont calés sur les dates de rendu de concours ou de lancement commercial. Impair studio itère avec le client sur matières, cadrages et éclairages jusqu'à obtenir l'émotion recherchée. Dans un marché où l'image précède souvent la visite réelle, ces livrables deviennent un outil de décision autant qu'un objet esthétique.</p>
""",
    "ink-and-fabrik": """
<p>Les tissus et finitions sont choisis selon les contraintes du métier : abrasion, visibilité, normes éventuelles. INK AND FABRIK peut gérer de petites séries comme des dotations plus larges pour chantiers ou usines. Personnaliser l'uniforme, c'est aussi renforcer la cohésion d'équipe et l'image de marque perçue par les clients sur site.</p>
""",
    "isolfix": """
<p>Les diagnostics préalables identifient ponts thermiques, infiltrations et points faibles acoustiques avant de poser le premier panneau. ISOLFIX coordonne étanchéité et isolation pour éviter les incompatibilités de mise en œuvre. À Casablanca, où le confort d'été et les pluies hivernales coexistent, cette vision d'enveloppe complète fait la différence sur la facture énergétique et la pérennité du bâti.</p>
""",
    "jardinier-elegance-de-la-maison": """
<p>Les entretiens récurrents — tonte, taille, fertilisation, arrosage — sont planifiés pour garder un jardin présentable toute l'année. Jardinier &amp; Élégance de la Maison privilégie des gestes adaptés au sol et au microclimat casablancais. Qu'il s'agisse d'une villa ou d'un siège d'entreprise, l'espace vert devient une signature visuelle soignée plutôt qu'une charge improvisée.</p>
""",
    "kech-design": """
<p>Les contraintes d'usage professionnel (flux clients, hygiène, stockage) sont intégrées dès la conception des meubles. KECH DESIGN livre des agencements cohérents du sol au plafond, y compris détails d'éclairage intégrés lorsque le projet le demande. À Marrakech, ville d'hospitalité et de commerce, cette capacité à habiller aussi bien un riad qu'une pharmacie est un atout rare.</p>
""",
    "l-atelier-piscine-by-housni": """
<p>Le choix du revêtement, du système de filtration et du traitement d'eau est expliqué sans jargon excessif. L'Atelier Piscine by Housni anticipe aussi l'accès chantier et les contraintes de voisinage à Témara. Une piscine réussie se juge après plusieurs saisons : étanchéité, clarté de l'eau et facilité d'entretien sont donc placées au même niveau que l'esthétique du bassin.</p>
""",
    "laboratoire-cibtp": """
<p>Les délais d'essais sont communiqués clairement pour s'insérer dans les plannings de bétonnage ou de réception. LABORATOIRE CIBTP conserve la traçabilité des échantillons et des conditions d'essai. Pour les entreprises du Souss, disposer d'un laboratoire de proximité réduit les coûts logistiques et accélère les décisions techniques lorsque le chantier ne peut pas attendre.</p>
""",
    "leaderpak": """
<p>Les systèmes VIDAL sont conçus pour des formats variés et des épaisseurs de carreaux contemporains. LEADERPAK forme et informe les poseurs sur les gestes qui maximisent la planéité. En industrialisant des accessoires autrefois artisanaux, la marque accélère les chantiers sans sacrifier le rendu final que jugent architectes et maîtres d'ouvrage.</p>
""",
    "lexmaeriel": """
<p>Les formules de crédit-bail aident à lisser la trésorerie tout en disposant d'engins récents. LEXMAERIEL insiste sur la disponibilité et l'état du matériel : un engin en panne coûte plus cher qu'une journée de location. Pour les entreprises du Sud, cette fiabilité opérationnelle est aussi importante que le tarif journalier affiché.</p>
""",
    "locaman": """
<p>Le chauffeur inclus sécurise les manœuvres en milieu urbain dense et réduit la charge de formation pour le client. Locaman précise rayons d'action, disponibilités et conditions météo qui peuvent impacter l'intervention. Sur l'axe Rabat–Témara–Salé, cette offre « machine + opérateur » répond aux urgences de levage sans délai de recrutement d'un conducteur temporaire.</p>
""",
    "luxalight": """
<p>Les conseillers aident à équilibrer flux lumineux, température de couleur et style décoratif. Luxalight suit les tendances européennes tout en tenant compte des pratiques d'installation locales. Avec plus de trente ans d'histoire et un réseau de magasins, l'enseigne reste l'adresse incontournable pour qui refuse de laisser l'éclairage au hasard du dernier moment de chantier.</p>
""",
    "maison-saber-architecture": """
<p>Les projets explorent la relation entre intérieur et paysage tangérois, souvent riche en vues et en vents. Maison Saber Architecture prend le temps de comprendre le mode de vie du client avant de figer les plans. Cette lenteur volontaire du début évite les espaces beaux mais inhabitables, et donne à chaque pièce une raison d'être claire.</p>
""",
    "marmol-martil": """
<p>Les lots sont préparés selon les quantités et les veines souhaitées pour assurer l'harmonie visuelle sur de grandes surfaces. MARMOL MARTIL travaille avec des professionnels qui connaissent les contraintes de pose et de finition des pierres dures. À Agadir, porte du Sud, la société facilite l'accès à des matériaux nobles sans multiplier les intermédiaires. Marbre et granit restent au cœur exclusif de cette activité d'import-export.</p>
""",
    "materca": """
<p>La couverture nationale implique une logistique rodée et des relations durables avec les transporteurs. MATERCA reste concentrée sur son métier de négociant : disponibilité, régularité et prix justes. Depuis 1994, cette constance a fait de l'entreprise un réflexe pour de nombreuses entreprises qui ne veulent pas improviser leurs approvisionnements à chaque nouveau chantier. Casablanca demeure la tête de pont de cette distribution.</p>
""",
    "mdf-services": """
<p>Les façades, quincailleries et éclairages intégrés sont choisis pour résister à un usage quotidien intensif. MDF Services valide les plans avec le client avant découpe afin de limiter les retouches. Sur Salé et le grand Rabat, l'atelier s'est fait une réputation de finitions propres et de pose respectueuse des lieux déjà habités.</p>
""",
    "mes-traitement": """
<p>Les analyses et réglages tiennent compte de la dureté de l'eau locale et du type de bassin. MES Traitement forme les exploitants aux gestes de contrôle quotidiens pour éviter les dérives. À Marrakech, où piscines et jardins sont centraux, une eau claire et saine n'est pas un détail : c'est une condition du confort et de la valeur du bien.</p>
""",
    "metastone": """
<p>Les finitions — adouci, flammé, brossé — sont proposées selon l'usage (sol intérieur, extérieurs antidérapants, murs). METASTONE peut livrer seulement le matériau ou assurer la pose complète. En contrôlant la filière depuis Taza jusqu'au chantier, la société réduit les écarts de teinte et garantit une authenticité difficile à obtenir via des circuits purement importateurs.</p>
""",
    "mongrillage": """
<p>Les hauteurs, remplissages et types de pose sont adaptés au niveau de sécurité recherché et au règlement de la zone. Mongrillage stocke accessoires et poteaux pour accélérer le démarrage des chantiers. Qu'il s'agisse d'une villa, d'un site industriel ou d'un espace public à Mohammedia, la clôture devient un élément durable du paysage plutôt qu'un bricolage temporaire.</p>
""",
    "multi-tx": """
<p>Les équipes se déplacent selon les opportunités de chantier, ce qui permet d'intervenir hors de Sidi Kacem tout en gardant une base organisée. Multi Tx clarifie les lots inclus dans chaque devis pour éviter les zones grises entre gros œuvre et finitions. Cette franchise contractuelle, associée à un suivi de terrain, rassure les clients éloignés qui ne peuvent pas être présents chaque jour.</p>
""",
    "my-zdayn-invest": """
<p>Le béton décoratif est mis en œuvre avec des contrôles de dosage et de cure pour éviter fissures et disparités de teinte. my zdayn invest mise sur un matériel moderne pour gains de précision et de sécurité. En conjuguant esthétique et robustesse, l'entreprise s'adresse aux projets qui refusent de choisir entre image et durabilité sur Casablanca.</p>
""",
    "natural-stone-suppliers": """
<p>Les plaques sont sélectionnées et numérotées lorsque le calepinage l'exige, notamment sur les grands halls. Natural Stone Suppliers accompagne le choix entre pierre locale et marbres d'importation selon budget et intention architecturale. Vingt et une années de métier autorisent un conseil franc : certaines pierres magnifiques ne conviennent pas à tous les usages, et mieux vaut le dire avant la pose.</p>
""",
    "nexview": """
<p>Les visites peuvent être intégrées aux annonces en ligne et aux réseaux des agences pour maximiser la portée. NexView soigne la luminosité et le parcours afin d'éviter les angles morts frustrants. À Casablanca, où les déplacements coûtent du temps, offrir une exploration 24h/24 devient un avantage commercial mesurable pour vendeurs et bailleurs. L'expérience immersive remplace souvent une première visite physique inutile.</p>
""",
    "optima-peintures": """
<p>Les formulations évoluent avec les attentes de faible odeur, de lessivabilité et de résistance UV. OPTIMA PEINTURES travaille avec les distributeurs et applicateurs pour assurer une mise en teinte fiable. Fabriquer au Maroc depuis 1985, c'est aussi garantir une proximité logistique et une compréhension fine des supports locaux — du béton brut aux enduits traditionnels. Colles et émulsions complètent naturellement la gamme peinture.</p>
""",
    "paradis-amenagement": """
<p>Les bois et panneaux sont choisis selon humidité ambiante et usage (porte technique, dressing, cuisine). PARADIS AMENAGEMENT organise la pose pour limiter la gêne dans les logements déjà occupés. Vingt ans de chantiers casablancais ont enseigné une leçon simple : le beau ne dure que si les assemblages, la quincaillerie et l'équerrage ont été traités sans compromis. Intérieur comme extérieur, la même exigence s'applique.</p>
""",
    "philippe-benisty": """
<p>Les Résidences Carline illustrent une recherche d'équilibre entre standing, services et cadre de vie marrakchi. Philippe Benisty veille à la cohérence entre promesse commerciale et réalité livrée. Pour les acquéreurs locaux ou internationaux, cet alignement est la condition d'une transaction sereine et d'une occupation durable du bien. Un projet est d'ores et déjà référencé sur Sifarah pour faciliter la découverte.</p>
""",
    "point-tp": """
<p>Les chantiers de réhabilitation exigent diagnostic préalable : structure, humidité, réseaux existants. POINT TP documente ces constats avant d'engager les travaux lourds. L'expérience Dar Niaba montre qu'un bâtiment patrimonial ou symbolique peut retrouver une seconde vie lorsque restauration et aménagement contemporain sont menés avec la même exigence.</p>
""",
    "prefa-norm": """
<p>La préfabrication permet de lisser la qualité d'une pièce à l'autre et de raccourcir les phases critiques sur site. PREFA NORM adapte ses productions aux besoins des entreprises du Souss et aux contraintes de transport. Pour les chantiers qui courent après le délai, disposer d'éléments béton prêts à poser change radicalement le rythme d'avancement. Production et commercialisation restent ancrées à Agadir.</p>
""",
    "profundes": """
<p>Les plannings intègrent les aléas classiques — intempéries, délais fournisseurs — avec des marges réalistes. profundes communique régulièrement sur l'avancement pour que le client de Rabat reste maître de ses arbitrages. Du gros œuvre aux finitions, la continuité d'équipe évite les pertes d'information qui coûtent cher lorsqu'on change d'intervenant à chaque phase.</p>
""",
    "qoubae-elec": """
<p>Les interventions de dépannage sont traitées avec la même rigueur que les installations neuves : diagnostic, sécurisation, remise en conformité. Qoubae elec conseille sur le choix des luminaires en fonction de l'usage de la pièce et de la consommation. À Casablanca, réactivité et sérieux technique font souvent plus que de longs discours marketing. Particuliers et professionnels y trouvent un interlocuteur unique pour courant et lumière sur leurs projets casablancais.</p>
""",
    "rahma_immobilier": """
<p>Chaque mandat est abordé avec une estimation réaliste et une stratégie de diffusion adaptée au bien. Rahma Aamrani prend le temps d'écouter contraintes familiales, horizons de placement et critères de localisation. Cette approche humaine, couplée à une sélection soignée, vise des transactions durables plutôt que des mises en relation précipitées.</p>
""",
    "robot-securite-process": """
<p>Les maintenances préventives et curatives sont planifiées pour limiter les indisponibilités des systèmes de sécurité. ROBOT SECURITE PROCESS forme les équipes client aux procédures d'alerte et de première intervention. Depuis 1998, cette culture de la continuité de service rassure les sites sensibles qui ne peuvent pas se permettre une détection incendie ou une vidéo défaillante.</p>
""",
    "s-i-t-e-f-ingenieur-geometre-topographe": """
<p>Les plans sont livrés dans des formats exploitables par architectes et BET, avec métadonnées claires. SITEF rappelle les limites de précision selon la méthode employée pour éviter toute surinterprétation. Dans un pays où le foncier et le permis sont critiques, un géomètre fiable est souvent le premier maillon d'un projet qui démarre sans contentieux. Expertise, précision et fiabilité restent la devise affichée.</p>
""",
    "saez": """
<p>Le dimensionnement de la grue tient compte des charges, portées et contraintes urbaines du site. SAEZ accompagne aussi la phase location avec un suivi technique pour maximiser la disponibilité. Soixante ans de culture grue se traduisent par des machines pensées pour les réalités du chantier moderne, pas seulement pour la brochure commerciale. Fabrication, vente et location forment un continuum de service à Casablanca.</p>
""",
    "sanivy": """
<p>Les gammes sont renouvelées pour suivre les tendances de design tout en maintenant des références de volume pour le neuf collectif. Sanivy travaille avec des importateurs et revendeurs qui ont besoin de régularité d'approvisionnement. Sur Casablanca, cette capacité à mixer standing et accessibilité permet d'équiper des projets très différents sans multiplier les fournisseurs. Turquie et Chine restent des origines majeures, complétées par l'Europe.</p>
""",
    "sarabo": """
<p>Les équipes commerciales aident à composer des nomenclatures cohérentes pour éviter les incompatibilités filetage ou pression. SARABO connaît les urgences des plombiers et organise le retrait rapide des pièces critiques. Plus d'un quart de siècle plus tard, la société reste un hub sanitaire et chauffage pour ceux qui construisent et entretiennent Casablanca au quotidien. Tuyauterie et salle de bain y cohabitent naturellement.</p>
""",
    "sdk-wood": """
<p>Le stockage et le séchage sont surveillés pour livrer des bois stables, prêts à l'usinage. SDK WOOD conseille sur les essences selon usage structurel ou décoratif. Trois générations de métier, c'est une mémoire des fournisseurs et des pièges à éviter — un capital invisible qui protège les menuisiers et charpentiers marocains. Qualité et service restent les deux piliers affichés.</p>
""",
    "sicatgb": """
<p>La diversification vers la formation et la quincaillerie permet d'accompagner le secteur au-delà du seul lot travaux. SICATGB mobilise son réseau pour des partenariats industriels lorsque le projet le justifie. Quarante et une années d'existence traduisent une capacité rare à traverser les cycles économiques du BTP casablancais sans perdre le contact du terrain. Aménagement et sous-traitance complètent le dispositif.</p>
""",
    "sm-stone": """
<p>Les clients sont reçus pour choisir veines et finitions sur échantillons grandeur nature lorsque c'est possible. SM STONE organise logistique et protection des plaques jusqu'au site pour limiter la casse. Entre Salé et Rabat, la proximité facilite les allers-retours de validation, précieux sur les projets d'exception où chaque dalle compte. Le site de Bouknadel accueille les professionnels sur rendez-vous.</p>
""",
    "societe-marocaine-d-amenagement-des-espa": """
<p>Le nettoyage de fin de chantier rend les espaces immédiatement présentables pour la réception ou la commercialisation. SMAEV coordonne jardinage et propreté pour un rendu homogène le jour J. À Tanger, où l'image des abords compte autant que l'intérieur, cette double compétence évite de jongler entre plusieurs prestataires mal synchronisés.</p>
""",
    "solutions-gazon-afrique": """
<p>Le gazon en plaques assure une reprise plus rapide qu'un semis classique lorsque le calendrier est serré. Solutions Gazon Afrique conseille sur l'arrosage et l'entretien des premières semaines, déterminantes pour la densité du tapis. Collectivités et promoteurs y gagnent un extérieur vert, uniforme et prêt à l'usage sans attendre une saison complète.</p>
""",
    "sousstherme": """
<p>Les maintenances saisonnières anticipent les pics de chaleur du Sud et limitent les pannes en pleine canicule. sousstherme peut coordonner clim, électricité et plomberie thermique pour des chantiers plus fluides. Présente à Marrakech et Agadir, l'entreprise suit ses clients sur un axe touristique et résidentiel où le confort d'été n'est pas négociable. Fourniture et pose s'inscrivent dans la même responsabilité.</p>
""",
    "ste-old-maati": """
<p>Les volumes sont préparés selon le planning de bétonnage pour éviter les ruptures de charge. STE OLD MAATI connaît les exigences des entreprises de la région de Settat en matière de granularité et de régularité. Dix ans et plus de pratique locale valent souvent mieux qu'un discours national : ici, la confiance se construit chargement après chargement.</p>
""",
    "ste-store-access": """
<p>Les intégrateurs apprécient la disponibilité des pièces et le support sur les paramétrages logiciels. STORE ACCESS aide à dimensionner le nombre de portes, lecteurs et caméras selon le plan de sécurité. À Rabat, capitale administrative et tertiaire, des solutions d'accès fiables sont un prérequis pour bureaux, campus et sites sensibles. ZKTeco, WDLink et Dahua structurent une offre déjà éprouvée.</p>
""",
    "studio-33-architects": """
<p>Les matériaux sont choisis pour le climat agadirien : lumière intense, proximité océanique, vents. Studio 33 architects refuse les copies de catalogues au profit de détails dessinés pour le site. Du premier croquis au mobilier, la même ligne directrice — luxe discret, fonctionnalité, ancrage — guide les arbitrages avec le client.</p>
""",
    "synelec-energy": """
<p>Les équipes conseils orientent vers des solutions d'éclairage efficaces et des appareillages adaptés aux normes. SYNELEC ENERGY reste proche des installateurs avec un support de devis et un suivi des disponibilités. Couvrir le territoire national depuis Casablanca impose une logistique disciplinée : c'est précisément ce que la société s'attache à garantir au quotidien.</p>
""",
    "takga": """
<p>La facturation transparente et le transport jusqu'au lieu convenu simplifient la vie des conducteurs de travaux. Takga contrôle la qualité des sables et graviers pour limiter les mauvaises surprises au malaxage. À Fès et alentours, disposer d'un fournisseur de granulats réactif reste un facteur clé pour tenir le rythme des coulages.</p>
""",
    "technoprime": """
<p>Les interfaces utilisateur sont simplifiées pour que la maison connectée reste agréable à vivre au quotidien. Technoprime sélectionne des marques dont le SAV et la disponibilité des pièces sont réalistes au Maroc. À Agadir, cette approche pragmatique séduit promoteurs et particuliers qui veulent la modernité sans la complexité inutile. Éclairage intelligent, climatisation et audio professionnel s'intègrent dans les mêmes scénarios domotiques pour villas et programmes neufs.</p>
""",
    "th-guard": """
<p>Les plannings d'agents tiennent compte des heures de pointe et des zones sensibles du site. TH.GUARD forme ses équipes à l'accueil autant qu'à la vigilance, car la sûreté passe aussi par le comportement. Coupler gardiennage et nettoyage permet au client de Témara de traiter deux postes critiques avec un seul responsable contractuel.</p>
""",
    "tradebridge-international-sarl": """
<p>Les systèmes magnétiques offrent une flexibilité d'implantation appréciée des architectes d'intérieur. Tradebridge International conseille sur les drivers, intensités et températures de couleur pour éviter les écarts entre showroom et réalité. Via Lumosart, la société vise les projets standing qui considèrent la lumière comme un matériau à part entière. Suspensions, lustres et appliques murales complètent le discours technique par le décoratif haut de gamme.</p>
""",
    "trecq": """
<p>Les rapports sont rédigés pour être actionnables : seuils, interprétations, recommandations. TRECQ déplace ses moyens sur l'ensemble du Royaume lorsque les projets l'exigent. Vingt-cinq ans de contrôles ont bâti une réputation simple : lorsque TRECQ valide un matériau ou un sol, les décideurs peuvent avancer avec un niveau de confiance élevé.</p>
""",
    "user_a1cdf942": """
<p>Dès que le titulaire aura renseigné son activité, sa zone et ses références, la fiche gagnera en visibilité auprès des maîtres d'ouvrage. En attendant, Sifarah reste le canal privilégié pour un premier échange professionnel. Compléter bio, spécialités et réalisations est le meilleur moyen d'attirer des demandes qualifiées sur la plateforme.</p>
""",
    "vergata-s-a-r-l": """
<p>Les urgences de dernière minute — visserie, quincaillerie de porte, consommables — sont traitées avec priorité lorsque le stock le permet. VERGATA connaît le rythme des finitions casablancaises et la frustration d'un chantier stoppé pour une pièce manquante. Quatre ans d'écoute client ont ancré cette culture du « débloquer le chantier aujourd'hui ».</p>
""",
    "viasim": """
<p>Les modes opératoires de démolition intègrent protection du voisinage, gestion des déchets et sécurité des équipes. Viasim transpose des standards acquis sur de grands projets internationaux à l'échelle des chantiers de Khouribga et du Maroc. Cette rigueur méthodologique rassure les maîtres d'ouvrage qui ne veulent pas improviser sur des phases à haut risque. Terrassement et préparation de plateforme suivent la même discipline.</p>
""",
    "webmount": """
<p>Les décors et textures suivent les tendances européennes tout en restant adaptés aux usages locaux. Webmount conseille menuisiers et agenceurs sur l'usinage et l'assemblage des panneaux pour limiter les défauts. Vingt-trois ans d'import ont bâti un réseau logistique capable d'alimenter régulièrement les ateliers casablancais en mélaminés stables et esthétiques. MDF et aggloméré forment le socle de cette offre écologique revendiquée.</p>
""",
    "youssef-lahkim-architecture-studio": """
<p>Les missions d'urbanisme et de paysage élargissent le regard au-delà du seul bâtiment, vers l'îlot et le quartier. Le studio casablancais cultive une mémoire de projets qui nourrit chaque nouvelle commande. Avec Imane Raffaq au suivi technique, la qualité d'exécution reste alignée sur l'ambition architecturale annoncée au client dès les premières réunions.</p>
""",
}


def wc(html: str) -> int:
    return len(re.sub(r"<[^>]+>", " ", html or "").split())


def main() -> None:
    rows = json.loads(OUT.read_text(encoding="utf-8"))
    missing = [r["username"] for r in rows if r["username"] not in EXTRA]
    if missing:
        raise SystemExit(f"missing EXTRA for {missing}")
    for r in rows:
        extra = EXTRA[r["username"]].strip()
        about = r["about_html"].rstrip()
        if extra and extra not in about:
            about = about + "\n" + extra
        w = wc(about)
        if w < 120:
            # add one more generic-but-unique sentence from facts
            raise SystemExit(f"still short {w}: {r['username']}")
        if w > 220:
            print(f"WARN long {w} {r['username']}")
        r["about_html"] = about
    OUT.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    words = [wc(r["about_html"]) for r in rows]
    print(f"entries={len(rows)} words min={min(words)} max={max(words)} avg={sum(words)/len(words):.0f}")


if __name__ == "__main__":
    main()
