#!/usr/bin/env python3
import json
import re
import urllib.request

UA = "Mozilla/5.0"
PAGES = [
    "https://alhoudagroupe.com/majorelle-hills/",
    "https://alhoudagroupe.com/palm-targa/",
    "https://alhoudagroupe.com/semlalia/",
    "https://alhoudagroupe.com/nos-projets/",
    "https://www.liliskane.com/",
    "https://at83properties.com/",
    "https://groupealnour.ma/projects/nour-prisme-elite/",
    "https://groupealnour.ma/projects/nour-confort-gueliz/",
    "https://groupealnour.ma/projects/nour-prestige/",
    "https://groupealnour.ma/projects/",
]


def main() -> None:
    result = {}
    for page in PAGES:
        try:
            req = urllib.request.Request(page, headers={"User-Agent": UA})
            html = urllib.request.urlopen(req, timeout=25).read().decode("utf-8", "ignore")
            imgs = re.findall(r"https?://[^\"']+\.(?:jpe?g|png|webp)", html, flags=re.I)
            clean = []
            seen = set()
            for u in imgs:
                low = u.lower()
                if any(x in low for x in ("chridari", "logo", "favicon", "icon", "sprite")):
                    continue
                if u in seen:
                    continue
                seen.add(u)
                clean.append(u)
            result[page] = clean[:12]
            print("PAGE", page)
            for u in clean[:8]:
                print(" ", u)
        except Exception as exc:  # noqa: BLE001
            print("FAIL", page, type(exc).__name__, exc)
    open("scripts/_promoter_images_found.json", "w", encoding="utf-8").write(
        json.dumps(result, ensure_ascii=False, indent=2)
    )


if __name__ == "__main__":
    main()
