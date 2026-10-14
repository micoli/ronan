import { describe, expect, it } from 'vitest'
import { parseMap } from '../map/parseMap'
import { branchesOf, createSessionReducer, initialSession, isValidSaved, openablePointIds, toSaved, type Session } from './session'

const point = (connections: Record<string, unknown>[] = [], extra: Record<string, unknown> = {}) => ({
  title: 'T',
  capsules: [{ soundcloudUrl: 'u1' }, { soundcloudUrl: 'u2' }],
  connections,
  ...extra,
})

const rawMap = (presentation: 'full' | 'local') => ({
  settings: { presentation },
  start: ['a'],
  points: {
    a: point([{ to: 'b', label: 'go b' }, { to: 'c' }]),
    b: point([{ to: 'd', requires: ['c'] }]),
    c: point([{ to: 'd' }]),
    d: point([], { final: true }),
  },
})

const full = parseMap(rawMap('full'))
const local = parseMap(rawMap('local'))
const run = (map: typeof full, ...actions: Parameters<ReturnType<typeof createSessionReducer>>[1][]): Session =>
  actions.reduce(createSessionReducer(map), initialSession)

describe('session reducer', () => {
  it('only opens reachable points', () => {
    expect(run(full, { type: 'open', pointId: 'd' })).toBe(initialSession)
    expect(run(full, { type: 'open', pointId: 'a' }).currentPointId).toBe('a')
  })

  it('records the journey as a set and remembers the previous point', () => {
    const session = run(full, { type: 'open', pointId: 'a' }, { type: 'reveal' }, { type: 'open', pointId: 'b' }, { type: 'open', pointId: 'a' })
    expect(session.journey).toEqual(['a', 'b'])
    expect(session.currentPointId).toBe('a')
    expect(session.previousPointId).toBe('b')
    expect(session.pendingReveal).toBe(false)
  })

  it('holds back new reachability until the reveal', () => {
    const opened = run(full, { type: 'open', pointId: 'a' })
    expect(opened.pendingReveal).toBe(true)
    expect(branchesOf(full, opened)).toEqual([])
    const revealed = createSessionReducer(full)(opened, { type: 'reveal' })
    expect(branchesOf(full, revealed).map((branch) => branch.id).sort()).toEqual(['b', 'c'])
  })

  it('opens a hinge once its requirements are visited, from any visited point', () => {
    const session = run(full, { type: 'open', pointId: 'a' }, { type: 'reveal' }, { type: 'open', pointId: 'b' }, { type: 'reveal' })
    expect(openablePointIds(full, session).has('d')).toBe(false)
    const withC = createSessionReducer(full)(createSessionReducer(full)(session, { type: 'open', pointId: 'c' }), { type: 'reveal' })
    expect(openablePointIds(full, withC).has('d')).toBe(true)
  })

  it('selects capsules within bounds', () => {
    const opened = run(full, { type: 'open', pointId: 'a' })
    expect(createSessionReducer(full)(opened, { type: 'selectCapsule', index: 1 }).capsuleIndex).toBe(1)
    expect(createSessionReducer(full)(opened, { type: 'selectCapsule', index: 5 })).toBe(opened)
  })

  it('restarts to the initial session', () => {
    expect(run(full, { type: 'open', pointId: 'a' }, { type: 'restart' })).toEqual(initialSession)
  })
})

describe('local presentation', () => {
  it('shows only the current point connections, with their labels, after the reveal', () => {
    const opened = run(local, { type: 'open', pointId: 'a' })
    expect(branchesOf(local, opened)).toEqual([])
    const revealed = createSessionReducer(local)(opened, { type: 'reveal' })
    expect(branchesOf(local, revealed)).toEqual([
      { id: 'b', label: 'go b' },
      { id: 'c', label: 'T' },
    ])
  })

  it('offers the start points before anything is opened', () => {
    expect([...openablePointIds(local, initialSession)]).toEqual(['a'])
  })
})

describe('saved session', () => {
  it('round-trips and rejects unknown points', () => {
    const session = run(full, { type: 'open', pointId: 'a' })
    const saved = toSaved(session)
    expect(saved).toEqual({ currentPointId: 'a', previousPointId: null, journey: ['a'] })
    expect(isValidSaved(saved, full)).toBe(true)
    expect(isValidSaved({ currentPointId: 'zzz', previousPointId: null, journey: [] }, full)).toBe(false)
    expect(toSaved(initialSession)).toBeNull()
  })
})
