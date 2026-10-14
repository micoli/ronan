import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import type { PointStatus } from '../../map/availability'
import type { Family, Point } from '../../map/types'
import type { Vec3 } from '../layoutBranches'
import { FamilyRing } from './FamilyRing'
import { HingeStar } from './HingeStar'
import { PointShape } from './PointShape'

interface MapPointProps {
  point: Point
  position: Vec3
  families: Family[]
  status: PointStatus
  current: boolean
  emphasised: boolean
}

const BASE_SIZE = 0.17
const DOT_SIZE = 0.055
const UNDISCOVERED_STAR_RADIUS = 0.3
const CLOSED_COLOR = '#808080'

const OPACITY: Record<PointStatus, number> = { visited: 1, reachable: 1, unreached: 0.35, closed: 0.12 }

export function MapPoint({ point, position, families, status, current, emphasised }: MapPointProps) {
  const group = useRef<Group>(null)
  const detailed = status === 'visited' || status === 'reachable' || emphasised
  const color = status === 'closed' ? CLOSED_COLOR : (families[0]?.color ?? '#ffffff')
  const size = BASE_SIZE * (point.hinge ? 1.3 : 1) * (current ? 1.6 : 1) * (emphasised ? 1.5 : 1)

  useFrame(({ clock }, delta) => {
    if (!group.current) return
    if (detailed) group.current.rotation.y += delta * (current ? 0.6 : 0.3)
    const pulse = status === 'reachable' ? 1 + 0.2 * Math.sin(clock.elapsedTime * 3 + position[0]) : 1
    group.current.scale.setScalar((detailed ? size : DOT_SIZE) * pulse)
  })

  return (
    <>
      <group position={position}>
        <group ref={group}>
          {detailed ? (
            <PointShape shape={families[0]?.shape ?? 'globe'} color={color} core={status === 'visited'} opacity={OPACITY[status]} />
          ) : (
            <mesh>
              <sphereGeometry args={[1, 6, 6]} />
              <meshBasicMaterial color={color} transparent opacity={OPACITY[status]} />
            </mesh>
          )}
        </group>
      </group>
      {detailed && families.length > 1 && (
        <FamilyRing position={position} colors={families.map((family) => family.color)} radius={size * 1.9} opacity={OPACITY[status]} />
      )}
      {point.hinge && status !== 'closed' && (
        <HingeStar position={position} radius={detailed ? size * 2 : UNDISCOVERED_STAR_RADIUS} opacity={detailed ? 0.7 : 0.3} />
      )}
    </>
  )
}
