# Configuration Cloudflare

## Services Cloudflare utilisés

1. **Cloudflare Stream** - Pour les vidéos Reels
2. **Cloudflare Pages** - Pour l'hébergement du site web

## Configuration Cloudflare Stream

### 1. Obtenir les credentials

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Sélectionnez votre compte
3. Allez dans **Stream** (ou créez un compte Stream si nécessaire)
4. Obtenez votre **Account ID** et **API Token**

### 2. Variables d'environnement

Ajoutez dans `frontend/.env` :

```
VITE_CLOUDFLARE_ACCOUNT_ID=your_account_id
VITE_CLOUDFLARE_STREAM_TOKEN=your_stream_api_token
```

**Note** : Pour uploader des vidéos depuis le frontend, vous devrez utiliser un backend proxy ou Cloudflare Workers pour sécuriser votre token.

## Configuration Cloudflare Pages

### 1. Déploiement via Git

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Sélectionnez **Pages**
3. Cliquez sur **Create a project**
4. Connectez votre repository GitHub
5. Configuration :
   - **Build command** : `cd frontend && npm run build`
   - **Build output directory** : `frontend/dist`
   - **Root directory** : `/` (ou `/frontend` selon votre structure)

### 2. Variables d'environnement dans Cloudflare Pages

Dans les paramètres du projet Pages, ajoutez :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLOUDFLARE_ACCOUNT_ID` (si nécessaire côté client)

## Structure recommandée

```
waseet/
├── frontend/          # Application React
├── supabase/          # Schéma Supabase
├── cloudflare/        # Workers/Functions si nécessaire
│   └── stream-upload/ # Worker pour upload sécurisé
└── README.md
```

## Upload de vidéos (Reels)

Pour sécuriser l'upload, deux options :

### Option 1 : Backend Proxy (Recommandé)
- Créer un endpoint dans Supabase Edge Functions
- Le frontend envoie la vidéo au proxy
- Le proxy upload vers Cloudflare Stream avec le token sécurisé

### Option 2 : Cloudflare Workers
- Créer un Worker qui gère l'upload
- Le frontend appelle le Worker
- Le Worker upload vers Stream

## Prochaines étapes

1. Configurer Cloudflare Stream
2. Créer un service pour gérer les vidéos
3. Intégrer dans la section Reels
4. Configurer le déploiement sur Cloudflare Pages

