import type { PointStatus } from '../../map/availability'

export const edgeIntensity = (from: PointStatus, to: PointStatus): number => {
  if (from === 'hidden' || to === 'hidden') return 0
  if (from === 'passed' || to === 'passed') return from === 'visited' || to === 'visited' ? 0.3 : 0
  if (from === 'closed' || to === 'closed') return 0.05
  if (from === 'visited' && to === 'visited') return 0.8
  if ((from === 'visited' && to === 'reachable') || (from === 'reachable' && to === 'visited')) return 0.55
  return 0.08
}
