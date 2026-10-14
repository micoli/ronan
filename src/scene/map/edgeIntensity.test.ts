import { describe, expect, it } from 'vitest'
import { edgeIntensity } from './edgeIntensity'

describe('edgeIntensity', () => {
  it('lights walked edges the most and closed ones the least', () => {
    expect(edgeIntensity('visited', 'visited')).toBeGreaterThan(edgeIntensity('visited', 'reachable'))
    expect(edgeIntensity('visited', 'reachable')).toBeGreaterThan(edgeIntensity('unreached', 'unreached'))
    expect(edgeIntensity('unreached', 'unreached')).toBeGreaterThan(edgeIntensity('visited', 'closed'))
  })

  it('is symmetric', () => {
    expect(edgeIntensity('reachable', 'visited')).toBe(edgeIntensity('visited', 'reachable'))
  })
})
