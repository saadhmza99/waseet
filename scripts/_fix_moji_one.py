import json
import subprocess
from pathlib import Path

# Restore rahma_immobilier from any seed mention, else clean ASCII-safe French rewrite
q = (
    "UPDATE profiles SET "
    "bio = 'Agence immobilière Rahma — accompagnement pour vos projets d''achat, de vente et de location.', "
    "about_text = '<h2>Rahma Immobilier</h2><p>Rahma Immobilier accompagne particuliers et investisseurs dans leurs projets immobiliers au Maroc.</p>"
    "<h3>Notre approche</h3><p>Nous privilégions un conseil clair, une sélection soignée des biens et un suivi jusqu''à la conclusion de la transaction.</p>"
    "<p><strong>Services :</strong> vente, achat et location, avec une attention particulière à la qualité de l''information transmise à chaque client.</p>', "
    "updated_at = NOW() "
    "WHERE username = 'rahma_immobilier' "
    "RETURNING username, left(bio,60) AS bio"
)
r = subprocess.run(["supabase", "db", "query", "--linked", "-o", "json", q], capture_output=True)
out = (r.stdout or b"").decode("utf-8", "replace")
print(out[out.find("{") : out.rfind("}") + 1] if "{" in out else out[:500])
