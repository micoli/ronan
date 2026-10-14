import { Billboard, Line } from '@react-three/drei'
import { useMemo } from 'react'
import type { Vec3 } from '../layoutBranches'

interface HingeStarProps {
  position: Vec3
  radius: number
  opacity: number
}

const TIPS = 5

export function HingeStar({ position, radius, opacity }: HingeStarProps) {
  const points = useMemo(
    () =>
      Array.from({ length: TIPS * 2 + 1 }, (_, i): Vec3 => {
        const angle = (i / (TIPS * 2)) * Math.PI * 2 + Math.PI / 2
        const r = i % 2 === 0 ? radius : radius * 0.45
        return [Math.cos(angle) * r, Math.sin(angle) * r, 0]
      }),
    [radius],
  )

  return (
    <Billboard position={position}>
      <Line points={points} color="#ffffff" lineWidth={1.2} transparent opacity={opacity} />
    </Billboard>
  )
}
