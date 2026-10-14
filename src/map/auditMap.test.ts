import { describe, expect, it } from 'vitest'
import { auditMap, unexplorablePoints } from './auditMap'
import { parseMap } from './parseMap'

const point = (connections: Record<string, unknown>[] = [], extra: Record<string, unknown> = {}) => ({
  title: 'T',
  capsules: [{ soundcloudUrl: 'https://soundcloud.com/a/b' }],
  connections,
  ...extra,
})

describe('auditMap', () => {
  it('reports nothing for a healthy map', () => {
    const map = parseMap({
      start: ['a'],
      families: { f: { label: 'F', color: '#ffffff', shape: 'globe' } },
      points: { a: point([{ to: 'b' }], { families: ['f'] }), b: point([], { families: ['f'] }) },
    })
    expect(auditMap(map)).toEqual([])
  })

  it('finds points locked behind conditions that can never be met', () => {
    const map = parseMap({
      start: ['a'],
      points: {
        a: point([{ to: 'b' }, { to: 'c', requires: ['d'] }]),
        b: point(),
        c: point([{ to: 'd' }]),
        d: point([{ to: 'c' }]),
      },
    })
    expect(unexplorablePoints(map).sort()).toEqual(['c', 'd'])
  })

  it('warns about unused families and non-SoundCloud urls', () => {
    const map = parseMap({
      start: ['a'],
      families: { unused: { label: 'U', color: '#ffffff', shape: 'cube' } },
      points: { a: { title: 'T', capsules: [{ soundcloudUrl: 'https://example.com/x.mp3' }] } },
    })
    const warnings = auditMap(map).join('\n')
    expect(warnings).toContain('family "unused" is declared but no point uses it')
    expect(warnings).toContain('not a SoundCloud URL')
  })
})
