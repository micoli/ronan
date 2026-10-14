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
- **`scene/`** : deux scènes r3f chargées à la demande, selon `settings.presentation`.
  - **`LocalScene`** (présentation `local`) : `NodeCore` (polyèdre filaire), `ChoiceBranch` (branche et nœud d'extrémité), `PathTrail` (Points déjà visités, estompés), `layoutBranches` (portrait : empilées ; paysage : en éventail).
  - **`map/ConstellationScene`** (présentation `full`) : toute la Map en 3D avec `OrbitControls` (rotation au doigt/souris, pincement pour zoomer, rotation lente tant qu'aucun Point n'est ouvert). `layoutMap` calcule une disposition force-dirigée déterministe (positions `position` respectées, cohésion par famille). `MapPoint` dessine un Point selon son statut (visité plein, accessible filaire et pulsant, non atteint estompé, fermé très estompé ou masqué), `PointShape` sa forme de famille, `FamilyRing` l'anneau segmenté des multi-familles, `HingeStar` l'étoile des charnières, `MapEdges` les liens (intensité par `edgeIntensity`), `CameraFocus` recentre doucement la caméra sur le Point ouvert. L'anneau de forme d'onde entoure le Point courant.
  - Communs : `WaveformRing` (anneau modulé par la forme d'onde), `LabelProjector` (positionne des boutons DOM par projection 3D→écran), `Starfield`.
- **`components/`** : écrans (`StartScreen`, `MapScreen` (panneau tiroir en 3D `full` : en bas sur mobile, à droite dès 900 px), `ErrorScreen`, `LoadingScreen`) et éléments (`PointHud`, `PlayerControls`, `CapsuleList`, `PointImage`, `ChoiceList`, `EndingPanel`, `TranscriptPanel`, `SoundCloudCredit`, `HiddenPlayerFrame`).
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
