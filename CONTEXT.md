# Ronan

Interactive sound exploration. A Visitor listens to recorded sounds and builds their own Journey through a Map of connected Points, in a black 3D sci-fi interface. The same model also covers a classic branching audio story.

## Language

**Map**:
One complete experience: a set of Points joined by Connections. A Map is authored as a single data file. Several Maps can coexist, each lasting roughly 20 to 25 minutes.
_Avoid_: Story, book, game

**Point**:
A place on the Map that the Visitor can open. Holds a title and one or more Capsules, and optionally text, an image, an anecdote.
_Avoid_: Node, page, chapter, scene

**Capsule**:
One audio recording inside a Point. Only one Capsule plays at a time.
_Avoid_: Track, clip, mp3

**Connection**:
A link from one Point to another. Carries an optional written label, and optional conditions on which Points the Visitor has visited. The only kind of link: links shown inside a Point's content are Connections too.
_Avoid_: Choice, branch, link, edge

**Family**:
A named grouping of Points, shown as a colour and a shape. A Point may belong to several Families.
_Avoid_: Category, tag, type

**Hinge**:
A Point that links otherwise distant parts of the Map, reachable from several paths. Marked with a star (★).
_Avoid_: Hub, bridge

**Visitor**:
The person exploring the Map.
_Avoid_: Reader, player, user

**Journey**:
The set of Points the Visitor has opened so far in the current exploration. An unordered set, not a stack. Restarting empties it.
_Avoid_: Path, history, session

**Reachable Point**:
A Point the Visitor may open now: it is adjacent to a Point of the Journey, and its Connection conditions hold.
_Avoid_: Unlocked, available

**Closed Point**:
A Point that can no longer be opened in the current Journey because a Connection condition rules it out. How it looks is set by the Map: hidden, dimmed or locked.

**Final Point**:
A Point that ends the exploration. Optional: an exploration also ends when no Reachable Point remains.
_Avoid_: Ending

**Presentation**:
How much of the Map the Visitor sees. _Local_: only the current Point and its onward Connections, the rest hidden (classic branching story). _Full_: the whole constellation visible.

## Relationships

- A **Map** contains many **Points** and **Connections**; a **Point** contains one or more **Capsules**.
- A **Point** belongs to zero or more **Families**.
- A **Connection** may require some Points to have been visited, or close once some Points have been visited.
- Several **Connections** may lead to the same **Point** (a **Hinge** is the typical case); the Map is a graph with loops allowed, not a tree.
- The **Visitor** may open any **Reachable Point**, including one next to a Point visited earlier, not only next to the latest one.
- Opening a **Point** stops the **Capsule** playing; a newly Reachable **Point** lights up a few seconds after listening starts.

## Flagged ambiguities

- "Choix" (earlier design) and "connexion" (brief) named the same thing: resolved as **Connection**.
- "Parcours" meant both the live exploration and an authored experience: the live one is the **Journey**, the authored one is the **Map**.
- "Node", "Reader", "Story", "Ending", "Path" belong to the first, story-only version of the project and are retired.
