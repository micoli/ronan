import { describe, expect, it } from 'vitest'
import { layoutBranches } from './layoutBranches'

describe('layoutBranches', () => {
  it('returns one position per choice', () => {
    expect(layoutBranches(0, 1.6)).toEqual([])
    expect(layoutBranches(3, 0.5)).toHaveLength(3)
  })

  it('stacks branches vertically in portrait', () => {
    const [first, second] = layoutBranches(2, 0.5)
    expect(second[1]).toBeGreaterThan(first[1])
    expect(Math.abs(first[0])).toBeLessThan(1)
  })

  it('spreads branches horizontally in landscape, centered', () => {
    const [left, , right] = layoutBranches(3, 1.8)
    expect(left[0]).toBe(-right[0])
  })
})
