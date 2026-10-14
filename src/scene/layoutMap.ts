import type { ExperienceMap } from '../map/types'
import type { Vec3 } from './layoutBranches'

const ITERATIONS = 320
const FAMILY_COHESION = 0.04
const EPSILON = 0.01

const seededRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const hash = (text: string): number => {
  let value = 2166136261
  for (let i = 0; i < text.length; i++) value = Math.imul(value ^ text.charCodeAt(i), 16777619)
  return value >>> 0
}

const length = (v: Vec3): number => Math.hypot(v[0], v[1], v[2])

export const layoutMap = (map: ExperienceMap, radius = 5): Record<string, Vec3> => {
  const ids = Object.keys(map.points)
  const random = seededRandom(hash(ids.join('|')))
  const index = new Map(ids.map((id, i) => [id, i]))
  const positions: Vec3[] = ids.map((id) => {
    const pinned = map.points[id].position
    if (pinned) return [...pinned]
    const direction: Vec3 = [random() - 0.5, random() - 0.5, random() - 0.5]
    const scale = (radius * 0.8 * random()) / Math.max(length(direction), EPSILON)
    return [direction[0] * scale, direction[1] * scale, direction[2] * scale]
  })
  const pinned = ids.map((id) => Boolean(map.points[id].position))

  const edges: [number, number][] = []
  const seen = new Set<string>()
  for (const id of ids) {
    for (const connection of map.points[id].connections) {
      const a = index.get(id) as number
      const b = index.get(connection.to) as number
      const key = a < b ? `${a}-${b}` : `${b}-${a}`
      if (a === b || seen.has(key)) continue
      seen.add(key)
      edges.push([a, b])
    }
  }

  const familyMembers = new Map<string, number[]>()
  ids.forEach((id, i) => map.points[id].families.forEach((family) => familyMembers.set(family, [...(familyMembers.get(family) ?? []), i])))

  const k = (radius * 1.1) / Math.cbrt(Math.max(ids.length, 1))

  for (let iteration = 0; iteration < ITERATIONS; iteration++) {
    const temperature = radius * 0.12 * (1 - iteration / ITERATIONS) + 0.005
    const displacement: Vec3[] = ids.map(() => [0, 0, 0])

    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const dx = positions[i][0] - positions[j][0]
        const dy = positions[i][1] - positions[j][1]
        const dz = positions[i][2] - positions[j][2]
        const distance = Math.max(Math.hypot(dx, dy, dz), EPSILON)
        const force = (k * k) / distance / distance
        for (const [node, sign] of [[i, 1], [j, -1]] as const) {
          displacement[node][0] += dx * force * sign
          displacement[node][1] += dy * force * sign
          displacement[node][2] += dz * force * sign
        }
      }
    }

    for (const [a, b] of edges) {
      const dx = positions[a][0] - positions[b][0]
      const dy = positions[a][1] - positions[b][1]
      const dz = positions[a][2] - positions[b][2]
      const distance = Math.max(Math.hypot(dx, dy, dz), EPSILON)
      const force = distance / k
      displacement[a][0] -= dx * force
      displacement[a][1] -= dy * force
      displacement[a][2] -= dz * force
      displacement[b][0] += dx * force
      displacement[b][1] += dy * force
      displacement[b][2] += dz * force
    }

    for (const members of familyMembers.values()) {
      if (members.length < 2) continue
      const centroid: Vec3 = [0, 0, 0]
      members.forEach((m) => positions[m].forEach((value, axis) => (centroid[axis] += value / members.length)))
      members.forEach((m) => {
        for (let axis = 0; axis < 3; axis++) displacement[m][axis] += (centroid[axis] - positions[m][axis]) * FAMILY_COHESION * k
      })
    }

    ids.forEach((_, i) => {
      if (pinned[i]) return
      const magnitude = Math.max(length(displacement[i]), EPSILON)
      const step = Math.min(magnitude, temperature)
      for (let axis = 0; axis < 3; axis++) positions[i][axis] += (displacement[i][axis] / magnitude) * step
    })
  }

  const free = ids.map((_, i) => i).filter((i) => !pinned[i])
  const center: Vec3 = [0, 0, 0]
  free.forEach((i) => positions[i].forEach((value, axis) => (center[axis] += value / free.length)))
  free.forEach((i) => positions[i].forEach((_, axis) => (positions[i][axis] -= center[axis])))
  const farthest = Math.max(...free.map((i) => length(positions[i])), EPSILON)
  if (farthest > radius) free.forEach((i) => positions[i].forEach((_, axis) => (positions[i][axis] *= radius / farthest)))

  return Object.fromEntries(ids.map((id, i) => [id, positions[i]]))
}
