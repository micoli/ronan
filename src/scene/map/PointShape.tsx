import type { FamilyShape } from '../../map/types'

interface PointShapeProps {
  shape: FamilyShape
  color: string
  filled: boolean
  opacity: number
}

function Material({ color, filled, opacity }: Omit<PointShapeProps, 'shape'>) {
  return <meshBasicMaterial color={color} wireframe={!filled} transparent opacity={opacity} />
}

export function PointShape({ shape, color, filled, opacity }: PointShapeProps) {
  const material = <Material color={color} filled={filled} opacity={opacity} />

  if (shape === 'cross') {
    return (
      <group>
        <mesh>
          <boxGeometry args={[0.7, 2.2, 0.7]} />
          {material}
        </mesh>
        <mesh>
          <boxGeometry args={[2.2, 0.7, 0.7]} />
          {material}
        </mesh>
      </group>
    )
  }

  return (
    <mesh>
      {shape === 'circle' && <icosahedronGeometry args={[1, 1]} />}
      {shape === 'diamond' && <octahedronGeometry args={[1.25]} />}
      {shape === 'triangle' && <tetrahedronGeometry args={[1.35]} />}
      {shape === 'square' && <boxGeometry args={[1.5, 1.5, 1.5]} />}
      {material}
    </mesh>
  )
}
