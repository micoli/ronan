import { reachablePoints } from './availability'
import type { ExperienceMap } from './types'

export const unexplorablePoints = (map: ExperienceMap): string[] => {
  const connectedMap = { ...map, settings: { ...map.settings, navigation: 'connected' as const } }
  const journey = new Set<string>()
  for (let next = reachablePoints(connectedMap, journey); next.size > 0; next = reachablePoints(connectedMap, journey)) {
    next.forEach((id) => journey.add(id))
  }
  return Object.keys(map.points).filter((id) => !journey.has(id))
}

export const auditMap = (map: ExperienceMap): string[] => {
  const warnings: string[] = []

  unexplorablePoints(map).forEach((id) => warnings.push(`point "${id}" can never be reached: its connections' conditions cannot all be met`))

  const usedFamilies = new Set(Object.values(map.points).flatMap((point) => point.families))
  Object.keys(map.families)
    .filter((id) => !usedFamilies.has(id))
    .forEach((id) => warnings.push(`family "${id}" is declared but no point uses it`))

  for (const point of Object.values(map.points)) {
    point.capsules
      .filter((capsule) => !capsule.soundcloudUrl.includes('soundcloud.com'))
      .forEach((capsule) => warnings.push(`point "${point.id}": "${capsule.soundcloudUrl}" is not a SoundCloud URL`))
  }

  if (map.settings.presentation === 'full' && Object.keys(map.families).length === 0) {
    warnings.push('no families declared: every point will look the same')
  }
  return warnings
}
