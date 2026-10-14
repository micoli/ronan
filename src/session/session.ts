import { openableConnections, reachablePoints } from '../map/availability'
import type { ExperienceMap } from '../map/types'

export interface Session {
  started: boolean
  currentPointId: string | null
  previousPointId: string | null
  journey: string[]
  capsuleIndex: number
  pendingReveal: boolean
}

export interface SavedSession {
  currentPointId: string | null
  previousPointId: string | null
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
  previousPointId: null,
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

export const openablePointIds = (map: ExperienceMap, session: Session): Set<string> => {
  const openable = new Set<string>()
  if (session.previousPointId) openable.add(session.previousPointId)

  if (map.settings.presentation === 'full') {
    session.journey.forEach((id) => openable.add(id))
    reachablePoints(map, revealedJourney(session)).forEach((id) => openable.add(id))
    return openable
  }

  if (session.currentPointId === null) {
    map.start.forEach((id) => openable.add(id))
    return openable
  }
  if (session.pendingReveal) return openable
  openableConnections(map, session.currentPointId, new Set(session.journey)).forEach((connection) => openable.add(connection.to))
  return openable
}

export const branchesOf = (map: ExperienceMap, session: Session): Branch[] => {
  if (map.settings.presentation === 'full') {
    return [...reachablePoints(map, revealedJourney(session))]
      .filter((id) => !session.journey.includes(id))
      .map((id) => ({ id, label: map.points[id].title }))
  }
  if (session.currentPointId === null || session.pendingReveal) return []
  return openableConnections(map, session.currentPointId, new Set(session.journey)).map((connection) => ({
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
          previousPointId: session.currentPointId !== action.pointId ? session.currentPointId : session.previousPointId,
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
    : { currentPointId: session.currentPointId, previousPointId: session.previousPointId, journey: session.journey }

const isKnownPointId = (value: unknown, map: ExperienceMap): value is string => typeof value === 'string' && Boolean(map.points[value])

export const isValidSaved = (value: unknown, map: ExperienceMap): value is SavedSession => {
  if (typeof value !== 'object' || value === null) return false
  const { currentPointId, previousPointId, journey } = value as Partial<SavedSession>
  if (currentPointId !== null && !isKnownPointId(currentPointId, map)) return false
  if (previousPointId !== null && !isKnownPointId(previousPointId, map)) return false
  return Array.isArray(journey) && journey.every((id) => isKnownPointId(id, map))
}
