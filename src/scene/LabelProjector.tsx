import { useFrame } from '@react-three/fiber'
import { useMemo, type RefObject } from 'react'
import { Vector3 } from 'three'
import type { Vec3 } from './layoutBranches'
import { placeLabels, type LabelRequest } from './placeLabels'

export interface LabelAnchor {
  id: string
  position: Vec3
  forced?: boolean
}

interface LabelProjectorProps {
  anchors: LabelAnchor[]
  labels: RefObject<Map<string, HTMLElement>>
}

interface Projected {
  anchor: LabelAnchor
  element: HTMLElement
  x: number
  y: number
  depth: number
  behindCamera: boolean
}

export function LabelProjector({ anchors, labels }: LabelProjectorProps) {
  const scratch = useMemo(() => new Vector3(), [])

  useFrame(({ camera, size }) => {
    const projected: Projected[] = []
    for (const anchor of anchors) {
      const element = labels.current.get(anchor.id)
      if (!element) continue
      scratch.set(...anchor.position).project(camera)
      projected.push({
        anchor,
        element,
        x: (scratch.x * 0.5 + 0.5) * size.width,
        y: (-scratch.y * 0.5 + 0.5) * size.height,
        depth: scratch.z,
        behindCamera: scratch.z > 1,
      })
    }

    const requests: LabelRequest[] = projected
      .filter((item) => !item.behindCamera)
      .sort((a, b) => Number(b.anchor.forced ?? false) - Number(a.anchor.forced ?? false) || a.depth - b.depth)
      .map((item) => ({
        id: item.anchor.id,
        x: item.x,
        y: item.y,
        width: item.element.offsetWidth,
        height: item.element.offsetHeight,
        forced: item.anchor.forced,
      }))
    const placements = placeLabels(requests, size)

    for (const item of projected) {
      const placement = placements.get(item.anchor.id)
      if (!placement?.visible) {
        item.element.style.visibility = 'hidden'
        continue
      }
      item.element.style.visibility = 'visible'
      item.element.style.transform = `translate(${placement.x}px, ${placement.y}px) translate(-50%, -50%)`
    }
  })

  return null
}
