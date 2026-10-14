# Architecture

Site statique (Vite + React + TypeScript + react-three-fiber), sans backend.

## Flux de données

```
story.json (gist) ──fetch──▶ parseStory ──▶ Story
                                             │
                       useSession (reducer pur + localStorage)
                                             │ Current Node
App ──▶ useSoundCloudPlayer ──▶ widget SoundCloud (iframe masquée)
          │ clockRef (position/durée), status, waveformUrl
          ▼
StoryScreen ──▶ Scene (3D)  ou  ChoiceList (2D)
```

## Modules

- **`story/`** : `types.ts` (Story, StoryNode, Choice), `parseStory.ts` (validation, erreurs listées), `loadStory.ts` (fetch + `VITE_STORY_URL`), `useStoryLoader.ts`.
- **`session/`** : `session.ts` est un reducer pur (`start`, `resume`, `choose`, `back`, `reveal`, `restart`) testé unitairement. `savedSessionStorage.ts` lit/écrit `ronan:session` (sauvegarde invalide ignorée). `useSession.ts` branche le tout.
- **`player/`** : `soundcloudWidget.ts` charge l'API du widget et décrit ses types ; `useSoundCloudPlayer.ts` expose `status`, `playTrack`, `togglePause`, `replay` et une horloge `clockRef` (position extrapolée entre les événements `PLAY_PROGRESS`) ; `useWaveform.ts` charge le JSON de forme d'onde.
- **`scene/`** : une scène r3f (`Scene.tsx`), chargée à la demande. `NodeCore` (polyèdre filaire), `WaveformRing` (anneau modulé par la forme d'onde), `ChoiceBranch` (branche + libellé HTML cliquable), `PathTrail` (Nodes déjà visités, estompés derrière), `Starfield`. `layoutBranches` calcule les positions (portrait : empilées ; paysage : en éventail).
- **`components/`** : écrans (`StartScreen`, `StoryScreen`, `ErrorScreen`, `LoadingScreen`) et éléments (`NodeHud`, `PlayerControls`, `ChoiceList`, `EndingPanel`, `TranscriptPanel`, `SoundCloudCredit`, `HiddenPlayerFrame`).
- **`hooks/capabilities.ts`** : `usePrefersReducedMotion`, `hasWebGL`, `detectQuality`.

## Choix de conception

- **Geste utilisateur** : `playTrack` est appelé directement dans les handlers de tap (Commencer, Reprendre, Choice), jamais depuis un effet, pour rester dans la chaîne du geste exigée par les navigateurs mobiles.
- **Choices révélés** : 3 s après le passage en lecture (le minuteur repart si le Reader met en pause puis reprend), à l'événement `FINISH` si la piste est plus courte. L'audio continue dans tous les cas.
- **Race de chargement** : un compteur (`loadToken`) ignore les callbacks d'un chargement périmé ; un `play()` explicite suit le `load()` car l'auto-lecture du widget est parfois ignorée quand l'URL est déjà chargée.
- **Dégradation** : WebGL absent ou `prefers-reduced-motion` → `ChoiceList` 2D, pas de `Scene`.
- **Un composant React par fichier**, early returns, commentaires rares.

## Tests

`npm test` : parseur d'histoire, reducer de session, layout des branches.
Le comportement audio (widget, iOS) se vérifie à la main dans un navigateur.
