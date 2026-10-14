export interface PickCandidate {
  id: string
  x: number
  y: number
  depth: number
}

const DEPTH_BIAS = 6

export const pickNearest = (candidates: PickCandidate[], x: number, y: number, radius: number): string | null => {
  let best: { id: string; score: number } | null = null
  for (const candidate of candidates) {
    const distance = Math.hypot(candidate.x - x, candidate.y - y)
    if (distance > radius) continue
    const score = distance + candidate.depth * DEPTH_BIAS
    if (!best || score < best.score) best = { id: candidate.id, score }
  }
  return best?.id ?? null
}
