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
  onOpen: (id: string) => void
  onHover: (id: string | null) => void
}

const BASE_SIZE = 0.15
const HIT_RADIUS = 0.45
const CLOSED_COLOR = '#808080'

const OPACITY: Record<PointStatus, number> = { visited: 1, reachable: 0.95, unreached: 0.3, closed: 0.12 }

export function MapPoint({ point, position, families, status, current, onOpen, onHover }: MapPointProps) {
  const group = useRef<Group>(null)
  const interactive = status === 'visited' || status === 'reachable'
  const color = status === 'closed' ? CLOSED_COLOR : (families[0]?.color ?? '#ffffff')
  const size = BASE_SIZE * (point.hinge ? 1.35 : 1) * (current ? 1.6 : 1)

  useFrame(({ clock }) => {
    if (!group.current) return
    const pulse = status === 'reachable' ? 1 + 0.18 * Math.sin(clock.elapsedTime * 3 + position[0]) : 1
    group.current.scale.setScalar(size * pulse)
  })

  return (
    <>
      <group position={position}>
        <group ref={group}>
          <PointShape shape={families[0]?.shape ?? 'circle'} color={color} filled={status === 'visited'} opacity={OPACITY[status]} />
        </group>
        <mesh
          onClick={(event) => {
            if (!interactive || event.delta > 6) return
            event.stopPropagation()
            onOpen(point.id)
          }}
          onPointerOver={() => {
            onHover(point.id)
            if (interactive) document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            onHover(null)
            document.body.style.cursor = ''
          }}
        >
          <sphereGeometry args={[HIT_RADIUS, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      {families.length > 1 && status !== 'closed' && (
        <FamilyRing position={position} colors={families.map((family) => family.color)} radius={size * 2.1} opacity={OPACITY[status]} />
      )}
      {point.hinge && status !== 'closed' && <HingeStar position={position} radius={size * 2.3} opacity={OPACITY[status] * 0.7} />}
    </>
  )
}
