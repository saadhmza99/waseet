# Supabase Database Setup

## Installation du schéma

1. Allez sur votre projet Supabase : https://supabase.com/dashboard
2. Ouvrez l'éditeur SQL (SQL Editor dans le menu de gauche)
3. Copiez le contenu de `schema.sql`
4. Collez-le dans l'éditeur SQL
5. Exécutez le script (Run)

## Structure de la base de données

### Tables principales :

- **profiles** - Profils utilisateurs (étend auth.users)
- **posts** - Posts du feed
- **listings** - Annonces/Jobs
- **comments** - Commentaires sur les posts
- **post_likes** - Likes sur les posts
- **portfolio_items** - Portfolio des utilisateurs
- **reviews** - Avis/Reviews
- **follows** - Relations de suivi
- **saved_posts** - Posts sauvegardés

## Fonctionnalités automatiques

- **Trigger `on_auth_user_created`** : Crée automatiquement un profil quand un utilisateur s'inscrit
- **Triggers `updated_at`** : Met à jour automatiquement le champ `updated_at` sur toutes les tables

## Row Level Security (RLS)

Toutes les tables ont RLS activé avec des politiques pour :
- ✅ Lecture publique pour la plupart des données
- ✅ Écriture limitée aux propriétaires
- ✅ Suppression limitée aux propriétaires

## Prochaines étapes

1. Exécutez le schéma SQL dans Supabase
2. Vérifiez que les tables sont créées
3. Testez l'authentification dans l'application
4. Configurez le storage pour les images (avatars, photos de couverture, etc.)

