import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseIndex } from '../experiences/parseIndex'
import { reachablePoints } from './availability'
import { parseMap } from './parseMap'

const PUBLIC_DIR = new URL('../../public/', import.meta.url)

const mapFiles = readdirSync(new URL('maps/', PUBLIC_DIR))
  .filter((name) => name !== 'index.json')
  .map((name) => `maps/${name}`)

describe('experiences index', () => {
  const index = parseIndex(JSON.parse(readFileSync(new URL('maps/index.json', PUBLIC_DIR), 'utf8')))

  it('lists only maps that exist and are valid', () => {
    for (const entry of index.experiences) {
      expect(mapFiles).toContain(`maps/${entry.map}`)
    }
  })

  it('lists every map file', () => {
    expect(index.experiences.map((entry) => `maps/${entry.map}`).sort()).toEqual([...mapFiles].sort())
  })
})

describe.each(mapFiles)('sample map %s', (file) => {
  const map = parseMap(JSON.parse(readFileSync(new URL(file, PUBLIC_DIR), 'utf8')))

  it('is valid', () => {
    expect(Object.keys(map.points).length).toBeGreaterThan(0)
  })

  it('can be fully explored by visiting whatever becomes reachable', () => {
    const connectedMap = { ...map, settings: { ...map.settings, navigation: 'connected' as const } }
    const journey = new Set<string>()
    for (let next = reachablePoints(connectedMap, journey); next.size > 0; next = reachablePoints(connectedMap, journey)) {
      next.forEach((id) => journey.add(id))
    }
    expect([...journey].sort()).toEqual(Object.keys(map.points).sort())
  })
})

describe('test-30 map', () => {
  const map = parseMap(JSON.parse(readFileSync(new URL('maps/test-30.json', PUBLIC_DIR), 'utf8')))

  it('has 30 points, 5 families and 5 hinges', () => {
    expect(Object.keys(map.points)).toHaveLength(30)
    expect(Object.keys(map.families)).toHaveLength(5)
    expect(Object.values(map.points).filter((point) => point.hinge)).toHaveLength(5)
  })

  it('gates the last intimate point behind two other families', () => {
    const gated = map.points.i5.connections.find((connection) => connection.to === 'i6')
    expect(gated?.requires).toEqual(['v3', 'n3'])
    expect(map.points.i4.connections.find((connection) => connection.to === 'i6')?.requires).toEqual(['v3', 'n3'])
  })
})
