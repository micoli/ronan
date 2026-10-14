import type { Story } from '../story/types'
import { isValidSaved, type SavedSession } from './session'

const KEY = 'ronan:session'

export const readSavedSession = (story: Story): SavedSession | null => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isValidSaved(parsed, story) ? parsed : null
  } catch {
    return null
  }
}

export const writeSavedSession = (saved: SavedSession | null): void => {
  try {
    if (saved === null) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, JSON.stringify(saved))
  } catch {
    // storage unavailable: progress simply is not remembered
  }
}
