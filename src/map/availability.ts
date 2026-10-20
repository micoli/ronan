import type { Connection, ExperienceMap } from './types'

export type PointStatus = 'visited' | 'reachable' | 'closed' | 'unreached' | 'hidden' | 'passed'

export type Journey = ReadonlySet<string>

export const isConnectionOpen = (connection: Connection, journey: Journey): boolean =>
  connection.requires.every((id) => journey.has(id)) && !connection.unless.some((id) => journey.has(id))

const isConnectionRuledOut = (connection: Connection, journey: Journey): boolean =>
  connection.unless.some((id) => journey.has(id))

const connectedPoints = (map: ExperienceMap, journey: Journey): Set<string> => {
  const reachable = new Set<string>(map.start.filter((id) => !journey.has(id)))
  for (const id of journey) {
    for (const connection of map.points[id]?.connections ?? []) {
      if (!journey.has(connection.to) && isConnectionOpen(connection, journey)) reachable.add(connection.to)
    }
  }
  return reachable
}

const storyPoints = (map: ExperienceMap, journey: Journey): Set<string> => {
  const tip = [...journey].at(-1)
  if (tip === undefined) return new Set(map.start)
  return new Set(openableConnections(map, tip, journey).map((connection) => connection.to).filter((id) => !journey.has(id)))
}

export const reachablePoints = (map: ExperienceMap, journey: Journey): Set<string> => {
  if (map.settings.navigation === 'story') return storyPoints(map, journey)
  const connected = connectedPoints(map, journey)
  if (map.settings.navigation === 'connected') return connected
  const closed = closedPoints(map, journey, connected)
  return new Set(Object.keys(map.points).filter((id) => !journey.has(id) && !closed.has(id)))
}

const closedPoints = (map: ExperienceMap, journey: Journey, reachable: Set<string>): Set<string> => {
  const inbound = new Map<string, Connection[]>()
  for (const point of Object.values(map.points)) {
    for (const connection of point.connections) inbound.set(connection.to, [...(inbound.get(connection.to) ?? []), connection])
  }
  const closed = new Set<string>()
  for (const id of Object.keys(map.points)) {
    if (journey.has(id) || reachable.has(id) || map.start.includes(id)) continue
    const connections = inbound.get(id) ?? []
    if (connections.length > 0 && connections.every((connection) => isConnectionRuledOut(connection, journey))) closed.add(id)
  }
  return closed
}

export const pointStatuses = (map: ExperienceMap, journey: Journey): Record<string, PointStatus> => {
  const reachable = reachablePoints(map, journey)
  const closed = closedPoints(map, journey, reachable)
  const statuses: Record<string, PointStatus> = {}
  for (const id of Object.keys(map.points)) {
    if (journey.has(id)) statuses[id] = 'visited'
    else if (reachable.has(id)) statuses[id] = 'reachable'
    else if (closed.has(id)) statuses[id] = 'closed'
    else statuses[id] = 'unreached'
  }
  return statuses
}

export const openableConnections = (map: ExperienceMap, fromId: string, journey: Journey): Connection[] =>
  (map.points[fromId]?.connections ?? []).filter((connection) => isConnectionOpen(connection, journey))

export const isExplorationFinished = (map: ExperienceMap, journey: Journey, currentId: string | null): boolean => {
  if (journey.size === 0 || currentId === null) return false
  if (map.points[currentId]?.final) return true
  return reachablePoints(map, journey).size === 0
}
