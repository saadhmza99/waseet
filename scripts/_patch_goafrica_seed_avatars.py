#!/usr/bin/env python3
"""Replace goafricaonline placeholder avatar_url in seed SQL with monogram paths (by username)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SQL = ROOT / "scripts" / "_apply_goafrica_monograms.sql"
TARGETS = [
    ROOT / "supabase" / "seeds" / "seed_lechantier_btp.sql",
    ROOT / "supabase" / "seeds" / "seed_lechantier_btp_chunks" / "chunk_025.sql",
]
GOA = "https://www.goafricaonline.com/build-manifest/images/logo.png?mtime=1700577148"


def mono_by_username() -> dict[str, str]:
    mapping: dict[str, str] = {}
    for line in SQL.read_text(encoding="utf-8").splitlines():
        m = re.search(r"avatar_url = '(/monograms/(.+?)\.svg)'", line)
        if not m:
            continue
        path, stem = m.group(1), m.group(2)
        user = re.sub(r"-[0-9a-f]{8}$", "", stem)
        mapping[user] = path
    return mapping


def main() -> None:
    mapping = mono_by_username()
    print(f"Loaded {len(mapping)} monogram paths")
    for path in TARGETS:
        if not path.exists():
            print(f"skip missing {path}")
            continue
        lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
        changed = 0
        missing: list[str] = []
        for i, line in enumerate(lines):
            if GOA not in line or "avatar_url" not in line:
                continue
            username = None
            for j in range(i, max(-1, i - 80), -1):
                m = re.search(r"username = '([^']+)'", lines[j])
                if m:
                    username = m.group(1)
                    break
            if username and username in mapping:
                lines[i] = line.replace(GOA, mapping[username])
                changed += 1
            else:
                missing.append(f"{username or '?'} @ {path.name}:{i + 1}")
        path.write_text("".join(lines), encoding="utf-8")
        print(f"{path.name}: replaced {changed}")
        for row in missing:
            print(f"  missing {row}")


if __name__ == "__main__":
    main()
