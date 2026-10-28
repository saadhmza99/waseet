"""Download the two FNPI LinkedIn post images into the public folder."""
import urllib.request
from pathlib import Path

OUT = Path("frontend/public/federations/posts")
OUT.mkdir(parents=True, exist_ok=True)

FILES = {
    "al-akaar.jpg": "https://media.licdn.com/dms/image/v2/D4E22AQFOgSlT_0nglw/feedshare-image-high-res/B4EaFTrCjQIwAU-/0/1792405154343?e=2147483647&v=beta&t=ORy4MHJ90aU1e4FBwExxGFDKUrPCZgUz22UB3tUqVB4",
    "observatoire-1.jpg": "https://media.licdn.com/dms/image/v2/D4E22AQFeiA3hz2wmzA/feedshare-image-high-res/B4EaF3v6lTJ0AY-/0/1793010412204?e=2147483647&v=beta&t=x4d5deu9AZDckRajGsNovnE1S5J6uJrdcGkbq25O6J0",
    "observatoire-2.jpg": "https://media.licdn.com/dms/image/v2/D4E22AQGdDw3BdJV-sQ/feedshare-image-high-res/B4EaF3v6bRKAAY-/0/1793010411588?e=2147483647&v=beta&t=6cdfx6RBy479iXV3NsqsMEmYwm13QdJ6cLmua3ZyPRA",
    "observatoire-3.jpg": "https://media.licdn.com/dms/image/v2/D4E22AQFj97UX0FT3Uw/feedshare-image-high-res/B4EaF3v6d3HoAU-/0/1793010411694?e=2147483647&v=beta&t=lY2_pkxTnEG4M2NxMVK9C28lMu098sVqen3oJmyYoQ4",
    "observatoire-4.jpg": "https://media.licdn.com/dms/image/v2/D4E22AQGaVkybVdSXAQ/feedshare-image-high-res/B4EaF3v6YGJEAY-/0/1793010411320?e=2147483647&v=beta&t=SD2zT8Pvv8BpPVwMwKZ4mugnJH50LGMCiivJc2GGarc",
}

for name, url in FILES.items():
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=40) as resp:
        data = resp.read()
        ctype = resp.headers.get("Content-Type") or ""
    path = OUT / name
    path.write_bytes(data)
    print(name, len(data), ctype.split(";")[0])
