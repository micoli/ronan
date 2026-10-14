import { parseMap } from './parseMap'
import type { ExperienceMap } from './types'

export const mapUrl: string = import.meta.env.VITE_MAP_URL || `${import.meta.env.BASE_URL}map.json`

export const loadMap = async (url: string = mapUrl): Promise<ExperienceMap> => {
  const response = await fetch(url, { cache: 'no-cache' })
  if (!response.ok) throw new Error(`Cannot load map (${response.status}) from ${url}`)
  return parseMap(await response.json())
}
