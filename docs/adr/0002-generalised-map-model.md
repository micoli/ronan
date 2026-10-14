# One generalised Map model instead of a story model plus a map model

The first version modelled a branching audio story: one audio per node, only the current node visible, no state, a mandatory ending. The thesis project needs a free exploration of a constellation: several sounds and text per point, the whole map visible, families, hinges, no mandatory ending. We evolve the single model into a **Map** of **Points** and **Connections**, and keep the story as a Map whose _Presentation_ is `local`, rather than maintaining two models.

Two separate applications would duplicate the player, the 3D scene, the validation and the deployment. A generalised model costs a more abstract data format and a rewrite of the session, parser and scene; the existing story keeps working as a `local` Map.

Consequences:
- Retired decisions: no visitor state, only the current node visible, one audio per node, mandatory ending, strict black and white, a stack-shaped path with a "back to previous" button.
- The authored data format changes: Points with Capsules, Families, Connection conditions, Map-level settings. The demo `story.json` must be migrated.
- Final Points are optional; an exploration also ends when no Point remains reachable.
- Audio stays on SoundCloud, one Capsule at a time, no crossfades or simultaneous playback, so ADR 0001 still holds.
