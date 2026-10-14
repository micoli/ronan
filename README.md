# Ronan

Lecteur d'histoire audio interactive, façon « livre dont vous êtes le héros ». Le Reader écoute un Node (une piste SoundCloud), puis choisit la suite parmi des branches qui poussent depuis le Node courant, dans une interface 3D noir et blanc d'inspiration SF.

Le vocabulaire (Story, Node, Choice, Reader…) est défini dans [`CONTEXT.md`](CONTEXT.md). Les décisions d'architecture sont dans [`docs/adr/`](docs/adr).

## Démarrage rapide

```bash
npm install
npm run dev        # http://localhost:5173/ronan/
npm test           # tests unitaires (parseur, session, layout)
npm run build      # typecheck + build dans dist/
```

Node 22+ recommandé.

## Configuration

| Variable | Rôle | Défaut |
| --- | --- | --- |
| `VITE_STORY_URL` | URL du JSON de l'histoire (ex. URL « raw » d'un gist) | `public/story.json` (démo) |
| `BASE_PATH` | Chemin de base du site (build) | `/ronan/` |

Exemple :

```bash
VITE_STORY_URL=https://gist.githubusercontent.com/<user>/<id>/raw/story.json npm run dev
```

Le format du JSON est décrit dans [`docs/story-format.md`](docs/story-format.md). L'URL « raw » d'un gist autorise le CORS, donc le site peut la charger depuis `github.io`. GitHub la met en cache environ 5 minutes.

## Déploiement (GitHub Pages)

Le workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) teste, construit et publie sur Pages à chaque push sur `main`.

1. Dans le dépôt : *Settings → Pages → Source : GitHub Actions*.
2. Optionnel : *Settings → Secrets and variables → Actions → Variables* : créer `STORY_URL` avec l'URL du JSON.
3. Site publié sur `https://<user>.github.io/ronan/`.

Si le dépôt change de nom, adapter `BASE_PATH` dans le workflow.

## Fonctionnement

- **Accueil** : bouton « Commencer » (ou « Reprendre » si une progression est sauvegardée). Ce tap débloque l'audio sur mobile.
- **Lecture d'un Node** : le titre s'affiche, la piste joue, une forme d'onde filaire réagit au son.
- **Choix** : les branches apparaissent 3 secondes après le début de la lecture (ou à la fin de la piste si elle est plus courte) ; « Passer à la suite » les affiche immédiatement. Un tap sur une branche charge le Node suivant.
- **Fin** : un Node sans Choice propose « Recommencer ». Pas d'annulation de choix.
- **Progression** : Node courant et chemin parcouru sauvegardés dans `localStorage` (clé `ronan:session`).

### Accessibilité et dégradations

- `prefers-reduced-motion` ou absence de WebGL : interface 2D sans animation, avec une simple liste de boutons.
- Qualité 3D réduite automatiquement sur mobile / CPU modeste (moins de particules, résolution plafonnée).
- Transcription optionnelle par Node, dans un panneau repliable.
- Contrôles clavier et libellés ARIA sur les boutons.

## Limites connues

- L'audio passe par le widget SoundCloud (iframe masquée) : pas d'analyseur temps réel ni de préchargement du Node suivant. La forme d'onde vient du JSON de forme d'onde précalculée par SoundCloud, synchronisé sur la position de lecture ; si elle est indisponible, une pulsation générique est utilisée. Voir [ADR 0001](docs/adr/0001-soundcloud-widget-for-audio.md).
- Le JSON de forme d'onde n'est pas une API documentée par SoundCloud et peut changer.
- Le comportement de l'autoplay sur iOS Safari reste à valider sur appareil réel.
- Un crédit « Audio · SoundCloud » avec lien vers la piste reste visible.

## Structure

```
src/
  story/      types, validation du JSON, chargement
  session/    état de lecture (reducer pur) et sauvegarde localStorage
  player/     widget SoundCloud, horloge de lecture, forme d'onde
  scene/      scène 3D (react-three-fiber) : noyau, anneau, branches, trace
  components/ écrans et éléments d'interface (un composant par fichier)
  hooks/      détection WebGL, reduced-motion, qualité
```

Voir [`docs/architecture.md`](docs/architecture.md) pour le détail.
