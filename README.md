# Ronan

Exploration sonore interactive. Le Visitor écoute les Capsules (pistes SoundCloud) d'un Point, puis choisit où aller parmi les Points accessibles d'une Map, dans une interface 3D noire d'inspiration SF. Une Map peut aussi se présenter comme un livre dont vous êtes le héros (présentation `local`).

Le vocabulaire (Map, Point, Capsule, Connection, Journey…) est défini dans [`CONTEXT.md`](CONTEXT.md). Les décisions d'architecture sont dans [`docs/adr/`](docs/adr).

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
| `VITE_MAP_URL` | URL du JSON de la Map (ex. URL « raw » d'un gist) | `public/map.json` (démo) |
| `BASE_PATH` | Chemin de base du site (build) | `/ronan/` |

Exemple :

```bash
VITE_MAP_URL=https://gist.githubusercontent.com/<user>/<id>/raw/map.json npm run dev

# carte de test de 30 Points
VITE_MAP_URL=/ronan/maps/test-30.json npm run dev
```

Le format du JSON est décrit dans [`docs/map-format.md`](docs/map-format.md). L'URL « raw » d'un gist autorise le CORS, donc le site peut la charger depuis `github.io`. GitHub la met en cache environ 5 minutes.

## Déploiement (GitHub Pages)

Le workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) teste, construit et publie sur Pages à chaque push sur `main`.

1. Dans le dépôt : *Settings → Pages → Source : GitHub Actions*.
2. Optionnel : *Settings → Secrets and variables → Actions → Variables* : créer `MAP_URL` avec l'URL du JSON.
3. Site publié sur `https://<user>.github.io/ronan/`.

Si le dépôt change de nom, adapter `BASE_PATH` dans le workflow.

## Fonctionnement

- **Accueil** : bouton « Commencer » (ou « Reprendre » si une progression est sauvegardée). Ce tap débloque l'audio sur mobile.
- **Ouverture d'un Point** : son titre s'affiche et sa première Capsule joue (une seule à la fois, ouvrir un autre Point coupe la lecture). Un Point à plusieurs Capsules propose une liste pour choisir.
- **Accessibilité des Points** : 3 secondes après le début de l'écoute d'un Point nouvellement visité, les Points qui deviennent accessibles apparaissent. Les règles `requires` / `unless` des Connections ouvrent ou ferment des possibilités (voir [`docs/map-format.md`](docs/map-format.md)).
- **Retour** : le bouton « « » rouvre le dernier Point écouté avant le Point courant.
- **Fin** : sur un Point `final`, ou quand plus rien n'est accessible, « Recommencer » est proposé.
- **Progression** : Journey sauvegardé dans `localStorage` (clé `ronan:session`).

### Accessibilité et dégradations

- `prefers-reduced-motion` ou absence de WebGL : interface 2D sans animation, avec une simple liste de boutons.
- Qualité 3D réduite automatiquement sur mobile / CPU modeste (moins de particules, résolution plafonnée).
- Texte optionnel par Point, dans un panneau repliable.
- Contrôles clavier et libellés ARIA sur les boutons.

## Limites connues

- L'audio passe par le widget SoundCloud (iframe masquée) : pas d'analyseur temps réel ni de préchargement de la Capsule suivante. La forme d'onde vient du JSON de forme d'onde précalculée par SoundCloud, synchronisé sur la position de lecture ; si elle est indisponible, une pulsation générique est utilisée. Voir [ADR 0001](docs/adr/0001-soundcloud-widget-for-audio.md).
- Le JSON de forme d'onde n'est pas une API documentée par SoundCloud et peut changer.
- Le comportement de l'autoplay sur iOS Safari reste à valider sur appareil réel.
- Un crédit « Audio · SoundCloud » avec lien vers la piste reste visible.

## Structure

```
src/
  map/        types, validation du JSON, règles de disponibilité, chargement
  session/    Journey et état de lecture (reducer pur), sauvegarde localStorage
  player/     widget SoundCloud, horloge de lecture, forme d'onde
  scene/      scène 3D (react-three-fiber) : noyau, anneau, branches, trace
  components/ écrans et éléments d'interface (un composant par fichier)
  hooks/      détection WebGL, reduced-motion, qualité
```

Voir [`docs/architecture.md`](docs/architecture.md) pour le détail.
