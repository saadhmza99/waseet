#!/usr/bin/env python3
"""Seed curated Accueil « Entreprises recommandées » profiles.

Creates verified enterprise profiles with category-aligned services + realisations,
using crawled facts/images from official sites (not generic filler).

  python scripts/seed_recommended_firms.py
  python scripts/seed_recommended_firms.py --apply

Password: Sifarah-{username}-2026!
"""

from __future__ import annotations

import csv
import json
import subprocess
import sys
import uuid
from pathlib import Path

import bcrypt

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "supabase" / "seeds"
OUT_SQL = OUT_DIR / "seed_recommended_firms.sql"
OUT_PASSWORDS = OUT_DIR / "seed_recommended_firms_passwords.csv"
OUT_META = OUT_DIR / "seed_recommended_firms_meta.json"

SEED_BATCH = "recommended_firms_2026"
PASSWORD_PREFIX = "Sifarah"
PASSWORD_SUFFIX = "2026!"
MAX_BIO = 251
NS = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")


def sql_str(value: str | None) -> str:
    if value is None:
        return "NULL"
    text = str(value).replace("\r\n", "\n").replace("\r", "\n")
    return "'" + text.replace("'", "''") + "'"


def sql_bool(value: object) -> str:
    return "TRUE" if value else "FALSE"


def sql_json(value: object) -> str:
    return sql_str(json.dumps(value if value is not None else [], ensure_ascii=False))


def trunc(value: str | None, n: int) -> str:
    text = (value or "").strip()
    if len(text) <= n:
        return text
    return text[: n - 1].rstrip() + "…"


def password_for(username: str) -> str:
    return f"{PASSWORD_PREFIX}-{username}-{PASSWORD_SUFFIX}"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=6)).decode("utf-8")


def uid(key: str) -> str:
    return str(uuid.uuid5(NS, f"sifarah:{SEED_BATCH}:{key}"))


# --- Curated firms (crawled 2026-10) -----------------------------------------

FIRMS: list[dict] = [
    {
        "key": "chbarchitects",
        "username": "chbarchitects",
        "full_name": "CHB Architects",
        "profession": "Architecture",
        "location": "Casablanca",
        "phone": "+212522269228",
        "email": "hakimbenjelloun@chbarchitects.com",
        "website_url": "https://www.chbarchitects.net",
        "primary_code": "5.1.1",
        "codes": ["5.1.1", "5.1.3", "5.2.1"],
        "avatar_url": "https://chb.kscreasupport.com/wp-content/uploads/2022/03/logo-chbarchitects-hakim-benjelloun-1.png",
        "cover_photo_url": "https://chb.kscreasupport.com/wp-content/uploads/2023/07/villa-1.jpg",
        "bio": trunc(
            "Cabinet d'architecture Hakim Benjelloun à Casablanca : résidentiel, hôtellerie, bureaux et équipements, du concept à la réalisation.",
            MAX_BIO,
        ),
        "about_text": """
<h2>CHB Architects</h2>
<p>Dirigé par Hakim Benjelloun depuis 1986, CHB Architects est un cabinet casablancais multi-expert qui réunit architectes, ingénieurs et designers d'intérieur. Formé à l'École Spéciale d'Architecture (Paris), à UC Berkeley et au MIT, Hakim Benjelloun a travaillé chez Zevaco, Azagoury, Riou, puis à Paris, San Francisco et New York avant de fonder l'agence au Maroc.</p>
<p>L'agence conçoit des projets résidentiels haut de gamme, hôteliers, tertiaires, d'enseignement et industriels, avec une écriture capable d'aller de la tradition marocaine à une architecture contemporaine. Le fil conducteur : l'harmonie des séquences spatiales et l'équilibre des proportions.</p>
<h3>Missions</h3>
<ul>
<li>Concept design et plans schématiques</li>
<li>Architecture générale et d'intérieur</li>
<li>Mobilier, agencement et suivi jusqu'à la réalisation</li>
<li>Interventions au Maroc et à l'international</li>
</ul>
<p><strong>Adresse :</strong> 2, rue des Moineaux, Casablanca · <strong>Tél :</strong> +212 5 22 26 92 28</p>
""".strip(),
        "services": [
            {
                "title": "Maîtrise d'œuvre architecturale clé en main",
                "category": "Architecture",
                "code": "5.1.1",
                "description": "Mission complète portée par le cabinet de Hakim Benjelloun : conception générale, architecture d'intérieur, mobilier et suivi jusqu'à la réalisation. Programmes résidentiels, hôteliers, sièges et équipements. Tarif sur devis selon l'échelle et les phases confiées.",
                "kinds": ["Étude", "Réalisation", "Accompagnement"],
                "included": [
                    "Conception générale de l'architecture",
                    "Architecture d'intérieur et agencement",
                    "Mobilier et design d'objet",
                    "Suivi jusqu'à la réalisation",
                ],
                "cover": "https://chb.kscreasupport.com/wp-content/uploads/2023/07/villa-1.jpg",
                "gallery": [
                    "https://chb.kscreasupport.com/wp-content/uploads/2023/07/villa-1.jpg",
                    "https://chb.kscreasupport.com/wp-content/uploads/2023/07/casa-priv3.jpg",
                    "https://chb.kscreasupport.com/wp-content/uploads/2023/07/villa.jpg",
                ],
                "zone_mode": "maroc",
                "cities": [],
                "travel": True,
                "remote": False,
                "audiences": ["Promoteurs", "Entreprises", "Investisseurs"],
                "missions": ["National", "International"],
            }
        ],
        "realisations": [
            {
                "title": "Villa privée à Casablanca",
                "city": "Casablanca",
                "description": "Résidence privée conçue par CHB Architects : volumes, matières et séquences d'espaces travaillés pour un équilibre contemporain.",
                "images": [
                    "https://chb.kscreasupport.com/wp-content/uploads/2023/07/villa-1.jpg",
                    "https://chb.kscreasupport.com/wp-content/uploads/2023/07/casa-priv3.jpg",
                    "https://chb.kscreasupport.com/wp-content/uploads/2023/07/villa.jpg",
                ],
            },
            {
                "title": "Siège de bureaux BMCE — Casablanca",
                "city": "Casablanca",
                "description": "Siège de bureaux conçu pour BMCE à Casablanca : environ 6 000 m², dix niveaux (deux sous-sols, RDC et sept étages), façade verre, inox, alucobond et ardoise.",
                "images": [
                    "https://chb.kscreasupport.com/wp-content/uploads/2023/07/villa.jpg",
                    "https://chb.kscreasupport.com/wp-content/uploads/2023/07/casa-priv3.jpg",
                ],
            },
        ],
    },
    {
        "key": "tgcc",
        "username": "tgcc",
        "full_name": "TGCC",
        "profession": "Construction & gros œuvre",
        "location": "Casablanca",
        "phone": "+212522238893",
        "email": "contact@tgcc.ma",
        "website_url": "https://tgcc.ma",
        "primary_code": "3.1.3",
        "codes": ["3.1.3", "3.1.4", "3.1.5"],
        "avatar_url": "https://tgcc.ma/wp-content/uploads/2025/10/Ensemble-logo.png",
        "cover_photo_url": "https://tgcc.ma/wp-content/uploads/2025/12/Grand_theatre.jpg",
        "bio": trunc(
            "TGCC — Travaux Généraux de Construction depuis 1991 : bâtiments, infrastructures et travaux publics au Maroc et en Afrique.",
            MAX_BIO,
        ),
        "about_text": """
<h2>TGCC</h2>
<p>Depuis 1991, TGCC (Travaux Généraux de Construction de Casablanca) s'impose comme un acteur de référence du bâtiment et des travaux publics au Maroc et en Afrique subsaharienne. Le Groupe intervient sur des projets d'envergure dans les domaines hôtelier, commercial, industriel, administratif et résidentiel.</p>
<p>Organisation autour de quatre pôles complémentaires : bâtiment &amp; infrastructure, travaux publics, filiales métier et développement international. Cette chaîne intégrée permet d'intervenir du gros œuvre à la coordination des corps d'état secondaires, avec les mêmes exigences de sécurité, de planning et de qualité.</p>
<h3>Références emblématiques</h3>
<ul>
<li>Grand Théâtre de Casablanca (CasArts) — 24 000 m², salles 1 800 / 600 / 450 places</li>
<li>Campus UM6P Rabat — +100 000 m² couverts, 856 chambres</li>
<li>Trémie Dar Bouazza, Stade Al Barid, et de nombreux programmes tertiaires et hôteliers</li>
</ul>
<p><strong>Siège :</strong> 4, rue Al Imam Mouslim — Oasis, 20103 Casablanca · <strong>Tél :</strong> +212 522 23 88 93</p>
""".strip(),
        "services": [
            {
                "title": "Entreprise générale de bâtiments",
                "category": "Structure",
                "code": "3.1.3",
                "description": "Mission d'entreprise générale sur bâtiments et ouvrages : gros œuvre, étanchéité et coordination du lot confié. Chiffrage sur dossier de consultation (métrés, planning, périmètre des corps d'état). Aucun prix au m² hors appel d'offres.",
                "kinds": ["Réalisation"],
                "included": ["Gros œuvre", "Étanchéité", "Coordination du lot confié"],
                "options": ["Bâtiment hospitalier", "Bâtiment tertiaire", "Ouvrage"],
                "cover": "https://tgcc.ma/wp-content/uploads/2025/12/Grand_theatre.jpg",
                "gallery": [
                    "https://tgcc.ma/wp-content/uploads/2025/12/Grand_theatre.jpg",
                    "https://tgcc.ma/wp-content/uploads/2025/12/TGCC-UM6P-RABAT_result.jpg",
                    "https://tgcc.ma/wp-content/uploads/2025/12/Tremie-Dar-Bouazza-1_result.jpg",
                ],
                "zone_mode": "maroc",
                "cities": [],
                "travel": True,
                "remote": False,
                "audiences": ["Promoteurs", "Entreprises"],
                "missions": [],
            }
        ],
        "realisations": [
            {
                "title": "Grand Théâtre de Casablanca",
                "city": "Casablanca",
                "description": "CasArts — 24 000 m² au cœur du quartier historique. Salle de spectacle 1 800 places, théâtre 600 places, salle de musique 450 places. Maître d'ouvrage : Casa Aménagement. Mission TGCC tous corps d'état.",
                "images": [
                    "https://tgcc.ma/wp-content/uploads/2025/12/Grand_theatre.jpg",
                    "https://tgcc.ma/wp-content/uploads/2025/12/TGCC-BESIX-PEOPLE-071_result.jpg",
                ],
            },
            {
                "title": "UM6P de Rabat",
                "city": "Rabat",
                "description": "Campus Université Mohammed VI Polytechnique : +100 000 m² couverts, 856 chambres, parking 10 000 m², écoles et incubateur. Maître d'ouvrage UM6P / OCP.",
                "images": [
                    "https://tgcc.ma/wp-content/uploads/2025/12/TGCC-UM6P-RABAT_result.jpg",
                ],
            },
            {
                "title": "Trémie Dar Bouazza",
                "city": "Casablanca",
                "description": "Ouvrage d'infrastructure urbaine réalisé par TGCC dans le cadre de ses activités travaux publics.",
                "images": [
                    "https://tgcc.ma/wp-content/uploads/2025/12/Tremie-Dar-Bouazza-1_result.jpg",
                ],
            },
            {
                "title": "Stade Al Barid",
                "city": "Rabat",
                "description": "Équipement sportif d'envergure : réalisation TGCC sur le stade Al Barid.",
                "images": [
                    "https://tgcc.ma/wp-content/uploads/2026/01/STADE-AL-BARID-73-1_result.jpg",
                ],
            },
        ],
    },
    {
        "key": "cgi",
        "username": "cgi",
        "full_name": "Compagnie Générale Immobilière",
        "profession": "Promotion immobilière",
        "location": "Rabat",
        "phone": "+212801002828",
        "email": "info@cgi.ma",
        "website_url": "https://www.cgi.ma",
        "primary_code": "1.2.1",
        "codes": ["1.2.1", "1.2.2"],
        "avatar_url": "https://cdgdev.ma/sites/default/files/2024-12/4Ffv-4rM.jpeg",
        "cover_photo_url": "https://cdgdev.ma/sites/default/files/2025-03/Arborelles%20020624_3%20-%20Photo.jpg",
        "bio": trunc(
            "CGI, filiale CDG depuis 1960 : promoteur de référence au Maroc — résidentiel moyen et haut standing, programmes mixtes et VEFA.",
            MAX_BIO,
        ),
        "about_text": """
<h2>Compagnie Générale Immobilière</h2>
<p>Créée en 1960, la Compagnie Générale Immobilière (CGI) est un acteur majeur de la promotion immobilière au Maroc et une filiale du groupe CDG. Forte de plus de six décennies d'expertise, elle a façonné le paysage urbain de plusieurs villes marocaines.</p>
<p>La CGI recentre son offre sur le haut et moyen standing et les projets à usage mixte (tertiaire et commercial). La commercialisation s'appuie sur la VEFA, un référentiel technique interne et des certifications (dont HQE) pour garantir qualité, délais et confort d'usage.</p>
<h3>Programmes en cours</h3>
<ul>
<li>Casablanca : GreenSide, GreenPark, CGT Green Homes, Azur Valley, Casablanca Marina, Les Patios d'Anfa</li>
<li>Rabat : Les Arborelles</li>
<li>Marrakech : Domaine de Noria, Les Orangers de Targa</li>
<li>Littoral et régions : Madinat Bades (Al Hoceima), Al Massira (Fnideq), Taghazout Bay Living</li>
</ul>
<p><strong>Call center :</strong> 080 100 28 28 · <strong>Email :</strong> info@cgi.ma · Showrooms du lundi au samedi</p>
""".strip(),
        "services": [
            {
                "title": "Développement de programmes immobiliers",
                "category": "Promoteur immobilier",
                "code": "1.2.1",
                "description": "Montage, commercialisation et suivi jusqu'à la livraison de programmes résidentiels et tertiaires. Le prix d'un lot est celui du programme, communiqué sur le dossier de vente. Pas de forfait de prestation séparé.",
                "kinds": ["Réalisation", "Accompagnement", "Gestion"],
                "included": [
                    "Montage du programme",
                    "Commercialisation des lots (VEFA)",
                    "Suivi jusqu'à la livraison",
                ],
                "options": ["Logement", "Plateau tertiaire", "Villa"],
                "cover": "https://cdgdev.ma/sites/default/files/2025-03/Arborelles%20020624_3%20-%20Photo.jpg",
                "gallery": [
                    "https://cdgdev.ma/sites/default/files/2025-03/Arborelles%20020624_3%20-%20Photo.jpg",
                    "https://cdgdev.ma/sites/default/files/2025-03/DPR-CGI-TAGHAZOUT-Bis-Oct-2024-920x860.png",
                    "https://cdgdev.ma/sites/default/files/2024-12/Casa%20Green%20Town%20_%20CASABLANCA-0082024_%C2%A9Said%20Mrigua_SAID%20MRIGUA%281%29.jpg",
                ],
                "zone_mode": "maroc",
                "cities": [],
                "travel": True,
                "remote": False,
                "audiences": ["Particuliers", "Investisseurs", "Entreprises"],
                "missions": [],
            }
        ],
        "realisations": [
            {
                "title": "Les Arborelles — El Menzeh",
                "city": "Rabat",
                "description": "Programme résidentiel CGI à Rabat : villas et lots haut de gamme, urbanisme responsable et standards de qualité du promoteur.",
                "images": [
                    "https://cdgdev.ma/sites/default/files/2025-03/Arborelles%20020624_3%20-%20Photo.jpg",
                    "https://cdgdev.ma/sites/default/files/2025-03/VILLA%20D%20%282%29.jpg",
                ],
            },
            {
                "title": "Casa Green Town — Casablanca",
                "city": "Casablanca",
                "description": "Opération résidentielle CGI à Casablanca, illustrant le positionnement moyen / haut standing du promoteur.",
                "images": [
                    "https://cdgdev.ma/sites/default/files/2024-12/Casa%20Green%20Town%20_%20CASABLANCA-0082024_%C2%A9Said%20Mrigua_SAID%20MRIGUA%281%29.jpg",
                ],
            },
            {
                "title": "Taghazout Bay Living",
                "city": "Agadir",
                "description": "Résidences Assif et Adrar — Taghazout Bay Living, programme CGI sur le littoral sud.",
                "images": [
                    "https://cdgdev.ma/sites/default/files/2025-03/DPR-CGI-TAGHAZOUT-Bis-Oct-2024-920x860.png",
                ],
            },
        ],
    },
    {
        "key": "interstyledesign",
        "username": "interstyledesign",
        "full_name": "Interstyle Design",
        "profession": "Rénovation intérieure",
        "location": "Casablanca",
        "phone": "+212656594142",
        "email": "contact@interstyledesign.ma",
        "website_url": "https://interstyledesign.ma",
        "ice": "002763867000019",
        "primary_code": "4.1.2",
        "codes": ["4.1.2", "5.2.1", "5.2.2"],
        "avatar_url": "https://interstyledesign.ma/images/Logo-interstyledesign.webp",
        "cover_photo_url": "https://interstyledesign.ma/images/projets/renovation-racine-01.webp",
        "bio": trunc(
            "Interstyle Design (Wafaa Elkass) : architecture d'intérieur et rénovation clé en main à Casablanca, dès 60 m².",
            MAX_BIO,
        ),
        "about_text": """
<h2>Interstyle Design</h2>
<p>Cabinet d'architecture d'intérieur fondé par Mme Elkass Wafaa, basé à Massira (Casablanca). Interstyle Design transforme appartements, bureaux et commerces de la conception 2D/3D jusqu'à la livraison clé en main, avec un seul interlocuteur et un réseau d'artisans tous corps d'état.</p>
<p>Pour les appartements, l'intervention commence à partir de 60 m² ; bureaux et locaux sont étudiés au cas par cas. Le cabinet prend aussi les biens livrés bruts, les villas en construction et les plateaux à aménager. Pilotage possible à distance (France, Belgique, Suisse, Italie) avec reporting photo/vidéo du chantier.</p>
<h3>Parcours type</h3>
<ul>
<li>Diagnostic gratuit et plans 2D de l'existant</li>
<li>Conception 3D photoréaliste et devis détaillé</li>
<li>Démarches administratives, coordination artisans, suivi de chantier</li>
<li>Livraison clé en main</li>
</ul>
<p><strong>Bureau :</strong> N°12, GH 200, Avenue Mohamed Naciri, Lot Massira Hassania, Casablanca · <strong>Tél / WhatsApp :</strong> +212 656 594 142</p>
""".strip(),
        "services": [
            {
                "title": "Rénovation intérieure clé en main",
                "category": "Rénovation intérieure",
                "code": "4.1.2",
                "description": "Rénovation et aménagement intérieur à Casablanca : appartements dès 60 m², bureaux et locaux au cas par cas. Du gros œuvre aux finitions, un seul interlocuteur coordonne maçons, plombiers, électriciens, menuisiers et peintres. Montant sur devis selon l'état du bien et le niveau de finition.",
                "kinds": ["Réalisation", "Accompagnement"],
                "included": [
                    "Appartements à partir de 60 m²",
                    "Tous corps d'état jusqu'aux finitions",
                    "Coordination du chantier",
                    "Livraison clé en main",
                ],
                "options": ["Bien livré brut", "Plateau de bureaux", "Villa en cours de construction"],
                "cover": "https://interstyledesign.ma/images/projets/renovation-racine-01.webp",
                "gallery": [
                    "https://interstyledesign.ma/images/projets/renovation-racine-01.webp",
                    "https://interstyledesign.ma/images/projets/renovation-racine-02.webp",
                    "https://interstyledesign.ma/images/projets/aeria-hs-1.webp",
                    "https://interstyledesign.ma/images/conception-2d-3d-casablanca.webp",
                ],
                "zone_mode": "villes",
                "cities": ["Casablanca"],
                "travel": True,
                "remote": True,
                "audiences": ["Particuliers", "Propriétaires", "Entreprises"],
                "missions": [],
            }
        ],
        "realisations": [
            {
                "title": "Résidence privée · Racine",
                "city": "Casablanca",
                "description": "Rénovation complète clé en main à Racine : conception 2D/3D validée à distance, puis réalisation et suivi jusqu'aux finitions. Style contemporain, volumes, matières et agencements sur mesure.",
                "images": [
                    "https://interstyledesign.ma/images/projets/renovation-racine-01.webp",
                    "https://interstyledesign.ma/images/projets/renovation-racine-02.webp",
                    "https://interstyledesign.ma/images/projets/renovation-racine-03.webp",
                    "https://interstyledesign.ma/images/projets/renovation-racine-04.webp",
                    "https://interstyledesign.ma/images/projets/renovation-racine-05.webp",
                ],
            },
            {
                "title": "Appartement · Aeria Park",
                "city": "Casablanca",
                "description": "Conception et réalisation complète d'un appartement haut standing à Aeria Park : identité contemporaine sobre, de la conception des espaces aux finitions.",
                "images": [
                    "https://interstyledesign.ma/images/projets/aeria-hs-1.webp",
                    "https://interstyledesign.ma/images/projets/aeria-hs-2.webp",
                    "https://interstyledesign.ma/images/projets/aeria-hs-3.webp",
                    "https://interstyledesign.ma/images/projets/aeria-hs-9.webp",
                ],
            },
        ],
    },
    {
        "key": "betam",
        "username": "betam",
        "full_name": "BETAM",
        "profession": "Bureau d'études",
        "location": "Casablanca",
        "phone": "+212522222264",
        "email": "contact@betam.ma",
        "website_url": "https://betam.ma",
        "primary_code": "3.4.2",
        "codes": ["3.4.2", "3.4.3", "3.4.6"],
        "avatar_url": "https://betam.ma/wp-content/uploads/2021/01/betam-fav.png",
        "cover_photo_url": "https://betam.ma/wp-content/uploads/2020/09/Un-service-batiment-genie-civil.jpg",
        "bio": trunc(
            "BETAM (Bureau d'Études et d'Aménagement Maroc) depuis 1975 : ingénierie, études techniques et suivi de travaux.",
            MAX_BIO,
        ),
        "about_text": """
<h2>BETAM</h2>
<p>Depuis 1975, le Bureau d'Études et d'Aménagement Maroc (B.E.T.A.M.) fournit des consultations technico-économiques, de l'ingénierie et de la gérance de projet aux organismes de l'État et aux entreprises privées.</p>
<p>Le bureau couvre les études techniques (conception et analyse structurelle bâtiment / génie civil), le contrôle et le suivi des travaux, ainsi que la coordination TCE pour organiser dans le temps et l'espace les tâches et les intervenants.</p>
<h3>Références</h3>
<ul>
<li>Études et suivi — Aéroport de Fès-Saïss et infrastructures de l'aéroport de Tan-Tan</li>
<li>Infrastructures et superstructures — Port de Casablanca</li>
<li>Centre hospitalier régional de Guelmim</li>
<li>Projet Madinat Al Wifaq (Al Omrane)</li>
</ul>
<p><strong>Tél :</strong> 05 22 22 22 64 · <strong>Site :</strong> betam.ma</p>
""".strip(),
        "services": [
            {
                "title": "Études techniques et suivi de travaux",
                "category": "Bureau d'études",
                "code": "3.4.2",
                "description": "Études techniques et suivi de réalisation pour maîtres d'ouvrage : structure, fluides, économie, ordonnancement. Honoraires sur devis. Suivi possible au Maroc, y compris à distance lorsque le dossier le permet.",
                "kinds": ["Étude", "Conseil", "Accompagnement"],
                "included": [
                    "Études techniques",
                    "Suivi de la réalisation",
                    "Contrôle de l'exécution",
                ],
                "options": ["Structure", "Fluides", "Ordonnancement", "Coordination TCE"],
                "cover": "https://betam.ma/wp-content/uploads/2020/10/etude-general.jpg",
                "gallery": [
                    "https://betam.ma/wp-content/uploads/2020/10/etude-general.jpg",
                    "https://betam.ma/wp-content/uploads/2020/10/maitrise-doeuvre.jpg",
                    "https://betam.ma/wp-content/uploads/2020/10/Assistance-Maitrise-douvrage.jpg",
                    "https://betam.ma/wp-content/uploads/2020/09/Un-service-batiment-genie-civil.jpg",
                ],
                "zone_mode": "maroc",
                "cities": [],
                "travel": True,
                "remote": True,
                "audiences": ["Promoteurs", "Entreprises", "Architectes / Bureaux d'études"],
                "missions": [],
            }
        ],
        "realisations": [
            {
                "title": "Études et suivi — Aéroport de Fès-Saïss",
                "city": "Fès",
                "description": "Études techniques et suivi des travaux pour l'aéroport de Fès-Saïss.",
                "images": [
                    "https://betam.ma/wp-content/uploads/2020/09/Un-service-batiment-genie-civil.jpg",
                    "https://betam.ma/wp-content/uploads/2020/10/maitrise-doeuvre.jpg",
                ],
            },
            {
                "title": "Infrastructures — Port de Casablanca",
                "city": "Casablanca",
                "description": "Construction des infrastructures et des superstructures au port de Casablanca.",
                "images": [
                    "https://betam.ma/wp-content/uploads/2020/09/Un-service-amenagement-urbain.jpg",
                    "https://betam.ma/wp-content/uploads/2020/10/etude-general.jpg",
                ],
            },
            {
                "title": "Centre hospitalier régional de Guelmim",
                "city": "Guelmim",
                "description": "Accompagnement BETAM sur la construction du centre hospitalier régional de Guelmim.",
                "images": [
                    "https://betam.ma/wp-content/uploads/2020/10/Assistance-Maitrise-douvrage.jpg",
                    "https://betam.ma/wp-content/uploads/2020/10/Planification-generale.jpg",
                ],
            },
        ],
    },
    {
        "key": "hajjiassocies",
        "username": "hajjiassocies",
        "full_name": "Hajji & Associés",
        "profession": "Droit immobilier & foncier",
        "location": "Casablanca",
        "phone": "+212522487474",
        "email": "info@ahlo.ma",
        "website_url": "https://ahlo.ma",
        "primary_code": "6.3.1",
        "codes": ["6.3.1", "6.4.2", "6.3.5"],
        "avatar_url": "https://ahlo.ma/wp-content/uploads/2022/09/cropped-sigle-270x270.png",
        "cover_photo_url": "https://ahlo.ma/wp-content/uploads/2022/05/CABINET-D-AVOCAT-HAJJI-ASSOCIES-CASABLANCA-CABINET-AMIN-HAJJI-MISE-EN-AVANT.jpg",
        "bio": trunc(
            "Hajji & Associés (Amin Hajji, 1996) : cabinet d'avocats d'affaires à Casablanca — immobilier, infrastructures, M&A et arbitrage.",
            MAX_BIO,
        ),
        "about_text": """
<h2>Hajji &amp; Associés</h2>
<p>Fondé en 1996 par Amin Hajji, professeur de droit et praticien, Hajji &amp; Associés est un cabinet d'avocats d'affaires international basé à Casablanca. Le cabinet accompagne investisseurs étrangers et entreprises marocaines sur les dossiers structurants : financement de projets, énergie, télécoms, marchés financiers, distribution, fusions-acquisitions et contentieux / arbitrage.</p>
<p>Sur le volet immobilier et foncier, l'équipe sécurise ventes, baux, titres et autorisations, et coordonne jusqu'à l'acte authentique avec le notaire. Double Gold Award « best law firm in North Africa » (2015 et 2016). Le cabinet est également lié au centre d'arbitrage Mizan.</p>
<h3>Domaines</h3>
<ul>
<li>Droit immobilier &amp; foncier, baux, titres</li>
<li>Finance internationale, restructurations, M&amp;A</li>
<li>Énergie, infrastructures et projets d'investissement</li>
<li>Contentieux commercial et arbitrage international</li>
</ul>
<p><strong>Adresse :</strong> 28, boulevard Moulay Youssef, 20070 Casablanca · <strong>Tél :</strong> +212 522 48 74 74 · <strong>Email :</strong> info@ahlo.ma</p>
""".strip(),
        "services": [
            {
                "title": "Sécurisation des ventes et des baux",
                "category": "Droit immobilier",
                "code": "6.3.1",
                "description": "Accompagnement juridique des opérations immobilières : audit des titres et autorisations, promesse et contrat de vente, baux commerciaux, coordination avec le notaire. Pour promoteurs, agences, investisseurs et entreprises à Casablanca et Rabat. Honoraires sur devis.",
                "kinds": ["Conseil", "Accompagnement"],
                "included": [
                    "Audit des titres et des autorisations",
                    "Promesse et contrat de vente",
                    "Baux commerciaux et professionnels",
                    "Coordination avec le notaire",
                ],
                "options": ["Revue d'un programme", "Contentieux de la construction"],
                "cover": "https://ahlo.ma/wp-content/uploads/2022/04/PHOTO-MENU-ACTIVITES-.jpg",
                "gallery": [
                    "https://ahlo.ma/wp-content/uploads/2022/04/PHOTO-MENU-ACTIVITES-.jpg",
                    "https://ahlo.ma/wp-content/uploads/2022/04/PHOTO-MENU-A-PROPOS.jpg",
                    "https://ahlo.ma/wp-content/uploads/2022/05/CABINET-D-AVOCAT-HAJJI-ASSOCIES-CASABLANCA-CABINET-AMIN-HAJJI-MISE-EN-AVANT.jpg",
                ],
                "zone_mode": "villes",
                "cities": ["Casablanca", "Rabat"],
                "travel": True,
                "remote": True,
                "audiences": ["Promoteurs", "Investisseurs", "Entreprises"],
                "missions": ["National", "International"],
            }
        ],
        "realisations": [
            {
                "title": "Accompagnement d'investissements internationaux",
                "city": "Casablanca",
                "description": "Conseil local auprès de cabinets internationaux sur des projets d'investissement au Maroc : montage contractuel, négociation et conformité au droit marocain.",
                "images": [
                    "https://ahlo.ma/wp-content/uploads/2022/05/CABINET-D-AVOCAT-HAJJI-ASSOCIES-CASABLANCA-CABINET-AMIN-HAJJI-MISE-EN-AVANT.jpg",
                    "https://ahlo.ma/wp-content/uploads/2022/04/PHOTO-MENU-A-PROPOS.jpg",
                ],
            },
            {
                "title": "Pratique contentieuse et arbitrage",
                "city": "Casablanca",
                "description": "Représentation devant juridictions nationales et internationales ; implication dans la création du centre d'arbitrage Mizan (2020).",
                "images": [
                    "https://ahlo.ma/wp-content/uploads/2022/04/PHOTO-MENU-ACTIVITES-.jpg",
                    "https://ahlo.ma/wp-content/uploads/2022/04/PHOTO-MENU-NOS-AVOCATS.jpg",
                ],
            },
        ],
    },
]


def build() -> tuple[list[dict], list[dict], list[dict], list[dict]]:
    pros: list[dict] = []
    services: list[dict] = []
    realisations: list[dict] = []
    meta: list[dict] = []

    for firm in FIRMS:
        user_id = uid(firm["key"])
        username = firm["username"]
        auth_email = f"{username}@recommended.sifarah.local"
        pros.append(
            {
                "id": user_id,
                "username": username,
                "full_name": firm["full_name"],
                "email": auth_email,
                "profile_email": firm.get("email") or auth_email,
                "phone": firm.get("phone"),
                "location": firm.get("location"),
                "profession": firm.get("profession"),
                "bio": firm.get("bio"),
                "about_text": firm.get("about_text"),
                "website_url": firm.get("website_url"),
                "ice": firm.get("ice"),
                "avatar_url": firm.get("avatar_url"),
                "cover_photo_url": firm.get("cover_photo_url"),
                "codes": firm.get("codes") or [],
                "primary_code": firm.get("primary_code"),
            }
        )
        meta.append(
            {
                "id": user_id,
                "username": username,
                "full_name": firm["full_name"],
                "profession": firm.get("profession"),
                "location": firm.get("location"),
                "avatar_url": firm.get("avatar_url"),
                "specialty": firm.get("profession"),
                "is_verified": True,
            }
        )
        for i, svc in enumerate(firm.get("services") or []):
            services.append(
                {
                    "id": uid(f"svc:{firm['key']}:{i}"),
                    "user_id": user_id,
                    "title": svc["title"],
                    "description": svc.get("description"),
                    "category": svc.get("category"),
                    "cover": svc.get("cover"),
                    "gallery": svc.get("gallery") or [],
                    "kinds": svc.get("kinds") or [],
                    "included": svc.get("included") or [],
                    "options": svc.get("options") or [],
                    "price_mode": "devis",
                    "amount": "",
                    "duration": "Selon le dossier",
                    "zone_mode": svc.get("zone_mode") or "maroc",
                    "cities": svc.get("cities") or [],
                    "region": "",
                    "travel": bool(svc.get("travel")),
                    "remote": bool(svc.get("remote")),
                    "audiences": svc.get("audiences") or [],
                    "audience_other": "",
                    "missions": svc.get("missions") or [],
                    "primary_code": svc.get("code") or firm.get("primary_code"),
                }
            )
        for i, real in enumerate(firm.get("realisations") or []):
            images = real.get("images") or []
            realisations.append(
                {
                    "id": uid(f"real:{firm['key']}:{i}"),
                    "user_id": user_id,
                    "title": real["title"],
                    "description": real.get("description"),
                    "images": images,
                    "cover": images[0] if images else None,
                    "city": real.get("city"),
                    "primary_code": firm.get("primary_code"),
                }
            )
    return pros, services, realisations, meta


def emit_sql(pros: list[dict], services: list[dict], realisations: list[dict]) -> list[str]:
    lines: list[str] = [
        "-- AUTO-GENERATED by scripts/seed_recommended_firms.py",
        f"-- Seed batch: {SEED_BATCH}",
        f"-- Pros: {len(pros)} | Services: {len(services)} | Realisations: {len(realisations)}",
        "CREATE EXTENSION IF NOT EXISTS pgcrypto;",
        "BEGIN;",
        "",
        f"DELETE FROM public.realisations WHERE user_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)});",
        f"DELETE FROM public.services WHERE user_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)});",
        f"DELETE FROM public.profile_internal_categories WHERE profile_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)});",
        f"DELETE FROM public.profile_category_history WHERE profile_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)});",
        f"DELETE FROM public.profiles WHERE id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)});",
        f"DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)});",
        f"DELETE FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)};",
        "",
        "-- auth.users + identities",
    ]

    password_rows: list[dict[str, str]] = []
    for pro in pros:
        password = password_for(pro["username"])
        hashed = hash_password(password)
        password_rows.append(
            {
                "id": pro["id"],
                "email": pro["email"],
                "username": pro["username"],
                "full_name": pro["full_name"],
                "password": password,
            }
        )
        meta = {
            "seed_batch": SEED_BATCH,
            "username": pro["username"],
            "full_name": pro["full_name"],
            "profession": pro.get("profession") or "",
            "location": pro.get("location") or "",
            "bio": pro.get("bio") or "",
            "phone": pro.get("phone") or "",
            "profile_type": "enterprise",
            "internal_category_code": pro.get("primary_code") or "",
        }
        app_meta = {"provider": "email", "providers": ["email"]}
        lines.append(
            "INSERT INTO auth.users ("
            "instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, "
            "raw_app_meta_data, raw_user_meta_data, created_at, updated_at, "
            "confirmation_token, recovery_token, email_change_token_new, email_change"
            ") VALUES ("
            f"'00000000-0000-0000-0000-000000000000', {sql_str(pro['id'])}::uuid, "
            f"'authenticated', 'authenticated', {sql_str(pro['email'])}, "
            f"{sql_str(hashed)}, NOW(), "
            f"{sql_str(json.dumps(app_meta, ensure_ascii=False))}::jsonb, "
            f"{sql_str(json.dumps(meta, ensure_ascii=False))}::jsonb, NOW(), NOW(), '', '', '', ''"
            ");"
        )
        lines.append(
            "INSERT INTO auth.identities ("
            "id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at"
            ") VALUES ("
            f"{sql_str(pro['id'])}::uuid, {sql_str(pro['id'])}::uuid, "
            f"jsonb_build_object('sub', {sql_str(pro['id'])}, 'email', {sql_str(pro['email'])}, "
            f"'email_verified', true, 'phone_verified', false), "
            f"'email', {sql_str(pro['id'])}, NOW(), NOW(), NOW()"
            ");"
        )

    lines.append("")
    lines.append("-- enrich profiles (verified)")
    for pro in pros:
        code = pro.get("primary_code") or ""
        lines.append("UPDATE public.profiles SET")
        lines.append(f"  username = {sql_str(pro['username'])},")
        lines.append(f"  full_name = {sql_str(pro['full_name'])},")
        lines.append(f"  profession = {sql_str(pro.get('profession'))},")
        lines.append(f"  location = {sql_str(pro.get('location'))},")
        lines.append(f"  bio = {sql_str(pro.get('bio'))},")
        lines.append(f"  about_text = {sql_str(pro.get('about_text'))},")
        lines.append(f"  phone = {sql_str(pro.get('phone'))},")
        lines.append(f"  email = {sql_str(pro.get('profile_email') or pro['email'])},")
        lines.append(f"  website_url = {sql_str(pro.get('website_url'))},")
        lines.append(f"  ice = {sql_str(pro.get('ice'))},")
        lines.append(f"  avatar_url = {sql_str(pro.get('avatar_url'))},")
        lines.append(f"  cover_photo_url = {sql_str(pro.get('cover_photo_url'))},")
        lines.append("  profile_type = 'enterprise',")
        lines.append("  is_verified = TRUE,")
        lines.append("  verified_at = COALESCE(verified_at, NOW()),")
        if code:
            lines.append(
                f"  internal_category_id = (SELECT id FROM public.internal_categories WHERE code = {sql_str(code)} LIMIT 1),"
            )
        else:
            lines.append("  internal_category_id = NULL,")
        lines.append("  updated_at = NOW()")
        lines.append(f"WHERE id = {sql_str(pro['id'])}::uuid;")

    lines.append("")
    lines.append("-- multi internal categories")
    for pro in pros:
        codes = pro.get("codes") or []
        if not codes:
            continue
        lines.append(
            f"DELETE FROM public.profile_internal_categories WHERE profile_id = {sql_str(pro['id'])}::uuid;"
        )
        for i, code in enumerate(codes[:5]):
            lines.append(
                "INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary) "
                f"SELECT {sql_str(pro['id'])}::uuid, ic.id, {('TRUE' if i == 0 else 'FALSE')} "
                f"FROM public.internal_categories ic WHERE ic.code = {sql_str(code)} "
                "ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;"
            )

    lines.append("")
    lines.append("-- services")
    for svc in services:
        code = svc.get("primary_code") or ""
        lines.append(
            "INSERT INTO public.services ("
            "id, user_id, title, description, category, cover, gallery, kinds, included, options, "
            "price_mode, amount, duration, zone_mode, cities, region, travel, remote, "
            "audiences, audience_other, missions, internal_category_id"
            ") VALUES ("
            f"{sql_str(svc['id'])}::uuid, {sql_str(svc['user_id'])}::uuid, "
            f"{sql_str(svc['title'])}, {sql_str(svc.get('description'))}, {sql_str(svc.get('category'))}, "
            f"{sql_str(svc.get('cover'))}, {sql_json(svc.get('gallery'))}::jsonb, "
            f"{sql_json(svc.get('kinds'))}::jsonb, {sql_json(svc.get('included'))}::jsonb, "
            f"{sql_json(svc.get('options'))}::jsonb, {sql_str(svc.get('price_mode') or 'devis')}, "
            f"{sql_str(svc.get('amount'))}, {sql_str(svc.get('duration'))}, "
            f"{sql_str(svc.get('zone_mode') or 'villes')}, {sql_json(svc.get('cities'))}::jsonb, "
            f"{sql_str(svc.get('region'))}, {sql_bool(svc.get('travel'))}, {sql_bool(svc.get('remote'))}, "
            f"{sql_json(svc.get('audiences'))}::jsonb, {sql_str(svc.get('audience_other'))}, "
            f"{sql_json(svc.get('missions'))}::jsonb, "
            + (
                f"(SELECT id FROM public.internal_categories WHERE code = {sql_str(code)} LIMIT 1)"
                if code
                else "NULL"
            )
            + ");"
        )

    lines.append("")
    lines.append("-- realisations")
    for row in realisations:
        code = row.get("primary_code") or ""
        lines.append(
            "INSERT INTO public.realisations ("
            "id, user_id, title, description, images, cover, city, internal_category_id"
            ") VALUES ("
            f"{sql_str(row['id'])}::uuid, {sql_str(row['user_id'])}::uuid, "
            f"{sql_str(row['title'])}, {sql_str(row.get('description'))}, "
            f"{sql_json(row.get('images'))}::jsonb, {sql_str(row.get('cover'))}, "
            f"{sql_str(row.get('city'))}, "
            + (
                f"(SELECT id FROM public.internal_categories WHERE code = {sql_str(code)} LIMIT 1)"
                if code
                else "NULL"
            )
            + ");"
        )

    lines.append("")
    lines.append("COMMIT;")
    lines.append("NOTIFY pgrst, 'reload schema';")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with OUT_PASSWORDS.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["id", "email", "username", "full_name", "password"])
        writer.writeheader()
        writer.writerows(password_rows)

    return lines


def apply_sql(path: Path) -> None:
    print("applying", path)
    proc = subprocess.run(
        ["supabase", "db", "query", "--linked", "-f", str(path)],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if proc.returncode != 0 or "ERROR" in (proc.stdout or "") or "ERROR" in (proc.stderr or ""):
        print(proc.stdout)
        print(proc.stderr)
        raise SystemExit(f"Failed applying {path}")
    print("apply ok")
    subprocess.run(
        [
            "supabase",
            "db",
            "query",
            "--linked",
            (
                "SELECT username, full_name, is_verified, "
                "(SELECT count(*) FROM services s WHERE s.user_id = p.id) AS services, "
                "(SELECT count(*) FROM realisations r WHERE r.user_id = p.id) AS realisations "
                "FROM profiles p JOIN auth.users u ON u.id = p.id "
                f"WHERE u.raw_user_meta_data->>'seed_batch' = '{SEED_BATCH}' "
                "ORDER BY full_name;"
            ),
        ],
        cwd=str(ROOT),
    )


def main() -> None:
    print("building...", flush=True)
    pros, services, realisations, meta = build()
    print(f"pros={len(pros)} services={len(services)} realisations={len(realisations)}", flush=True)
    lines = emit_sql(pros, services, realisations)
    OUT_SQL.write_text("\n".join(lines) + "\n", encoding="utf-8")
    OUT_META.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {OUT_SQL}")
    print(f"wrote {OUT_META}")
    print(f"wrote {OUT_PASSWORDS}")
    if "--apply" in sys.argv:
        apply_sql(OUT_SQL)


if __name__ == "__main__":
    main()
