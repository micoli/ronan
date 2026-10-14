export interface LabelRequest {
  id: string
  x: number
  y: number
  width: number
  height: number
  forced?: boolean
}

export interface LabelPlacement {
  x: number
  y: number
  visible: boolean
}

interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

const GAP = 12
const MARGIN = 6
const SPACING = 3

const overlaps = (a: Rect, b: Rect): boolean =>
  a.left < b.right + SPACING && a.right + SPACING > b.left && a.top < b.bottom + SPACING && a.bottom + SPACING > b.top

const rectAround = (cx: number, cy: number, width: number, height: number): Rect => ({
  left: cx - width / 2,
  top: cy - height / 2,
  right: cx + width / 2,
  bottom: cy + height / 2,
})

export const placeLabels = (
  requests: LabelRequest[],
  viewport: { width: number; height: number },
): Map<string, LabelPlacement> => {
  const placements = new Map<string, LabelPlacement>()
  const placed: Rect[] = []

  for (const request of requests) {
    const { x, y, width, height } = request
    const candidates: [number, number][] = [
      [x, y - height / 2 - GAP],
      [x, y + height / 2 + GAP],
      [x + width / 2 + GAP, y],
      [x - width / 2 - GAP, y],
    ]
    const clamped = candidates.map(([cx, cy]): [number, number] => [
      Math.min(Math.max(cx, width / 2 + MARGIN), viewport.width - width / 2 - MARGIN),
      Math.min(Math.max(cy, height / 2 + MARGIN), viewport.height - height / 2 - MARGIN),
    ])
    const free = clamped.find(([cx, cy]) => !placed.some((rect) => overlaps(rectAround(cx, cy, width, height), rect)))
    const chosen = free ?? (request.forced ? clamped[0] : null)

    if (!chosen) {
      placements.set(request.id, { x, y, visible: false })
      continue
    }
    placed.push(rectAround(chosen[0], chosen[1], width, height))
    placements.set(request.id, { x: chosen[0], y: chosen[1], visible: true })
  }
  return placements
}
