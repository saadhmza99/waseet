#!/usr/bin/env python3
"""Seed Agadir notaires: auth users + profiles + service cards + SVG monogram avatars.

No em dashes (— / –) in generated copy.
Re-run safe via seed_batch = notaires_agadir_2026.
"""

from __future__ import annotations

import json
import re
import unicodedata
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_SQL = ROOT / "supabase" / "seeds" / "seed_notaires_agadir.sql"
OUT_PASSWORDS = ROOT / "supabase" / "seeds" / "seed_notaires_agadir_passwords.csv"
AVATAR_DIR = ROOT / "frontend" / "public" / "notaires"
SEED_BATCH = "notaires_agadir_2026"
NS = uuid.UUID("a6d1b0e0-9f11-4c22-8d33-a0fa15e5eed0")
CAT_CODE = "6.4.1"

# name | address | phone | email
RAW = r"""
KARIMA AGUEROUAZ|N° 05 RDC IMM SABRINA RUE DE LA FOIRE AGADIR|05 28 84 78 47|me.aguerouazkarima@gmail.com
NADIA ESSADKI|11 RUE PRESIDENT EL BEKKAY N° 4 2EME ETG QI AGADIR|05 28 82 36 37|notairenadiaessadki@gmail.com
SALEM BOURHIM|IMM ALBARAKA 34 4EME ETAGE N°18 Av abderrahim BOUAABID SIDI YOUSSEF AGADIR|05 28 22 40 14|Maitre.bourhim@gmail.com
ESSAID ERRAMI|AV MOULAY ABDELLAH IMM D1 N° 6 TALBORJT AGADIR|05 28 82 82 32|me.essaiderrami@gmail.com
LAHCEN BOUIALA|N°32 4éme étage Immeuble Tigouramine Avenue Hassan II Agadir|05 28 84 77 17|etudebouiala@gmail.com
YOUSSEF SAIDI|2ème étage N° 21, Immeuble 129, Haut Founty, Agadir|05 28 82 04 88|me.youssef.saidi@gmail.com
ABDELJALIL NIDALE|N° 5 2 éme étage tour al hikma avenue hassan I cité dakhla - agadir|05 28 21 30 99|nidale.notaire@gmail.com
Hassan BALOUL|2 Bloc 12 1er étage Av Ahmed Akhnouch, rue de marrakech AGADIR|07 62 51 69 40|me.baloul@yahoo.com
SAID ICHACHTOUN|Bureau 22, 4ème étage, immeuble B1 Résidence Yasmine, boulevard Cadi Ayyad 80020 AGADIR|05 28 29 46 29|notaire.ichachtoun@gmail.com
KHADIJA TOUIJER|BUREAU 1 IMM 131 3 EME ETAGE HAUT FOUNTY AGADIR|05 28 85 20 08|maitretouijer@gmail.com
Moha RMOU|N°16, 1er étage, Imm Tinmel- Place OUA, BP 20034- Agadir.|05 28 82 08 28|rmou.moha@gmail.com
TARIK KARNOUNE|Angle Avenue Moulay HASSAN  I et Avenue GHANDI . Res DIYAR 1 . 3 étage N° 303 CITY DAKHLA|05 28 22 14 22|tariknotaire79@gmail.com
Habiba AKENOUCH|AGADIR AV HASSAN 2 RES MERYEM APPT 19 ET 20|05 28 82 64 53|akenouchhabiba@yahoo.fr
FATIMA ZOHRA ERRAIS|imm safa janoub, 1er etage, n14, bd hassan I, cite dakhla|05 28 22 10 51|notaire.errais.fz@gmail.com
HASSAN EL ATRACHE|TAGHZOUT HAY HASSANI IMM N° A179E 1er ETAGE INEZGANE|05 28 83 64 64|elatrachenotaire@gmail.com
SAID EL AIADI|BLOC " K" N° 526 Al Houda AGADIR|05 28 32 16 01|maitreelaiadi@gmail.com
NOURDDINE ABRAYCH|Immeuble Yasmine, n° 65, Bloc A, 5 ème étage, Angle Avenue Kadi Ayad Et Avenue El Moukaouama - Quartier Industriel – AGADIR|05 82 22 00 25|abraych.notaire@gmail.com
LAILA WAHBI|GALERIES TALBORJT BLVD CHEIKH SAADI PORTE D-B14 1ER ETAGE - AGADIR|05 28 84 22 06|MEWAHBI@GMAIL.COM
MAMMASS HAZIL|27 IMMEUBLE IFRANE II 2EME ETAGE AV HASSAN II AGADIR|05 28 84 84 20|etudehazil.mammass@gmail.com
AMINE HAMDAOUA|Immeuble NOUSSAIRI AV EL KETTANI AGADIR|05 28 38 01 00|notaire@notairehamdaoua.ma
SAMIR BOUFOUS|Angle Avenue Hassan 2 et Rue Tarablous, N° 1, 2 et 4 1er étage. Agadir|05 28 84 74 16|boufous.notaire@hotmail.fr
HASSAN EL MANSOURI|ANGLE AV 29 FEVRIER RUE L'ENTRAIDE NATIONALE IMM TIFAK 1 ER ETAGE TALBORJT AGADIR|05 28 82 36 39|m.hassanelmansouri@gmail.com
SAID EL MANSOURI|Cité Founty Agadir Bay Imm Technopole 1 Bloc E Bureau 405 & 406 - 4 ème étage Sonaba Agadir|05 28 33 33 37|maitre.said.elmansourib@gmail.com
HICHAM CHABBI|AV HASSAN 1 IMM KARIMI 1ER ETAGE B4 EL FIDIYA DAKHLA AGADIR|05 28 22 72 16|hicham.chabbi.notaire@gmail.com
Nour-Eddine AMINI|Bureau 32, 3ème étage, Immeuble E1, Résidence TIFAOUINE, Angle Avenue AL MOUQUAOUAMA et Rue OUED ZIZ, AGADIR|05 28 29 46 10|me.amininoureddine@gmail.com
RIDA ASSEBBANE|imm assalam n° 22 avenue cheikh saadi agadir|05 28 82 67 55|r.assebbane@hotmail.com
AHMED ELYAMANI|AGADIR BAY, TECHNOPOLE 2/A9, BLOC B, 3ème ETAGE N°BB301, SONABA -AGADIR|05 28 21 74 74|me.elyamaniahmed@gmail.com
EL HOUZ MOHAMED|IMM. CARRE BLANC. 95 RUE TOMBOKTOU 1 ER ETAGE AL MASSIRA 80050 AGADIR|05 28 84 88 81|m.elhouz.notaire@gmail.com
ABDELLAH OURHZIF|AVENUE DES FAR EL MENZEH 5 BIS 3EME ETAGE N°307 AGADIR|05 28 84 50 32|notaireourhzif@yahoo.fr
EL AIADI OTMAN|RESIDENCE TIGUEMMI 2 IMM 27 N 07 AVENUE DES FAR TADDART|05 28 82 82 51|notaire.elaiadi@gmail.com
MOULAY ABDELAZIZ EL ALLAOUI|BUREAU N° 47 IMMEUBLE ONYX 4EME ETAGE AVENUE HASSAN II AGADIR|05 28 38 34 34|notaire.elalaoui@gmail.com
MAITRE BOUMAHDI|PLATEAU 01,02 ET 03 1er ETAGE IMM CITY POLE PARCELLE N°119 LOT HAUT FOUNTY AGADIR|05 28 84 49 20|etude.boumahdi@gmail.com
Mustapha AIT ABDELKRIM|Immeuble Salam Center, n407, 4ème étage, Rue de Fès, Agadir|05 28 22 10 40|aitabdelkrimnotaire@gmail.com
KHADIJA LAMINE|Av 29 février résidence NESR 1ER étage N°1 Nouveau Talborjt Agadir|05 28 82 50 95|lamine.khadija@hotmail.fr
HOUDA AMNIUEL|Avenue Oued Ziz Immeuble Tifaouine Bloc E2 2ème étage n° 4 Agadir|05 28 82 77 27|meamniuel@gmail.com
BIJAMANE ISSAAD|AV HASSAN II IMM FLEURIDA 2EME étage N° 22-23 AGADIR|05 28 82 80 95|issaad.bijamane@gmail.com
MEHDI AKCHOUCH|IMM TITRITE , AVENUE HASSAN II N°34 , 3ème étage Agadir|05 28 82 05 05|maitre.akchouch@hotmail.fr
AHMED EL MOUTOUK|IMM9 N°2 2EME ETAGE RUE YACOUB EL MANSOUR TALBORJT AGADIR 80000|05 28 84 66 99|notaireelmoutouk1@gmail.com
KHALID CHABBI|AV HASSAN 1 IMM KARIMI B4 & B2 1er ETAGE EL FIDDIYA DAKHLA AGADIR|05 28 22 34 67|khalid.chabbi.notaire@gmail.com
CHEKKAR GHIZLAN|Avenue Mohamed El Fassi, Immeuble Itrane, 1er étage, n°35 et 36 En face hay Al Houda agadir 80000|05 25 19 60 41|me.chekkar@gmail.com
KHALID BOUHADI|Bureau 32, 3ème étage, Immeuble E1, Résidence TIFAOUINE, Angle Avenue AL MOUQUAOUAMA et Rue OUED ZIZ, AGADIR|05 28 29 46 20|maitre.bouhadi@gmail.com
BENEMANESOUR Atmane|Imm Amal Souss 1er étage N° 13 Boulevard Hassan I Cité Dakhla Agadir|05 28 22 96 25|mnotaire92@gmail.com
AIMAD OUDDOUD|Avenue 2 Mars Cite Ryad Salam Residence Aferni 2 Imm A5 RDC Bureau N° 2 Agadir|05 28 22 33 13|maitreouddoud@gmail.com
BRAHIM BOUJRADA|Immeuble Ennassim 1er Etage N° 2, Boulevard Hassan 1er, Cité Al Massira Agadir|05 28 29 26 29|boujradanotaire@gmail.com
AADIL BELKHENFAR|N°4 2EME ETAGE IMMEUBLE BORJ AL HAY LOT 3344 HAY MOHAMMADI AGADIR|05 28 29 51 51|me.aadilbelkhenfar.notaire@hotmail.com
ABDERRAHIM BOUHRIA|611 IMM 7 RESIDENCE ERRACHAD AV MOUQUAWAMA AGADIR|05 28 82 31 04|bouhriaabderrahim@gmail.com
MUSTAPHA AMGHAR|9, Rue de la foire-Im BOUAIDA Av. Hassan II- AGADIR|05 28 84 53 59|me.amghar@gmail.com
jamal azakaye|N° 104 ET 105 BLOC C TECHNOPOLE II 1ER ETAGE FOUNTY AGADIR BAY AGADIR|05 28 84 71 79|maitreazakaye@gmail.com
RACHID HAZIL|28 IMM IFRANE 2 2éme ETAGE AV HASSAN II AGADIR|05 28 84 53 02|ra.hazil@yahoo.fr
Abdellah ALIOUAT|App N°1, 1er étage Imm Lot N° 3266, Bloc 10 pré de la S.G.M.B, Hay Mohammadi, 80 000 Agadir Maroc.|05 28 22 22 78|maitre.aliouat@gmail.com
MOUNIR EL MAGUIRI|N°205, 2ème étage, Bloc E, Technopole2, Agadir Bay, Cité Founty|05 28 82 04 84|elmaguiri.notaire@gmail.com
Abdallah EL GAMANI|technopole2 bloc d 2eme étage bureau 204 agadir bay|05 28 22 01 01|etudegamani@gmail.com
M'HAMMED BOUANANI|App N°1 , 1er Etage Imm Lot N°3266 Av. Casablanca Hay Mohammadi , AGADIR .80000|06 61 18 82 84|etudemaitrebouanani@gmail.com
KALTOUM ATCHA|Appt 4, Immeuble 17, Angle avenue Abdellah Guerssifi et Bd Ben Mahfoud Al Yaacoubi, Bloc L Cité EL HOUDA, Agadir.|05 28 82 00 94|atcha.notaire@yahoo.com
WAFAE ABRIANE|N°EB 403 ET EB 404 BLOC E AGADIR TECHNOPOLE 2 AGADIR BAY FOUNTY|05 28 24 79 79|wafaeabrianenotaire@gmail.com
Hafsa EDDARKAOUI|bloc E N°427 1er étage av elguersifi hay el houda ,Agadir|05 28 32 67 67|maitreeddarkaouihafsa@gmail.com
Meryem Soussi|Rue kaddi ayad agadir|05 25 44 27 61|notairesoussi@gmail.com
RABIAA KERINNA|residance al manzeh imm a n°103 1er etage av des far agadir|05 28 38 37 37|rabianotaire@gmail.com
MHAMED BENTALEB|N°24 IMMEUBLE LYAZID AVENUE HASSAN II|05 28 38 38 01|notaire.bentaleb@gmail.com
MOUNIA RMOU|15, Imm. TINMEL, PLACE OUA, AV. DES FAR, Agadir|05 28 82 07 03|notaire.mouniarmou@gmail.com
AHMED RHZIOUAL BERRADA|AV LARACHE IMM 111 BUREAU N°25 5EME ETAGE GH17 ISLANE HAY MOHAMADI AGADIR 80000|05 28 52 89 37|notaire.berrada@gmail.com
Hicham KAMAL|N°36, Bd Moulay Ismail, Hay Nahda, 1er étage - Agadir - Maroc Code Postale 80000|05 28 84 89 22|hkamal.notaire@gmail.com
FAYSAL LASLAMI|n°1 1er Etage imm Jamal rue de l'hotel de ville agadir|05 28 84 12 30|laslamifaysal@yahoo.fr
mohamed mazrouai|Agadir Talborjt Imm Achar 2 Etage|05 28 84 11 13|memazrouai@gmail.com
MERYEM GOULFERNI|2éme étage n 95 rue massa avenue rue de Marrakech QI Bloc 11 AGADIR|05 28 28 21 18|goulferninotaire@gmail.com
Lahcen OUAMER|bloc E N°427 1er étage av elguersifi hay el houda ,Agadir|05 28 32 67 67|etudenotaire245@gmail.com
MARIAM ZAHIR|Angle av el moukaouama et rue de souk 1er etage bureau 02 quartier industriel agadir|05 28 84 30 89|mariamzahir.notaire@gmail.com
LAHCEN ZERKDI|BD MOULAY ABDELLAH IMM YDROLIQUE M4 1 ETAGE N 105 AGADIR|05 28 82 18 08|etudemaitrezerkdi@gmail.com
JOUBA EL MEZOUED|Avenue hassan II immeuble ibn ziane premier étage bureau N° 12 Agadir|05 28 82 88 12|notaire.jouba@gmail.com
Bouchra BEKKAOUI|Complexe AL Amal, Imm. 2. 3éme étage, N° 83, Av. Hassan II, Agadir.|05 28 82 89 53|maitre.bouchra.bekkaoui@gmail.com
HAKIMA ERGGALI|N 1, 1 ER ETAGE, IMMEUBLE ENNASSIM, AVENUE HASSAN 1ER AGADIR|05 28 29 26 29|erggalinotaire@gmail.com
OMAR EL KHAZRAJI|Avenue Hassan II Immeuble Oumlil 2ème étage Bureau N° 15 AGADIR|05 28 84 66 51|me.omarelkhazraji@gmail.com
""".strip()

COLORS = [
    ("#174f43", "#e8f2ef"),
    ("#1a3a5c", "#e8eef5"),
    ("#5c3d1a", "#f5efe8"),
    ("#3d1a5c", "#f0e8f5"),
    ("#1a5c4a", "#e8f5f1"),
    ("#5c1a2e", "#f5e8ec"),
    ("#2c4a6e", "#e9eef4"),
    ("#4a5c1a", "#f2f5e8"),
]

HOOKS = [
    "L'étude reçoit particuliers et professionnels pour sécuriser chaque acte.",
    "Un accompagnement clair, du premier rendez-vous jusqu'à la signature.",
    "Dossiers immobiliers, famille et entreprises traités avec rigueur.",
    "Proximité, écoute et délais tenus pour vos formalités notariales.",
    "Une étude de confiance pour vos projets patrimoniaux à Agadir.",
    "Conseil notarial accessible, avec un suivi transparent du dossier.",
]


def sql_str(value: str | None) -> str:
    if value is None:
        return "NULL"
    text = str(value).replace("\r\n", "\n").replace("\r", "\n")
    # ban AI long dashes
    text = text.replace("\u2014", "-").replace("\u2013", "-").replace("—", "-").replace("–", "-")
    return "'" + text.replace("'", "''") + "'"


def slugify(value: str, fallback: str) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    text = re.sub(r"-{2,}", "-", text)
    return (text or fallback)[:40]


def title_name(raw: str) -> str:
    parts = [p for p in re.split(r"\s+", raw.strip()) if p]
    out = []
    for p in parts:
        if p.upper() in {"EL", "AL", "BEN", "AIT", "OU", "M'HAMMED"}:
            out.append(p[:1].upper() + p[1:].lower() if "'" in p else p.capitalize() if len(p) > 2 else p.upper())
            continue
        if p.lower().startswith("m'"):
            out.append("M'" + p[2:].capitalize())
            continue
        out.append(p.capitalize() if p.isupper() or p.islower() else p)
    # Prefer Maître display for full_name
    pretty = " ".join(out)
    return pretty


def phone_e164(raw: str) -> str:
    digits = re.sub(r"\D", "", raw or "")
    if digits.startswith("212"):
        return "+" + digits
    if digits.startswith("0") and len(digits) >= 9:
        return "+212" + digits[1:]
    if digits:
        return "+212" + digits
    return ""


def city_from_address(address: str) -> str:
    a = address.upper()
    if "INEZGANE" in a:
        return "Inezgane"
    return "Agadir"


def initials(name: str) -> str:
    parts = [p for p in re.split(r"\s+", name.strip()) if p and p.lower() not in {"el", "al", "ben", "ait", "maitre", "maître"}]
    if not parts:
        return "N"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def write_svg(path: Path, letters: str, fg: str, bg: str) -> None:
    path.write_text(
        f"""<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="{bg}"/>
  <circle cx="128" cy="128" r="96" fill="{fg}"/>
  <text x="128" y="140" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="72" font-weight="700" fill="{bg}">{letters}</text>
</svg>
""",
        encoding="utf-8",
    )


def bio_for(name: str, city: str, i: int) -> str:
    hook = HOOKS[i % len(HOOKS)]
    return (
        f"{name}, notaire à {city}. {hook} "
        f"Ventes, donations, successions, sociétés et authentification d'actes."
    )[:450]


def about_for(name: str, address: str, phone: str, email: str, city: str, i: int) -> str:
    focus = [
        ("ventes immobilières et VEFA", "donations et successions", "création et cession de sociétés"),
        ("actes de vente et promesses", "régimes matrimoniaux", "baux et actes authentiques"),
        ("transactions immobilières", "partages successoraux", "conseil patrimonial"),
        ("sécurisation des titres", "actes de société", "formalités auprès des administrations"),
    ][i % 4]
    return f"""<h2>Étude de {name}</h2>
<p>Notaire à {city}, {name} accompagne particuliers, familles et entreprises dans la rédaction et l'authentification des actes. L'étude privilégie la clarté des explications, la vérification des pièces et le respect des délais.</p>
<h3>Domaines d'intervention</h3>
<ul>
<li>{focus[0]}</li>
<li>{focus[1]}</li>
<li>{focus[2]}</li>
</ul>
<p>Chaque dossier fait l'objet d'un suivi personnalisé, de la prise de contact jusqu'à la signature et au dépôt des formalités.</p>
<p><strong>Adresse :</strong> {address}</p>
<p><strong>Tél :</strong> {phone} · <strong>Email :</strong> {email}</p>"""


def service_desc(name: str, city: str) -> str:
    return (
        f"Accompagnement notarial par {name} à {city} : actes de vente, donations, "
        f"successions, sociétés et authentification. Honoraires selon le barème et la nature du dossier. "
        f"Prise de rendez-vous sur devis."
    )


def parse_rows() -> list[dict[str, str]]:
    rows = []
    for line in RAW.splitlines():
        line = line.strip()
        if not line:
            continue
        name, address, phone, email = [p.strip() for p in line.split("|")]
        # normalize dashes in address
        address = address.replace("\u2014", "-").replace("\u2013", "-").replace("—", "-").replace("–", "-")
        rows.append(
            {
                "name_raw": name,
                "full_name": title_name(name),
                "address": address,
                "phone": phone,
                "email": email.lower(),
            }
        )
    return rows


def main() -> None:
    rows = parse_rows()
    AVATAR_DIR.mkdir(parents=True, exist_ok=True)
    usernames: set[str] = set()
    lines: list[str] = []
    pw_lines = ["id,email,username,full_name,password"]

    lines.append("-- AUTO-GENERATED by scripts/seed_notaires_agadir.py")
    lines.append(f"-- Seed batch: {SEED_BATCH}")
    lines.append(f"-- Notaires: {len(rows)}")
    lines.append("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
    lines.append("BEGIN;")
    lines.append("")
    lines.append(
        f"DELETE FROM public.services WHERE user_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)});"
    )
    lines.append(
        f"DELETE FROM public.profile_internal_categories WHERE profile_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)});"
    )
    lines.append(
        f"DELETE FROM public.profile_category_history WHERE profile_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)});"
    )
    lines.append(
        f"DELETE FROM public.profiles WHERE id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)});"
    )
    lines.append(
        f"DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)});"
    )
    lines.append(
        f"DELETE FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)};"
    )
    lines.append("")

    for i, row in enumerate(rows):
        email = row["email"]
        full_name = row["full_name"]
        if full_name.upper().startswith("MAITRE ") or full_name.upper().startswith("MAÎTRE "):
            bare = re.sub(r"(?i)^ma[iî]tre\s+", "", full_name).strip()
        else:
            bare = full_name
        display = bare

        base = slugify(bare, f"notaire-{i+1}")
        username = f"notaire-{base}"[:48]
        n = 2
        while username in usernames:
            username = f"notaire-{base}-{n}"[:48]
            n += 1
        usernames.add(username)

        user_id = str(uuid.uuid5(NS, email))
        svc_id = str(uuid.uuid5(NS, f"svc:{email}"))
        city = city_from_address(row["address"])
        phone = phone_e164(row["phone"])
        password = f"Sifarah-{username}-2026!"
        fg, bg = COLORS[i % len(COLORS)]
        letters = initials(bare)
        svg_name = f"{username}.svg"
        write_svg(AVATAR_DIR / svg_name, letters, fg, bg)
        avatar = f"/notaires/{svg_name}"

        bio = bio_for(bare, city, i)
        about = about_for(bare, row["address"], row["phone"], email, city, i)
        login_email = f"{username}@notaires-agadir.sifarah.local"

        meta = {
            "seed_batch": SEED_BATCH,
            "username": username,
            "full_name": display,
            "profession": "Notaire",
            "location": city,
            "bio": bio,
            "phone": phone,
            "profile_type": "enterprise",
            "internal_category_code": CAT_CODE,
        }
        app_meta = json.dumps({"provider": "email", "providers": ["email"]})
        meta_json = json.dumps(meta, ensure_ascii=False)

        lines.append(
            "INSERT INTO auth.users ("
            "instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, "
            "raw_app_meta_data, raw_user_meta_data, created_at, updated_at, "
            "confirmation_token, recovery_token, email_change_token_new, email_change"
            ") VALUES ("
            f"'00000000-0000-0000-0000-000000000000', {sql_str(user_id)}::uuid, "
            f"'authenticated', 'authenticated', {sql_str(login_email)}, "
            f"crypt({sql_str(password)}, gen_salt('bf')), NOW(), "
            f"{sql_str(app_meta)}::jsonb, {sql_str(meta_json)}::jsonb, NOW(), NOW(), '', '', '', ''"
            ");"
        )
        lines.append(
            "INSERT INTO auth.identities ("
            "id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at"
            ") VALUES ("
            f"{sql_str(user_id)}::uuid, {sql_str(user_id)}::uuid, "
            f"jsonb_build_object('sub', {sql_str(user_id)}, 'email', {sql_str(login_email)}, "
            f"'email_verified', true, 'phone_verified', false), "
            f"'email', {sql_str(user_id)}, NOW(), NOW(), NOW()"
            ");"
        )

        lines.append("UPDATE public.profiles SET")
        lines.append(f"  username = {sql_str(username)},")
        lines.append(f"  full_name = {sql_str(display)},")
        lines.append("  profession = 'Notaire',")
        lines.append(f"  location = {sql_str(city)},")
        lines.append(f"  bio = {sql_str(bio)},")
        lines.append(f"  about_text = {sql_str(about)},")
        lines.append(f"  phone = {sql_str(phone or None)},")
        lines.append(f"  email = {sql_str(email)},")
        lines.append("  website_url = NULL,")
        lines.append(f"  avatar_url = {sql_str(avatar)},")
        lines.append("  cover_photo_url = NULL,")
        lines.append("  profile_type = 'enterprise',")
        lines.append("  directory_visible = TRUE,")
        lines.append("  is_verified = TRUE,")
        lines.append("  verified_at = COALESCE(verified_at, NOW()),")
        lines.append(
            f"  internal_category_id = (SELECT id FROM public.internal_categories WHERE code = {sql_str(CAT_CODE)} LIMIT 1),"
        )
        lines.append("  updated_at = NOW()")
        lines.append(f"WHERE id = {sql_str(user_id)}::uuid;")

        lines.append(
            "INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary) "
            "SELECT "
            f"{sql_str(user_id)}::uuid, id, TRUE "
            f"FROM public.internal_categories WHERE code = {sql_str(CAT_CODE)} LIMIT 1 "
            "ON CONFLICT DO NOTHING;"
        )

        included = json.dumps(
            [
                "Acte authentique",
                "Vérification des pièces",
                "Conseil préalable",
                "Formalités post-signature",
            ],
            ensure_ascii=False,
        )
        kinds = json.dumps(["Conseil", "Actes"], ensure_ascii=False)
        cities = json.dumps([city], ensure_ascii=False)
        audiences = json.dumps(["Particuliers", "Professionnels"], ensure_ascii=False)
        missions = json.dumps(["Sur place", "Sur rendez-vous"], ensure_ascii=False)
        title = f"Étude notariale - {bare}"
        desc = service_desc(bare, city)

        lines.append(
            "INSERT INTO public.services ("
            "id, user_id, title, description, category, cover, gallery, kinds, included, options, "
            "price_mode, amount, duration, zone_mode, cities, region, travel, remote, "
            "audiences, audience_other, missions, internal_category_id"
            ") VALUES ("
            f"{sql_str(svc_id)}::uuid, {sql_str(user_id)}::uuid, "
            f"{sql_str(title)}, {sql_str(desc)}, 'Notariat', "
            f"{sql_str(avatar)}, {sql_str(json.dumps([avatar]))}::jsonb, "
            f"{sql_str(kinds)}::jsonb, {sql_str(included)}::jsonb, '[]'::jsonb, "
            f"'devis', NULL, NULL, 'villes', {sql_str(cities)}::jsonb, 'Souss-Massa', "
            f"FALSE, FALSE, {sql_str(audiences)}::jsonb, NULL, {sql_str(missions)}::jsonb, "
            f"(SELECT id FROM public.internal_categories WHERE code = {sql_str(CAT_CODE)} LIMIT 1)"
            ");"
        )
        lines.append("")

        pw_lines.append(f"{user_id},{login_email},{username},{display},{password}")

    lines.append("COMMIT;")
    lines.append(f"-- Login emails: {{username}}@notaires-agadir.sifarah.local")
    lines.append(f"-- Passwords: see {OUT_PASSWORDS.name}")

    OUT_SQL.parent.mkdir(parents=True, exist_ok=True)
    OUT_SQL.write_text("\n".join(lines) + "\n", encoding="utf-8")
    OUT_PASSWORDS.write_text("\n".join(pw_lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT_SQL} ({len(rows)} notaires)")
    print(f"Wrote {OUT_PASSWORDS}")
    print(f"Avatars in {AVATAR_DIR}")


if __name__ == "__main__":
    main()
