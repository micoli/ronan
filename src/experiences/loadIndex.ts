import { parseIndex } from './parseIndex'
import type { ExperienceEntry, ExperienceIndex } from './types'

export const singleMapUrl: string | undefined = import.meta.env.VITE_MAP_URL || undefined

export const indexUrl: string = import.meta.env.VITE_MAPS_INDEX_URL || `${import.meta.env.BASE_URL}maps/index.json`

export const resolveMapUrl = (entry: ExperienceEntry, base: string = indexUrl): string =>
  new URL(entry.map, new URL(base, window.location.href)).href

export const loadIndex = async (url: string = indexUrl): Promise<ExperienceIndex> => {
  const response = await fetch(url, { cache: 'no-cache' })
  if (!response.ok) throw new Error(`Cannot load the experiences index (${response.status}) from ${url}`)
  return parseIndex(await response.json())
}
