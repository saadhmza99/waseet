#!/usr/bin/env python3
"""Replace template emergency pads with unique French paragraphs."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "_about_out_1.json"

UNIQUE_REPLACEMENTS: dict[str, str] = {
    "metalurgique-roofing": (
        "<p>Sur le littoral d’Asilah, l’air salin et le vent imposent des fixations "
        "et des recouvrements soignés. Métallurgique Roofing accompagne charpentiers "
        "et particuliers sur ces détails souvent négligés. Qu’il s’agisse d’un hangar, "
        "d’une extension ou d’une toiture résidentielle, l’objectif reste une couverture "
        "étanche, esthétique et rapide à mettre en œuvre, avec un rendu proche de la "
        "tuile lorsque la finition Aspect Brique Qarmoud est retenue.</p>"
    ),
    "padilla-maroc": (
        "<p>Au-delà de la fourniture, Padilla Maroc oriente les bureaux de contrôle et "
        "entreprises générales vers les classements coupe-feu adaptés à chaque local. "
        "Les portails automatiques bénéficient du même sérieux : motorisation, sécurité "
        "piétonne et maintenance. Implantée boulevard Abderrahim Bouabid, l’équipe reste "
        "un interlocuteur technique pour les projets tertiaires et industriels du Grand "
        "Casablanca qui ne peuvent pas improviser sur la conformité des fermetures.</p>"
    ),
    "scenery-construction": (
        "<p>Chaque chantier Scenery commence par un état des lieux photographié et un "
        "phasing clair, surtout en site occupé. L’entreprise privilégie des finitions "
        "durables — peintures lavables, sanitaires robustes, joints soignés — plutôt que "
        "des effets de mode fragiles. Clients particuliers et professionnels y trouvent "
        "un partenaire capable d’assumer construction légère, rénovation et aménagement "
        "sans multiplier les sous-traitants anonymes.</p>"
    ),
    "skyscan-solutions": (
        "<p>Lorsque le foncier est litigieux ou le relief complexe, SkyScan multiplie les "
        "contrôles croisés GNSS, drone et station totale. Les livrables sont indexés et "
        "archivés pour servir longtemps après le chantier. Administrations et promoteurs "
        "apprécient cette traçabilité. Les modules de formation accélèrent aussi la "
        "montée en compétence des équipes internes clientes sur les outils géospatiaux "
        "modernes déployés depuis Kénitra.</p>"
    ),
    "societe-d-ingenierie-du-paysage": (
        "<p>SIP travaille aussi la gestion différenciée des espaces verts et l’économie "
        "d’eau, sujets décisifs à Rabat. Les dossiers d’exécution précisent essences, "
        "densités et détails de bordures pour limiter les mauvaises surprises en phase "
        "travaux. Promoteurs d’ensembles résidentiels et gestionnaires de parcs publics "
        "y trouvent un BET capable de défendre le paysage comme une infrastructure à "
        "part entière, pas comme une simple décoration finale.</p>"
    ),
    "solution-toiture": (
        "<p>Les chantiers industriels du Souss et d’ailleurs profitent de la légèreté "
        "des systèmes RODECA pour limiter les charges sur structure. Solution Toiture "
        "aide au calepinage anti-condensation et au choix des accessoires de rive. "
        "Architectes et entreprises générales disposent ainsi d’une toiture translucide "
        "ou opaque selon le programme, livrée partout au Maroc avec un appui technique "
        "depuis Agadir jusqu’à la pose.</p>"
    ),
    "ste-sopmine": (
        "<p>À Fès, les hivers frais et les étés chauds poussent les ménages à moderniser "
        "chauffage et eau chaude. Sopmine oriente vers des solutions dimensionnées, "
        "pièces détachées disponibles et conseils d’entretien. Côté piscine, l’enseigne "
        "fournit filtration et traitements pour prolonger la saison d’usage. Vingt ans "
        "de comptoir ont créé une relation de confiance avec plombiers et particuliers "
        "de la médina comme des nouveaux quartiers.</p>"
    ),
    "sunxpert": (
        "<p>SunXpert insiste sur la qualité de pose et le monitoring après mise en "
        "service : un système solaire ne vaut que par sa production réelle. L’équipe "
        "rabat-casa accompagne aussi les dossiers d’autoconsommation industrielle. "
        "Particuliers et agriculteurs du Gharb y voient une voie concrète pour "
        "stabiliser leurs coûts énergétiques tout en s’inscrivant dans la transition "
        "nationale vers le renouvelable.</p>"
    ),
    "tcg-la-jeunesse": (
        "<p>TCG La Jeunesse documente avancement et aléas pour que le client reste "
        "décideur éclairé. Les méthodes modernes évoquées — organisation de chantier, "
        "sécurité, choix matériaux — sont mises en pratique concrètement sur chaque "
        "opération. À Casablanca, l’entreprise cible des projets où la relation humaine "
        "compte autant que le béton : un partenaire accessible, jeune d’esprit, mais "
        "exigeant sur la qualité finale livrée.</p>"
    ),
    "tendance-lighting": (
        "<p>Commerces, showrooms et habitats contemporains s’appuient sur le LED pour "
        "réduire la facture tout en sculptant l’ambiance. Tendance Lighting aide à "
        "composer scènes chaudes ou froides selon l’usage. L’import-distribution couvre "
        "aussi les besoins saisonniers (guirlandes, décoration) sans négliger les "
        "références techniques — projecteurs et panels — indispensables aux électriciens "
        "professionnels.</p>"
    ),
    "travaux-tie": (
        "<p>Une toiture ardoise bien réalisée valorise le patrimoine et protège durablement "
        "le bâtiment. Travaux TIE forme ses équipes à ces gestes précis, tout en maîtrisant "
        "les membranes d’étanchéité modernes pour terrasses et toits-terrasses. Isolation "
        "et BA13 sous comble complètent l’enveloppe. Casablanca dispose ainsi d’un "
        "spécialiste capable de traiter la cinquième façade de A à Z.</p>"
    ),
    "venezia-home": (
        "<p>Venezia Home suit les retours d’usage pour ajuster son assortiment : ce qui "
        "compte, c’est la fiabilité au quotidien, pas la fiche technique saturée. "
        "Distributeurs et ménages casablancais trouvent une marque lisible, avec un "
        "positionnement clair sur le confort accessible. L’électroménager y est pensé "
        "comme un compagnon de la cuisine et du linge, robuste et simple à vivre.</p>"
    ),
    "viadis": (
        "<p>Viadis structure ses commandes pour limiter les ruptures sur les références "
        "à rotation rapide : disjoncteurs, câbles courants, appareillage. Les comptes "
        "professionnels bénéficient d’un suivi commercial dédié. À Casablanca, ce négoce "
        "électrique se veut un maillon discret mais essentiel : faire arriver le bon "
        "matériel au bon moment pour que le chantier électrique ne soit jamais le "
        "goulet d’étranglement du planning.</p>"
    ),
    "wa-architecture-studio": (
        "<p>WA Architecture Studio explore densités, seuils et matériaux locaux pour "
        "des bâtiments sobres et ancrés. L’urbanisme n’est pas un discours abstrait : "
        "il oriente les implantations, les accès et les espaces communs. À Témara, "
        "l’agence défend une modernité mesurée, capable de dialoguer avec le tissu "
        "existant plutôt que de l’ignorer, au service de maîtres d’ouvrage exigeants "
        "sur le sens autant que sur l’image.</p>"
    ),
}


def strip_tags(html: str) -> str:
    return re.sub(r"<[^>]+>", " ", html or "")


def word_count(html: str) -> int:
    return len(strip_tags(html).split())


def main() -> None:
    rows = json.loads(OUT.read_text(encoding="utf-8"))
    for r in rows:
        u = r["username"]
        if u not in UNIQUE_REPLACEMENTS:
            continue
        html = r["about_html"]
        idx = html.find("<p>En résumé,")
        if idx < 0:
            idx = html.find("<p>En r\u00e9sum\u00e9,")
        if idx < 0:
            raise SystemExit(f"pad not found for {u}")
        base = html[:idx].rstrip()
        r["about_html"] = base + UNIQUE_REPLACEMENTS[u]
        w = word_count(r["about_html"])
        print(f"{u}: {w} words")
        if w < 120 or w > 200:
            raise SystemExit(f"out of range {u} {w}")

    OUT.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("fixed pads, wrote", OUT)


if __name__ == "__main__":
    main()
