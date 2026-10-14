# Format d'une Map

Une expérience est un unique fichier JSON (typiquement hébergé dans un gist ou dans `public/`), chargé au démarrage et validé par `src/map/parseMap.ts`. Vocabulaire : voir [`CONTEXT.md`](../CONTEXT.md).

```json
{
  "title": "Cartographie sonore",
  "settings": { "presentation": "full", "unavailable": "dimmed" },
  "start": ["v1", "l1"],
  "families": {
    "voix": { "label": "Voix", "color": "#ffd166", "shape": "circle" },
    "lieu": { "label": "Lieux", "color": "#4cc9f0", "shape": "diamond" }
  },
  "points": {
    "v1": {
      "title": "Murmure du quai",
      "families": ["voix"],
      "hinge": false,
      "final": false,
      "capsules": [
        { "title": "Prise 1", "soundcloudUrl": "https://soundcloud.com/auteur/piste" }
      ],
      "text": "Fragment de recherche affiché dans un panneau repliable.",
      "image": "images/quai.jpg",
      "position": [0, 0, 0],
      "connections": [
        { "to": "v2" },
        { "to": "l3", "label": "vers les lieux", "requires": ["l1"], "unless": ["v6"] }
      ]
    }
  }
}
```

## Racine

| Champ | Type | Obligatoire | Description |
| --- | --- | --- | --- |
| `title` | string | non | Titre de l'expérience |
| `settings.presentation` | `"full"` \| `"local"` | non (`full`) | `full` : toute la carte visible. `local` : seulement le Point courant et ses Connections (histoire à choix). Une Map `local` n'a qu'un seul `start`. |
| `settings.unavailable` | `"dimmed"` \| `"hidden"` | non (`dimmed`) | Rendu des Points fermés |
| `start` | string \| string[] | oui | Point(s) d'entrée accessibles au début |
| `families` | objet | non | Table `id → { label, color (#rrggbb), shape }` ; `shape` ∈ `circle`, `diamond`, `triangle`, `square`, `cross` |
| `points` | objet | oui | Table `id → Point` |

## Point

| Champ | Type | Obligatoire | Description |
| --- | --- | --- | --- |
| `title` | string | oui | Titre affiché |
| `capsules` | tableau | oui (≥ 1) | Enregistrements SoundCloud : `{ soundcloudUrl, title? }`. La première joue automatiquement. |
| `families` | string[] | non | Familles du Point (plusieurs possibles) |
| `hinge` | boolean | non | Point-charnière ★ |
| `final` | boolean | non | Point qui termine l'exploration |
| `text` | string | non | Texte, anecdote, fragment |
| `image` | string | non | Chemin relatif à la racine du site (ex. `images/a.jpg`) ou URL |
| `position` | `[x, y, z]` | non | Position imposée ; sinon calcul automatique |
| `connections` | tableau | non | Connections sortantes |

## Connection

| Champ | Type | Description |
| --- | --- | --- |
| `to` | string | Point cible (obligatoire) |
| `label` | string | Libellé affiché (sinon le titre du Point cible) |
| `requires` | string[] | Points à avoir visités pour que la Connection soit ouverte |
| `unless` | string[] | La Connection se ferme dès qu'un de ces Points est visité |

## Règles de disponibilité

- Au début, seuls les Points de `start` sont accessibles.
- Un Point devient accessible dès qu'une Connection **ouverte** y mène depuis **n'importe quel** Point déjà visité.
- Un Point visité reste toujours rouvrable.
- Un Point non visité est **fermé** quand toutes les Connections qui y mènent sont fermées par un `unless`.
- Les nouveaux Points accessibles apparaissent 3 secondes après le début de l'écoute d'un Point nouvellement visité.
- L'exploration se termine sur un Point `final`, ou quand plus aucun Point n'est accessible.

## Règles validées au chargement

Une Map invalide n'est pas lue : l'écran d'erreur liste les problèmes.

- Champs requis présents (titre, au moins une Capsule par Point).
- `start`, `to`, `requires`, `unless` et `families` référencent des éléments existants.
- Chaque Point est atteignable depuis `start` en suivant les Connections (conditions ignorées).
- Familles : couleur `#rrggbb` et forme valide.

## Évolution

La progression sauvegardée référence les IDs de Points. **Ne jamais renommer un ID existant**, sinon la reprise est perdue (une sauvegarde invalide est simplement ignorée).

Les pistes SoundCloud doivent être publiques (ou intégrables). Des cartes d'exemple sont dans `public/map.json` (histoire en présentation `local`) et `public/maps/test-30.json` (30 Points, 5 familles, charnières et conditions).
