import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Points } from 'three'

interface StarfieldProps {
  count: number
}

export function Starfield({ count }: StarfieldProps) {
  const ref = useRef<Points>(null)
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3)
    for (let i = 0; i < values.length; i++) values[i] = (Math.random() - 0.5) * 40
    return values
  }, [count])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.01
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.035} sizeAttenuation transparent opacity={0.55} />
    </points>
  )
}
