import { useFrame } from '@react-three/fiber'
import { useMemo, type RefObject } from 'react'
import { Vector3 } from 'three'
import type { Vec3 } from './layoutBranches'

interface LabelProjectorProps {
  ids: string[]
  targets: Vec3[]
  origin: Vec3
  labels: RefObject<Map<string, HTMLElement>>
  lift: number
}

export function LabelProjector({ ids, targets, origin, labels, lift }: LabelProjectorProps) {
  const scratch = useMemo(() => new Vector3(), [])

  useFrame(({ camera, size }) => {
    ids.forEach((id, index) => {
      const element = labels.current.get(id)
      const target = targets[index]
      if (!element || !target) return
      scratch.set(origin[0] + target[0], origin[1] + target[1] + lift, origin[2] + target[2]).project(camera)
      const x = (scratch.x * 0.5 + 0.5) * size.width
      const y = (-scratch.y * 0.5 + 0.5) * size.height
      element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
      element.style.visibility = scratch.z > 1 ? 'hidden' : 'visible'
    })
  })

  return null
}
