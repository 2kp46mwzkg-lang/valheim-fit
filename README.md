# ⚔️ Valheim Fit

Tes séances de sport réelles (fichier FIT Garmin ou saisie manuelle) rapportent des ressources pour bâtir ta maison viking.

## Mise en ligne (GitHub Pages)

1. Crée un dépôt public `valheim-fit` sur GitHub.
2. Envoie tous les fichiers du projet (SAUF `node_modules` et `dist`).
3. Settings → Pages → Source : **GitHub Actions**.
4. Onglet **Actions** : attends la coche verte (≈ 1 min).
5. Ton adresse : `https://TONPSEUDO.github.io/valheim-fit/`

Chaque modification envoyée sur `main` republie le site automatiquement.

## Tester sans montre
Ajoute `?dev` à l'adresse, ou utilise la saisie manuelle.

## Récupérer un fichier FIT
Garmin Connect (web) → activité → ⚙️ → Exporter l'original (.zip). L'appli lit le zip directement.

## Équilibrage
- `src/game/points.ts` : zones cardiaques et multiplicateurs
- `src/game/loot.ts` : objets et taux de drop
- `src/game/recipes.ts` : constructions, artisanat, quêtes

## En local (optionnel)
```
npm install
npm run dev
```
