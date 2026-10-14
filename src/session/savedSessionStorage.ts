import type { ExperienceMap } from '../map/types'
import { isValidSaved, type SavedSession } from './session'

const keyFor = (experienceId: string): string => `ronan:session:${experienceId}`

export const readSavedSession = (map: ExperienceMap, experienceId: string): SavedSession | null => {
  try {
    const raw = localStorage.getItem(keyFor(experienceId))
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isValidSaved(parsed, map) ? parsed : null
  } catch {
    return null
  }
}

export const writeSavedSession = (experienceId: string, saved: SavedSession | null): void => {
  try {
    if (saved === null) localStorage.removeItem(keyFor(experienceId))
    else localStorage.setItem(keyFor(experienceId), JSON.stringify(saved))
  } catch {
    // storage unavailable: progress simply is not remembered
  }
}
