import { Html, Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, QuadraticBezierCurve3, Vector3, type Group } from 'three'
import type { Vec3 } from './layoutBranches'

interface ChoiceBranchProps {
  label: string
  target: Vec3
  delay: number
  onChoose: () => void
}

const GROW_SECONDS = 0.8

export function ChoiceBranch({ label, target, delay, onChoose }: ChoiceBranchProps) {
  const group = useRef<Group>(null)
  const age = useRef(-delay)

  const points = useMemo(() => {
    const end = new Vector3(...target)
    const control = new Vector3(0, end.y * 0.55, 0)
    return new QuadraticBezierCurve3(new Vector3(0, 0, 0), control, end).getPoints(28)
  }, [target])

  useFrame((_, delta) => {
    age.current += delta
    const growth = MathUtils.clamp(age.current / GROW_SECONDS, 0, 1)
    group.current?.scale.setScalar(growth)
  })

  return (
    <group ref={group} scale={0}>
      <Line points={points} color="#ffffff" lineWidth={1} transparent opacity={0.7} />
      <mesh position={target}>
        <octahedronGeometry args={[0.1, 0]} />
        <meshBasicMaterial color="#ffffff" wireframe />
      </mesh>
      <Html position={[target[0], target[1] + 0.35, target[2]]} center zIndexRange={[20, 0]}>
        <button className="branch-label" style={{ animationDelay: `${delay + GROW_SECONDS * 0.7}s` }} onClick={onChoose}>
          {label}
        </button>
      </Html>
    </group>
  )
}
