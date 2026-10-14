import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, type ElementRef, type RefObject } from 'react'
import { Vector3 } from 'three'
import type { OrbitControls } from '@react-three/drei'
import type { Vec3 } from '../layoutBranches'

interface CameraFocusProps {
  controls: RefObject<ElementRef<typeof OrbitControls> | null>
  target: Vec3
  triggerKey: string
}

const FOCUS_SECONDS = 1.6
const FOCUS_SPEED = 0.06

export function CameraFocus({ controls, target, triggerKey }: CameraFocusProps) {
  const remaining = useRef(0)
  const goal = useRef(new Vector3())

  useEffect(() => {
    goal.current.set(...target)
    remaining.current = FOCUS_SECONDS
  }, [triggerKey, target])

  useFrame((_, delta) => {
    if (remaining.current <= 0 || !controls.current) return
    remaining.current -= delta
    controls.current.target.lerp(goal.current, FOCUS_SPEED)
  })

  return null
}
