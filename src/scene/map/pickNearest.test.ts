import { describe, expect, it } from 'vitest'
import { pickNearest } from './pickNearest'

const at = (id: string, x: number, y: number, depth = 0) => ({ id, x, y, depth })

describe('pickNearest', () => {
  it('returns the closest candidate within the radius', () => {
    expect(pickNearest([at('a', 100, 100), at('b', 130, 100)], 120, 100, 40)).toBe('b')
  })

  it('returns null when nothing is close enough', () => {
    expect(pickNearest([at('a', 100, 100)], 300, 300, 30)).toBeNull()
  })

  it('prefers the nearer point to the camera when taps are ambiguous', () => {
    expect(pickNearest([at('far', 100, 100, 0.9), at('near', 104, 100, 0.1)], 102, 100, 30)).toBe('near')
  })

  it('handles an empty list', () => {
    expect(pickNearest([], 0, 0, 30)).toBeNull()
  })
})
