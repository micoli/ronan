import { parseMap } from './parseMap'
import type { ExperienceMap } from './types'

export const loadMap = async (url: string): Promise<ExperienceMap> => {
  const response = await fetch(url, { cache: 'no-cache' })
  if (!response.ok) throw new Error(`Cannot load map (${response.status}) from ${url}`)
  return parseMap(await response.json())
}
