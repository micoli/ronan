# Format de l'histoire

L'histoire est un unique fichier JSON (typiquement hébergé dans un gist), chargé au démarrage et validé par `src/story/parseStory.ts`.

```json
{
  "start": "awakening",
  "nodes": {
    "awakening": {
      "title": "Réveil en orbite",
      "soundcloudUrl": "https://soundcloud.com/auteur/piste",
      "transcript": "Texte optionnel affiché dans un panneau repliable.",
      "choices": [
        { "label": "Ouvrir le sas", "to": "airlock" },
        { "label": "Rester immobile", "to": "silence" }
      ]
    },
    "airlock": { "title": "Le sas", "soundcloudUrl": "https://soundcloud.com/auteur/piste-2", "choices": [] },
    "silence": { "title": "Silence", "soundcloudUrl": "https://soundcloud.com/auteur/piste-3", "choices": [] }
  }
}
```

## Champs

| Champ | Type | Obligatoire | Description |
| --- | --- | --- | --- |
| `start` | string | oui | ID du Start Node (unique) |
| `nodes` | objet | oui | Table `id → Node` |
| `nodes[id].title` | string | oui | Titre affiché pendant l'écoute |
| `nodes[id].soundcloudUrl` | string | oui | URL publique de la piste SoundCloud |
| `nodes[id].transcript` | string | non | Transcription affichée si présente |
| `nodes[id].choices` | tableau | oui | Choices sortants ; `[]` = Ending |
| `choices[].label` | string | oui | Libellé affiché sur la branche (propre au Choice) |
| `choices[].to` | string | oui | ID du Node cible |

## Règles validées au chargement

Une histoire invalide n'est pas lue : l'écran d'erreur liste les problèmes.

- `start` référence un Node existant.
- Chaque Choice cible un Node existant.
- Tout Node est atteignable depuis `start`.
- Au moins un Ending (Node sans Choice).
- Champs requis présents et non vides.

Plusieurs Choices peuvent cibler le même Node (convergence), les boucles sont autorisées.

## Évolution

La progression sauvegardée référence les IDs de Nodes. **Ne jamais renommer un ID existant**, sinon la reprise est perdue (une sauvegarde invalide est simplement ignorée).

Les pistes SoundCloud doivent être publiques (ou intégrables) pour jouer dans le widget.
