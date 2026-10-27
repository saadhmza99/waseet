#!/usr/bin/env python3
"""Seed feed posts for recommended_firms_2026 verified profiles.

  python scripts/seed_recommended_posts.py --apply
"""

from __future__ import annotations

import json
import subprocess
import sys
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_SQL = ROOT / "supabase" / "seeds" / "seed_recommended_posts.sql"
SEED_BATCH = "recommended_firms_2026"
POST_BATCH = "recommended_posts_2026"
NS = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")

# Deterministic profile ids (same as seed_recommended_firms.py)
FIRM_IDS = {
    "chbarchitects": str(uuid.uuid5(NS, f"sifarah:{SEED_BATCH}:chbarchitects")),
    "tgcc": str(uuid.uuid5(NS, f"sifarah:{SEED_BATCH}:tgcc")),
    "cgi": str(uuid.uuid5(NS, f"sifarah:{SEED_BATCH}:cgi")),
    "interstyledesign": str(uuid.uuid5(NS, f"sifarah:{SEED_BATCH}:interstyledesign")),
    "betam": str(uuid.uuid5(NS, f"sifarah:{SEED_BATCH}:betam")),
    "hajjiassocies": str(uuid.uuid5(NS, f"sifarah:{SEED_BATCH}:hajjiassocies")),
}


def sql_str(value: str | None) -> str:
    if value is None:
        return "NULL"
    text = str(value).replace("\r\n", "\n").replace("\r", "\n")
    return "'" + text.replace("'", "''") + "'"


def sql_json(value: object) -> str:
    return sql_str(json.dumps(value if value is not None else [], ensure_ascii=False))


def pid(key: str) -> str:
    return str(uuid.uuid5(NS, f"sifarah:{POST_BATCH}:{key}"))


POSTS = [
    {
        "key": "chb",
        "username": "chbarchitects",
        "created_at": "2026-09-28T09:30:00+00",
        "city": "Casablanca",
        "description": (
            "Le siège de bureaux conçu pour BMCE à Casablanca réunit environ 6 000 m² sur 26 m de haut. "
            "Le bâtiment compte dix niveaux : deux sous-sols, un rez-de-chaussée et sept étages.\n\n"
            "Les sous-sols accueillent le parking, les locaux techniques et les archives. "
            "Le rez-de-chaussée rassemble l'accueil, les salles de réunion, la cafétéria, le fitness et la maintenance. "
            "La façade associe verre, inox, alucobond et ardoise agrafée. La maîtrise d'œuvre est celle de CHB Architects, "
            "le cabinet de Hakim Benjelloun, au 2, rue des Moineaux."
        ),
        "images": [
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80",
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80",
        ],
    },
    {
        "key": "tgcc",
        "username": "tgcc",
        "created_at": "2026-09-20T11:00:00+00",
        "city": "Casablanca",
        "description": (
            "Grand Théâtre de Casablanca (CasArts) : 24 000 m² au cœur du quartier historique, "
            "salle de spectacle 1 800 places, théâtre 600 places et salle de musique 450 places. "
            "TGCC a assuré une mission tous corps d'état pour Casa Aménagement.\n\n"
            "Parmi nos autres références récentes : campus UM6P à Rabat (+100 000 m² couverts), "
            "trémie Dar Bouazza et stade Al Barid."
        ),
        "images": [
            "https://tgcc.ma/wp-content/uploads/2025/12/Grand_theatre.jpg",
            "https://tgcc.ma/wp-content/uploads/2025/12/TGCC-UM6P-RABAT_result.jpg",
            "https://tgcc.ma/wp-content/uploads/2025/12/Tremie-Dar-Bouazza-1_result.jpg",
            "https://tgcc.ma/wp-content/uploads/2026/01/STADE-AL-BARID-73-1_result.jpg",
        ],
    },
    {
        "key": "cgi",
        "username": "cgi",
        "created_at": "2026-09-14T08:45:00+00",
        "city": "Casablanca",
        "description": (
            "La Compagnie Générale Immobilière, filiale de la Caisse de Dépôt et de Gestion depuis 1960, "
            "développe et commercialise des programmes résidentiels et tertiaires sur l'ensemble du Maroc.\n\n"
            "Le métier couvre le montage de l'opération, la mise en vente des lots (VEFA) et le suivi jusqu'à la livraison. "
            "Portefeuille recentré sur le moyen et haut standing et les projets mixtes : GreenSide, Azur Valley, "
            "Les Arborelles, Domaine de Noria, Taghazout Bay Living…"
        ),
        "images": [
            "https://cdgdev.ma/sites/default/files/2025-03/Arborelles%20020624_3%20-%20Photo.jpg",
            "https://cdgdev.ma/sites/default/files/2024-12/Casa%20Green%20Town%20_%20CASABLANCA-0082024_%C2%A9Said%20Mrigua_SAID%20MRIGUA%281%29.jpg",
            "https://cdgdev.ma/sites/default/files/2025-03/DPR-CGI-TAGHAZOUT-Bis-Oct-2024-920x860.png",
        ],
    },
    {
        "key": "interstyle",
        "username": "interstyledesign",
        "created_at": "2026-09-08T16:15:00+00",
        "city": "Casablanca",
        "description": (
            "Interstyle Design, cabinet fondé par Wafaa Elkass et installé à Massira, "
            "reprend les appartements à Casablanca à partir de 60 m². Les bureaux et les locaux sont étudiés au cas par cas.\n\n"
            "Un seul interlocuteur coordonne les corps d'état, de la maçonnerie aux finitions : "
            "électricité, plomberie, revêtements et menuiseries. Conception 2D/3D, puis livraison clé en main — "
            "y compris pour les clients qui pilotent à distance."
        ),
        "images": [
            "https://interstyledesign.ma/images/projets/renovation-racine-01.webp",
            "https://interstyledesign.ma/images/projets/renovation-racine-02.webp",
            "https://interstyledesign.ma/images/projets/renovation-racine-03.webp",
            "https://interstyledesign.ma/images/projets/aeria-hs-1.webp",
            "https://interstyledesign.ma/images/projets/aeria-hs-9.webp",
        ],
    },
    {
        "key": "betam",
        "username": "betam",
        "created_at": "2026-08-27T10:00:00+00",
        "city": "Casablanca",
        "description": (
            "BETAM (Bureau d'Études et d'Aménagement Maroc) assure depuis 1975 les études techniques "
            "et le suivi de réalisation pour des maîtres d'ouvrage publics et privés.\n\n"
            "Références : aéroport de Fès-Saïss, infrastructures de Tan-Tan, port de Casablanca, "
            "centre hospitalier régional de Guelmim. Honoraires sur devis ; suivi possible à distance."
        ),
        "images": [
            "https://betam.ma/wp-content/uploads/2020/09/Un-service-batiment-genie-civil.jpg",
            "https://betam.ma/wp-content/uploads/2020/10/etude-general.jpg",
            "https://betam.ma/wp-content/uploads/2020/10/maitrise-doeuvre.jpg",
            "https://betam.ma/wp-content/uploads/2020/10/Assistance-Maitrise-douvrage.jpg",
        ],
    },
    {
        "key": "hajji",
        "username": "hajjiassocies",
        "created_at": "2026-08-18T15:20:00+00",
        "city": "Casablanca",
        "description": (
            "Hajji & Associés, cabinet d'avocats d'affaires fondé par Amin Hajji en 1996, "
            "accompagne les ventes et les baux immobiliers ainsi que les investissements internationaux au Maroc.\n\n"
            "La mission couvre l'audit des titres et des autorisations, la promesse, le contrat de vente et les baux, "
            "puis la coordination avec le notaire. Le cabinet intervient aussi en M&A, infrastructures et arbitrage."
        ),
        "images": [
            "https://ahlo.ma/wp-content/uploads/2022/05/CABINET-D-AVOCAT-HAJJI-ASSOCIES-CASABLANCA-CABINET-AMIN-HAJJI-MISE-EN-AVANT.jpg",
            "https://ahlo.ma/wp-content/uploads/2022/04/PHOTO-MENU-ACTIVITES-.jpg",
            "https://ahlo.ma/wp-content/uploads/2022/04/PHOTO-MENU-A-PROPOS.jpg",
        ],
    },
]


def emit_sql() -> str:
    lines = [
        "-- AUTO-GENERATED by scripts/seed_recommended_posts.py",
        f"-- Post batch marker via description prefix / deterministic ids ({POST_BATCH})",
        "BEGIN;",
        "",
        # Remove prior seed of these deterministic ids
        "DELETE FROM public.post_likes WHERE post_id IN ("
        + ", ".join(f"{sql_str(pid(p['key']))}::uuid" for p in POSTS)
        + ");",
        "DELETE FROM public.post_comments WHERE post_id IN ("
        + ", ".join(f"{sql_str(pid(p['key']))}::uuid" for p in POSTS)
        + ");",
        "DELETE FROM public.post_shares WHERE post_id IN ("
        + ", ".join(f"{sql_str(pid(p['key']))}::uuid" for p in POSTS)
        + ");",
        "DELETE FROM public.saved_posts WHERE post_id IN ("
        + ", ".join(f"{sql_str(pid(p['key']))}::uuid" for p in POSTS)
        + ");",
        "DELETE FROM public.posts WHERE id IN ("
        + ", ".join(f"{sql_str(pid(p['key']))}::uuid" for p in POSTS)
        + ");",
        "",
    ]
    for post in POSTS:
        user_id = FIRM_IDS[post["username"]]
        images = post["images"]
        lines.append(
            "INSERT INTO public.posts ("
            "id, user_id, title, description, single_image_url, images, "
            "likes_count, comments_count, shares_count, is_sponsored, post_type, city, created_at, updated_at"
            ") VALUES ("
            f"{sql_str(pid(post['key']))}::uuid, {sql_str(user_id)}::uuid, '', "
            f"{sql_str(post['description'])}, {sql_str(images[0] if images else None)}, "
            f"{sql_json(images)}::jsonb, 0, 0, 0, FALSE, 'standard', {sql_str(post['city'])}, "
            f"{sql_str(post['created_at'])}::timestamptz, {sql_str(post['created_at'])}::timestamptz"
            ");"
        )
    lines.append("")
    lines.append("COMMIT;")
    lines.append("NOTIFY pgrst, 'reload schema';")
    return "\n".join(lines) + "\n"


def main() -> None:
    sql = emit_sql()
    OUT_SQL.parent.mkdir(parents=True, exist_ok=True)
    OUT_SQL.write_text(sql, encoding="utf-8")
    print(f"wrote {OUT_SQL} posts={len(POSTS)}")
    if "--apply" not in sys.argv:
        return
    # Policy + trigger first
    policy_sql = ROOT / "scripts" / "_apply_verified_posts_rule.sql"
    policy_sql.write_text(
        """
BEGIN;

DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
CREATE POLICY "Users can create their own posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      COALESCE(post_type, 'standard') <> 'standard'
      OR EXISTS (
        SELECT 1 FROM public.profiles pr
        WHERE pr.id = user_id AND pr.is_verified IS TRUE
      )
    )
  );

CREATE OR REPLACE FUNCTION public.check_post_standard_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(NEW.post_type, 'standard') <> 'standard' THEN
    RETURN NEW;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles pr
    WHERE pr.id = NEW.user_id AND pr.is_verified IS TRUE
  ) THEN
    RAISE EXCEPTION 'POST_AUTHOR_NOT_VERIFIED'
      USING DETAIL = 'Seuls les profils vérifiés (badge) peuvent publier des posts sur le fil.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_posts_15_check_standard_verified ON public.posts;
CREATE TRIGGER trg_posts_15_check_standard_verified
  BEFORE INSERT OR UPDATE OF post_type, user_id ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.check_post_standard_verified();

COMMIT;
NOTIFY pgrst, 'reload schema';
""".strip()
        + "\n",
        encoding="utf-8",
    )
    for path in (policy_sql, OUT_SQL):
        print("applying", path.name)
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
            raise SystemExit(f"Failed on {path}")
    print("apply ok")
    subprocess.run(
        [
            "supabase",
            "db",
            "query",
            "--linked",
            (
                "SELECT p.username, count(*)::int AS posts "
                "FROM posts po JOIN profiles p ON p.id = po.user_id "
                f"WHERE po.id IN ({', '.join(chr(39)+pid(x['key'])+chr(39)+'::uuid' for x in POSTS)}) "
                "GROUP BY p.username ORDER BY p.username;"
            ),
        ],
        cwd=str(ROOT),
    )


if __name__ == "__main__":
    main()
