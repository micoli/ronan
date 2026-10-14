# Architecture

Site statique (Vite + React + TypeScript + react-three-fiber), sans backend. Vocabulaire : [`CONTEXT.md`](../CONTEXT.md). Décisions : [`docs/adr/`](adr).

## Flux de données

```
map.json (gist / public) ──fetch──▶ parseMap ──▶ ExperienceMap
                                                    │
                          useSession (reducer pur + localStorage)
                                                    │ point courant, Journey, Points accessibles
App ──▶ useSoundCloudPlayer ──▶ widget SoundCloud (iframe masquée)
          │ clockRef (position/durée), status, waveformUrl
          ▼
MapScreen ──▶ Scene (3D)  ou  ChoiceList (2D)
```

## Modules

- **`map/`** : `types.ts` (ExperienceMap, Point, Capsule, Connection, Family), `parseMap.ts` (validation, erreurs listées), `availability.ts` (fonctions pures : Points accessibles, fermés, non atteints, fin d'exploration), `loadMap.ts` (fetch + `VITE_MAP_URL`), `useMapLoader.ts`.
- **`session/`** : `session.ts` contient le reducer pur (`begin`, `resume`, `open`, `selectCapsule`, `reveal`, `restart`), le calcul des Points ouvrables (`openablePointIds`) et des branches à afficher (`branchesOf`). `savedSessionStorage.ts` lit/écrit `ronan:session` (sauvegarde invalide ignorée). `useSession.ts` branche le tout.
- **`player/`** : `soundcloudWidget.ts` charge l'API du widget ; `useSoundCloudPlayer.ts` expose `status`, `playTrack`, `togglePause`, `replay` et une horloge `clockRef` (position extrapolée entre les événements `PLAY_PROGRESS`) ; `useWaveform.ts` charge le JSON de forme d'onde.
- **`scene/`** : scène r3f chargée à la demande. `NodeCore` (polyèdre filaire), `WaveformRing` (anneau modulé par la forme d'onde), `ChoiceBranch` (branche et nœud d'extrémité), `LabelProjector` (positionne des boutons DOM par projection 3D→écran), `PathTrail` (Points déjà visités, estompés), `Starfield`, `layoutBranches` (portrait : empilées ; paysage : en éventail).
- **`components/`** : écrans (`StartScreen`, `MapScreen`, `ErrorScreen`, `LoadingScreen`) et éléments (`PointHud`, `PlayerControls`, `CapsuleList`, `PointImage`, `ChoiceList`, `EndingPanel`, `TranscriptPanel`, `SoundCloudCredit`, `HiddenPlayerFrame`).
- **`hooks/capabilities.ts`** : `usePrefersReducedMotion`, `hasWebGL`, `detectQuality`.

## Choix de conception

- **Journey = ensemble** : l'ordre de visite est conservé (pour la trace) mais seule l'appartenance compte pour les règles (ADR 0003). Le Point précédent est mémorisé à part pour le bouton « retour ».
- **Révélation différée** : `pendingReveal` est vrai après l'ouverture d'un Point nouvellement visité. Tant qu'il l'est, les Points rendus accessibles par cette visite sont masqués ; `reveal` est déclenché 3 s après le début de la lecture, ou à la fin de la piste si elle est plus courte, et seulement si la lecture est en cours (la pause annule le minuteur).
- **Geste utilisateur** : `playTrack` est appelé directement dans les handlers de tap, jamais depuis un effet, pour rester dans la chaîne du geste exigée par les navigateurs mobiles.
- **Course de chargement** : un compteur (`loadToken`) ignore les callbacks d'un chargement périmé ; un `play()` explicite suit le `load()` car l'auto-lecture du widget est parfois ignorée quand l'URL est déjà chargée.
- **Libellés en DOM, pas dans le canvas** : les boutons de la scène sont de vrais éléments HTML positionnés par projection à chaque image. `drei/Html` créait un root React séparé qui se démontait en plein rendu et perdait des libellés.
- **Dégradation** : WebGL absent ou `prefers-reduced-motion` → `ChoiceList` 2D, pas de `Scene`.
- **Un composant React par fichier**, early returns, commentaires rares.

## Tests

`npm test` : parseur de Map, règles de disponibilité, reducer de session, layout des branches, validité et explorabilité des cartes d'exemple de `public/`.
Le comportement audio (widget, iOS) se vérifie à la main dans un navigateur.
