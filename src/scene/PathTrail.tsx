const MAX_VISIBLE = 8

interface PathTrailProps {
  path: string[]
}

const sway = (index: number): number => Math.sin(index * 2.3) * 0.9

export function PathTrail({ path }: PathTrailProps) {
  const visible = path.slice(-MAX_VISIBLE)
  const offset = path.length - visible.length

  return (
    <group>
      {visible.map((id, index) => {
        const depth = visible.length - index
        return (
          <mesh key={`${offset + index}-${id}`} position={[sway(offset + index), 0.2 * depth, -1.6 * depth]}>
            <octahedronGeometry args={[0.25, 0]} />
            <meshBasicMaterial color="#ffffff" wireframe transparent opacity={Math.max(0.08, 0.5 - depth * 0.06)} />
          </mesh>
        )
      })}
    </group>
  )
}
