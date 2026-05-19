# StreamFinder FR

Recherchez un film et découvrez instantanément sur quelles plateformes de streaming il est disponible en France (abonnement, VOD, location, achat digital).

## Fonctionnalités

- Recherche de films en temps réel via l'API TMDB
- Disponibilité en France : abonnement (Netflix, Canal+, Disney+…), VOD/location, achat digital
- Page de détail avec poster, synopsis, genres, durée, note
- Interface sombre, responsive, style streaming premium

## Prérequis

- Node.js 18+
- Une clé API TMDB gratuite (voir ci-dessous)

## Obtenir une clé API TMDB

1. Créez un compte sur https://www.themoviedb.org
2. Allez dans **Paramètres → API** dans votre profil
3. Faites une demande d'accès à l'API (gratuit, approuvé instantanément pour usage personnel)
4. Copiez votre **Clé API (v3 auth)**

## Installation et démarrage

```bash
# 1. Accéder au projet
cd /Users/ariazoulay/Projects/streamfinder-fr

# 2. Installer les dépendances (déjà fait)
npm install

# 3. Configurer la clé API
# Éditez .env et collez votre clé TMDB :
# VITE_TMDB_API_KEY=votre_cle_ici

# 4. Lancer l'application
npm run dev
```

L'application sera disponible sur http://localhost:5173

## Configuration de la clé API

Éditez le fichier `.env` à la racine du projet :

```
VITE_TMDB_API_KEY=votre_cle_tmdb_ici
```

Ne committez jamais ce fichier (il est dans `.gitignore`).

## Changer le pays de disponibilité

La constante `COUNTRY` dans `src/api/tmdb.ts` contrôle la région :

```ts
export const COUNTRY = 'FR'; // France par défaut
```

Changez-la en `'US'`, `'DE'`, `'GB'`, etc. pour d'autres pays.

## Build de production

```bash
npm run build
npm run preview
```

## Stack technique

- React 19 + TypeScript
- Vite 8
- React Router 7
- Axios
- TMDB API (films + watch providers via JustWatch)
