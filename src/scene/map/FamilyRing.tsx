import { Billboard, Line } from '@react-three/drei'
import { useMemo } from 'react'
import type { Vec3 } from '../layoutBranches'

interface FamilyRingProps {
  position: Vec3
  colors: string[]
  radius: number
  opacity: number
}

const POINTS_PER_ARC = 14
const GAP = 0.12

export function FamilyRing({ position, colors, radius, opacity }: FamilyRingProps) {
  const arcs = useMemo(
    () =>
      colors.map((color, index) => {
        const span = (Math.PI * 2) / colors.length
        const start = index * span + GAP
        const points = Array.from({ length: POINTS_PER_ARC }, (_, step): Vec3 => {
          const angle = start + ((span - GAP * 2) * step) / (POINTS_PER_ARC - 1)
          return [Math.cos(angle) * radius, Math.sin(angle) * radius, 0]
        })
        return { color, points }
      }),
    [colors, radius],
  )

  return (
    <Billboard position={position}>
      {arcs.map((arc) => (
        <Line key={arc.color} points={arc.points} color={arc.color} lineWidth={1.5} transparent opacity={opacity} />
      ))}
    </Billboard>
  )
}
