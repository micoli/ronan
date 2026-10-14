import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

export function NodeCore() {
  const ref = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.4
    ref.current.rotation.x += delta * 0.15
  })

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.45, 1]} />
      <meshBasicMaterial color="#ffffff" wireframe />
    </mesh>
  )
}
