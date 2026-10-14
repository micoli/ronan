import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseMap } from '../map/parseMap'
import { layoutMap } from './layoutMap'

const load = (file: string) => parseMap(JSON.parse(readFileSync(new URL(`../../public/${file}`, import.meta.url), 'utf8')))
const distance = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

describe('layoutMap', () => {
  const map = load('maps/test-30.json')

  it('is deterministic', () => {
    expect(layoutMap(map)).toEqual(layoutMap(map))
  })

  it('places every point inside the radius with finite coordinates', () => {
    const positions = layoutMap(map, 5)
    expect(Object.keys(positions)).toHaveLength(30)
    for (const position of Object.values(positions)) {
      expect(position.every(Number.isFinite)).toBe(true)
      expect(Math.hypot(...position)).toBeLessThanOrEqual(5.001)
    }
  })

  it('keeps connected points closer than unconnected ones on average', () => {
    const positions = layoutMap(map)
    const linked: number[] = []
    const unlinked: number[] = []
    const ids = Object.keys(map.points)
    for (const a of ids) {
      for (const b of ids) {
        if (a >= b) continue
        const connected = map.points[a].connections.some((c) => c.to === b) || map.points[b].connections.some((c) => c.to === a)
        ;(connected ? linked : unlinked).push(distance(positions[a], positions[b]))
      }
    }
    const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length
    expect(mean(linked)).toBeLessThan(mean(unlinked))
  })

  it('keeps pinned positions untouched', () => {
    const pinned = parseMap({
      start: ['a'],
      points: {
        a: { title: 'A', capsules: [{ soundcloudUrl: 'u' }], position: [1, 2, 3], connections: [{ to: 'b' }] },
        b: { title: 'B', capsules: [{ soundcloudUrl: 'u' }] },
      },
    })
    expect(layoutMap(pinned).a).toEqual([1, 2, 3])
  })

  it('handles a single point', () => {
    const single = parseMap({ start: ['a'], points: { a: { title: 'A', capsules: [{ soundcloudUrl: 'u' }] } } })
    expect(layoutMap(single).a.every(Number.isFinite)).toBe(true)
  })
})
