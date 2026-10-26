# -*- coding: utf-8 -*-
"""Append unique French paragraphs so each about reaches 120–200 visible words."""
from __future__ import annotations

import importlib.util
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BATCH = ROOT / "_about_batch_0.json"
OUT = ROOT / "_about_out_0.json"

# Extra unique paragraphs keyed by username (plain HTML snippets to append before closing)
EXPAND: dict[str, str] = {
"6po-industrie": "",  # already long enough likely
"abrar-industrie": """<p>Sur le terrain, la coordination entre carrières, préfabriqués et bitume réduit les interfaces pour les entreprises générales. Abrar Industrie mise sur des volumes prévisibles et un dialogue technique avec les conducteurs de travaux, afin d’anticiper les pics de saison et les contraintes de normes matériaux. Cette lecture industrielle du chantier fait la différence lorsque les délais de coulage ou d’enrobés ne souffrent aucun à-coup logistique.</p>""",
"adli-menage": """<p>Au-delà du simple import, Adli Ménage veille à la cohérence esthétique des trios : finitions assorties, formats encastrables compatibles avec les plans de travail courants, et documentation claire pour les poseurs. Nous aidons aussi à anticiper les délais d’approvisionnement pour que la cuisine ne reste pas bloquée en attendant un four ou une hotte. Un service pensé pour les rythmes du second œuvre casablancais.</p>""",
"afrique-decoupe-laser": """<p>Chaque dossier démarre par l’analyse des fichiers CAO et des contraintes matière. Nous optimisons les imbrications pour limiter les chutes, puis enchaînons découpe, formage et soudure selon le cahier des charges. Les lots partent contrôlés, prêts à l’assemblage chez l’intégrateur ou sur site. Cette industrialisation fine séduit autant les ateliers automobiles que les projets d’architecture métallique exigeants à Casablanca.</p>""",
"agtm": """<p>La complémentarité des deux associés IAV Hassan II permet de croiser regards cadastral et topographique sur un même dossier. Nous livrons des plans exploitables par les bureaux d’études et les notaires, avec une traçabilité claire des méthodes (drone, laser 3D, levés classiques). À Mohammedia comme sur le grand Casablanca, AGTM vise des délais réalistes sans sacrifier la précision millimétrique attendue du géomètre.</p>""",
"alfatech-ascenseur": """<p>Le dimensionnement tient compte du trafic, de la hauteur de course et des normes de sécurité applicables. Nous coordonnons avec le gros œuvre pour réserver les gaines, puis assurant la pose et les essais avant mise en service. Les monte-charges industriels bénéficient du même sérieux que les cabines résidentielles : fiabilité, accessibilité et maintenance anticipée pour éviter les immobilisations coûteuses.</p>""",
"alomrane-holding": """<p>Au-delà des chiffres de programmes, Al Omrane structure des opérations qui articulent logement, équipements et tissu urbain. Les acquéreurs et partenaires trouvent sur Sifarah une porte d’entrée pour localiser les projets et comprendre l’offre publique de promotion. Le site alomrane.gov.ma complète cette lecture avec l’actualité institutionnelle et les orientations nationales du groupe.</p>""",
"amastroy-engineering-consulting": """<p>À Oujda, la proximité avec les chantiers de l’Oriental accélère les allers-retours entre hypothèses de calcul et réalités d’exécution. Amastroy rédige des notes claires, des plans lisibles et des recommandations de ferraillage ou de charpente adaptées aux entreprises locales. Nous restons disponibles pendant la phase chantier pour lever les indécisions techniques sans ralentir le planning.</p>""",
"anouar-almostakbal": """<p>Le promoteur casablancais sélectionne des implantations pensées pour le quotidien des ménages : desserte, services de proximité et typologies adaptées à la demande. Les fiches projets sur Sifarah permettent de comparer les opérations et de suivre leur avancement commercial. Anouar AlMostakbal misera toujours sur une communication transparente autour des programmes, du plan de masse aux finitions annoncées.</p>""",
"arnoss-cuisine": """<p>L’atelier casablancais d’Arnoss Design travaille les mélaminés, laques et plans de travail selon le budget et le style du client. Nous anticipons les réservations plomberie et électroménager pour éviter les mauvaises surprises le jour de la pose. Le résultat : une cuisine ou un dressing qui s’inscrit naturellement dans l’architecture intérieure, sans improviser au dernier moment.</p>""",
"atlas-confort-et-securite": """<p>ACS intervient dès les études d’exécution pour caler les réseaux CVC et fluides avec les autres corps d’état. La maintenance préventive prolonge ensuite la performance des installations industrielles et tertiaires. Qu’il s’agisse d’un désenfumage réglementaire ou d’une centrale de traitement d’air, nos équipes documentent les ouvrages pour faciliter l’exploitation future du bâtiment.</p>""",
"awrach": """<p>Sur plus d’un demi-siècle, Awrach a traversé les évolutions du béton et des modes constructifs marocains. Cette mémoire se traduit par des équipes habituées aux contrôles, aux phasages serrés et aux exigences de solidité structurelle. Les maîtres d’ouvrage qui choisissent Awrach recherchent avant tout un interlocuteur capable d’assumer le gros œuvre sans improvisation.</p>""",
"badryteam-sarl": """<p>À Tanger, la lumière et les angles de vue changent d’un quartier à l’autre : BadryTeam adapte cadrages et post-production à chaque bien. Les promoteurs reçoivent des packs prêts pour réseaux sociaux, sites web et salles de vente. En huit ans, la société a appris à raconter un programme immobilier en images aussi bien qu’un appartement témoin, avec la même exigence visuelle.</p>""",
"becomar": """<p>L’usine de Berrechid alimente des chantiers exigeants où la régularité des préfabriqués conditionne la vitesse d’élévation. BECOMAR investit dans la recherche de solutions béton plus performantes, tout en maintenant des références classiques certifiées. Les bureaux d’études apprécient de pouvoir spécifier des éléments standards ou des pièces spéciales sans changer de fournisseur.</p>""",
"bilss-elec": """<p>Sur une villa neuve, Bilss’elec coordonne chemins de câbles, points d’éclairage et réservations avec le plâtrier et le peintre. Nous livrons un tableau étiqueté et un schéma simple pour la maintenance. Les particuliers casablancais y gagnent une installation lisible, conforme et prête à accueillir d’éventuelles évolutions domotiques plus tard.</p>""",
"brs-energie": """<p>À Salé, le climat atlantique impose des choix CVC réalistes et une plomberie résistante. BRS Énergie dimensionne aussi les kits solaires en fonction de l’orientation et des besoins ECS. La force de l’entreprise est de parler le même langage sur tous ces lots, pour éviter les conflits de réseaux dans les gaines techniques.</p>""",
"casatransmateriaux": """<p>Trente-cinq ans d’activité, c’est aussi une connaissance fine des granulats demandés selon les formulations béton. Casatransmateriaux aide les clients à caler les livraisons sur les fenêtres de coulage et à éviter les stocks morts sur site. La confiance se construit livraison après livraison, lorsque la qualité reste stable d’un camion à l’autre.</p>""",
"ceratube": """<p>Le showroom et le stock Ceratube permettent de composer une salle de bain complète ou de dépanner une pièce industrielle rapidement. Les équipes conseillent sur la compatibilité ROBIMED et les alternatives selon le budget. Cette double lecture — particulier exigeant et professionnel pressé — structure toute la relation commerciale à Casablanca.</p>""",
"chilivin": """<p>Chi’Livin aime les projets où l’architecture et l’intérieur se dessinent ensemble, plutôt que par couches successives. Matériaux durables, lumière naturelle et détails de menuiserie sont pensés dès l’esquisse. À Casablanca, l’agence livre ainsi des lieux de vie cohérents, prêts à être habités sans rupture entre le gros œuvre et la décoration.</p>""",
"clenz": """<p>Depuis 2022, CLENZ a construit un catalogue orienté conformité et disponibilité. Les responsables HSE apprécient de pouvoir regrouper EPI, hygiène et consommables chez un même distributeur casablancais. La logistique rapide réduit les ruptures de stock qui mettent en risque les équipes sur site, surtout dans le BTP et l’industrie.</p>""",
"comptoir-ouhassou": """<p>À Tanger, l’humidité marine et le soleil stressent les peintures extérieures : le Comptoir Ouhassou oriente vers des systèmes adaptés. Pour la carrosserie ou la piscine, les formulations changent encore ; d’où l’intérêt d’un magasin spécialisé plutôt qu’un rayon généraliste. Vingt-six ans de comptoir, c’est autant d’histoires de supports et de climats.</p>""",
"creatrend": """<p>Creatrend suit les tendances sanitaires turques et asiatiques pour renouveler régulièrement les collections de mitigeurs et d’appareils. Les revendeurs casablancais y trouvent des lignes compétitives sans renoncer à un design contemporain. L’import structuré sécurise aussi les volumes pour les opérations de plusieurs logements.</p>""",
"dari-btp-sarl-au": """<p>À Khouribga, DARI BTP s’appuie sur des profils diplômés pour organiser planning, sécurité et coordination des sous-traitants. Les aménagements complémentaires au gros œuvre sont traités avec la même exigence que la structure. Cette culture d’entreprise rassure les maîtres d’ouvrage régionaux qui veulent un interlocuteur unique et lisible.</p>""",
"decolag": """<p>Le parquet SPC étanche séduit les salles d’eau et les commerces à fort passage ; les bardages PVC accélèrent les rénovations sans gros œuvre. DECOLAG à Tanger conseille sur l’association des profils, plinthes et peintures pour un rendu homogène. L’objectif : un intérieur moderne, durable et simple à entretenir au quotidien.</p>""",
"doc-tech": """<p>À Marrakech, Doc Tech dimensionne vidéosurveillance et incendie selon la typologie du site — riad, hôtel ou entrepôt. La domotique vient ensuite fluidifier éclairage et accès. Sept ans d’installations locales nous ont appris à composer avec l’architecture traditionnelle autant qu’avec le neuf, sans dénaturer les lieux.</p>""",
"duo-design": """<p>Duo Design construit chaque meuble autour des gestes quotidiens : ouverture, rangement, éclairage intégré. Vingt ans d’atelier casablancais nourrissent un sens du détail rare sur les chants, ferrures et jeux de volumes. Qu’il s’agisse d’une cuisine familiale ou d’un espace commercial, le sur-mesure reste la règle, jamais l’exception.</p>""",
"el-wifaq-verre": """<p>Le réseau logistique d’El Wifaq Verre réduit les délais pour les menuisiers alu et les façadiers hors Fès. Les conseils sur le trempé ou le feuilleté évitent les erreurs de spécification coûteuses. Deux décennies d’expérience nationale font de l’entreprise un interlocuteur stable pour les appels d’offres comme pour les dépannages urgents.</p>""",
"elkron-maroc": """<p>Les certifications EN et NF d’ELKRON rassurent les directions techniques des grands comptes. Au Maroc, la filiale URMET traduit ce catalogue mondial en solutions adaptées aux sites sensibles — justice, santé, médias, retail. Formation des installateurs partenaires et suivi après-vente complètent une offre pensée pour durer.</p>""",
"energy-panel-maroc": """<p>Depuis 2012, Energy Panel Maroc accompagne la montée en puissance des projets sobres en énergie. Le conseil porte autant sur le dimensionnement que sur la pertinence économique des solutions. L’entreprise s’adresse aux maîtres d’ouvrage qui veulent des résultats mesurables, pas seulement un discours « vert ».</p>""",
"espace-steel": """<p>À Médiouna, Espace Steel industrialise des modules qui se transportent et s’assemblent vite. La location séduit les chantiers temporaires ; la vente répond aux besoins semi-permanents. Qualité d’assemblage et options (isolation, électricité de base) différencient l’offre sur un marché où le prix seul ne suffit plus.</p>""",
"ev-adipe": """<p>EV.ADIPE sélectionne des végétaux qui tiennent le climat casablancais et conseille sur les densités de plantation. L’arrosage automatique est dimensionné pour limiter le gaspillage tout en gardant un jardin vivant. Particuliers et syndics y trouvent un partenaire capable de livrer plantes et technique dans la même conversation.</p>""",
"ezza-btp": """<p>Sur Agadir, Ezza BTP connaît les contraintes du littoral et des sols locaux. L’entreprise structure ses chantiers autour d’un contrôle régulier des ferraillages et des coulages. Cette discipline d’exécution attire les maîtres d’ouvrage qui refusent les improvisations sur le gros œuvre, cœur de la valeur d’un bâtiment.</p>""",
"familec-trav-sarl": """<p>Familec Trav à Rabat alimente les électriciens en références courantes et en solutions plus techniques pour l’industrie. Le stock de câblage et d’appareillage réduit les allers-retours inutiles. Un négoce de proximité reste, pour beaucoup d’artisans, le meilleur levier pour tenir un planning serré.</p>""",
"ficuss-jardin": """<p>Ficuss Jardin commence souvent par une lecture du sol et de l’exposition avant de dessiner massifs et circulations. L’entretien programmé protège ensuite l’investissement végétal. À Casablanca, où l’eau et le vent stressent les plantations, cette approche réaliste fait la différence entre un jardin photo et un jardin vivant.</p>""",
"forum-diffusion": """<p>Forum Diffusion observe les nouvelles façons de travailler — hybridation, flex, salles de concentration — et adapte ses implantations. Trente-deux ans à Rabat, c’est une mémoire des marques et des usages. L’équipe livre aussi un conseil d’implantation pour que le mobilier serve vraiment la productivité, pas seulement l’image.</p>""",
"gazouni": """<p>L’hydroseeding Gazouni convient aux grands linéaires, talus autoroutiers et espaces verts où le gazon traditionnel peine. Les certifications UAB et ECOCERT rassurent les donneurs d’ordre publics et privés. Depuis Casablanca, les équipes projettent un mélange qui accroche le sol et accélère la couverture végétale durablement.</p>""",
"geneltec": """<p>Geneltec à Mohammedia aime les villas où électricité classique et smart home cohabitent sans complexité inutile. Serrures WiFi, caméras et solaire sont intégrés dans une logique d’usage simple pour la famille. L’entreprise documente les installations pour que la maintenance future reste accessible.</p>""",
"geomarec": """<p>GEOMAREC à Tanger traite plomberie, CVC et piscine comme un système de confort unique. Quinze ans de dépannages et d’installations neuves nourrissent un sens pratique très apprécié des particuliers. Les professionnels, eux, retrouvent un interlocuteur capable de caler les lots fluides sur le planning général du chantier.</p>""",
"green-atlas-studio": """<p>Green Atlas Studio dessine des jardins qui dialoguent avec l’architecture plutôt que de la masquer. Irrigation raisonnée, palettes végétales locales et entretien programmé prolongent la beauté des espaces. Quinze années à Casablanca confirment qu’un beau plan ne suffit pas : il faut aussi une mise en œuvre soignée et un suivi.</p>""",
"gyptec-platre": """<p>GYPTEC à Safi positionne le plâtre comme matériau d’avenir : santé intérieure, modularité, performance. Les équipes qualité et environnement travaillent à réduire l’empreinte tout en maintenant les niveaux techniques attendus par le second œuvre. Pour les industriels du bâtiment, c’est un partenaire de filière, pas seulement un fournisseur.</p>""",
"hatim-idrissi": """<p>Sous la direction de Hatim Idrissi, Naturel Design privilégie des matières sincères et des ambiances lumineuses. Le cabinet casablancais suit le projet du concept aux détails de pose. Les clients y cherchent une signature intérieure claire, loin des catalogues impersonnels, avec un dialogue permanent sur les usages réels du lieu.</p>""",
"helpworks-building": """<p>Helpworks aligne terrassement, réseaux et génie civil pour livrer des plateformes vraiment viabilisées. Depuis 2017 à Casablanca, l’entreprise a appris à anticiper les imprévus de sol et les interfaces avec les concessionnaires. Un lotissement bien préparé, c’est moins de conflits plus tard entre promoteur et entreprises de bâtiment.</p>""",
"hn-bloom": """<p>HN BLOOM capitalise dix ans de marché marocain pour traduire les besoins de confort en scénarios domotiques lisibles. SMART G4 CONTROL structure l’offre, tandis que la sécurité électronique protège les accès. Étude, pose et commercialisation restent dans la même équipe, ce qui simplifie la vie des promoteurs et des particuliers.</p>""",
"icynene": """<p>La mousse projetée ICYNENE épouse les reliefs et limite les ponts thermiques difficiles à traiter autrement. À Casablanca, l’entreprise intervient sur toitures, combles et locaux industriels. Le discours n’est pas seulement technique : il porte aussi sur le confort d’été, l’acoustique et la sobriété énergétique au fil des saisons.</p>""",
"indubois": """<p>L’usine Lakhyayta d’Indubois combine cadence industrielle et personnalisation. Les partenariats Hofmat, Kronospan et Renogloss sécurisent la qualité des panneaux. Depuis 2017, la SARL AU (capital 1 000 000 MAD) livre portes, dressings et cuisines avec une exigence de finition digne de l’habitat contemporain casablancais.</p>""",
"isodec": """<p>ISODEC enchaîne cloisons, sols, peinture et lots techniques pour éviter la dispersion des responsabilités. Vingt-cinq ans de rénovation à Casablanca enseignent l’humilité devant les immeubles anciens et la précision sur le neuf. Le client reçoit un planning unique et une qualité d’exécution homogène d’une pièce à l’autre.</p>""",
"itamtec": """<p>ITAMTEC à Rabat dépannne aussi bien une villa qu’un site logistique : motorisations, rails, télécommandes. Quinze ans d’automatismes enseignent à diagnostiquer vite et à proposer le bon niveau de remplacement. L’entretien préventif reste le meilleur allié pour éviter les portails bloqués aux heures critiques.</p>""",
"kaan-studio": """<p>Kaan-Studio à Meknès produit des images qui aident à décider et à vendre. La VR plonge le client dans l’espace avant construction ; les vidéos 3D dynamisent les campagnes. Dix ans de rendu ont affiné un style réaliste, utile autant aux promoteurs qu’aux industriels visualisant une future usine.</p>""",
"kitchen-youssi-by-oqaidi": """<p>Kitchen Youssi by Oqaidi refuse les cuisines « catalogue » sans âme. L’ergonomie de circulation, la lumière et les matériaux nobles guident chaque plan. Du premier rendez-vous à la pose, le client suit un parcours clair, avec des choix assumés plutôt qu’une accumulation d’options inutiles.</p>""",
"la-washateria": """<p>La Washateria intervient quand le chantier est presque fini — moment où la poussière et les rayures se voient le plus. Marbre, mosaïque, vitrages et Alucobond reprennent leur éclat ; la peinture en rappel sécurisé traite les façades hautes. À Témara, c’est souvent le dernier maillon avant la remise des clés.</p>""",
"lahlou-workers": """<p>Lahlou Workers importe des standards internationaux sur les chantiers d’Agadir : finitions, phasages, contrôle qualité. Hôtels et résidences premium exigent une coordination millimétrée des corps d’état. Depuis 2022, l’entreprise capitalise une expérience acquise ailleurs pour livrer des ouvrages de prestige sans compromis.</p>""",
"legbtp": """<p>LEGBTP, depuis 2007, élargit son offre au-delà du forage classique : hydrologie, géophysique, expertises et contrôles matériaux. La conformité NF P 94-500 structure les missions géotechniques. À Casablanca, le laboratoire est un interlocuteur de référence pour sécuriser les fondations avant le premier béton.</p>""",
"livingspace-ma": """<p>LivingSpace.ma orchestre contenus, ciblage et diffusion pour que chaque programme immobilier trouve son audience. L’agence casablancaise parle le langage des promoteurs et celui des plateformes digitales. Un dispositif 360° évite les actions dispersées et mesure ce qui convertit vraiment.</p>""",
"locaziz-location-de-materiel-et-outillag": """<p>Locaziz à Salé maintient un parc d’échafaudages et d’outillage prêt à partir. Vingt ans de location ont appris à conseiller le bon matériel selon hauteur, durée et type de façade. Réserver plutôt qu’acheter libère la trésorerie des artisans pendant les pics d’activité Rabat-Salé.</p>""",
"ma-industry": """<p>MA Industry s’appuie sur plus de trente-cinq ans d’expertise Andross en Italie pour proposer des solutions d’isolation thermique adaptées au Maroc. L’enjeu : performance énergétique et confort, avec un discours technique plutôt que marketing. Casablanca sert de base pour toucher chantiers neufs et rénovations exigeantes.</p>""",
"mall-zellij-distribution": """<p>Mall Zellij alimente B2B et B2C avec des collections Italie–Espagne–Turquie régulièrement renouvelées. Quatorze ans de distribution ont construit un stock profond pour éviter les ruptures sur les références phares. Architectes et particuliers y trouvent des carreaux et sanitaires alignés sur les tendances sans sacrifier la durabilité.</p>""",
"maroc-modulaire-steel": """<p>Maroc Modulaire Steel, SARL 2024 à Casablanca, concentre fabrication et personnalisation des modules. Bureaux de vente et guérites partagent la même exigence de solidité et de rapidité de déploiement. L’expérience métier cumulée des équipes compense la jeunesse juridique de la structure.</p>""",
"matra-equipement": """<p>Matra Équipement conseille le débit et la configuration des pompes à projeter selon mortiers et hauteurs. À Casablanca, les entreprises de second œuvre gagnent du temps dès que la projection remplace l’application manuelle. Un bon équipement, bien choisi, se rentabilise sur quelques chantiers intensifs.</p>""",
"menage-pro": """<p>MÉNAGE-PRO cadre chaque nettoyage de chantier sur devis, avec un périmètre clair : poussières, résidus de peinture, sols. Safi, El Jadida et Marrakech sont desservis pour accompagner promoteurs et particuliers jusqu’à la remise des clés. La transparence du suivi évite les mauvaises surprises le jour J.</p>""",
"metalnov": """<p>METALNOV à Fès dessine un mobilier urbain pensé pour durer sous le soleil et le passage intensif. Fonte pour réseaux et structures sur mesure complètent l’offre collectivités. Esthétique et robustesse ne s’opposent pas : elles se conçoivent ensemble dès le dessin d’atelier.</p>""",
"mirage-colors": """<p>Mirage Colors, revendeur Jotun à Berrechid, accompagne du nuancier jusqu’à la livraison nationale. Les peintures extérieures sont choisies pour résister au climat marocain ; les intérieures pour la lessivabilité du quotidien. Artisans et particuliers y trouvent un conseil technique rare dans la distribution classique.</p>""",
"most-pack": """<p>MOST PACK organise le gros œuvre autour du béton armé et du coffrage maîtrisé. Villas et bâtiments suivent des phasages clairs pour limiter les reprises. Sur le génie civil comme sur le résidentiel, la qualité des ferraillages et des coulages reste le premier critère de réussite structurelle.</p>""",
"multireseaux-sarl": """<p>Multiréseaux sélectionne Schneider, Legrand, ABB, Siemens ou Hager selon le niveau d’exigence du site. Quinze ans d’installations électriques et informatiques au Maroc nourrissent une méthode : étudier, fournir, poser, conformer, maintenir. Résidentiel, tertiaire et industrie y trouvent le même sérieux documentaire.</p>""",
"nait-dbou-batiments": """<p>Nait Dbou Bâtiments traite l’enveloppe comme un système : étanchéité, isolation thermique et acoustique se renforcent mutuellement. Toitures, terrasses et sous-sols casablancais bénéficient de solutions adaptées aux infiltrations et aux pertes énergétiques. Le confort des occupants est le critère final de réussite.</p>""",
"nextile": """<p>Nextile à Casablanca ne se contente pas de vendre des EPI : l’équipe questionne le métier, les risques et le confort thermique. BTP, logistique et maintenance reçoivent des tenues qui tiennent la journée de travail. Sécurité et image de l’entreprise avancent ainsi ensemble.</p>""",
"omari-zellige": """<p>Omari Zellige perpétue à Fès un geste artisanal que quarante-deux ans d’atelier ont affiné. Architectes du monde entier y commandent des motifs qui racontent le Maroc sans pastiche. Chaque carreau émaillé porte la marque de la main, tout en respectant les tolérances nécessaires à une pose contemporaine.</p>""",
"orca-lum": """<p>Orca Lum relie esthétique aluminium et exigences techniques des portes isothermes. Hôpitaux et industries agroalimentaires y trouvent des fermetures adaptées au froid et à l’hygiène ; l’habitat, des baies et façades durables. Fabrication, pose et SAV restent sous le même toit casablancais.</p>""",
"pe2s-smart-home": """<p>Depuis 2012, PE2S transforme appartements et programmes neufs en lieux connectés sans complexité superflue. Électricité, domotique, sécurité et réseaux sont coordonnés pour éviter les doublons de câblage. Promoteurs et particuliers apprécient la transparence du suivi et la fiabilité des mises en service.</p>""",
"platinova": """<p>Avec quatre villes — Casablanca, Tanger, Marrakech, Agadir — PLATINOVA rapproche plafond, sol, mur et isolation des chantiers. Seize ans de second œuvre marocain guident le choix des références stockées. Les poseurs gagnent du temps lorsqu’un même groupe livre plusieurs lots cohérents.</p>""",
"port-log": """<p>Port Log profite de sa proximité avec le port de Casablanca pour faire tourner vente et location de conteneurs. Bureaux de chantier, stockage et showrooms modulaires partent rapidement vers les sites. Vingt ans d’activité ont bâti une communauté d’utilisateurs fidèles dans le BTP et la logistique urbaine.</p>""",
"priority-fire-equipment": """<p>Priority Fire Equipment à Casablanca ne s’arrête pas à la pose : la formation des équipes sur site est décisive en cas d’incident. Étude, fourniture, installation et maintenance suivent les normes internationales. Treize ans de projets incendie enseignent que la prévention se joue autant dans les procédures que dans le matériel.</p>""",
"propoly-industry": """<p>Propoly Industry extrude des tôles polyester pour des usages où légèreté et résistance aux intempéries comptent. Couvertures, bardages et abris casablancais y trouvent une alternative industrielle aux matériaux plus lourds. L’outil de production local réduit les délais pour les aménageurs et constructeurs légers.</p>""",
"quincaillerie-global": """<p>Quincaillerie Global regroupe EPI, quincaillerie et matériaux pour limiter les courses entre fournisseurs. À Casablanca, artisans et entreprises y préparent une journée de chantier en un seul passage. La diversité du stock répond autant au dépannage qu’aux démarrages de lots complets.</p>""",
"realestate": """<p>Dakimm navigue entre le marché soussi d’Agadir et celui de Rabat pour dénicher villas, appartements et opportunités d’investissement. L’accompagnement couvre la lecture du bien, le voisinage et les étapes administratives. Un partenaire de confiance pour les acquéreurs qui veulent éviter les approximations.</p>""",
"rosaver": """<p>Rosaver (Renner Maroc) équipe les ateliers de menuiserie avec vernis, lasures et systèmes couleur exigeants. Vingt ans d’import à Casablanca ont bâti une expertise sur les supports bois intérieurs et extérieurs. Effets spéciaux et diluants complètent une offre pensée pour les finisseurs professionnels.</p>""",
"s2g": """<p>S2G à Mohammedia croise géotechnique, géophysique et contrôles NDT pour réduire les mauvaises surprises de sol. Vingt-cinq ans d’ingénierie des sols nourrissent des recommandations concrètes pour adapter l’ouvrage. Formation continue et investigations maritimes élargissent encore le champ d’intervention du laboratoire.</p>""",
"saniramar-sarl": """<p>Depuis 2001, Saniramar a appris les urgences des chantiers casablancais : une référence manquante peut bloquer toute une équipe. Le négoce industriel et bâtiment y répond par un stock utile et un conseil terrain. Plomberie et second œuvre restent au cœur de cette relation de long terme.</p>""",
"santaire-2000-orobath": """<p>Sanitaire 2000 Orobath, depuis 1987, a vu passer les modes sans perdre l’exigence qualité. Carrelage et sanitaire se choisissent ensemble pour un rendu de salle de bain cohérent. Plombiers et carreleurs y trouvent des collections durables, pensées pour la pose et pour le quotidien des occupants.</p>""",
"sbtp-smart-building-technologies-power": """<p>Sous la marque POWER, SBTP formule mortiers, colles, enduits et peintures pour les conditions réelles des chantiers marocains. L’accompagnement technique aide les applicateurs à choisir le bon produit au bon moment. Fabrication locale et vision performance distinguent cette offre casablancaise sur le marché du second œuvre.</p>""",
"sevolta": """<p>Sevolta (Electro Volt Ampère) intervient sur les tableaux, circuits et éclairages avec une priorité : la sécurité des usagers. À Casablanca, particuliers et locaux pro apprécient un diagnostic clair et une exécution propre. L’électricité générale bien faite se fait oublier — jusqu’au prochain agrandissement du logement.</p>""",
"sitca": """<p>SITCA à Rabat aime les projets qui vont de la structure aux jardins. Construction neuve, rénovation et aménagements extérieurs sont portés par la même exigence de suivi. Les maîtres d’ouvrage gagnent un partenaire capable d’enchaîner les phases sans perdre le fil du programme initial.</p>""",
"smetec-sarl": """<p>SMETEC livre des infrastructures sportives où le revêtement, le drainage et les équipements forment un tout. Huit ans à Casablanca auprès du public et du privé ont affiné le phasage clé en main. De l’étude à la réception, le club ou la collectivité dispose d’un interlocuteur unique.</p>""",
"sogetech": """<p>SOGETECH à Berrechid fournit des levés qui nourrissent directement les dossiers VRD et génie civil. Sept ans d’outils de pointe et d’exigence terrain rassurent aménageurs et entreprises. Une topographie juste en début de projet évite des surcoûts bien plus lourds ensuite.</p>""",
"soqalin-accessoires": """<p>Soqalin Accessoires stocke les petites pièces qui font perdre des journées lorsqu’elles manquent : ferrures, profils alu, accessoires de cuisine. À Casablanca, les poseurs passent au comptoir pour finir proprement un lot. La spécialisation quincaillerie–cuisine évite le rayon fourre-tout inefficace.</p>""",
"ste-2ch-carriere": """<p>Ste 2CH carrière calibra galets, graviers et sables pour les formulations béton et les couches de voirie. La régularité granulométrique conditionne la qualité des coulages. Les entreprises qui s’approvisionnent régulièrement y gagnent une prévisibilité rare sur un poste souvent sous-estimé.</p>""",
"ste-solar-unlimited-casa": """<p>Solar Unlimited Casa dimensionne ballons et champs solaires selon la consommation ECS réelle. Injection, pompage et hybrides complètent l’offre pour les projets plus ambitieux. À Casablanca, l’entreprise parle aussi climatisation et chauffage pour une vision énergétique globale du bâtiment.</p>""",
"stockage-maroc": """<p>Stockage Maroc, fort de près de quarante ans, importe pour garder des prix compétitifs sans négliger la robustesse des rayonnages. Entrepôts et bureaux casablancais sont aménagés pour optimiser chaque mètre cube. L’accompagnement projet évite les erreurs de capacité et de circulation.</p>""",
"sun-negoce": """<p>SUN Negoce alimente les installateurs casablancais en câbles, appareillage et éclairage courants. La disponibilité du stock fait gagner des demi-journées précieuses sur chantier. Un négoce électrique efficace, c’est d’abord une logistique de proximité et des références qui tournent.</p>""",
"taboug-building": """<p>Taboug Building développe à Agadir des programmes résidentiels pensés pour le cadre de vie littoral. La présence sur Sifarah et Chridari facilite la découverte de l’offre. Le promoteur mise sur une communication claire autour de son projet référencé, pour des acquéreurs mieux informés.</p>""",
"tanger-equipements-et-automatismes": """<p>TEA SARL à Tanger fiabilise armoires et automatismes sur des sites où l’arrêt de production coûte cher. Électricité industrielle et maintenance technique avancent ensemble. Les usines du détroit y trouvent un intervenant local, réactif, capable de diagnostiquer et de remettre en service rapidement.</p>""",
"teemlan-engineering-servcies": """<p>Teemlan à Tanger produit des dossiers CVC, CFO/CFA, plomberie et incendie cohérents entre eux. Huit ans d’études techniques ont appris à anticiper les conflits de réseaux. Résidentiel, tertiaire et industrie bénéficient d’un accompagnement de la conception jusqu’au suivi de réalisation.</p>""",
"top-grad-equipement": """<p>TOP GRAD, depuis 2003, sélectionne des marques internationales éprouvées en cuisine professionnelle. Chefs et hôteliers casablancais y trouvent performance et durabilité ; le pôle matériel médical élargit l’offre vers la santé. Vingt-trois ans de terrain guident des conseils d’équipement réalistes.</p>""",
"travaux-ait-ahmed": """<p>Travaux Ait Ahmed relie structure et paysagisme pour des projets casablancais complets. Renforcement de poteaux, gros œuvre et extérieurs sont menés avec quinze ans de recul. Un seul interlocuteur évite les zones grises entre le béton et le jardin livré.</p>""",
"uniconstru-maroc": """<p>Uniconstru Maroc sécurise l’approvisionnement ciment et matériaux autour de Kénitra. Les entreprises du Gharb limitent ainsi les ruptures qui cassent le rythme des coulages. Un dépôt de confiance, c’est d’abord une disponibilité régulière et une relation commerciale simple.</p>""",
"vedovadeco": """<p>VedovaDeco pose des panneaux PVC décoratifs qui changent un hall ou un salon sans démolir. Résistance humidité, classement feu B1 et isolation renforcent l’argument technique. Promoteurs et décorateurs casablancais apprécient découpe sur mesure et livraison nationale pour tenir les délais de finition.</p>""",
"vetfashion-north-africa": """<p>Vetfashion North Africa personnalise tenues et EPI pour que la sécurité porte aussi les couleurs de l’entreprise. Six ans à Casablanca auprès de l’hôtellerie, l’industrie et la santé ont affiné coupes et grammages. Concevoir et fabriquer localement accélère les séries et les retouches.</p>""",
"vitres-intelligentes-maroc": """<p>Vitres Intelligentes Maroc équipe salles de réunion et chambres d’hôtel d’un verre qui s’opacifie à la demande. L’installation légère séduit les sites où l’on refuse les cloisons définitives. À Rabat, l’entreprise démontre qu’intimité et lumière naturelle peuvent coexister sans compromis lourd.</p>""",
"woodka": """<p>Woodka livre portes, placards et cuisines bois avec pose incluse, pour un résultat homogène. À Casablanca, le clé en main évite les conflits entre fournisseur et poseur. Prises de cotes soignées et finitions atelier font la différence sur la durée de vie des ouvrages.</p>""",
"zenara-trade": """<p>Zenara Trade relie la production verrière turque aux chantiers maghrébins via une antenne casablancaise. Logistique et SAV locaux réduisent les frictions de l’import. Architectes et façadiers y trouvent un verre de qualité, supporté par une équipe qui comprend les délais africains du Nord.</p>""",
}

# Second pass: short unique closers for profiles still slightly under 120 words
EXPAND2: dict[str, str] = {
"familec-trav-sarl": "<p>De l’appareillage résidentiel aux besoins industriels, le comptoir rabat reste un allié du planning électrique quotidien.</p>",
"geneltec": "<p>Chaque villa connectée livrée à Mohammedia illustre cette alliance entre courant fort classique et usages smart home simples.</p>",
"itamtec": "<p>Un contrat d’entretien ITAMTEC prolonge la durée de vie des motorisations et limite les interventions d’urgence coûteuses.</p>",
"lahlou-workers": "<p>La culture internationale de Lahlou Workers se lit dans le soin porté aux finitions visibles autant qu’aux détails cachés.</p>",
"livingspace-ma": "<p>Reporting transparent et itérations créatives : LivingSpace.ma traite chaque programme comme une marque à faire grandir.</p>",
"maroc-modulaire-steel": "<p>Sur site, les modules se mettent en service rapidement, libérant du temps pour le cœur de métier du client.</p>",
"menage-pro": "<p>Une équipe ponctuelle et un devis respecté : la signature MÉNAGE-PRO sur les trois villes couvertes.</p>",
"metalnov": "<p>Collectivités et aménageurs trouvent chez METALNOV un fabricant capable d’allier dessin d’atelier et pose sur site.</p>",
"mirage-colors": "<p>Du nuancier WhatsApp à la palette chantier, Mirage Colors reste proche des applicateurs jusqu’au dernier litre.</p>",
"multireseaux-sarl": "<p>La maintenance préventive proposée par Multiréseaux protège les investissements électriques sur la durée.</p>",
"nait-dbou-batiments": "<p>Diagnostiquer avant de traiter : Nait Dbou privilégie l’analyse des pathologies d’humidité avant toute intervention.</p>",
"nextile": "<p>Essais de coupe et conseils grammage font partie du service Nextile, pas seulement la livraison de cartons.</p>",
"orca-lum": "<p>Les dossiers isothermes Orca Lum intègrent joints, quincaillerie et contraintes d’hygiène dès la conception.</p>",
"pe2s-smart-home": "<p>PE2S documente tableaux et scénarios domotiques pour que le propriétaire reste autonome après la réception.</p>",
"platinova": "<p>Un réassort multi-villes permet aux entreprises nationales de garder les mêmes références d’une région à l’autre.</p>",
"priority-fire-equipment": "<p>Exercices et formations Priority Fire ancrent les bons réflexes bien avant qu’un sinistre ne survienne.</p>",
"propoly-industry": "<p>La réactivité de l’usine casablancaise séduit les projets d’abris et de couvertures à planning serré.</p>",
"quincaillerie-global": "<p>Casque, visserie et consommables : un panier unique pour démarrer la journée sans détour inutile.</p>",
"realestate": "<p>Dakimm privilégie la transparence sur l’état du bien et le contexte de quartier avant toute signature.</p>",
"santaire-2000-orobath": "<p>Showroom et conseil pose aident à composer des salles de bain durables, belles au-delà de la première saison.</p>",
"sbtp-smart-building-technologies-power": "<p>Les fiches techniques POWER clarifient dosages et conditions d’application pour limiter les malfaçons.</p>",
"smetec-sarl": "<p>Après livraison, SMETEC reste disponible pour les réglages fins qui font d’un terrain un vrai outil sportif.</p>",
"soqalin-accessoires": "<p>Un stock vivant d’accessoires évite les improvisations dangereuses sur les ferrures de dernière minute.</p>",
"stockage-maroc": "<p>Étude d’implantation et formation à l’usage des rayonnages font partie de l’accompagnement Stockage Maroc.</p>",
"sun-negoce": "<p>Les artisans reviennent chez SUN Negoce parce que les références tournent et les conseils restent pragmatiques.</p>",
"taboug-building": "<p>À Agadir, Taboug Building ancre ses programmes dans une lecture réaliste de la demande résidentielle locale.</p>",
"tanger-equipements-et-automatismes": "<p>La proximité tangéroise de TEA raccourcit les délais d’intervention sur les lignes de production critiques.</p>",
"teemlan-engineering-servcies": "<p>Des notes d’hypothèses claires aident maîtres d’ouvrage et entreprises à trancher vite pendant le chantier.</p>",
"top-grad-equipement": "<p>Essais en showroom et conseil d’implantation aident les chefs à choisir un parc machine vraiment utile.</p>",
"travaux-ait-ahmed": "<p>Sur Casablanca, Travaux Ait Ahmed livre des extérieurs aussi soignés que les structures qu’ils prolongent.</p>",
"vetfashion-north-africa": "<p>Broderie, sérigraphie et coupes métier : Vetfashion transforme l’uniforme en vecteur d’identité visible.</p>",
"vitres-intelligentes-maroc": "<p>Démonstrations sur site à Rabat convainquent souvent plus vite qu’un long dossier technique papier.</p>",
}


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(mod)
    return mod


def visible_words(html: str) -> int:
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text).strip()
    return len(text.split()) if text else 0


def main() -> None:
    entries = []
    for i in range(4):
        mod = load_module(f"gen{i}", ROOT / f"_about_gen_{i}.py")
        entries.extend(mod.ENTRIES)

    by_user = {e["username"]: e for e in entries}
    for expand_map in (EXPAND, EXPAND2):
        for user, extra in expand_map.items():
            if not extra:
                continue
            if user not in by_user:
                raise SystemExit(f"unknown user {user}")
            e = by_user[user]
            e["about_html"] = e["about_html"].rstrip() + "\n" + extra.strip()

    batch = json.loads(BATCH.read_text(encoding="utf-8"))
    ordered = []
    problems = []
    for p in batch:
        e = by_user[p["username"]]
        assert e["id"] == p["id"]
        bio = e["bio"].strip()
        html = e["about_html"].replace("livaison", "livraison").strip()
        wc = visible_words(html)
        if len(bio) > 220:
            problems.append(f"{e['username']}: bio {len(bio)}")
        if not (120 <= wc <= 200):
            problems.append(f"{e['username']}: words={wc}")
        ordered.append({"id": e["id"], "username": e["username"], "bio": bio, "about_html": html})

    if problems:
        print("PROBLEMS", len(problems))
        for x in problems[:40]:
            print(" -", x)
        if len(problems) > 40:
            print(f" ... +{len(problems)-40} more")
        raise SystemExit(2)

    OUT.write_text(json.dumps(ordered, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK wrote {len(ordered)} entries to {OUT.name}")


if __name__ == "__main__":
    main()
