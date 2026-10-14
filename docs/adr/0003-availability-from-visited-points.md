# Point availability is decided by the set of visited Points, nothing richer

A Connection may carry `requires` (Points that must already be in the Journey) and `unless` (the Connection closes once one of these Points is in the Journey). A Point is reachable when it is adjacent to any Point of the Journey and one open Connection leads to it. How a Closed Point is drawn (`hidden`, `dimmed`, later `locked`) is a Map setting, not code.

We rejected two alternatives. Adjacency only could not express "opens" and "closes", which the project needs. State variables (counters, flags, per-Point effects) are more expressive but add scripting, harder validation and a role-playing feel the project explicitly rejects ("not a video game, not an escape game").

Reaching from any visited Point (a frontier) rather than only from the latest one lets the Visitor leave a sound and rebound elsewhere while keeping a perceptible progression. Fully free navigation was rejected because Connections would become decorative.

Because rules only read the visited set, they stay declarative in the data file and can be checked when loading and by a validation command. If richer rules are ever needed, this decision is the one to revisit.
