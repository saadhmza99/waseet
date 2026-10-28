"""Save the FNPI LinkedIn excerpt image."""
import urllib.request
from pathlib import Path

url = (
    "https://media.licdn.com/dms/image/v2/D4E22AQFOgSlT_0nglw/feedshare-image-high-res/"
    "B4EaFTrCjQIwAU-/0/1792405154343?e=2147483647&v=beta&t=ORy4MHJ90aU1e4FBwExxGFDKUrPCZgUz22UB3tUqVB4"
)
out = Path("frontend/public/federations/fnpi-al-akaar.jpg")
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=30) as resp:
    data = resp.read()
    ctype = resp.headers.get("Content-Type")
out.write_bytes(data)
print(len(data), ctype, out)
