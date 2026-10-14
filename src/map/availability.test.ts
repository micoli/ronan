import { describe, expect, it } from 'vitest'
import { isExplorationFinished, openableConnections, pointStatuses, reachablePoints } from './availability'
import { parseMap } from './parseMap'

const point = (connections: Record<string, unknown>[] = [], extra: Record<string, unknown> = {}) => ({
  title: 'T',
  capsules: [{ soundcloudUrl: 'u' }],
  connections,
  ...extra,
})

const map = parseMap({
  start: ['a'],
  points: {
    a: point([{ to: 'b' }, { to: 'c' }]),
    b: point([{ to: 'd', requires: ['c'] }, { to: 'e', unless: ['c'] }]),
    c: point([{ to: 'e', unless: ['b'] }]),
    d: point(),
    e: point([], { final: true }),
  },
})

const journey = (...ids: string[]) => new Set(ids)

describe('reachablePoints', () => {
  it('offers only the start points at the beginning', () => {
    expect([...reachablePoints(map, journey())]).toEqual(['a'])
  })

  it('reaches neighbours of any visited point, not only the latest', () => {
    expect([...reachablePoints(map, journey('a', 'b'))].sort()).toEqual(['c', 'e'])
  })

  it('opens a connection once its required points are visited', () => {
    expect(reachablePoints(map, journey('a', 'b')).has('d')).toBe(false)
    expect(reachablePoints(map, journey('a', 'b', 'c')).has('d')).toBe(true)
  })

  it('closes a connection once an "unless" point is visited', () => {
    expect(reachablePoints(map, journey('a', 'b')).has('e')).toBe(true)
    expect(reachablePoints(map, journey('a', 'b', 'c')).has('e')).toBe(false)
  })
})

describe('pointStatuses', () => {
  it('labels visited, reachable, unreached and closed points', () => {
    expect(pointStatuses(map, journey('a'))).toEqual({ a: 'visited', b: 'reachable', c: 'reachable', d: 'unreached', e: 'unreached' })
    expect(pointStatuses(map, journey('a', 'b', 'c'))).toMatchObject({ d: 'reachable', e: 'closed' })
  })
})

describe('openableConnections', () => {
  it('lists the open connections of a point', () => {
    expect(openableConnections(map, 'b', journey('a', 'b')).map((connection) => connection.to)).toEqual(['e'])
  })
})

describe('isExplorationFinished', () => {
  it('is false before anything is opened', () => {
    expect(isExplorationFinished(map, journey(), null)).toBe(false)
  })

  it('ends on a final point', () => {
    expect(isExplorationFinished(map, journey('a', 'b', 'e'), 'e')).toBe(true)
  })

  it('ends when nothing reachable remains', () => {
    expect(isExplorationFinished(map, journey('a', 'b', 'c', 'd'), 'd')).toBe(true)
    expect(isExplorationFinished(map, journey('a', 'b'), 'b')).toBe(false)
  })

  it('continues while something is reachable', () => {
    expect(isExplorationFinished(map, journey('a'), 'a')).toBe(false)
  })
})
