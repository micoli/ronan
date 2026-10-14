import { describe, expect, it } from 'vitest'
import { MapValidationError, parseMap } from './parseMap'

const point = (extra: Record<string, unknown> = {}) => ({
  title: 'T',
  capsules: [{ soundcloudUrl: 'https://soundcloud.com/a/b' }],
  ...extra,
})

const issuesOf = (raw: unknown): string[] => {
  try {
    parseMap(raw)
  } catch (error) {
    if (error instanceof MapValidationError) return error.issues
    throw error
  }
  return []
}

describe('parseMap', () => {
  it('accepts a map with families, hinge, conditions and defaults', () => {
    const map = parseMap({
      start: ['a'],
      families: { mem: { label: 'Mémoire', color: '#aabbcc', shape: 'circle' } },
      points: {
        a: point({ families: ['mem'], hinge: true, connections: [{ to: 'b', label: 'go', requires: [], unless: ['c'] }] }),
        b: point({ connections: [{ to: 'c' }] }),
        c: point({ final: true }),
      },
    })
    expect(map.settings).toEqual({ presentation: 'full', unavailable: 'dimmed' })
    expect(map.points.a.hinge).toBe(true)
    expect(map.points.a.connections[0]).toEqual({ to: 'b', label: 'go', requires: [], unless: ['c'] })
    expect(map.points.b.connections[0].requires).toEqual([])
    expect(map.points.c.final).toBe(true)
  })

  it('accepts a single start id as a string', () => {
    expect(parseMap({ start: 'a', points: { a: point() } }).start).toEqual(['a'])
  })

  it('does not require any final point', () => {
    expect(issuesOf({ start: ['a'], points: { a: point({ connections: [{ to: 'b' }] }), b: point({ connections: [{ to: 'a' }] }) } })).toEqual([])
  })

  it('rejects unknown references', () => {
    const issues = issuesOf({
      start: ['zzz'],
      points: { a: point({ families: ['nope'], connections: [{ to: 'ghost', requires: ['phantom'] }] }) },
    }).join('\n')
    expect(issues).toContain('unknown point "zzz"')
    expect(issues).toContain('unknown family "nope"')
    expect(issues).toContain('unknown point "ghost"')
    expect(issues).toContain('unknown point "phantom"')
  })

  it('rejects points that no start can reach', () => {
    expect(issuesOf({ start: ['a'], points: { a: point(), orphan: point() } }).join()).toContain('"orphan" cannot be reached')
  })

  it('rejects a point without capsule and a bad family', () => {
    const issues = issuesOf({
      start: ['a'],
      families: { bad: { label: 'x', color: 'red', shape: 'blob' } },
      points: { a: { title: 'T', capsules: [] } },
    }).join('\n')
    expect(issues).toContain('needs at least one capsule')
    expect(issues).toContain('"color" must be a hex color')
  })

  it('requires a single start point for a local map', () => {
    const points = { a: point(), b: point() }
    expect(issuesOf({ start: ['a', 'b'], settings: { presentation: 'local' }, points }).join()).toContain('exactly one start')
    expect(issuesOf({ start: ['a', 'b'], settings: { presentation: 'full' }, points })).toEqual([])
  })

  it('rejects an invalid presentation', () => {
    expect(issuesOf({ start: ['a'], settings: { presentation: 'weird' }, points: { a: point() } }).join()).toContain('presentation')
  })
})
