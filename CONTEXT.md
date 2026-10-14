# Ronan

Interactive audio story reader. The reader listens to a story and picks where it goes next, like a gamebook, through a black-and-white 3D sci-fi interface.

## Language

**Story**:
The complete authored work: a directed graph of Nodes joined by Choices. Already written.
_Avoid_: Book, game, adventure

**Node**:
One unit of the Story. Has a title and an audio recording (mp3) that is played to the reader. Several Choices may lead into the same Node.
_Avoid_: Passage, page, chapter, scene

**Choice**:
A link from one Node to another Node, offered to the Reader once the Current Node has been heard (or skipped). Carries its own written label, distinct from the target Node's title.
_Avoid_: Option, branch, link

**Start Node**:
The single Node where every reading begins.

**Ending**:
A Node with no outgoing Choices.

**Current Node**:
The Node the reader is presently listening to. Only its outgoing Choices are shown, as branches growing from it. The rest of the Story stays hidden.

**Path**:
The ordered Nodes the Reader has left behind to reach the Current Node. Going back pops the last Node of the Path and replays it.

**Reader**:
The person experiencing the Story. Makes Choices; carries no state (no stats, no inventory) between Nodes.
_Avoid_: Player, user, hero

## Relationships

- A **Story** contains many **Nodes**; a **Node** has zero or more outgoing **Choices** (zero = ending).
- Several **Choices** may target the same **Node** (convergence); the Story is a graph, not a strict tree.
- A **Choice** availability never depends on Reader state: no locked or conditional Choices.
