# -*- coding: utf-8 -*-
"""Generate unique French bio + about_html for batch 2."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
INP = ROOT / "_about_batch_2.json"
OUT = ROOT / "_about_out_2.json"

# Unique content keyed by username
CONTENT: dict[str, dict[str, str]] = {}

CONTENT["abdelrazak-forge-maroc-maitre-ferronnier"] = {
    "bio": "Ferronnerie d'art sur mesure : portes, garde-corps, rampes, grilles et clôtures forgées pour chantiers résidentiels et professionnels.",
    "about_html": """<h2>Abdelrazak Forge Maroc — maître ferronnier</h2>
<p>Artisan ferronnier, <strong>Abdelrazak Forge Maroc</strong> conçoit et fabrique des ouvrages métalliques sur mesure pour sécuriser et embellir les bâtis. Chaque pièce est travaillée à la forge selon les dimensions du chantier et le style recherché, du contemporain au plus classique.</p>
<h3>Ouvrages réalisés</h3>
<ul>
<li>Portes et portails en fer forgé</li>
<li>Garde-corps et rampes d'escalier</li>
<li>Grilles de défense et clôtures</li>
</ul>
<p>Le travail privilégie la solidité des assemblages, la précision des finitions et une pose soignée. Que ce soit pour une villa, un immeuble ou un local commercial, l'atelier livre des pièces durables, adaptées aux contraintes marocaines et aux attentes esthétiques du maître d'ouvrage.</p>""",
}

CONTENT["act-bet"] = {
    "bio": "Bureau d'études techniques à Marrakech : structures, lots techniques, VRD, études d'exécution et assistance aux projets de construction.",
    "about_html": """<h2>ACT BET — ingénierie du bâtiment à Marrakech</h2>
<p><strong>ACT BET</strong> (ABET) est un bureau d'études techniques marocain dédié à l'ingénierie du bâtiment et des infrastructures. Depuis sept ans, l'équipe accompagne promoteurs, architectes et entreprises générales sur des missions de structure, de lots techniques et de VRD.</p>
<h3>Périmètre d'intervention</h3>
<ul>
<li>Études de structure et notes de calcul</li>
<li>Études d'exécution et plans de détail</li>
<li>VRD et coordination technique</li>
<li>Expertise et assistance technique en phase chantier</li>
</ul>
<p>Basé à Marrakech, le bureau mise sur la clarté des livrables, le respect des délais contractuels et une coordination étroite avec les autres corps d'état. L'objectif : transformer les intentions de projet en solutions constructibles, conformes et maîtrisables sur le terrain.</p>""",
}

CONTENT["afcodev"] = {
    "bio": "Kits de protection invisibles en acier inox 304L pour fenêtres, balcons et terrasses — sécurité jusqu'à 250 kg, esthétique préservée.",
    "about_html": """<h2>AFCODEV — sécurité discrète pour balcons et fenêtres</h2>
<p>À Casablanca, <strong>AFCODEV</strong> commercialise et installe des kits de protection de dernière génération pour sécuriser fenêtres, balcons et terrasses sans dénaturer la façade. Le filet en acier inoxydable 304L, revêtu de PVC transparent, reste presque invisible tout en offrant une résistance allant jusqu'à 250 kg.</p>
<p>La solution s'adresse aux familles, copropriétés et promoteurs soucieux de prévenir les chutes sans grille opaque. L'équipe assure la pose et le conseil sur le dimensionnement adapté à chaque ouverture.</p>
<h3>Points forts</h3>
<ul>
<li>Filet inox quasi invisible</li>
<li>Haute résistance mécanique</li>
<li>Installation soignée sur sites résidentiels</li>
</ul>
<p>Métallerie et matériaux de construction : AFCODEV allie sécurité et esthétique pour des espaces de vie plus sereins.</p>""",
}

CONTENT["agence-d-architecture-et-d-amenagement-t"] = {
    "bio": "Agence TAHTI – 3AT à Casablanca : architecture et aménagement depuis 2000, projets durables et espaces à forte identité.",
    "about_html": """<h2>Agence TAHTI – 3AT, architecture depuis 2000</h2>
<p>Fondée en 2000 à Casablanca, l'<strong>Agence d'architecture et d'aménagement TAHTI – 3AT</strong> est une structure multidisciplinaire qui conçoit des espaces dynamiques, durables et ancrés dans leur contexte. Vingt-cinq ans de pratique nourrissent une approche mêlant innovation, exigence constructive et souci du détail.</p>
<p>L'agence intervient en architecture et en génie civil / structure, du programme à la livraison, en dialogue permanent avec les maîtres d'ouvrage et les BET partenaires.</p>
<h3>Notre méthode</h3>
<ul>
<li>Lecture attentive du site et du programme</li>
<li>Conception sensible aux usages et à la lumière</li>
<li>Suivi de chantier et coordination des corps d'état</li>
</ul>
<p>Qu'il s'agisse d'un équipement, d'un immeuble ou d'un aménagement intérieur ambitieux, 3AT cherche des réponses spatiales claires, élégantes et constructibles. Site : 3at.ma.</p>""",
}

CONTENT["aifox-services"] = {
    "bio": "Installations électriques, domotique et vidéosurveillance à Casablanca — équipe rodée aux grands projets tertiaires et résidentiels.",
    "about_html": """<h2>AIFOX SERVICES — électricité &amp; domotique</h2>
<p><strong>AIFOX SERVICES</strong> intervient à Casablanca sur l'installation électrique, la domotique et la vidéosurveillance. L'équipe a déjà participé à de grands projets où fiabilité des réseaux et qualité de câblage sont non négociables.</p>
<h3>Domaines couverts</h3>
<ul>
<li>Courants forts et tableaux électriques</li>
<li>Domotique et automatismes du bâtiment</li>
<li>Sécurité intelligente et vidéosurveillance</li>
</ul>
<p>Du logement collectif au site professionnel, AIFOX privilégie des schémas clairs, des matériels adaptés et un SAV réactif. Les prestations sont cadrées sur devis, avec un phasage compatible avec le planning général du chantier.</p>""",
}

CONTENT["alliances-darna"] = {
    "bio": "Promoteur immobilier à Marrakech — programmes résidentiels référencés sur Sifarah, focus qualité de vie et emplacements stratégiques.",
    "about_html": """<h2>Alliances Darna — promotion à Marrakech</h2>
<p><strong>Alliances Darna</strong> développe des opérations immobilières à Marrakech, avec plusieurs programmes déjà référencés sur Sifarah. Le promoteur cible des emplacements cohérents avec les attentes des acquéreurs : accessibilité, environnement et qualité des prestations.</p>
<p>Chaque projet est mené avec une attention particulière aux plans, aux finitions et au suivi commercial, afin d'offrir un parcours d'achat lisible du premier contact à la livraison.</p>
<h3>Engagements</h3>
<ul>
<li>Programmes pensés pour le marché local</li>
<li>Suivi transparent des étapes de commercialisation</li>
<li>Exigence sur la qualité constructive</li>
</ul>
<p>Pour découvrir les résidences en cours et à venir : alliancesdarna.ma.</p>""",
}

CONTENT["alufactory"] = {
    "bio": "Distributeur de systèmes aluminium à Mohammedia : fenêtres, façades, pergolas, vérandas, volets et solutions du standing au best cost.",
    "about_html": """<h2>ALUFACTORY — l'aluminium pour tous les projets</h2>
<p>Installée à Mohammedia, <strong>ALUFACTORY</strong> accompagne architectes, menuisiers et maîtres d'ouvrage dans le choix et la fourniture de systèmes de menuiserie aluminium. La gamme couvre fenêtres, portes, volets roulants, façades, pergolas, vérandas, brise-soleil, cloisons, terrasses et motorisations.</p>
<p>Du très haut standing au best cost, l'équipe oriente vers le profilé et le vitrage adaptés au climat, au budget et à l'esthétique du bâtiment. Accessoires d'étanchéité et produits connexes complètent l'offre pour une pose sereine.</p>
<h3>Pourquoi nous</h3>
<ul>
<li>Large catalogue de systèmes aluminium</li>
<li>Conseil technique avant commande</li>
<li>Disponibilité pour chantiers partout au Maroc</li>
</ul>
<p>Plus d'informations sur alufactory.ma.</p>""",
}

CONTENT["anas-abara-architecture"] = {
    "bio": "Cabinet d'architecture à Tétouan : conception, paysagisme et design intérieur pour particuliers et professionnels, suivi sur devis.",
    "about_html": """<h2>ANAS ABARA ARCHITECTURE — Tétouan</h2>
<p>Basé à Tétouan, le cabinet <strong>ANAS ABARA ARCHITECTURE</strong> conçoit des projets où architecture, paysagisme et design intérieur dialoguent. Quatre années de pratique ont forgé une méthode exigeante : programmes clarifiés, plans précis et suivi de mission jusqu'aux finitions.</p>
<p>Particuliers, entreprises et acteurs du bâtiment y trouvent un interlocuteur unique pour le neuf comme pour la rénovation. Chaque mission fait l'objet d'un devis détaillé et d'un phasage transparent.</p>
<ul>
<li>Études architecturales et permis</li>
<li>Aménagements paysagers</li>
<li>Design intérieur cohérent avec le bâti</li>
</ul>
<p>Site : anasabara-arch.com.</p>""",
}

CONTENT["ar-solutions"] = {
    "bio": "Location d'engins BTP, agriculture et industrie à Casablanca — formules courte, moyenne ou longue durée, tarifs selon durée.",
    "about_html": """<h2>AR SOLUTIONS — location d'engins à Casablanca</h2>
<p><strong>AR SOLUTIONS</strong> met à disposition des professionnels du BTP, de l'agriculture et de l'industrie un parc d'engins et de matériels de chantier. Les formules sont souples : courte, moyenne ou longue durée, avec des tarifs indexés sur la période de location.</p>
<p>L'objectif est de sécuriser la disponibilité du matériel au bon moment, sans immobiliser un capital inutile. L'équipe conseille sur le choix de l'engin selon la nature des travaux et organise la mise à disposition.</p>
<h3>Atouts</h3>
<ul>
<li>Parc adapté aux chantiers urbains et TP</li>
<li>Locations sur mesure</li>
<li>Huit ans d'expérience terrain</li>
</ul>
<p>Demande de devis via locenginmaroc.com.</p>""",
}

CONTENT["artmood"] = {
    "bio": "Cuisines et dressings sur mesure à Tanger depuis 2014 — atelier 600 m², CNC, 30 artisans, pose dans tout le Maroc.",
    "about_html": """<h2>artmood — cuisines &amp; dressings à Tanger</h2>
<p>Depuis 2014, <strong>artmood</strong> fabrique à Tanger des cuisines, dressings et meubles sur mesure. L'atelier de 600 m² dispose de machines CNC et d'une équipe d'une trentaine d'artisans pour assurer conception, usinage et pose.</p>
<h3>Savoir-faire</h3>
<ul>
<li>Cuisines modernes, classiques et italiennes</li>
<li>Dressings walk-in et meubles de salle de bain</li>
<li>Plans de travail quartz, granit ou marbre</li>
<li>Menuiserie aluminium et bois, surfaces VORTEX</li>
</ul>
<p>Livraison et installation sont proposées dans tout le Maroc. Dix ans d'expérience guident chaque projet, du premier croquis à la mise en service de la cuisine. Découvrez artmood.ma.</p>""",
}

CONTENT["atterra"] = {
    "bio": "Bureau d'études à Marrakech : ingénierie responsable, innovation et formation des talents marocains, héritage du groupe en France.",
    "about_html": """<h2>ATTERRA — ingénierie ancrée à Marrakech</h2>
<p>Installée à Marrakech, <strong>ATTERRA</strong> conjugue exigence technique, innovation et respect du territoire. Forte de l'expérience du groupe en France, la structure place la démarche environnementale au cœur de ses études : préservation des ressources, prise en compte des écosystèmes et anticipation des enjeux climatiques.</p>
<p>Au-delà des livrables d'ingénierie, ATTERRA s'engage pour la formation et la montée en compétences des ingénieurs marocains, afin de renforcer durablement le tissu local.</p>
<ul>
<li>Études techniques pour projets marocains</li>
<li>Vision environnementale intégrée</li>
<li>Quinze années d'expérience cumulée</li>
</ul>
<p>En savoir plus : atterra.ma.</p>""",
}

CONTENT["azconstruction360"] = {
    "bio": "Courant faible, sécurité électronique, domotique et automatisme à Casablanca — vente de matériel et prestations d'installation.",
    "about_html": """<h2>azconstruction360 — sécurité &amp; automatismes</h2>
<p>À Casablanca, <strong>azconstruction360</strong> commercialise du matériel et réalise des prestations en courant faible, sécurité électronique, domotique et automatisme. L'offre s'adresse aux installateurs, promoteurs et particuliers exigeants sur la fiabilité des systèmes.</p>
<p>Neuf années de pratique permettent d'intervenir du conseil produit à la mise en service, avec une attention particulière à la compatibilité des équipements et à la documentation des installations.</p>
<h3>Interventions typiques</h3>
<ul>
<li>Vidéosurveillance et contrôle d'accès</li>
<li>Automatismes de portails et stores</li>
<li>Solutions domotiques résidentielles</li>
</ul>
<p>Contact et références via le réseau Centurion / bigmark.</p>""",
}

CONTENT["beccaprime"] = {
    "bio": "Nettoyage professionnel, espaces verts et distribution d'EPI à Casablanca — solutions pour entreprises, collectivités et sites.",
    "about_html": """<h2>BECCAPRIME — propreté, jardins &amp; EPI</h2>
<p><strong>BECCAPRIME</strong> regroupe trois métiers complémentaires à Casablanca : le nettoyage professionnel, l'entretien des espaces verts et la distribution de produits d'entretien ainsi que d'équipements de protection individuelle.</p>
<p>Entreprises, collectivités et particuliers y trouvent des prestations calibrées sur la fréquence et le niveau d'exigence du site, avec respect des normes d'hygiène et de sécurité.</p>
<ul>
<li>Contrats de nettoyage et remise en état</li>
<li>Jardinage et maintenance paysagère</li>
<li>Fourniture d'EPI et consommables</li>
</ul>
<p>L'équipe privilégie la régularité des interventions et la transparence des devis. Site : beccaprime.ma.</p>""",
}

CONTENT["bet-skiredj"] = {
    "bio": "BET SKIREDJ depuis 1985 à Tanger : plus de 1000 projets — bâtiment, génie civil, charpentes, ponts, BIM et études d'exécution.",
    "about_html": """<h2>BET SKIREDJ — 40 ans d'ingénierie à Tanger</h2>
<p>Créé en 1985, le <strong>Bureau d'études techniques SKIREDJ</strong> a accompagné plus de mille projets : bâtiments, génie civil, charpentes métalliques, ponts et ouvrages d'art. De la constructibilité à la livraison, l'équipe dimensionne, coordonne et produit les documents nécessaires à l'exécution.</p>
<h3>Compétences clés</h3>
<ul>
<li>Études de structure et plans d'exécution</li>
<li>Maquette numérique BIM</li>
<li>Spécifications techniques et contractuelles</li>
</ul>
<p>Sérieux, excellence et innovation restent les fils conducteurs du bureau. Maîtres d'ouvrage et entreprises générales y trouvent un partenaire capable de faire aboutir des projets complexes sur le nord du Maroc et au-delà. Site : betskiredj.com.</p>""",
}

CONTENT["blok-modulaire-maroc"] = {
    "bio": "Construction, vente et location de bâtiments modulaires à Rabat — bureaux, salles de classe et espaces temporaires sur mesure.",
    "about_html": """<h2>Blok Modulaire Maroc — espaces prêts à l'emploi</h2>
<p>Basée à Rabat, <strong>Blok Modulaire Maroc</strong> conçoit, vend et loue des bâtiments modulaires pour professionnels, collectivités et particuliers. La formule répond aux besoins de rapidité et de flexibilité : bureaux de chantier, salles de classe, espaces de vie ou structures temporaires.</p>
<p>Dix années d'expérience nourrissent une offre écoresponsable, esthétique et fonctionnelle, avec des modules adaptés aux climats et aux usages marocains.</p>
<ul>
<li>Modules neufs et configurations sur mesure</li>
<li>Location pour chantiers et événements</li>
<li>Accompagnement de A à Z</li>
</ul>
<p>Des espaces livrés plus vite, sans sacrifier le confort ni la qualité d'enveloppe.</p>""",
}

CONTENT["canal-iskane"] = {
    "bio": "Promoteur immobilier à Casablanca — opérations résidentielles et suivi de commercialisation sur le marché local.",
    "about_html": """<h2>Canal Iskane — promotion à Casablanca</h2>
<p><strong>Canal Iskane</strong> est un promoteur immobilier actif à Casablanca. L'enseigne développe des programmes pensés pour le marché local, avec une attention portée à l'emplacement, à la typologie des logements et à la qualité des finitions livrées.</p>
<p>Un projet est déjà référencé sur Sifarah ; d'autres opérations peuvent venir enrichir le portefeuille selon les opportunités foncières.</p>
<h3>Ce que nous privilégions</h3>
<ul>
<li>Emplacements cohérents avec la demande</li>
<li>Parcours d'achat clair pour les acquéreurs</li>
<li>Suivi jusqu'à la livraison</li>
</ul>
<p>Canal Iskane s'adresse aux ménages et investisseurs recherchant un interlocuteur promoteur structuré sur Casablanca.</p>""",
}

CONTENT["celo-fixations-maroc"] = {
    "bio": "Filiale CELO à Casablanca : fixations, supportage et visserie depuis 1963 — solutions pour gagner du temps à la pose.",
    "about_html": """<h2>CELO FIXATIONS MAROC — la fixation qui accélère</h2>
<p>Héritier d'un savoir-faire de fabricant depuis 1963, le groupe <strong>CELO</strong> conçoit des systèmes de fixation et de supportage pensés pour réduire le temps d'installation et les coûts de pose. La filiale marocaine, basée à Casablanca, met cette gamme au service des professionnels du bâtiment et de l'industrie.</p>
<p>Vis, chevilles, supports et accessoires sont sélectionnés pour la régularité dimensionnelle et la fiabilité en conditions de chantier.</p>
<ul>
<li>Fixations pour béton, métal et plaques</li>
<li>Systèmes de supportage techniques</li>
<li>Conseil application pour installateurs</li>
</ul>
<p>Objectif : assembler plus vite, sans compromettre la tenue mécanique. Site : celofixings.ma.</p>""",
}

CONTENT["chattal-ingenierie-et-coordination"] = {
    "bio": "BET à Marrakech : structure, OPC, VRD, multi-technique et AMO — de la conception à la livraison pour promoteurs et architectes.",
    "about_html": """<h2>Chattal Ingénierie &amp; Coordination</h2>
<p>Bureau d'études BTP à Marrakech, <strong>Chattal Ingénierie et coordination</strong> intervient en structure, OPC, VRD, ingénierie multi-technique et assistance à maîtrise d'ouvrage. Promoteurs, architectes et MOA y trouvent un partenaire pour sécuriser conception et exécution.</p>
<p>Quatre années d'activité ont structuré des méthodes de coordination claires, utiles dès que plusieurs lots techniques se croisent.</p>
<ul>
<li>Notes de calcul et plans de structure</li>
<li>OPC et planning de chantier</li>
<li>VRD et lots techniques</li>
</ul>
<p>De l'esquisse à la réception, l'équipe vise des projets maîtrisables, documentés et livrés dans les temps. Site : chattal-ingenierie.com.</p>""",
}

CONTENT["cimag"] = {
    "bio": "Matériaux de gros œuvre à Casablanca depuis 20 ans : agglos, poutrelles, hourdis, bordures — stock pro et prix compétitifs.",
    "about_html": """<h2>Cimag — le gros œuvre en stock à Casablanca</h2>
<p><strong>Cimag</strong> fournit les matériaux essentiels du gros œuvre : agglomérés, poutrelles, hourdis, bordures et éléments connexes. Vingt années de présence sur le marché casablancais ont forgé une logistique fiable pour les entreprises de construction comme pour les particuliers bâtisseurs.</p>
<p>La société mise sur la qualité constante des produits, des prix compétitifs et un service de retrait ou de livraison adapté au rythme des chantiers.</p>
<ul>
<li>Gamme complète pour planchers et maçonnerie</li>
<li>Disponibilité pour professionnels BTP</li>
<li>Accompagnement sur les quantités</li>
</ul>
<p>Site : cimagmaroc.com.</p>""",
}

CONTENT["co-bureau"] = {
    "bio": "Mobilier de bureau et aménagement d'espaces de travail à Casablanca — bureaux, sièges ergonomiques, cloisons et solutions sur mesure.",
    "about_html": """<h2>Co bureau — espaces de travail efficaces</h2>
<p>Spécialiste du mobilier de bureau au Maroc, <strong>Co bureau</strong> équipe PME, grands comptes et administrations avec des postes de travail modernes et ergonomiques. L'offre comprend bureaux, sièges, tables de réunion, rangements, cloisons et aménagements sur mesure.</p>
<p>Vingt ans d'expérience guident le conseil : lecture des flux, choix des finitions et installation complète jusqu'à la mise en place.</p>
<ul>
<li>Étude d'aménagement et implantation</li>
<li>Mobilier professionnel durable</li>
<li>Livraison et montage sur site</li>
</ul>
<p>Objectif : des open spaces et bureaux individuels confortables, productifs et cohérents avec l'image de l'entreprise. Site : cobureau.ma.</p>""",
}

CONTENT["construction-professionals-morocco"] = {
    "bio": "Annuaire Sifarah : comparez architectes, entreprises et artisans vérifiés pour vos projets BTP et immobilier au Maroc.",
    "about_html": """<h2>Construction Professionals Morocco</h2>
<p>Cette vitrine recense et met en relation les professionnels du bâtiment et de l'immobilier présents sur Sifarah. L'objectif est simple : aider maîtres d'ouvrage et particuliers à <strong>trouver et comparer</strong> architectes, entreprises générales, artisans et fournisseurs vérifiés.</p>
<p>Les fiches détaillent métiers, zones d'intervention et réalisations pour faciliter un premier contact qualifié.</p>
<ul>
<li>Professionnels du BTP référencés</li>
<li>Architectes et bureaux d'études</li>
<li>Artisans et fournisseurs matériaux</li>
</ul>
<p>Utilisez cet espace comme point d'entrée pour constituer votre équipe projet au Maroc, puis poursuivez l'échange directement avec les profils sélectionnés.</p>""",
}

CONTENT["dalltech-travaux"] = {
    "bio": "Dallage, pavage, aménagements extérieurs et terrains de sport clé en main à Casablanca — football, padel, basketball.",
    "about_html": """<h2>DallTech Travaux — sols &amp; terrains de sport</h2>
<p>À Casablanca, <strong>DallTech Travaux</strong> réalise dallages, pavages et aménagements extérieurs, ainsi que des terrains de sport clés en main : football, padel et basketball. L'approche combine étude du support, choix des matériaux et exécution précise pour des ouvrages durables.</p>
<p>Collectivités, promoteurs et clubs sportifs y trouvent un interlocuteur unique du diagnostic terrain à la réception.</p>
<ul>
<li>Dallage et pavage urbains ou privés</li>
<li>Terrains multisports aux standards techniques</li>
<li>Solutions extérieures sur mesure</li>
</ul>
<p>Qualité d'exécution et respect des délais structurent chaque chantier. Site : dalltech.ma.</p>""",
}

CONTENT["deante-maroc"] = {
    "bio": "Équipements de salle de bain et cuisine à Casablanca — robinetterie, sanitaires et accessoires pour pros et particuliers.",
    "about_html": """<h2>Deante Maroc — salles de bain &amp; cuisines</h2>
<p><strong>Deante Maroc</strong> propose à Casablanca une sélection d'équipements pour salle de bain et cuisine : robinetterie, sanitaires et accessoires destinés aux installateurs, décorateurs et particuliers. Cinq années de présence sur le marché marocain ont structuré une offre claire et un soutien client attentif.</p>
<ul>
<li>Sanitaires et meubles de salle de bain</li>
<li>Solutions plomberie associées</li>
<li>Éléments pour cuisines contemporaines</li>
</ul>
<p>L'équipe accompagne le choix des références selon le style du projet et les contraintes techniques du réseau. Découvrez le catalogue sur deante.ma.</p>""",
}

CONTENT["dfye-decoforyouelite"] = {
    "bio": "Menuiserie aluminium, façades, vitrage et escaliers en verre à Tanger — aménagement haut de gamme depuis 14 ans.",
    "about_html": """<h2>dfye [DecoForYouElite] — Tanger</h2>
<p><strong>dfye</strong> (DecoForYouÉlite) est l'expert tangérois de la décoration et de l'aménagement sur mesure haut de gamme. Menuiserie aluminium, façades élégantes, vitrages de précision et escaliers en verre trempé composent le cœur de métier.</p>
<p>Quatorze années de chantiers ont affiné une signature : allier design moderne et fonctionnalité pour des intérieurs et enveloppes qui reflètent le style du client.</p>
<ul>
<li>Façades et menuiseries aluminium</li>
<li>Travaux de vitrage sur mesure</li>
<li>Escaliers et garde-corps en verre</li>
</ul>
<p>Du premier relevé à la pose, l'équipe reste le fil conducteur du projet. Site : dfye.ma.</p>""",
}

CONTENT["dromapro"] = {
    "bio": "Distribution technique à Tanger : clim, domotique, incendie, vidéosurveillance, solaire et aspiration centralisée.",
    "about_html": """<h2>DROMAPRO — solutions techniques bâtiment</h2>
<p>Basée à Tanger, <strong>DROMAPRO</strong> fournit et distribue des solutions techniques pour le bâtiment et l'industrie : climatisation, domotique, aspiration centralisée, détection incendie, vidéosurveillance, sonorisation, télédistribution, contrôle d'accès et énergie solaire.</p>
<p>Marques reconnues et conseil d'application permettent aux installateurs et maîtres d'ouvrage de constituer des lots cohérents et performants.</p>
<ul>
<li>Chauffage et climatisation</li>
<li>Sécurité et courants faibles</li>
<li>Domotique et solaire</li>
</ul>
<p>Trois années d'activité, une ambition claire : des solutions fiables, adaptées au climat du Nord. Site : dromapro.ma.</p>""",
}

CONTENT["effinex"] = {
    "bio": "Infrastructures télécoms et réseaux à Casablanca — 35 ans d'expérience terrain, installation et maintenance pour opérateurs et PME.",
    "about_html": """<h2>EFFINEX — réseaux &amp; télécoms à Casablanca</h2>
<p><strong>EFFINEX</strong> est le partenaire casablancais pour l'installation et la maintenance d'infrastructures télécoms et réseaux. L'alliance d'environ 35 ans d'expérience terrain — issue de l'opérateur historique — et d'une vision tournée vers l'innovation guide chaque intervention.</p>
<p>Opérateurs, PME et administrations s'appuient sur EFFINEX pour la performance et la disponibilité de leurs systèmes.</p>
<ul>
<li>Déploiement et maintenance réseaux</li>
<li>Infrastructures télécoms</li>
<li>Support technique réactif</li>
</ul>
<p>Expertise, innovation et maintenance : trois piliers pour des liaisons durables. Site : effinex.ma.</p>""",
}

CONTENT["eleg-garden-atelier"] = {
    "bio": "Aménagement d'espaces verts, terrasses et vérandas à Marrakech — conception paysagère sur devis pour villas et professionnels.",
    "about_html": """<h2>Eleg Garden Atelier — jardins à Marrakech</h2>
<p><strong>Eleg Garden Atelier</strong> aménage les espaces verts et les terrasses autour de Marrakech. L'atelier conçoit des jardins, vérandas végétalisées et extérieurs habitables pour particuliers, entreprises et acteurs du bâtiment.</p>
<p>Six années de pratique ont ancré une méthode simple : relevé du terrain, proposition paysagère, devis clair puis suivi de réalisation.</p>
<ul>
<li>Création et rénovation de jardins</li>
<li>Aménagement de terrasses</li>
<li>Projets véranda / outdoor</li>
</ul>
<p>Des espaces extérieurs pensés pour le climat marrakchi, agréables toute l'année. Site : eleggardenatelier.com.</p>""",
}

CONTENT["em-etincelle"] = {
    "bio": "Fournitures électriques, industriels et automatisme à Casablanca — achat, vente, import et export de matériels.",
    "about_html": """<h2>EM ETINCELLE — électricité &amp; automatisme</h2>
<p><strong>EM ETINCELLE</strong> commercialise à Casablanca des matériels et fournitures électriques, industriels et d'automatisme. L'activité couvre l'achat-vente ainsi que l'import-export pour alimenter installateurs et industriels.</p>
<p>Domotique et électricité générale complètent le positionnement : disposer rapidement des références nécessaires aux tableaux, automatismes et courants faibles.</p>
<ul>
<li>Matériel électrique industriel</li>
<li>Composants d'automatisme</li>
<li>Solutions pour installateurs</li>
</ul>
<p>Un comptoir technique pour sécuriser les approvisionnements de chantier et d'usine.</p>""",
}

CONTENT["enras"] = {
    "bio": "Ascenseurs et monte-charges à Casablanca : installation, modernisation, réparation et contrats de maintenance.",
    "about_html": """<h2>ENRAS — mobilité verticale à Casablanca</h2>
<p><strong>ENRAS</strong> installe, modernise, répare et maintient ascenseurs et monte-charges sur Casablanca et ses environs. Dix années d'expérience permettent d'accompagner le projet de l'étude de trafic à la maintenance préventive.</p>
<p>Immeubles résidentiels, tertiaires et sites industriels y trouvent des solutions adaptées aux normes de sécurité et au confort des usagers.</p>
<ul>
<li>Neuf et remplacement d'appareils</li>
<li>Modernisation de cabines et machineries</li>
<li>Contrats de maintenance</li>
</ul>
<p>Valorisez chaque étage avec une mobilité fluide et sûre. Site : enraslift.com.</p>""",
}

CONTENT["europelles"] = {
    "bio": "Vente et importation de machines de chantier à Marrakech : pelles, chargeurs, tractopelles, compacteurs et pièces détachées.",
    "about_html": """<h2>EUROPELLES Marrakech — engins de construction</h2>
<p><strong>EUROPELLES</strong> importe, vend et distribue à Marrakech des machines de construction neuves et d'occasion, ainsi que accessoires et pièces détachées. L'offre s'adresse aux professionnels du BTP, de l'agriculture et de l'industrie.</p>
<h3>Parc proposé</h3>
<ul>
<li>Chargeurs et mini-pelles</li>
<li>Pelles hydrauliques et tractopelles</li>
<li>Compacteurs et équipements associés</li>
</ul>
<p>Conseil personnalisé, assistance technique, commandes sur mesure et livraison dans tout le Maroc complètent la vente. Une gamme robuste pour des chantiers exigeants. Site : europelles.com.</p>""",
}

CONTENT["expertsevicelive"] = {
    "bio": "Location de nacelles et chariots élévateurs à Casablanca — ciseaux, articulées, télescopiques pour chantiers et maintenance.",
    "about_html": """<h2>Expertsevicelive — nacelles à Casablanca</h2>
<p>Spécialisée dans la location de matériel de manutention et de travail en hauteur, <strong>Expertsevicelive</strong> met à disposition nacelles ciseaux, articulées, verticales et télescopiques, ainsi que chariots élévateurs.</p>
<p>Dix ans d'expérience sur Casablanca aident les entreprises de second œuvre, de maintenance et de BTP à accéder au bon engin sans immobiliser un parc propre.</p>
<ul>
<li>Nacelles pour intérieur et extérieur</li>
<li>Chariots élévateurs</li>
<li>Conseil sur la hauteur et la capacité</li>
</ul>
<p>Site : expertservicelife.ma.</p>""",
}

CONTENT["fadil-group"] = {
    "bio": "Solutions de construction et matériaux à Casablanca — accompagnement particuliers, entreprises et investisseurs sur leurs projets.",
    "about_html": """<h2>Fadil Group — construire avec méthode</h2>
<p>Acteur marocain du BTP basé à Casablanca, <strong>Fadil Group</strong> propose des solutions de construction et de fournitures adaptées aux particuliers, entreprises et investisseurs. Dix années de projets ont ancré une culture de professionnalisme et d'efficacité.</p>
<p>L'équipe intervient sur le conseil matériaux et le suivi d'opérations pour livrer des ouvrages conformes aux attentes du maître d'ouvrage.</p>
<ul>
<li>Fourniture de matériaux de construction</li>
<li>Appui technique aux projets</li>
<li>Coordination avec les entreprises partenaires</li>
</ul>
<p>Site : fadilgroup.ma.</p>""",
}

CONTENT["faw"] = {
    "bio": "Menuiserie aluminium haut de gamme à Casablanca, portes coupe-feu Novoferm et automatismes de portes et rideaux.",
    "about_html": """<h2>faw — aluminium &amp; automatismes</h2>
<p><strong>faw</strong> conçoit et pose des menuiseries aluminium haut de gamme et moyen standing à Casablanca. Résidentiel, médical et bureaux : chaque projet bénéficie de finitions soignées et d'un suivi sur mesure.</p>
<p>L'entreprise importe également des portes coupe-feu Novoferm (Espagne) et propose des automatismes : kits moteurs battants, portes sectionnelles, portes vitrées automatiques et moteurs tubulaires pour rideaux.</p>
<ul>
<li>Fenêtres et façades aluminium</li>
<li>Portes coupe-feu certifiées</li>
<li>Motorisations et accès automatisés</li>
</ul>
<p>Performance, sécurité et esthétique sur chaque chantier. Site : faw.ma.</p>""",
}

CONTENT["flow-sud"] = {
    "bio": "Réseaux de fluides et traitement à Agadir — conception et construction pour rompre avec les pratiques classiques du BTP.",
    "about_html": """<h2>FLOW SUD — réseaux de fluides à Agadir</h2>
<p><strong>FLOW SUD</strong> conçoit et construit des réseaux d'acheminement et de traitement des fluides pour le sud du Maroc. La société est née d'une volonté de moderniser les pratiques du BTP : méthodes claires, qualité d'exécution et communication directe avec le client.</p>
<p>Six années d'expérience nourrissent des interventions en plomberie technique et réseaux, pour le neuf comme pour la rénovation.</p>
<ul>
<li>Conception de réseaux</li>
<li>Travaux de pose et raccordement</li>
<li>Solutions de traitement associées</li>
</ul>
<p>Site : flowsud.com.</p>""",
}

CONTENT["frigmar"] = {
    "bio": "Climatisation depuis 1974 à Casablanca : distribution, installation et maintenance de solutions froid et confort thermique.",
    "about_html": """<h2>Frigmar — le froid maîtrisé depuis 1974</h2>
<p>Fondée en 1974, <strong>Frigmar Maroc</strong> distribue, installe et maintient des solutions de climatisation pour le résidentiel, le tertiaire et l'industrie à Casablanca. Plus de cinq décennies d'activité ont bâti une connaissance fine des marques, des fluides et des contraintes locales.</p>
<p>Unités cassettes, splits et systèmes plus complexes font partie du quotidien des techniciens.</p>
<ul>
<li>Vente d'équipements de climatisation</li>
<li>Pose et mise en service</li>
<li>Contrats de maintenance</li>
</ul>
<p>Un interlocuteur historique pour le confort thermique sur Casablanca.</p>""",
}

CONTENT["gc-ceramica"] = {
    "bio": "Import et distribution de carrelage et accessoires décoratifs à Casablanca — pour promoteurs, architectes et décorateurs.",
    "about_html": """<h2>GC CERAMICA — carreaux &amp; décor</h2>
<p>Basée à Casablanca, <strong>GC CERAMICA</strong> importe et distribue carreaux et accessoires décoratifs pour promoteurs, décorateurs et architectes. Cinq années de sélection produit ont façonné un catalogue orienté projets créatifs et finitions soignées.</p>
<ul>
<li>Grès cérame et faïences</li>
<li>Accessoires et profilés de pose</li>
<li>Conseil pour showrooms et chantiers</li>
</ul>
<p>De la villa au programme collectif, l'équipe aide à matcher formats, teintes et usages. Site : gcceramica.com.</p>""",
}

CONTENT["geoafrique-drillers"] = {
    "bio": "Sondages géotechniques et essais in situ à Casablanca — reconnaissance de sol pour projets de construction et d'aménagement.",
    "about_html": """<h2>GEOAFRIQUE DRILLERS — reconnaître le sol</h2>
<p><strong>GEOAFRIQUE DRILLERS</strong> (G.A.D) exécute sondages de reconnaissance et essais in situ pour les projets de construction et d'aménagement au Maroc. Quinze années de campagnes ont affirmé une expertise conformes aux normes en vigueur.</p>
<p>Maîtres d'ouvrage et bureaux d'études s'appuient sur des données terrain fiables avant de dimensionner fondations et structures.</p>
<ul>
<li>Sondages géotechniques</li>
<li>Essais in situ</li>
<li>Rapports pour la conception</li>
</ul>
<p>Basée à Casablanca, l'équipe intervient selon le planning des phases d'études. Site : geoafriquedrillers.com.</p>""",
}

CONTENT["gmr-ascenseurs"] = {
    "bio": "Installation d'ascenseurs et systèmes de mobilité à Agadir — technologies récentes, suivi de maintenance et sécurité.",
    "about_html": """<h2>GMR ASCENSEURS — Agadir</h2>
<p><strong>GMR ASCENSEURS</strong> installe ascenseurs et systèmes de mobilité complémentaire à Agadir et dans le sud. Le principe est clair : une pose fluide, des technologies adaptées et une exécution soignée, suivie d'un entretien rigoureux.</p>
<p>Neuf années d'activité ont formé une équipe capable de garantir sécurité, confort et praticité sur le long terme.</p>
<ul>
<li>Installation neuve</li>
<li>Systèmes de mobilité associés</li>
<li>Suivi post-pose</li>
</ul>
<p>L'innovation reste un levier ; la qualification des techniciens, le garant de la qualité. Site : gmrascenseurs.com.</p>""",
}

CONTENT["groupe-allali"] = {
    "bio": "Promoteur immobilier à Mohammedia — programmes résidentiels référencés sur Sifarah, focus qualité et emplacement.",
    "about_html": """<h2>Groupe Allali — promotion à Mohammedia</h2>
<p>Le <strong>Groupe Allali</strong> développe des opérations immobilières à Mohammedia. Deux projets sont référencés sur Sifarah, témoignant d'une activité de promoteur ancrée sur le littoral atlantique proche de Casablanca.</p>
<p>L'approche privilégie des programmes lisibles pour les acquéreurs : typologies adaptées, suivi commercial et exigence sur la livraison.</p>
<ul>
<li>Opérations résidentielles</li>
<li>Emplacements stratégiques à Mohammedia</li>
<li>Parcours client structuré</li>
</ul>
<p>En savoir plus : allali.ma.</p>""",
}

CONTENT["hagemeyer"] = {
    "bio": "Centrale d'achat Casablanca : peinture, isolation, éclairage décoratif, époxy sols et petit appareillage pour BTP et industrie.",
    "about_html": """<h2>Hagemeyer — fournitures bâtiment &amp; industrie</h2>
<p>Partenaire des acteurs du bâtiment, de l'énergie et de l'industrie à Casablanca, <strong>Hagemeyer</strong> fonctionne comme une centrale d'achat spécialisée. Peinture, isolation thermique, éclairage décoratif, habillage de façade, revêtements de sol époxy et petit appareillage composent l'offre.</p>
<ul>
<li>Peintures et isolants</li>
<li>Éclairage et finitions</li>
<li>Solutions pour sols industriels</li>
</ul>
<p>L'engagement : répondre vite avec des produits de qualité et un conseil orienté chantier. Contact : contact@hagemeyer.ma — hagemeyer.ma.</p>""",
}

CONTENT["hba-studio"] = {
    "bio": "Agence d'architecture à Marrakech fondée en 2022 par Hamza Boufous — espaces sensibles à la lumière et à l'identité ocre de la ville.",
    "about_html": """<h2>HBA STUDIO — architecture à Marrakech</h2>
<p>Fondée en 2022 par <strong>Hamza Boufous</strong>, architecte agréé diplômé de l'ENA Marrakech et passé par l'ETSAM de Madrid, <strong>HBA STUDIO</strong> conçoit des espaces en harmonie avec l'identité culturelle et la lumière de la ville ocre.</p>
<p>Inscrit à l'Ordre des Architectes, le fondateur porte une vision élargie : chaque projet transforme les idées du client en architecture sensible, fonctionnelle et ancrée dans son contexte.</p>
<ul>
<li>Conception résidentielle et d'équipements</li>
<li>Écoute du programme et du site</li>
<li>Qualité d'exécution jusqu'au chantier</li>
</ul>
<p>Site : hbastudio.net.</p>""",
}

CONTENT["hilti-maroc"] = {
    "bio": "Outillage électroportatif, consommables et services Hilti pour pros du bâtiment et de l'industrie — présence Maroc depuis près de 30 ans.",
    "about_html": """<h2>HILTI MAROC — performance chantier</h2>
<p>Chez <strong>Hilti</strong>, l'outillage électroportatif, les consommables, logiciels et services sont conçus pour les professionnels de la construction et de l'industrie. Au Maroc, l'enseigne accompagne les chantiers avec des solutions de perçage, ancrage et découpe reconnues pour leur sécurité et leur durabilité.</p>
<p>Près de trois décennies de présence locale (référence Tanger / réseau national) ancrent un service après-vente et une formation utilisateurs structurés.</p>
<ul>
<li>Perceuses, burineurs, meuleuses</li>
<li>Ancrages et consommables</li>
<li>Services et conseils application</li>
</ul>
<p>Site : hilti.ma.</p>""",
}

CONTENT["i-see-home"] = {
    "bio": "Domotique, vidéosurveillance, réseaux, électricité et clim à Casablanca — solutions sur mesure depuis 20 ans.",
    "about_html": """<h2>I see home — maison et bâtiment connectés</h2>
<p>Reconnue à Casablanca pour la domotique, la vidéosurveillance, le câblage réseaux et la sécurité, <strong>I see home</strong> déploie aussi électricité et climatisation grâce à une équipe d'ingénieurs et de techniciens.</p>
<p>Vingt années de projets nourrissent des solutions sur mesure pour villas, résidences et sites tertiaires.</p>
<ul>
<li>Automatismes et scénarios domotiques</li>
<li>Sécurité électronique</li>
<li>Lots techniques associés</li>
</ul>
<p>Du schéma à la mise en service, un seul interlocuteur. Site : iseehome.ma.</p>""",
}

CONTENT["impair-studio"] = {
    "bio": "Rendus 3D, films et images immobilières à Rabat — pour architectes, promoteurs et maîtres d'ouvrage partout au Maroc.",
    "about_html": """<h2>Impair studio — images qui convainquent</h2>
<p>Groupe d'architectes et spécialistes du contenu visuel basé à Rabat, <strong>Impair studio</strong> produit rendus réalistes, films et livrables 3D pour agences d'architecture, promoteurs et maîtres d'ouvrage.</p>
<p>L'enjeu : aider à décrocher un concours, convaincre un client ou commercialiser un produit immobilier avec une expérience visuelle forte.</p>
<ul>
<li>Imagerie architecturale photoréaliste</li>
<li>Films de projet</li>
<li>Supports pour commercialisation</li>
</ul>
<p>Six années à peaufiner lumières, matières et cadrages. Site : impairstudio.com.</p>""",
}

CONTENT["ink-and-fabrik"] = {
    "bio": "Vêtements de travail et EPI personnalisés à Casablanca — identité de marque, sécurité des équipes et événements pro.",
    "about_html": """<h2>INK AND FABRIK — tenues &amp; EPI</h2>
<p>À Casablanca, <strong>INK AND FABRIK</strong> conçoit et fabrique des vêtements de travail et équipements adaptés à chaque secteur. Affirmer l'identité de marque, protéger les équipes ou personnaliser un événement : l'atelier soigne chaque détail.</p>
<p>Quatre années d'activité ont structuré une offre réactive pour entreprises du BTP, de l'industrie et des services.</p>
<ul>
<li>Tenues professionnelles sur mesure</li>
<li>Personnalisation textile</li>
<li>Solutions liées à la sécurité au travail</li>
</ul>
<p>Site : inkandfabrik.com.</p>""",
}

CONTENT["isolfix"] = {
    "bio": "Isolation thermique et acoustique, étanchéité et revêtements à Casablanca — laine, XPS, polyuréthane, membranes et sols.",
    "about_html": """<h2>ISOLFIX — enveloppe &amp; confort</h2>
<p><strong>ISOLFIX</strong> réalise travaux et distribution d'isolation thermique, phonique et acoustique à Casablanca, ainsi que l'étanchéité et des revêtements spéciaux. Laine de roche, verre, XPS/EPS, mousse polyuréthane, liège ou perlite : la gamme couvre toitures, murs et planchers.</p>
<ul>
<li>Isolation et correction acoustique</li>
<li>Membranes bitumineuses et étanchéité</li>
<li>Revêtements de sol (vinyle, parquet, gazon…)</li>
<li>Ouvrages métalliques associés</li>
</ul>
<p>Un interlocuteur unique pour le confort thermique et l'enveloppe du bâtiment. Site : isolfix.ma.</p>""",
}

CONTENT["jardinier-elegance-de-la-maison"] = {
    "bio": "Paysagiste à Casablanca : création et entretien de jardins pour particuliers et professionnels, missions cadrées sur devis.",
    "about_html": """<h2>Jardinier &amp; Élégance de la Maison</h2>
<p>Paysagiste à Casablanca, <strong>Jardinier &amp; Élégance de la Maison</strong> crée et entretient des jardins pour particuliers, entreprises et acteurs du bâtiment. Dix années de pratique guident une méthode simple : analyse du site, proposition, devis puis suivi des travaux.</p>
<ul>
<li>Création paysagère</li>
<li>Entretien régulier</li>
<li>Remise en état d'espaces extérieurs</li>
</ul>
<p>Des jardins élégants, adaptés au climat casablancais et aux usages du lieu, sans surpromesse — seulement un travail soigné et planifié.</p>""",
}

CONTENT["kech-design"] = {
    "bio": "Menuiserie et agencement à Marrakech : cuisines, dressings, hôtellerie, commerces, cabinets médicaux et espaces professionnels.",
    "about_html": """<h2>KECH DESIGN — agencer Marrakech</h2>
<p><strong>KECH DESIGN</strong> pratique la menuiserie générale et l'agencement intérieur pour particuliers et professionnels à Marrakech. Cuisines, dressings, salles de bain, bibliothèques, salons marocains, portes, parquet et habillages muraux composent le quotidien de l'atelier.</p>
<p>Côté pro : bureaux, pharmacies, cabinets médicaux, showrooms, hôtels, riads, restaurants, spas… chaque espace reçoit un mobilier adapté à son flux.</p>
<ul>
<li>Agencement résidentiel sur mesure</li>
<li>Aménagements commerciaux et médicaux</li>
<li>Hôtellerie et restauration</li>
</ul>
<p>Site : kechdesign.ma.</p>""",
}

CONTENT["l-atelier-piscine-by-housni"] = {
    "bio": "Construction, rénovation et entretien de piscines privées et collectives à Témara — L'Atelier Piscine by Housni.",
    "about_html": """<h2>L'Atelier Piscine by Housni</h2>
<p>Spécialisée à Témara, <strong>L'Atelier Piscine by Housni</strong> construit, rénove et entretient des piscines privées et collectives. Du bassin familial à l'équipement d'un site partagé, l'équipe maîtrise structure, étanchéité, filtration et finitions.</p>
<ul>
<li>Construction de piscines neuves</li>
<li>Rénovation et mise aux normes</li>
<li>Contrats d'entretien</li>
</ul>
<p>Un atelier de proximité pour des bassins durables, agréables à vivre et adaptés au climat atlantique de la région rabat-témara.</p>""",
}

CONTENT["laboratoire-cibtp"] = {
    "bio": "Laboratoire CIBTP à Agadir : géotechnique, matériaux, génie civil, géologie et expertises pour le contrôle qualité BTP.",
    "about_html": """<h2>LABORATOIRE CIBTP — Agadir</h2>
<p>Le <strong>Laboratoire CIBTP</strong>, Centre d'Ingénierie du BTP à Agadir, réalise études, essais et contrôles en géotechnique des sols, matériaux de construction, ingénierie du bâtiment, génie civil, géologie et expertise.</p>
<p>Dix années d'activité ont affirmé un rôle de partenaire technique pour entreprises et maîtres d'ouvrage du Souss et au-delà.</p>
<ul>
<li>Essais matériaux et sols</li>
<li>Contrôle qualité chantier</li>
<li>Expertises et études spécialisées</li>
</ul>
<p>Des résultats fiables pour sécuriser la conception et l'exécution. Site : cibtp.ma.</p>""",
}

CONTENT["leaderpak"] = {
    "bio": "Depuis 2013 à Mohammedia, marque VIDAL : clips de nivellement, cales et croisillons pour une pose de carrelage précise.",
    "about_html": """<h2>LEADERPAK — outils VIDAL pour carreleurs</h2>
<p>Fondée en 2013 à Mohammedia, <strong>LEADERPAK</strong> s'est imposée grâce à l'innovation autour de la pose de carrelage. Sous la marque <strong>VIDAL</strong>, l'entreprise développe clips de nivellement, cales, croisillons d'espacement et pinces de serrage.</p>
<p>Recherche, développement et design produit travaillent ensemble pour des accessoires plastiques qui accélèrent et fiabilisent le travail des poseurs.</p>
<ul>
<li>Systèmes de nivellement</li>
<li>Accessoires de pose</li>
<li>Amélioration continue des gammes</li>
</ul>
<p>Site : vidaltools.ma.</p>""",
}

CONTENT["lexmaeriel"] = {
    "bio": "Location et crédit-bail de matériel de levage et de chantier à Agadir — engins fiables pour tous types de projets.",
    "about_html": """<h2>LEXMAERIEL — levage &amp; engins à Agadir</h2>
<p><strong>LEXMAERIEL</strong> (LEXMATERIEL) propose location et crédit-bail de matériel de levage et de chantier au Maroc, avec une base à Agadir. Machines fiables, équipe réactive et formules flexibles selon la taille du projet et le secteur d'activité.</p>
<ul>
<li>Engins de levage</li>
<li>Matériel de chantier divers</li>
<li>Options de location longue durée</li>
</ul>
<p>L'ambition : être le partenaire de référence du Sud pour disposer du bon engin au bon moment. Site : lexmateriel.ma.</p>""",
}

CONTENT["locaman"] = {
    "bio": "Location Manitou télescopique avec chauffeur à Rabat, Témara et Salé — devis rapide, hauteurs 13 à 17 m.",
    "about_html": """<h2>Locaman — Manitou avec chauffeur</h2>
<p>Basée à Témara, <strong>Locaman</strong> loue des engins de chantier avec chauffeur, notamment des Manitou télescopiques de 13 à 17 m, pour Rabat, Témara, Salé et le périmètre. La promesse opérationnelle : disponibilité rapide et devis en aboutissant en une heure lorsque le planning le permet.</p>
<ul>
<li>Télescopiques avec opérateur inclus</li>
<li>Couverture Rabat–Témara–Salé</li>
<li>Formules adaptées aux chantiers urbains</li>
</ul>
<p>Idéal pour levage de matériaux, charpentes et interventions en hauteur sans immobiliser un engin à l'année.</p>""",
}

CONTENT["luxalight"] = {
    "bio": "Chaîne d'éclairage à Casablanca : +1500 références, distributeur Brilliant, New Garden, Iris Cristal, Beghelli et plus.",
    "about_html": """<h2>Luxalight — éclairer vos ambiances</h2>
<p>Première chaîne de magasins spécialisée en éclairage au Maroc, <strong>Luxalight</strong> (Casablanca) est distributeur exclusif de marques européennes : Brilliant AG, New Garden, Iris Cristal, Soflight, Beghelli, LightOne et Stiel.</p>
<p>Plus de 1500 références et trente années d'expérience permettent d'équiper villas, hôtels et projets tertiaires avec un conseil lumière précis.</p>
<ul>
<li>Luminaires décoratifs et techniques</li>
<li>Marques européennes exclusives</li>
<li>Accompagnement showroom</li>
</ul>
<p>Site : luxalight.ma.</p>""",
}

CONTENT["maison-saber-architecture"] = {
    "bio": "Cabinet d'architecture à Tanger — chaque espace trouve son sens, du programme à la réalisation sensible du lieu.",
    "about_html": """<h2>Maison Saber Architecture — Tanger</h2>
<p>À Tanger, <strong>Maison Saber Architecture</strong> est un cabinet où chaque espace est pensé pour trouver son sens. Programmes résidentiels et projets sur mesure y sont traités avec une attention particulière à la lumière, aux usages et au caractère du site.</p>
<ul>
<li>Conception architecturale</li>
<li>Dialogue client approfondi</li>
<li>Suivi jusqu'à la matérialisation</li>
</ul>
<p>Bienvenue dans une approche où le dessin sert le vécu quotidien autant que l'image du bâtiment. Site : maisonsaber.com.</p>""",
}

CONTENT["marmol-martil"] = {
    "bio": "Import-export de marbre et granit en gros à Agadir — pierres naturelles pour projets résidentiels et professionnels.",
    "about_html": """<h2>MARMOL MARTIL — marbre &amp; granit</h2>
<p>Société d'import-export basée à Agadir, <strong>MARMOL MARTIL</strong> négocie en gros marbre et granit pour le marché marocain. Blocs et dalles alimentent marbriers, promoteurs et entreprises de pose.</p>
<ul>
<li>Marbres et granits sélectionnés</li>
<li>Négoce en volumes professionnels</li>
<li>Approvisionnement pour le Sud et au-delà</li>
</ul>
<p>Une source fiable de pierre naturelle pour revêtements, plans de travail et éléments décoratifs durables.</p>""",
}

CONTENT["materca"] = {
    "bio": "Matériaux de construction depuis 1994 à Casablanca — distribution nationale pour entreprises et chantiers du Royaume.",
    "about_html": """<h2>MATERCA — matériaux depuis 1994</h2>
<p>Fondée en 1994, <strong>MATERCA</strong> commercialise des matériaux de construction sur l'ensemble du territoire marocain depuis Casablanca. Trois décennies de logistique et de relations fournisseurs assurent une offre stable pour les entreprises du BTP.</p>
<ul>
<li>Gamme pour gros œuvre et second œuvre</li>
<li>Couverture nationale</li>
<li>Service orienté professionnels</li>
</ul>
<p>Un fournisseur historique pour sécuriser les approvisionnements de chantier, année après année.</p>""",
}

CONTENT["mdf-services"] = {
    "bio": "Placards, dressings, cuisines MDF et habillage mural à Salé — mobilier intérieur sur mesure depuis 7 ans.",
    "about_html": """<h2>MDF Services — dressings &amp; cuisines à Salé</h2>
<p>Spécialiste du placard, du dressing et de la cuisine en MDF à Salé, <strong>MDF Services</strong> réalise aussi habillages muraux et mobilier intérieur sur mesure. Sept années d'atelier ont peaufiné coupe, assemblages et pose.</p>
<ul>
<li>Cuisines et rangements</li>
<li>Dressings optimisés</li>
<li>Habillage mural et meubles</li>
</ul>
<p>Du relevé des cotes à l'installation, un travail soigné pour des intérieurs fonctionnels dans la région de Rabat-Salé. Site : mdfservices.ma.</p>""",
}

CONTENT["mes-traitement"] = {
    "bio": "Traitement et purification d'eau, pompage et équipements durables à Marrakech — solutions pour piscines et réseaux.",
    "about_html": """<h2>MES Traitement — l'eau sous contrôle</h2>
<p>À Marrakech, <strong>MES Traitement</strong> développe des solutions de traitement et de purification d'eau, ainsi que du pompage et des équipements durables. Plus de six ans d'expertise au service des piscines, des réseaux et des installations exigeantes sur la qualité de l'eau.</p>
<ul>
<li>Traitement et filtration</li>
<li>Pompage</li>
<li>Équipements pour bassins et réseaux</li>
</ul>
<p>Innovation et fiabilité pour un usage serein de la ressource. Site : mestraitement.com.</p>""",
}

CONTENT["metastone"] = {
    "bio": "Pierre naturelle de Taza : extraction, transformation, vente et pose de travertin et ardoise — sols, murs, terrasses.",
    "about_html": """<h2>METASTONE — de la carrière au chantier</h2>
<p>Ancrée dans le patrimoine géologique de Taza et basée à Rabat, <strong>METASTONE</strong> extrait, transforme, vend et pose la pierre naturelle — notamment travertin et ardoise. L'entreprise maîtrise la chaîne complète, de la sélection en carrière à la mise en œuvre.</p>
<ul>
<li>Sols, murs et terrasses en pierre</li>
<li>Allées et aménagements décoratifs</li>
<li>Solutions clé en main</li>
</ul>
<p>Durabilité, élégance et authenticité guident chaque projet résidentiel ou tertiaire. Site : metastone.ma.</p>""",
}

CONTENT["mongrillage"] = {
    "bio": "Clôtures, portails, poteaux et accessoires à Mohammedia — solutions de sécurisation durables pour particuliers et collectivités.",
    "about_html": """<h2>Mongrillage — sécuriser les espaces</h2>
<p>Fournisseur spécialisé à Mohammedia, <strong>Mongrillage</strong> propose clôtures, portails, poteaux et accessoires pour particuliers, entreprises et collectivités. Quinze années d'activité ont bâti une offre fiable, esthétique et conçue pour durer.</p>
<ul>
<li>Gammes de clôtures complètes</li>
<li>Portails et quincaillerie associée</li>
<li>Conseil sur la pose et les finitions</li>
</ul>
<p>De la protection à la finition, tout le nécessaire pour un projet de clôture abouti. Site : mongrillage.com.</p>""",
}

CONTENT["multi-tx"] = {
    "bio": "Construction, gros œuvre, finitions et aménagements à Sidi Kacem — interventions sur tout le Maroc, devis clairs.",
    "about_html": """<h2>Multi Tx — construire partout au Maroc</h2>
<p>Société basée à Sidi Kacem, <strong>Multi Tx</strong> intervient en construction, travaux divers, finitions intérieures et aménagement extérieur sur l'ensemble du territoire. Gros œuvre et second œuvre sont cadrés sur devis, avec un suivi d'étapes transparent.</p>
<ul>
<li>Gros œuvre et structure</li>
<li>Finitions intérieures</li>
<li>Aménagements extérieurs</li>
</ul>
<p>Particuliers, entreprises et professionnels du bâtiment y trouvent un interlocuteur mobile, orienté résultats sur chantier.</p>
<p>Site : multitx.ma.</p>""",
}

CONTENT["my-zdayn-invest"] = {
    "bio": "Béton décoratif, construction et aménagements à Casablanca — esthétique, robustesse et parc matériel moderne.",
    "about_html": """<h2>my zdayn invest — béton &amp; aménagements</h2>
<p>Entreprise innovante à Casablanca, <strong>my zdayn invest</strong> se spécialise dans la construction, l'aménagement et le béton décoratif. Technologie, matériaux performants et équipe qualifiée servent des projets exigeants en qualité et durabilité.</p>
<ul>
<li>Coulage, réfection et béton décoratif</li>
<li>Ponçage et finitions</li>
<li>Aménagements intérieurs et extérieurs</li>
</ul>
<p>Une approche éco-responsable et un parc matériel moderne pour transformer durablement les espaces. Site : myzdayninvest.ma.</p>""",
}

CONTENT["natural-stone-suppliers"] = {
    "bio": "Marbre et granite de carrières marocaines et import (Carrare, travertin) à Mohammedia — pose et fourniture haut de gamme.",
    "about_html": """<h2>Natural Stone Suppliers — pierre d'exception</h2>
<p>À Mohammedia, <strong>Natural Stone Suppliers</strong> commercialise et pose marbre et granite bruts ou transformés. L'exploitation de carrières marocaines assure traçabilité et régularité ; l'import de Carrare et de travertin répond aux projets les plus exigeants.</p>
<p>Vingt et une années d'expérience nourrissent des solutions pour résidentiel, commercial et institutionnel.</p>
<ul>
<li>Pierres locales et prestigieuses</li>
<li>Transformation et pose</li>
<li>Projets sur mesure</li>
</ul>
<p>Site : natural-stone.co.</p>""",
}

CONTENT["nexview"] = {
    "bio": "Visites virtuelles 360° pour l'immobilier à Casablanca — valorisez vos biens à vendre ou louer, exploration à distance 24h/24.",
    "about_html": """<h2>NexView — visites immersives</h2>
<p><strong>NexView</strong> crée des visites virtuelles 360° immersives pour l'immobilier à Casablanca. Agences et particuliers valorisent ainsi leurs biens : les prospects explorent chaque pièce à distance, comme s'ils y étaient, à toute heure.</p>
<ul>
<li>Captation 360° professionnelle</li>
<li>Visites publiables en ligne</li>
<li>Support pour vente et location</li>
</ul>
<p>Un levier concret pour accélérer les décisions d'achat ou de location sans multiplier les déplacements inutiles.</p>""",
}

CONTENT["optima-peintures"] = {
    "bio": "Fabricant marocain de peintures, colles et émulsions depuis 1985 à Casablanca — gammes intérieur et extérieur.",
    "about_html": """<h2>OPTIMA PEINTURES — fabriqué au Maroc depuis 1985</h2>
<p>Fondée en 1985 à Casablanca, <strong>Optima Peintures</strong> fabrique peintures, colles et émulsions pour la décoration intérieure et extérieure. Quarante années de savoir-faire industriel nourrissent des formulations adaptées au climat et aux pratiques locales.</p>
<ul>
<li>Peintures bâtiment</li>
<li>Colles et émulsions</li>
<li>Conseil application pour pros</li>
</ul>
<p>Une référence nationale pour peindre durablement façades et intérieurs. Site : optima-peintures.ma.</p>""",
}

CONTENT["paradis-amenagement"] = {
    "bio": "Menuiserie bois, cuisines équipées et aménagement intérieur/extérieur à Casablanca — conception, fabrication et pose depuis 20 ans.",
    "about_html": """<h2>PARADIS AMENAGEMENT — sur mesure à Casa</h2>
<p>À Casablanca, <strong>PARADIS AMENAGEMENT</strong> réalise menuiserie, agencement et aménagement intérieur comme extérieur. Vingt années d'expérience couvrent conception, fabrication et installation pour particuliers et professionnels.</p>
<ul>
<li>Portes, placards, dressings et meubles bois</li>
<li>Cuisines équipées haut de gamme</li>
<li>Aménagements extérieurs associés</li>
</ul>
<p>Du croquis à la pose, un atelier exigeant sur les finitions. Site : paradisamenagement.ma.</p>""",
}

CONTENT["philippe-benisty"] = {
    "bio": "Promoteur immobilier à Marrakech — Les Résidences Carline et opérations résidentielles de standing.",
    "about_html": """<h2>Philippe Benisty — promotion à Marrakech</h2>
<p><strong>Philippe Benisty</strong> développe des opérations immobilières à Marrakech, dont les Résidences Carline. Le positionnement privilégie des programmes résidentiels soignés, en phase avec la demande locale et internationale sur la ville ocre.</p>
<ul>
<li>Promotion résidentielle</li>
<li>Suivi de commercialisation</li>
<li>Exigence qualitative à la livraison</li>
</ul>
<p>Un projet est référencé sur Sifarah ; l'activité reste tournée vers des adresses premium. Site : lesresidencescarline.ma.</p>""",
}

CONTENT["point-tp"] = {
    "bio": "Aménagement, rénovation et réhabilitation à Tanger — structure, restauration du bâti et agencement sur mesure.",
    "about_html": """<h2>POINT TP — réhabiliter Tanger</h2>
<p><strong>POINT TP</strong> agit à Tanger sur l'aménagement intérieur et extérieur, la rénovation structurelle et la réhabilitation : remettre le bâti en état en respectant les logiques constructives, ou faire du neuf à partir de l'ancien.</p>
<p>L'entreprise collabore aussi avec des usines partenaires pour du mobilier professionnel et de l'agencement sur mesure — comme l'illustre la restauration du musée Dar Niaba.</p>
<ul>
<li>Restauration et réhabilitation</li>
<li>Travaux touchant à la structure</li>
<li>Agencement de locaux</li>
</ul>
<p>Site : pointtp.ma.</p>""",
}

CONTENT["prefa-norm"] = {
    "bio": "Production et commercialisation de produits béton à Agadir — préfabriqués pour chantiers du Souss et du Maroc.",
    "about_html": """<h2>PREFA NORM — béton préfabriqué</h2>
<p>Basée à Agadir, <strong>PREFA NORM</strong> (PREFANORM) produit et commercialise des produits à base de béton pour le bâtiment et les travaux publics. La préfabrication apporte régularité dimensionnelle et rapidité de pose sur chantier.</p>
<ul>
<li>Éléments béton préfabriqués</li>
<li>Fourniture pour entreprises TP et bâtiment</li>
<li>Production ancrée dans le Souss</li>
</ul>
<p>Une source locale pour sécuriser les approvisionnements en béton manufacturé.</p>""",
}

CONTENT["profundes"] = {
    "bio": "Rénovation et construction à Rabat — du gros œuvre aux finitions, projets cadrés pour particuliers et professionnels.",
    "about_html": """<h2>profundes — bâtir à Rabat</h2>
<p>Entreprise de rénovation et de construction basée à Rabat, <strong>profundes</strong> intervient du gros œuvre aux finitions. Cinq années de chantiers ont affirmé une culture de qualité d'exécution et de communication claire avec le maître d'ouvrage.</p>
<ul>
<li>Neuf et rénovation</li>
<li>Gros œuvre et second œuvre</li>
<li>Suivi de planning</li>
</ul>
<p>Des travaux structurés, devis à l'appui, pour des projets résidentiels ou professionnels dans la capitale. Site : profundas.com.</p>""",
}

CONTENT["qoubae-elec"] = {
    "bio": "Électricité et luminaires à Casablanca — interventions fiables, rapides et professionnelles pour tous types de projets.",
    "about_html": """<h2>Qoubae elec — lumière &amp; courant</h2>
<p>À Casablanca, <strong>Qoubae elec</strong> assure travaux d'électricité et fourniture de luminaires pour projets résidentiels et professionnels. La promesse : fiabilité, rapidité et professionnalisme sur chaque intervention.</p>
<ul>
<li>Installations électriques</li>
<li>Éclairage et luminaires</li>
<li>Mises aux normes et dépannages</li>
</ul>
<p>Un prestataire de proximité pour sécuriser tableaux, circuits et ambiances lumineuses.</p>""",
}

CONTENT["rahma_immobilier"] = {
    "bio": "Agence immobilière — vente, location et investissement de biens résidentiels et commerciaux, accompagnement personnalisé.",
    "about_html": """<h2>Rahma Aamrani — agence immobilière</h2>
<p>L'agence de <strong>Rahma Aamrani</strong> accompagne particuliers et investisseurs dans leurs projets immobiliers. Sélection de biens résidentiels et commerciaux à la vente comme à la location, avec des opportunités calibrées selon budgets et objectifs.</p>
<ul>
<li>Vente et location</li>
<li>Conseil en investissement</li>
<li>Suivi jusqu'à la signature</li>
</ul>
<p>Transparence et écoute structurent la relation client, de la première visite à la remise des clés. Présence également via les réseaux sociaux de l'agence.</p>""",
}

CONTENT["robot-securite-process"] = {
    "bio": "Depuis 1998 à Casablanca : détection incendie, extinction, alarmes, vidéosurveillance et domotique pour industrie et tertiaire.",
    "about_html": """<h2>ROBOT SECURITE PROCESS — protéger les sites</h2>
<p>Fondée en 1998, <strong>Robot Sécurité Process</strong> installe, met en service, maintient et rénove détection incendie, extinction automatique, alarmes, vidéosurveillance et domotique à Casablanca.</p>
<p>Industrie, tertiaire, hôpitaux, hôtels et grandes administrations s'appuient sur une équipe reconnue pour sa rigueur, en partenariat avec des références comme Inim Electronics.</p>
<ul>
<li>Incendie et extinction</li>
<li>Sûreté électronique</li>
<li>Maintenance sur cycle de vie</li>
</ul>
<p>Site : robotsecuriteprocess.com.</p>""",
}

CONTENT["s-i-t-e-f-ingenieur-geometre-topographe"] = {
    "bio": "SITEF — ingénieur géomètre-topographe : bornage, levés, implantations et plans, expertise précision et fiabilité.",
    "about_html": """<h2>S.I.T.E.F — géomètre-topographe</h2>
<p><strong>SITEF</strong>, ingénieur géomètre-topographe, met l'accent sur l'expertise, la précision et la fiabilité des levés. Bornage, implantations, plans topographiques et dossiers réglementaires sont produits pour sécuriser les projets de construction et les mutations foncières.</p>
<ul>
<li>Levés et plans</li>
<li>Implantation de chantier</li>
<li>Assistance aux dossiers techniques</li>
</ul>
<p>Un interlocuteur de terrain pour que chaque cote compte avant de couler le béton.</p>""",
}

CONTENT["saez"] = {
    "bio": "Grues à tour : fabrication, vente et location à Casablanca — soixante ans d'expérience industrielle au service des chantiers.",
    "about_html": """<h2>SAEZ — grues à tour</h2>
<p><strong>SAEZ</strong> fabrique, vend et loue des grues à tour pour la construction moderne. Forte d'environ soixante années d'expérience dans le secteur, l'entreprise (présence Casablanca) propose des solutions innovantes, fiables et un service client personnalisé.</p>
<ul>
<li>Grues neuves et solutions de location</li>
<li>Technologie et sécurité de levage</li>
<li>Accompagnement technique</li>
</ul>
<p>Qualité machine et disponibilité au service des entreprises générales. Site : gruassaez.com.</p>""",
}

CONTENT["sanivy"] = {
    "bio": "Import de sanitaires et mitigeurs d'Europe et d'Asie (Turquie, Chine) à Casablanca — gammes pour salles de bain et plomberie.",
    "about_html": """<h2>Sanivy — sanitaires &amp; mitigeurs</h2>
<p>Basée à Casablanca, <strong>Sanivy</strong> importe produits sanitaires et mitigeurs depuis l'Europe et l'Asie, principalement Turquie et Chine. L'offre alimente revendeurs, plombiers et projets de salles de bain.</p>
<ul>
<li>Robinetterie et mitigeurs</li>
<li>Équipements sanitaires</li>
<li>Sélection qualité/prix pour le marché marocain</li>
</ul>
<p>Un importateur orienté disponibilité et diversité de styles pour équiper le résidentiel comme le tertiaire.</p>""",
}

CONTENT["sarabo"] = {
    "bio": "Distribution sanitaire, plomberie, tuyauterie et chauffage à Casablanca — plus de 25 ans au service des installateurs.",
    "about_html": """<h2>SARABO — sanitaire &amp; chauffage</h2>
<p>À Casablanca, <strong>SARABO</strong> distribue matériel sanitaire, équipements de salle de bain, plomberie, tuyauterie et chauffage. Vingt-six années de présence ont bâti un réseau de confiance avec installateurs et négociants (lien historique Robicer).</p>
<ul>
<li>Sanitaires et accessoires</li>
<li>Réseaux et tuyauterie</li>
<li>Chauffage et irrigation associée</li>
</ul>
<p>Stock et conseil pour faire avancer les lots fluides sans rupture. Site : sarabo.ma.</p>""",
}

CONTENT["sdk-wood"] = {
    "bio": "Import et distribution de bois à Casablanca — savoir-faire familial sur trois générations, gammes pour tous chantiers.",
    "about_html": """<h2>SDK WOOD — l'excellence du bois</h2>
<p>Savoir-faire transmis sur trois générations, <strong>SDK WOOD</strong> est un acteur majeur de l'import et de la distribution de bois au Maroc, depuis Casablanca. Tous types de bois sont sélectionnés auprès de partenaires internationaux pour menuisiers et entreprises.</p>
<ul>
<li>Sélection qualité à la source</li>
<li>Service logistique réactif</li>
<li>Gammes pour construction et aménagement</li>
</ul>
<p>Treize années sous l'enseigne actuelle, des décennies d'héritage métier. Site : sdkwood.ma.</p>""",
}

CONTENT["sicatgb"] = {
    "bio": "Construction, BTP, quincaillerie, aménagement et formation à Casablanca — plus de 40 ans d'activité et de partenariats.",
    "about_html": """<h2>SICATGB — BTP &amp; quincaillerie</h2>
<p>Société casablancaise au long cours (plus de quarante ans), <strong>SICATGB</strong> combine construction BTP, fourniture de quincaillerie, aménagement, sous-traitance et formation. Elle participe aussi à des projets industriels et commerciaux via partenariats et investissements.</p>
<ul>
<li>Travaux et sous-traitance</li>
<li>Matériel de quincaillerie</li>
<li>Formation aux métiers du BTP</li>
</ul>
<p>Un groupe polyvalent pour orchestrer ou fournir les chantiers. Site : sicatgb.com.</p>""",
}

CONTENT["sm-stone"] = {
    "bio": "Marbre, granite et pierre naturelle à Salé (siège Rabat) — fourniture pour revêtements et projets d'exception, Bouknadel.",
    "about_html": """<h2>SM STONE — pierres à Salé</h2>
<p>Basée à Salé avec siège à Rabat (Route de Kénitra Km 9, Bouknadel), <strong>SM STONE</strong> fournit marbre, granite et pierre naturelle pour revêtements et ouvrages décoratifs. Quinze années d'activité ont affirmé une offre pour architectes, marbriers et particuliers exigeants.</p>
<ul>
<li>Marbres et granites</li>
<li>Pierres naturelles sélectionnées</li>
<li>Conseil formats et finitions</li>
</ul>
<p>Des matériaux nobles pour sols, murs et plans de travail durables.</p>""",
}

CONTENT["societe-marocaine-d-amenagement-des-espa"] = {
    "bio": "Jardinage, aménagement d'espaces verts et nettoyage de fin de chantier à Tanger — solutions sur mesure pour tous clients.",
    "about_html": """<h2>SMAEV — jardins &amp; propreté à Tanger</h2>
<p>La <strong>Société Marocaine d'Aménagement des Espaces Verts</strong> crée, entretient et transforme les extérieurs à Tanger, tout en assurant le nettoyage de fin de chantier. Particuliers et professionnels bénéficient de solutions adaptées au site et au budget.</p>
<ul>
<li>Jardins paysagers</li>
<li>Aménagements urbains ou privés</li>
<li>Nettoyage après travaux</li>
</ul>
<p>Cinq années d'expérience, des outils adaptés et une équipe terrain pour des espaces extérieurs apaisants. Site : jardin-amenagment.com.</p>""",
}

CONTENT["solutions-gazon-afrique"] = {
    "bio": "Aménagement d'espaces verts et production de gazon naturel en plaques — Solutions Gazon Afrique pour pelouses durables.",
    "about_html": """<h2>Solutions Gazon Afrique</h2>
<p><strong>Solutions Gazon Afrique</strong> aménage les espaces verts et produit du gazon naturel en plaques. La double compétence — production et pose — assure une pelouse homogène, adaptée aux climats et usages marocains.</p>
<ul>
<li>Gazon en plaques de production propre</li>
<li>Création et rénovation de pelouses</li>
<li>Aménagements paysagers associés</li>
</ul>
<p>Collectivités, promoteurs et particuliers y trouvent un interlocuteur capable de livrer un tapis végétal prêt à l'emploi et de le mettre en place dans les règles de l'art.</p>""",
}

CONTENT["sousstherme"] = {
    "bio": "Climatisation, électricité générale et plomberie thermique à Marrakech et Agadir — installation, fourniture et maintenance.",
    "about_html": """<h2>sousstherme — confort thermique Sud</h2>
<p>Bien établie à Marrakech et Agadir, <strong>sousstherme</strong> installe, fournit et maintient des climatisations, et intervient aussi en électricité générale et plomberie thermique pour clients résidentiels et professionnels.</p>
<p>Sept années d'activité, un capital social solide et une immatriculation conforme rassurent les maîtres d'ouvrage du Souss et de Marrakech.</p>
<ul>
<li>Clim : pose et SAV</li>
<li>Électricité générale</li>
<li>Plomberie thermique</li>
</ul>
<p>Site : sousstherme.ma.</p>""",
}

CONTENT["ste-old-maati"] = {
    "bio": "Matériaux de construction et agrégats à Settat depuis plus de 10 ans — fourniture pour chantiers de la région.",
    "about_html": """<h2>STE OLD MAATI — matériaux à Settat</h2>
<p>Depuis plus de dix ans, <strong>STE OLD MAATI</strong> opère à Settat dans la construction et la vente de matériaux, notamment les agrégats. L'expérience acquise sur les chantiers de la région nourrit une offre pragmatique pour entreprises et bâtisseurs.</p>
<ul>
<li>Agrégats et matériaux de construction</li>
<li>Fourniture pour le gros œuvre</li>
<li>Ancrage local à Settat</li>
</ul>
<p>Un fournisseur de proximité pour sécuriser les volumes nécessaires au démarrage et à la poursuite des travaux.</p>""",
}

CONTENT["ste-store-access"] = {
    "bio": "Import et distribution à Rabat : contrôle d'accès, sécurité, gestion intelligente et POS — ZKTeco, WDLink, Dahua.",
    "about_html": """<h2>STE STORE ACCESS — techno &amp; accès</h2>
<p>Entreprise marocaine basée à Rabat, <strong>STORE ACCESS</strong> importe et distribue des solutions technologiques avancées : sécurité, contrôle d'accès, gestion intelligente des espaces et systèmes de point de vente.</p>
<p>Partenariats avec ZKTeco, WDLink et Dahua garantissent des produits performants, certifiés et adaptés au marché local.</p>
<ul>
<li>Contrôle d'accès et badges</li>
<li>Vidéosurveillance</li>
<li>Solutions POS et espaces connectés</li>
</ul>
<p>Contact : contact@storeaccess.ma — storeaccess.ma.</p>""",
}

CONTENT["studio-33-architects"] = {
    "bio": "Cabinet d'architecture à Agadir : résidences haut de gamme sur mesure, design intérieur et paysage intégrés.",
    "about_html": """<h2>Studio 33 architects — Agadir</h2>
<p>Cabinet d'architecture et de design au Maroc, <strong>Studio 33 architects</strong> conçoit des projets résidentiels haut de gamme et sur mesure depuis Agadir. Luxe, élégance et fonctionnalité s'appuient sur la qualité des matériaux, l'harmonie des volumes et l'intégration au site.</p>
<p>Cinq années de pratique offrent un accompagnement complet : conception architecturale, design intérieur et aménagement paysager.</p>
<ul>
<li>Villas et résidences d'exception</li>
<li>Intérieurs cohérents avec l'architecture</li>
<li>Paysage et abords</li>
</ul>
<p>Chaque projet est traité comme une œuvre unique. Site : studio33architects.com.</p>""",
}

CONTENT["synelec-energy"] = {
    "bio": "Import, distribution et installation de matériel électrique et éclairage à Casablanca — partenaire des pros de la filière.",
    "about_html": """<h2>SYNELEC ENERGY — électricité &amp; lumière</h2>
<p>Société marocaine passionnée par le matériel électrique, <strong>SYNELEC ENERGY</strong> importe, distribue et installe équipements et éclairage sur tout le territoire, depuis Casablanca.</p>
<p>Industrie, habitat et tertiaire y trouvent des solutions pour le confort, la performance et les économies d'énergie. Artisans installateurs et ingénieurs sont les interlocuteurs naturels de la société.</p>
<ul>
<li>Matériel électrique professionnel</li>
<li>Éclairage technique et décoratif</li>
<li>Travaux et conseil</li>
</ul>
<p>Site : synelec.ma — support et devis sur demande.</p>""",
}

CONTENT["takga"] = {
    "bio": "Granulats et sables à Fès : concassé, lavé, G1/G2 — qualité contrôlée, prix compétitifs et transport jusqu'au chantier.",
    "about_html": """<h2>Takga — granulats à Fès</h2>
<p>Fournisseur de granulats basé à Fès, <strong>Takga</strong> propose sables concassés et lavés, graviers G1 et G2 et autres fractions pour le béton et les travaux de voirie. La qualité du matériau et la compétitivité des prix s'accompagnent d'un service de transport jusqu'au lieu de livraison, avec facturation claire.</p>
<ul>
<li>Sable concassé et lavé</li>
<li>Gravet G1 / G2</li>
<li>Livraison chantier</li>
</ul>
<p>Un approvisionnement fiable pour les entreprises de la région fassie et les chantiers qui exigent des granulats réguliers.</p>""",
}

CONTENT["technoprime"] = {
    "bio": "Domotique, éclairage intelligent, clim et audio pro à Agadir — projets connectés pour villas, promoteurs et entreprises.",
    "about_html": """<h2>Technoprime — Agadir connecté</h2>
<p>Basée à Agadir, <strong>Technoprime</strong> déploie automatisation, éclairage intelligent, climatisation et systèmes audio professionnels. Particuliers, promoteurs, architectes et entreprises y trouvent des intégrations fiables issues de marques reconnues.</p>
<ul>
<li>Contrôle éclairage, stores, chauffage</li>
<li>Sécurité et sonorisation</li>
<li>Climatisation intégrée aux scénarios</li>
</ul>
<p>Confort, économies d'énergie et design pour des espaces élégants et intelligents. Site : technoprime.ma.</p>""",
}

CONTENT["th-guard"] = {
    "bio": "Gardiennage, sûreté des sites et nettoyage à Témara — agents formés et prestations de propreté pour entreprises et chantiers.",
    "about_html": """<h2>TH.GUARD — sécurité &amp; nettoyage</h2>
<p>À Témara, <strong>TH.GUARD</strong> fournit gardiennage et sûreté des installations grâce à des agents formés, tout en proposant des prestations de nettoyage — y compris en contexte de chantier ou de sites tertiaires.</p>
<p>L'entreprise insiste sur la posture des agents : premier visage vu par clients et visiteurs, ils incarnent la fiabilité du dispositif.</p>
<ul>
<li>Gardiennage et rondes</li>
<li>Sûreté multi-secteurs</li>
<li>Nettoyage professionnel</li>
</ul>
<p>Un partenaire unique pour sécuriser et entretenir les sites.</p>""",
}

CONTENT["tradebridge-international-sarl"] = {
    "bio": "Éclairage et électricité design à Casablanca : systèmes magnétiques, suspensions, lustres et appliques pour projets standing.",
    "about_html": """<h2>Tradebridge International — lumière design</h2>
<p>Société casablancaise d'import et de distribution, <strong>Tradebridge International SARL</strong> (marque Lumosart) propose éclairage et électricité modernes de haute qualité : câblage, spots, lampes, suspensions.</p>
<ul>
<li>Systèmes magnétiques encastrés ou apparents</li>
<li>Suspensions et lustres pour villas et hôtels</li>
<li>Appliques et plafonniers décoratifs</li>
</ul>
<p>Des produits performants et esthétiques pour projets résidentiels et hôteliers exigeants. Site : lumosart.com.</p>""",
}

CONTENT["trecq"] = {
    "bio": "Laboratoire à Meknès depuis 25 ans : essais sols, bétons, enrobés, granulats et suivi géotechnique sur tout le Maroc.",
    "about_html": """<h2>TRECQ — contrôle qualité matériaux</h2>
<p>Fort de vingt-cinq ans d'expérience, le laboratoire <strong>TRECQ</strong> à Meknès est une référence nationale pour le contrôle des matériaux, les études géotechniques et le suivi technique des projets de construction et d'infrastructures.</p>
<p>Équipements certifiés aux normes NM, ASTM, EN et ISO ; équipe d'ingénieurs et techniciens pluridisciplinaire.</p>
<ul>
<li>Essais sols, bétons, enrobés, granulats</li>
<li>Couverture nationale</li>
<li>Fiabilité et rapidité des rapports</li>
</ul>
<p>Partenaire des entreprises BTP, collectivités et MOA pour la sécurité des ouvrages. Site : trecq.ma.</p>""",
}

CONTENT["user_a1cdf942"] = {
    "bio": "Professionnel du bâtiment et de l'immobilier sur Sifarah — profil en cours de complétion, contactez-nous pour vos projets.",
    "about_html": """<h2>Professionnel Sifarah</h2>
<p>Ce profil est référencé sur <strong>Sifarah</strong>, la plateforme marocaine dédiée au BTP et à l'immobilier. Les informations détaillées (raison sociale, métiers, zone d'intervention) seront précisées prochainement par le titulaire du compte.</p>
<p>En attendant, vous pouvez utiliser la messagerie de la plateforme pour présenter votre besoin : construction, rénovation, fourniture ou mission d'étude.</p>
<ul>
<li>Mise en relation qualifiée</li>
<li>Échanges via Sifarah</li>
<li>Complément de fiche à venir</li>
</ul>
<p>Nous invitons le professionnel à enrichir bientôt sa présentation afin de mieux valoriser son savoir-faire auprès des maîtres d'ouvrage.</p>""",
}

CONTENT["vergata-s-a-r-l"] = {
    "bio": "Quincaillerie et fournitures BTP à Casablanca — accompagnement des professionnels pour équiper et faire avancer les chantiers.",
    "about_html": """<h2>VERGATA — quincaillerie pro à Casa</h2>
<p><strong>VERGATA s.a.r.l</strong> accompagne les professionnels du BTP à Casablanca avec une offre de quincaillerie et de fournitures de chantier. Quatre années d'activité ont structuré un service réactif, orienté disponibilité des pièces et conseil produit.</p>
<ul>
<li>Quincaillerie bâtiment</li>
<li>Fournitures pour entreprises</li>
<li>Réponses rapides aux urgences de chantier</li>
</ul>
<p>Un comptoir de confiance pour ne pas bloquer une pose ou une finition faute de référence. Site : vergata.ma.</p>""",
}

CONTENT["viasim"] = {
    "bio": "Démolition et terrassement à Khouribga — expertise technique nourrie d'un parcours international (EUROVIA, ADP).",
    "about_html": """<h2>Viasim — démolition &amp; terrassement</h2>
<p>Basée à Khouribga, <strong>Viasim</strong> est le partenaire des projets exigeants en démolition et terrassement. L'approche est façonnée par l'expérience internationale du cofondateur, ingénieur diplômé en France et passé par EUROVIA et ADP (Aéroports de Paris).</p>
<ul>
<li>Démolition maîtrisée</li>
<li>Terrassement et préparation de plateforme</li>
<li>Rigueur technique et gestion de chantier</li>
</ul>
<p>Des méthodes éprouvées pour des opérations sûres et planifiées. Site : viasim.ma.</p>""",
}

CONTENT["webmount"] = {
    "bio": "Importateur de panneaux mélaminés MDF et aggloméré européens à Casablanca — matériaux écologiques pour la menuiserie.",
    "about_html": """<h2>Webmount — panneaux bois européens</h2>
<p>Importateur à Casablanca, <strong>Webmount</strong> fournit des panneaux de bois mélaminés en MDF et aggloméré de haute qualité d'origine européenne, avec un positionnement leader sur les matériaux écologiques.</p>
<p>Vingt-trois années d'expérience font de l'entreprise un partenaire durable pour menuisiers et agenceurs.</p>
<ul>
<li>MDF et aggloméré mélaminés</li>
<li>Origine européenne</li>
<li>Orientation matériaux responsables</li>
</ul>
<p>Pour des projets d'aménagement uniques, des panneaux stables et esthétiques. Site : webmount.com.</p>""",
}

CONTENT["youssef-lahkim-architecture-studio"] = {
    "bio": "Studio d'architecture à Casablanca depuis 25 ans : architecture, intérieur, urbanisme et paysage — direction technique Imane Raffaq.",
    "about_html": """<h2>Youssef LAHKIM Architecture Studio</h2>
<p>À Casablanca, le <strong>Youssef LAHKIM Architecture Studio</strong> conseille et conçoit depuis un quart de siècle : architecture, intérieur, urbanisme et aménagements paysagers. La direction technique, portée notamment par Imane Raffaq, assure la continuité et la rigueur des études.</p>
<ul>
<li>Projets architecturaux complets</li>
<li>Design et décoration intérieure</li>
<li>Planification urbaine et paysage</li>
</ul>
<p>Vingt-cinq années d'écoute client et d'exigence constructive pour des espaces durables et habités. Site : ylahkim.com.</p>""",
}


def word_count(html: str) -> int:
    plain = re.sub(r"<[^>]+>", " ", html or "")
    return len(plain.split())


def main() -> None:
    rows = json.loads(INP.read_text(encoding="utf-8"))
    out = []
    missing = []
    for row in rows:
        uname = row["username"]
        if uname not in CONTENT:
            missing.append(uname)
            continue
        c = CONTENT[uname]
        bio = c["bio"].strip()
        about = c["about_html"].strip()
        if len(bio) > 220:
            raise SystemExit(f"bio too long ({len(bio)}): {uname}")
        wc = word_count(about)
        if wc < 90 or wc > 230:
            print(f"WARN words={wc} {uname}")
        out.append({"id": row["id"], "username": uname, "bio": bio, "about_html": about})
    if missing:
        raise SystemExit(f"missing content for {len(missing)}: {missing[:20]}")
    if len(out) != len(rows):
        raise SystemExit(f"count mismatch {len(out)} vs {len(rows)}")
    # uniqueness quick check
    bios = [x["bio"] for x in out]
    if len(set(bios)) != len(bios):
        raise SystemExit("duplicate bios detected")
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {OUT} entries={len(out)}")


if __name__ == "__main__":
    main()




