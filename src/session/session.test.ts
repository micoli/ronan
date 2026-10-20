import { describe, expect, it } from 'vitest'
import { parseMap } from '../map/parseMap'
import { branchesOf, statusesOf, createSessionReducer, initialSession, isValidSaved, openablePointIds, toSaved, type Session } from './session'

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

  it('only offers the chosen continuation when replaying a visited point', () => {
    const afterB = run(full, { type: 'open', pointId: 'a' }, { type: 'reveal' }, { type: 'open', pointId: 'b' }, { type: 'reveal' })
    expect(openablePointIds(full, afterB).has('c')).toBe(true)
    const backOnA = createSessionReducer(full)(afterB, { type: 'open', pointId: 'a' })
    expect(backOnA.pendingReveal).toBe(false)
    expect([...openablePointIds(full, backOnA)]).toEqual(['b'])
    expect(branchesOf(full, backOnA).map((branch) => branch.id)).toEqual(['b'])
    expect(createSessionReducer(full)(backOnA, { type: 'open', pointId: 'c' })).toBe(backOnA)
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

describe('statusesOf', () => {
  it('keeps the new reachability hidden until the reveal', () => {
    const opened = run(full, { type: 'open', pointId: 'a' })
    expect(statusesOf(full, opened)).toMatchObject({ a: 'visited', b: 'unreached', c: 'unreached' })
    const revealed = createSessionReducer(full)(opened, { type: 'reveal' })
    expect(statusesOf(full, revealed)).toMatchObject({ a: 'visited', b: 'reachable', c: 'reachable', d: 'unreached' })
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
    expect(saved).toEqual({ currentPointId: 'a', journey: ['a'] })
    expect(isValidSaved(saved, full)).toBe(true)
    expect(isValidSaved({ currentPointId: 'zzz', journey: [] }, full)).toBe(false)
    expect(toSaved(initialSession)).toBeNull()
  })
})

describe('story navigation', () => {
  const story = parseMap({
    settings: { navigation: 'story' },
    start: ['s1', 's2'],
    points: {
      s1: { title: 'S1', capsules: [{ soundcloudUrl: 'u' }], connections: [{ to: 'a' }, { to: 'b' }] },
      s2: { title: 'S2', capsules: [{ soundcloudUrl: 'u' }], connections: [{ to: 'b' }] },
      a: { title: 'A', capsules: [{ soundcloudUrl: 'u' }], connections: [] },
      b: { title: 'B', capsules: [{ soundcloudUrl: 'u' }], connections: [] },
    },
  })
  const reduce = createSessionReducer(story)

  it('shows only the start points at first', () => {
    expect(statusesOf(story, initialSession)).toEqual({ s1: 'reachable', s2: 'reachable', a: 'hidden', b: 'hidden' })
  })

  it('greys out the unchosen starts and withholds the destinations until the reveal', () => {
    const opened = reduce(initialSession, { type: 'open', pointId: 's1' })
    expect(statusesOf(story, opened)).toEqual({ s1: 'visited', s2: 'passed', a: 'hidden', b: 'hidden' })
    const revealed = reduce(opened, { type: 'reveal' })
    expect(statusesOf(story, revealed)).toEqual({ s1: 'visited', s2: 'passed', a: 'reachable', b: 'reachable' })
  })

  it('refuses to rewrite the story once a destination was chosen', () => {
    const afterA = [{ type: 'open', pointId: 's1' }, { type: 'reveal' }, { type: 'open', pointId: 'a' }, { type: 'reveal' }].reduce(
      (state, action) => reduce(state, action as never),
      initialSession,
    )
    const back = reduce(afterA, { type: 'open', pointId: 's1' })
    expect([...openablePointIds(story, back)]).toEqual(['a'])
    expect(reduce(back, { type: 'open', pointId: 'b' })).toBe(back)
    expect(statusesOf(story, back)).toMatchObject({ s1: 'visited', a: 'visited', b: 'passed', s2: 'passed' })
  })
})
