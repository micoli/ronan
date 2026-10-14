import { describe, expect, it } from 'vitest'
import { placeLabels, type LabelRequest } from './placeLabels'

const viewport = { width: 400, height: 800 }
const label = (id: string, x: number, y: number, extra: Partial<LabelRequest> = {}): LabelRequest => ({ id, x, y, width: 120, height: 28, ...extra })

describe('placeLabels', () => {
  it('puts a lone label above its anchor', () => {
    const placement = placeLabels([label('a', 200, 400)], viewport).get('a')
    expect(placement).toEqual({ x: 200, y: 400 - 14 - 12, visible: true })
  })

  it('never lets two visible labels overlap', () => {
    const requests = Array.from({ length: 8 }, (_, i) => label(`p${i}`, 180 + i * 6, 400 + i * 4))
    const placements = placeLabels(requests, viewport)
    const visible = requests.filter((request) => placements.get(request.id)?.visible)
    expect(visible.length).toBeGreaterThan(1)
    for (const a of visible) {
      for (const b of visible) {
        if (a.id >= b.id) continue
        const pa = placements.get(a.id)!
        const pb = placements.get(b.id)!
        const separated = Math.abs(pa.x - pb.x) >= 120 || Math.abs(pa.y - pb.y) >= 28
        expect(separated).toBe(true)
      }
    }
  })

  it('hides the labels that find no room, unless forced', () => {
    const crowded = Array.from({ length: 12 }, (_, i) => label(`p${i}`, 200, 400))
    const forced = label('hovered', 200, 400, { forced: true })
    const placements = placeLabels([forced, ...crowded], viewport)
    expect(placements.get('hovered')?.visible).toBe(true)
    expect(crowded.some((request) => !placements.get(request.id)?.visible)).toBe(true)
  })

  it('keeps labels inside the viewport', () => {
    const placement = placeLabels([label('edge', 2, 3)], viewport).get('edge')!
    expect(placement.x).toBeGreaterThanOrEqual(60)
    expect(placement.y).toBeGreaterThanOrEqual(14)
  })

  it('forces a label even when everything collides', () => {
    const blockers = Array.from({ length: 6 }, (_, i) => label(`b${i}`, 200, 400))
    const placements = placeLabels([...blockers, label('forced', 200, 400, { forced: true })], viewport)
    expect(placements.get('forced')?.visible).toBe(true)
  })
})
