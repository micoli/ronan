import { describe, expect, it } from 'vitest'
import { IndexValidationError, parseIndex } from './parseIndex'

describe('parseIndex', () => {
  it('accepts experiences with an optional description', () => {
    const index = parseIndex({
      experiences: [
        { id: 'a', title: 'A', map: 'a.json', description: 'first' },
        { id: 'b', title: 'B', map: 'b.json' },
      ],
    })
    expect(index.experiences).toEqual([
      { id: 'a', title: 'A', map: 'a.json', description: 'first' },
      { id: 'b', title: 'B', map: 'b.json', description: undefined },
    ])
  })

  it('rejects an empty or missing list', () => {
    expect(() => parseIndex({ experiences: [] })).toThrow(IndexValidationError)
    expect(() => parseIndex(null)).toThrow(IndexValidationError)
  })

  it('rejects incomplete entries and duplicate ids', () => {
    expect(() => parseIndex({ experiences: [{ id: 'a', title: 'A' }] })).toThrow(/needs "id", "title" and "map"/)
    expect(() => parseIndex({ experiences: [{ id: 'a', title: 'A', map: 'x' }, { id: 'a', title: 'B', map: 'y' }] })).toThrow(/duplicate id/)
  })
})
