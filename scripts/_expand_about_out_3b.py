# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path

base = Path(r"c:\Users\Hamza\Downloads\waseet\scripts")
path = base / "_about_out_3.json"
rows = json.loads(path.read_text(encoding="utf-8"))

EXTRA2 = {
    "ematus": "<p>Les équipes EMATUS restent disponibles pour clarifier compatibilités et références croisées, un service discret mais décisif lorsque le planning électrique ne tolère aucun faux numéro de catalogue.</p>",
    "explomar": "<p>Du salon privé à l’immeuble tertiaire, Explomar aide à caler formats et finitions de pierre pour un rendu homogène, y compris lorsque les lots de pose sont échelonnés dans le temps.</p>",
    "ferraille-fer": "<p>Un simple appel suffit souvent à verrouiller diamètres et quantités : la réactivité commerciale de Ferraille Fer est pensée pour les chefs de chantier pressés par le calendrier de coulage.</p>",
    "fortis-travaux": "<p>Cette lecture intégrée se traduit aussi par des réceptions plus claires : un seul dossier technique, des essais coordonnés et une maintenance facilitée pour le gestionnaire de l’ouvrage.</p>",
    "garden-factory": "<p>Les formations proposées diffusent ces méthodes auprès d’une communauté élargie de paysagistes et graphistes, renforçant ainsi l’écosystème de l’exterior design au Maroc.</p>",
    "geocapital": "<p>Les livrables intègrent les formats attendus par les logiciels de conception, ce qui accélère le passage du levé terrain au plan d’architecte ou d’ingénieur.</p>",
    "gobo-design": "<p>Qu’il s’agisse d’un hall d’accueil ou d’une façade nocturne, Gobo Design veille à ce que la lumière serve le récit du lieu sans éblouir ni gaspiller.</p>",
    "groupe-ryham": "<p>Les acquéreurs intéressés trouvent ainsi un point d’entrée simple pour demander plans, délais et conditions, sans multiplier les intermédiaires inutiles.</p>",
    "ham-archi": "<p>Cette proximité n’empêche pas la rigueur documentaire : plans, détails et suivis de chantier restent structurés pour sécuriser la réalisation auprès des entreprises.</p>",
    "hbs-etude-et-ingenierie": "<p>Qu’il s’agisse d’une structure neuve ou d’une réhabilitation, HBS cherche la solution la plus robuste au regard du budget et du calendrier du maître d’ouvrage.</p>",
    "hitech-info": "<p>Le négoce informatique complète ces prestations en fournissant postes, périphériques et consommables, pour un interlocuteur unique sur le volet digital de l’entreprise.</p>",
    "import-protection": "<p>Des gammes renewables et des tailles étendues permettent d’équiper des équipes hétérogènes sans multiplier les fournisseurs EPI à Casablanca.</p>",
    "iswood": "<p>Les menuisiers industriels comme les ateliers artisanaux y trouvent des panneaux adaptés à leurs process, avec une constance de qualité rare sur le long terme.</p>",
    "kitchen-ma": "<p>Matériaux, coloris et accessoires sont validés en amont pour coller au style de vie du foyer, qu’il soit minimaliste, familial ou ouvert sur le séjour.</p>",
    "l-etanchiete-du-casa-nord": "<p>Le conseil porte aussi sur l’entretien : un foyer bien réglé et une toiture suivie prolongent la durée de vie des installations et le confort d’hiver.</p>",
    "locarad-ma": "<p>La transparence sur les horaires, les rayons d’action et les conditions de location évite les mauvaises surprises le jour J sur le chantier.</p>",
    "makrodoor": "<p>Maintenance préventive et pièces détachées font partie de l’équation : une porte industrielle n’a de valeur que si elle reste disponible 24 heures sur 24.</p>",
    "maro-reno": "<p>De la peinture aux réseaux, chaque corps d’état est phasé pour limiter les arrêts d’activité du cabinet pendant les travaux.</p>",
    "materiox": "<p>Échantillons et fiches techniques sont fournis rapidement pour accélérer les validations en agence d’architecture ou chez le décorateur.</p>",
    "meksa": "<p>Pose, réglages et conseils d’entretien prolongent la performance des menuiseries, un point souvent négligé après la livraison des châssis.</p>",
    "mesos-architecture": "<p>Les échanges avec le client restent centraux : Mesos clarifie options et impacts budgétaires pour décider vite, sans sacrifier l’ambition architecturale.</p>",
    "microtopographie": "<p>Les livrables SIG et 3D facilitent aussi la communication avec les collectivités et les bureaux d’études partenaires du Nord.</p>",
    "mooua-design": "<p>Les délais sont annoncés franchement, car une visualisation livrée trop tard perd sa valeur commerciale auprès des décideurs.</p>",
    "n-waccess": "<p>Devis détaillés et suivi de fabrication permettent au client tangérois de savoir où en est sa commande avant la pose finale.</p>",
    "nbr-centre": "<p>Rapports clairs et délais maîtrisés font de NBR un partenaire régulier des entreprises de travaux publics et privés du Souss.</p>",
    "nuevo-lighting": "<p>La cohérence des références dans le temps aide les mainteneurs à remplacer des modules sans redessiner toute l’installation.</p>",
    "oratek-smart-solutions": "<p>Audits de l’existant et propositions d’évolution permettent de moderniser un bâtiment sans tout reprendre, un atout pour les gestionnaires d’Agadir.</p>",
    "parm": "<p>Support technique sur chantier et documentation bilingue accompagnent les équipes de pose lorsqu’elles découvrent un nouveau système ARDEX.</p>",
    "pladis": "<p>Les équipes commerciales connaissent les contraintes des poseurs et savent proposer des alternatives lorsque le calepinage évolue en cours de projet.</p>",
    "polio-carrelage-sanitaire": "<p>La proximité avec Salé et Rabat facilite les retraits urgents et les ajustements de dernière minute avant la pose des carreaux.</p>",
    "preprint": "<p>Du fichier graphique à la pose sur structure, Preprint garde la main sur la chaîne pour éviter les écarts de couleur ou de format.</p>",
    "readybat": "<p>Les missions de conseil et d’assistance à maîtrise d’ouvrage complètent l’offre d’études pure, utiles lorsque le client veut un regard indépendant.</p>",
    "roch-deco": "<p>Petits logements comme grands plateaux de bureaux trouvent ainsi un interlocuteur unique pour cloisonner, isoler et préparer les finitions.</p>",
    "s-o-s-thermique": "<p>Contrats d’entretien et conseils d’optimisation énergétique prolongent la relation après l’installation, pour un confort stable toute l’année.</p>",
    "sahara-stores": "<p>Les bâches techniques et tentes de chantier complètent l’offre stores, ce qui intéresse aussi les entreprises de travaux et de transport.</p>",
    "saniworld": "<p>Industrie et agriculture bénéficient du même sérieux logistique : pièces disponibles, conseils d’usage et continuité des gammes dans le temps.</p>",
    "saroutech": "<p>Mises à jour et assistance après pose rassurent les clients qui découvrent la serrure connectée pour la première fois.</p>",
    "sebou-peinture": "<p>Les finitions sont choisies pour résister au climat de Kénitra, entre humidité atlantique et ensoleillement des terrasses.</p>",
    "sisomo-building-technology": "<p>Conseils sur les épaisseurs et les points singuliers (combles, cloisons, planchers) font partie intégrante de chaque devis d’isolation.</p>",
    "smartvolts": "<p>Devis détaillés, planning d’intervention et comptes-rendus techniques documentent chaque mission pour les responsables de sites.</p>",
    "societe-wassim-de-materiaux-de-construct": "<p>Que le besoin porte sur le gros œuvre ou le second œuvre, Wassim cherche la référence adaptée plutôt que le produit générique.</p>",
    "stamtech": "<p>Formation des utilisateurs et essais de réception finalisent les installations, pour que la sécurité ne reste pas un matériel inutilisé.</p>",
    "ste-reda-et-naoual": "<p>Devis illustrés et délais annoncés clairement aident les clients de Taza à planifier leurs travaux métalliques sans mauvaise surprise.</p>",
    "sterixis-engineering-bureau-d-etudes-tec": "<p>La jeunesse de la structure se traduit par une réactivité forte et une aisance avec les outils numériques contemporains du BTP.</p>",
    "sufalum": "<p>Du premier contact à la réception des ouvrants, Sufalum reste joignable pour ajuster détails de quincaillerie, teintes et accessoires.</p>",
    "synergy-solutions": "<p>Les secteurs agricole et hospitalier, particulièrement exigeants, bénéficient d’études spécifiques sur autonomie, secours et maintenance.</p>",
    "tanalt-stone": "<p>Échantillons et conseils de calepinage aident à anticiper joints, veines et formats avant la commande définitive des plaques.</p>",
    "tecnovamed": "<p>Cette présence locale évite d’attendre des équipes venues du Nord pour un simple dépannage ou une extension de réseau technique.</p>",
    "trading-partnerships": "<p>Cuisine professionnelle et climatisation se croisent souvent dans les mêmes établissements : un seul fournisseur simplifie alors les achats et le SAV.</p>",
    "ultrapro-confec": "<p>Marquages, coloris d’entreprise et séries spéciales sont possibles pour les flottes qui veulent une identité visuelle claire sur le terrain.</p>",
    "usi-cuisine": "<p>Le suivi après pose — réglages, conseils d’usage — fait partie de la relation, car une cuisine se vit longtemps après l’inauguration.</p>",
    "vetco": "<p>Les professionnels comme les particuliers trouvent au même endroit béton préfabriqué et aciers courants, ce qui simplifie les tournées d’approvisionnement.</p>",
    "vital-fer": "<p>Des conseils sur les sections et usages courants aident les clients moins expérimentés à commander juste, sans surstock inutile.</p>",
    "wislane-beton": "<p>La proximité de Meknès réduit les coûts de transport et permet des réassorts rapides lorsque le rythme de coulage s’accélère.</p>",
    "z-b-r-metal": "<p>Devis, délais et finitions sont discutés avant fabrication pour coller au style souhaité, qu’il soit industriel brut ou plus décoratif.</p>",
}

def words(html):
    t = re.sub(r"<[^>]+>", " ", html)
    return len(re.sub(r"\s+", " ", t).strip().split())

for row in rows:
    u = row["username"]
    if u in EXTRA2 and words(row["about_html"]) < 120:
        # avoid double-append
        snippet = EXTRA2[u][:40]
        if snippet not in row["about_html"]:
            row["about_html"] += EXTRA2[u]

issues = []
for i, row in enumerate(rows):
    wc = words(row["about_html"])
    if not (120 <= wc <= 200):
        issues.append(f"{i} {row['username']}: {wc}")
    if len(row["bio"]) > 220:
        issues.append(f"{i} bio {len(row['bio'])}")

path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("issues", len(issues))
for x in issues:
    print(x)
print("count", len(rows))
