import type { Story } from '../story/types'

export interface Session {
  currentNodeId: string | null
  path: string[]
  choicesRevealed: boolean
}

export type SessionAction =
  | { type: 'start'; startId: string }
  | { type: 'resume'; saved: SavedSession }
  | { type: 'choose'; to: string }
  | { type: 'reveal' }
  | { type: 'restart' }

export interface SavedSession {
  currentNodeId: string
  path: string[]
}

export const initialSession: Session = { currentNodeId: null, path: [], choicesRevealed: false }

export const sessionReducer = (session: Session, action: SessionAction): Session => {
  switch (action.type) {
    case 'start':
      return { currentNodeId: action.startId, path: [], choicesRevealed: false }
    case 'resume':
      return { ...action.saved, choicesRevealed: false }
    case 'choose':
      if (session.currentNodeId === null) return session
      return { currentNodeId: action.to, path: [...session.path, session.currentNodeId], choicesRevealed: false }
    case 'reveal':
      return { ...session, choicesRevealed: true }
    case 'restart':
      return initialSession
  }
}

export const toSaved = (session: Session): SavedSession | null =>
  session.currentNodeId === null ? null : { currentNodeId: session.currentNodeId, path: session.path }

export const isValidSaved = (value: unknown, story: Story): value is SavedSession => {
  if (typeof value !== 'object' || value === null) return false
  const { currentNodeId, path } = value as Partial<SavedSession>
  if (typeof currentNodeId !== 'string' || !story.nodes[currentNodeId]) return false
  return Array.isArray(path) && path.every((id) => typeof id === 'string' && Boolean(story.nodes[id]))
}
