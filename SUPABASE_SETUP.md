# Configuration Supabase

## Installation

1. Installer les dépendances :
```bash
cd frontend
npm install
```

## Configuration des variables d'environnement

1. Créer un fichier `.env` dans le dossier `frontend/` :
```bash
cd frontend
touch .env
```

2. Ajouter les variables suivantes dans le fichier `.env` :
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Obtenir vos credentials Supabase :
   - Allez sur [supabase.com](https://supabase.com)
   - Créez un nouveau projet ou sélectionnez un projet existant
   - Allez dans Settings > API
   - Copiez l'URL du projet et la clé `anon` (public)

## Structure

- `frontend/src/lib/supabase.ts` - Client Supabase configuré
- `frontend/src/contexts/AuthContext.tsx` - Contexte d'authentification
- `frontend/src/App.tsx` - Intégration du AuthProvider

## Utilisation

### Authentification

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, signIn, signUp, signOut } = useAuth();
```

### Accès direct à Supabase

```typescript
import { supabase } from '@/lib/supabase';

// Exemple : récupérer des données
const { data, error } = await supabase
  .from('table_name')
  .select('*');
```

