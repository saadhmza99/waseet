"""Generate seed_projets_dossier_289.sql from projets_dossier_289.csv.

The CSV is shaped like public.projects_documents, keyed by the Kerix
project id (public.projects.attributes.source_project_id). Each seeded
project exists once per linked pro, so every document is fanned out to
all copies via INSERT ... SELECT. Titles scraped from HTML junk or raw
PDF filenames are cleaned / derived from the document URL.
"""
import csv
import html
import re
import urllib.parse
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "projets_dossier_289.csv"
OUT_PATH = ROOT / "supabase" / "seeds" / "seed_projets_dossier_289.sql"

TYPE_MAP = {
    "brochure": "Brochure commerciale",
    "cahier_des_charges": "Spécifications publiques du projet",
    "document": "Autre",
    "web_page": "Présentation du projet",
}


def title_from_url(url: str) -> str:
    path = urllib.parse.urlparse(url).path
    name = urllib.parse.unquote(path.rstrip("/").rsplit("/", 1)[-1])
    name = re.sub(r"\.(pdf|docx?|xlsx?|pptx?|zip)$", "", name, flags=re.I)
    name = re.sub(r"[-_/]+", " ", name)
    name = re.sub(r"\s+", " ", name).strip(" .")
    return name or "Document"


def clean_title(raw: str, url: str) -> str:
    raw = (raw or "").strip()
    # Scraped HTML fragments / broken encoding: derive from the file name.
    if "<" in raw or ">" in raw or "\ufffd" in raw:
        return title_from_url(url)
    title = html.unescape(re.sub(r"<[^>]*>", " ", raw))
    title = re.sub(r"\s+", " ", title).strip()
    if len(title) < 4:
        return title_from_url(url)
    # Raw file names read better without extension / separators.
    if re.search(r"\.(pdf|docx?|xlsx?)$", title, flags=re.I):
        title = title_from_url(url)
    return title[:120]


def sql_text(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def main() -> None:
    rows = list(csv.DictReader(CSV_PATH.open(encoding="utf-8-sig", newline="")))

    by_project: dict[str, list[dict]] = defaultdict(list)
    for index, row in enumerate(rows):
        by_project[row["project_id"]].append(
            {
                "title": clean_title(row["title"], row["url"].strip()),
                "type": TYPE_MAP.get(row["type"].strip(), "Autre"),
                "url": row["url"].strip().replace(" ", "%20"),
                "privacy": "private" if row["privacy"].strip() == "private" else "public",
                "position": int(row["position"] or 0),
                "index": index,
            }
        )

    statements: list[str] = []
    doc_count = 0
    for project_id, docs in by_project.items():
        docs.sort(key=lambda d: (d["position"], d["index"]))
        for position, doc in enumerate(docs):
            doc_count += 1
            statements.append(
                "INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)\n"
                f"SELECT p.id, {sql_text(doc['title'])}, {sql_text(doc['type'])}, "
                f"{sql_text(doc['url'])}, {sql_text(doc['privacy'])}, {position}\n"
                "FROM public.projects p\n"
                f"WHERE p.attributes->>'source_project_id' = {sql_text(project_id)}\n"
                "  AND NOT EXISTS (\n"
                "    SELECT 1 FROM public.projects_documents d\n"
                f"    WHERE d.project_id = p.id AND d.url = {sql_text(doc['url'])}\n"
                "  );"
            )

    header = (
        "-- Seed: project documents from projets_dossier_289.csv\n"
        f"-- {doc_count} documents across {len(by_project)} Kerix projects; each one is\n"
        "-- attached to every projects row sharing attributes.source_project_id\n"
        "-- (one row per linked pro). Idempotent: re-running inserts nothing twice\n"
        "-- (matched on project_id + url).\n"
        "-- Apply with: supabase db query --linked -f supabase/seeds/seed_projets_dossier_289.sql\n\n"
    )
    OUT_PATH.write_text(header + "\n\n".join(statements) + "\n", encoding="utf-8")
    print(f"wrote {OUT_PATH} ({doc_count} docs, {len(by_project)} projects, {len(statements)} inserts)")


if __name__ == "__main__":
    main()
