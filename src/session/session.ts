import { openableConnections, pointStatuses, reachablePoints, type PointStatus } from '../map/availability'
import type { ExperienceMap } from '../map/types'

export interface Session {
  started: boolean
  currentPointId: string | null
  journey: string[]
  capsuleIndex: number
  pendingReveal: boolean
}

export interface SavedSession {
  currentPointId: string | null
  journey: string[]
}

export type SessionAction =
  | { type: 'begin' }
  | { type: 'resume'; saved: SavedSession }
  | { type: 'open'; pointId: string }
  | { type: 'selectCapsule'; index: number }
  | { type: 'reveal' }
  | { type: 'restart' }

export const initialSession: Session = {
  started: false,
  currentPointId: null,
  journey: [],
  capsuleIndex: 0,
  pendingReveal: false,
}

export interface Branch {
  id: string
  label: string
}

const revealedJourney = (session: Session): Set<string> => {
  const hidden = session.pendingReveal ? session.currentPointId : null
  return new Set(session.journey.filter((id) => id !== hidden))
}

export const previousPointOf = (session: Session): string | null => {
  const index = session.currentPointId === null ? -1 : session.journey.indexOf(session.currentPointId)
  return index > 0 ? session.journey[index - 1] : null
}

const nextPointOf = (session: Session): string | null => {
  const index = session.currentPointId === null ? -1 : session.journey.indexOf(session.currentPointId)
  return index >= 0 && index < session.journey.length - 1 ? session.journey[index + 1] : null
}

const isReplaying = (session: Session): boolean => nextPointOf(session) !== null

const choicesOf = (map: ExperienceMap, session: Session): Set<string> => {
  if (map.settings.navigation !== 'story') return reachablePoints(map, revealedJourney(session))
  return session.pendingReveal ? new Set() : reachablePoints(map, new Set(session.journey))
}

export const openablePointIds = (map: ExperienceMap, session: Session): Set<string> => {
  const openable = new Set<string>()
  const previous = previousPointOf(session)
  if (previous) openable.add(previous)

  const next = nextPointOf(session)
  if (next) {
    openable.add(next)
    return openable
  }

  if (map.settings.presentation === 'full') {
    choicesOf(map, session).forEach((id) => openable.add(id))
    return openable
  }

  if (session.currentPointId === null) {
    map.start.forEach((id) => openable.add(id))
    return openable
  }
  if (session.pendingReveal) return openable
  openableConnections(map, session.currentPointId, new Set(session.journey))
    .filter((connection) => !session.journey.includes(connection.to))
    .forEach((connection) => openable.add(connection.to))
  return openable
}

const passedChoicesOf = (map: ExperienceMap, session: Session): string[] => {
  const passed = session.journey.length === 0 ? [] : map.start.filter((id) => !session.journey.includes(id))
  session.journey.slice(0, -1).forEach((id, index) => {
    const journeyThen = new Set(session.journey.slice(0, index + 1))
    openableConnections(map, id, journeyThen).forEach((connection) => passed.push(connection.to))
  })
  return passed.filter((id) => !session.journey.includes(id))
}

export const statusesOf = (map: ExperienceMap, session: Session): Record<string, PointStatus> => {
  const isStory = map.settings.navigation === 'story'
  const statuses = pointStatuses(map, isStory ? new Set(session.journey) : revealedJourney(session))
  const withholdChoices = isReplaying(session) || (isStory && session.pendingReveal)
  for (const id of Object.keys(statuses)) {
    if (statuses[id] === 'reachable' && withholdChoices) statuses[id] = 'unreached'
    if (isStory && statuses[id] !== 'reachable' && statuses[id] !== 'visited') statuses[id] = 'hidden'
  }
  session.journey.forEach((id) => (statuses[id] = 'visited'))
  if (isStory) passedChoicesOf(map, session).forEach((id) => statuses[id] !== 'reachable' && statuses[id] !== 'visited' && (statuses[id] = 'passed'))
  return statuses
}

export const branchesOf = (map: ExperienceMap, session: Session): Branch[] => {
  if (session.pendingReveal) return []
  const next = nextPointOf(session)
  if (next) return [{ id: next, label: map.points[next].title }]
  if (session.currentPointId === null) {
    if (map.settings.presentation !== 'full') return []
    return map.start.map((id) => ({ id, label: map.points[id].title }))
  }
  return openableConnections(map, session.currentPointId, new Set(session.journey))
    .filter((connection) => !session.journey.includes(connection.to))
    .map((connection) => ({
      id: connection.to,
      label: connection.label ?? map.points[connection.to].title,
    }))
}

export const createSessionReducer =
  (map: ExperienceMap) =>
  (session: Session, action: SessionAction): Session => {
    switch (action.type) {
      case 'begin':
        return { ...session, started: true }
      case 'resume':
        return { ...action.saved, started: true, capsuleIndex: 0, pendingReveal: false }
      case 'open': {
        if (!openablePointIds(map, session).has(action.pointId)) return session
        const isNew = !session.journey.includes(action.pointId)
        return {
          started: true,
          currentPointId: action.pointId,
          journey: isNew ? [...session.journey, action.pointId] : session.journey,
          capsuleIndex: 0,
          pendingReveal: isNew,
        }
      }
      case 'selectCapsule': {
        const capsules = session.currentPointId ? map.points[session.currentPointId].capsules : []
        if (action.index < 0 || action.index >= capsules.length) return session
        return { ...session, capsuleIndex: action.index }
      }
      case 'reveal':
        return session.pendingReveal ? { ...session, pendingReveal: false } : session
      case 'restart':
        return initialSession
    }
  }

export const toSaved = (session: Session): SavedSession | null =>
  session.journey.length === 0
    ? null
    : { currentPointId: session.currentPointId, journey: session.journey }

const isKnownPointId = (value: unknown, map: ExperienceMap): value is string => typeof value === 'string' && Boolean(map.points[value])

export const isValidSaved = (value: unknown, map: ExperienceMap): value is SavedSession => {
  if (typeof value !== 'object' || value === null) return false
  const { currentPointId, journey } = value as Partial<SavedSession>
  if (currentPointId !== null && !isKnownPointId(currentPointId, map)) return false
  return Array.isArray(journey) && journey.every((id) => isKnownPointId(id, map))
}
