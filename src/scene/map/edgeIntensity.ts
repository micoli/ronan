import type { PointStatus } from '../../map/availability'

export const edgeIntensity = (from: PointStatus, to: PointStatus): number => {
  if (from === 'closed' || to === 'closed') return 0.05
  if (from === 'visited' && to === 'visited') return 0.8
  if ((from === 'visited' && to === 'reachable') || (from === 'reachable' && to === 'visited')) return 0.55
  return 0.16
}
