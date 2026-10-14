import type { ExperienceEntry, ExperienceIndex } from './types'

export class IndexValidationError extends Error {
  constructor(readonly issues: string[]) {
    super(`Invalid experiences index:\n- ${issues.join('\n- ')}`)
  }
}

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim() !== ''

export const parseIndex = (raw: unknown): ExperienceIndex => {
  const list = typeof raw === 'object' && raw !== null ? (raw as { experiences?: unknown }).experiences : undefined
  if (!Array.isArray(list) || list.length === 0) throw new IndexValidationError(['"experiences" must be a non-empty array'])

  const issues: string[] = []
  const seen = new Set<string>()
  const experiences: ExperienceEntry[] = []

  list.forEach((item: unknown, position) => {
    const entry = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>
    if (!isNonEmptyString(entry.id) || !isNonEmptyString(entry.title) || !isNonEmptyString(entry.map)) {
      issues.push(`experience #${position}: needs "id", "title" and "map"`)
      return
    }
    if (seen.has(entry.id)) {
      issues.push(`experience "${entry.id}": duplicate id`)
      return
    }
    seen.add(entry.id)
    experiences.push({
      id: entry.id,
      title: entry.title,
      map: entry.map,
      description: isNonEmptyString(entry.description) ? entry.description : undefined,
    })
  })

  if (issues.length > 0) throw new IndexValidationError(issues)
  return { experiences }
}
