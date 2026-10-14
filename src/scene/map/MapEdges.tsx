import { useEffect, useMemo } from 'react'
import { BufferAttribute, BufferGeometry, Color } from 'three'
import type { PointStatus } from '../../map/availability'
import type { ExperienceMap } from '../../map/types'
import type { Vec3 } from '../layoutBranches'
import { edgeIntensity } from './edgeIntensity'

interface MapEdgesProps {
  map: ExperienceMap
  positions: Record<string, Vec3>
  statuses: Record<string, PointStatus>
}

interface Edge {
  from: string
  to: string
}

export function MapEdges({ map, positions, statuses }: MapEdgesProps) {
  const { geometry, edges, colorAttribute } = useMemo(() => {
    const list: Edge[] = []
    const seen = new Set<string>()
    for (const point of Object.values(map.points)) {
      for (const connection of point.connections) {
        const key = [point.id, connection.to].sort().join('>')
        if (seen.has(key)) continue
        seen.add(key)
        list.push({ from: point.id, to: connection.to })
      }
    }
    const vertices = new Float32Array(list.length * 6)
    list.forEach((edge, i) => {
      vertices.set(positions[edge.from], i * 6)
      vertices.set(positions[edge.to], i * 6 + 3)
    })
    const bufferGeometry = new BufferGeometry()
    bufferGeometry.setAttribute('position', new BufferAttribute(vertices, 3))
    const colors = new BufferAttribute(new Float32Array(list.length * 6), 3)
    bufferGeometry.setAttribute('color', colors)
    return { geometry: bufferGeometry, edges: list, colorAttribute: colors }
  }, [map, positions])

  useEffect(() => {
    const color = new Color()
    edges.forEach((edge, i) => {
      const intensity = edgeIntensity(statuses[edge.from], statuses[edge.to])
      const hidden = map.settings.unavailable === 'hidden' && (statuses[edge.from] === 'closed' || statuses[edge.to] === 'closed')
      const tint = map.points[edge.from].families[0]
      color.set(tint ? map.families[tint].color : '#ffffff').multiplyScalar(hidden ? 0 : intensity)
      colorAttribute.setXYZ(i * 2, color.r, color.g, color.b)
      colorAttribute.setXYZ(i * 2 + 1, color.r, color.g, color.b)
    })
    colorAttribute.needsUpdate = true
  }, [edges, statuses, map, colorAttribute])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial vertexColors />
    </lineSegments>
  )
}
