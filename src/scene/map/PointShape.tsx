import type { FamilyShape } from '../../map/types'

interface PointShapeProps {
  shape: FamilyShape
  color: string
  core: boolean
  opacity: number
}

const CORE_SCALE = 0.32

function Geometry({ shape }: { shape: FamilyShape }) {
  switch (shape) {
    case 'globe':
      return <icosahedronGeometry args={[1, 2]} />
    case 'octahedron':
      return <octahedronGeometry args={[1.3, 0]} />
    case 'pyramid':
      return <tetrahedronGeometry args={[1.45, 0]} />
    case 'cube':
      return <boxGeometry args={[1.55, 1.55, 1.55]} />
    case 'polyhedron':
      return <dodecahedronGeometry args={[1.15, 0]} />
  }
}

export function PointShape({ shape, color, core, opacity }: PointShapeProps) {
  return (
    <group>
      <mesh>
        <Geometry shape={shape} />
        <meshBasicMaterial color={color} wireframe transparent opacity={opacity} />
      </mesh>
      {core && (
        <mesh scale={CORE_SCALE}>
          <Geometry shape={shape} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}
    </group>
  )
}
