import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import type { Vec3 } from '../layoutBranches'
import { pickNearest, type PickCandidate } from './pickNearest'

export interface PickItem {
  id: string
  position: Vec3
  interactive: boolean
}

interface ScreenPickerProps {
  items: PickItem[]
  onOpen: (id: string) => void
  onHover: (id: string | null) => void
}

const TAP_MAX_MOVE = 10
const TAP_MAX_MS = 600
const FINE_RADIUS = 22
const COARSE_RADIUS = 36
const HOVER_RADIUS = 18

export function ScreenPicker({ items, onOpen, onHover }: ScreenPickerProps) {
  const camera = useThree((state) => state.camera)
  const element = useThree((state) => state.gl.domElement)
  const latest = useRef({ items, onOpen, onHover })
  latest.current = { items, onOpen, onHover }

  useEffect(() => {
    const scratch = new Vector3()
    let press: { x: number; y: number; at: number; id: string | null } | null = null

    const nearest = (clientX: number, clientY: number, radius: number): string | null => {
      const rect = element.getBoundingClientRect()
      const candidates: PickCandidate[] = []
      for (const item of latest.current.items) {
        if (!item.interactive) continue
        scratch.set(...item.position).project(camera)
        if (scratch.z > 1) continue
        candidates.push({
          id: item.id,
          x: (scratch.x * 0.5 + 0.5) * rect.width,
          y: (-scratch.y * 0.5 + 0.5) * rect.height,
          depth: (scratch.z + 1) / 2,
        })
      }
      return pickNearest(candidates, clientX - rect.left, clientY - rect.top, radius)
    }

    const tapRadius = (event: PointerEvent) => (event.pointerType === 'mouse' ? FINE_RADIUS : COARSE_RADIUS)

    const handleDown = (event: PointerEvent) => {
      const id = nearest(event.clientX, event.clientY, tapRadius(event))
      press = { x: event.clientX, y: event.clientY, at: performance.now(), id }
      latest.current.onHover(id)
    }
    const handleMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.buttons !== 0) return
      const id = nearest(event.clientX, event.clientY, HOVER_RADIUS)
      latest.current.onHover(id)
      element.style.cursor = id ? 'pointer' : ''
    }
    const handleUp = (event: PointerEvent) => {
      const started = press
      press = null
      if (event.pointerType !== 'mouse') latest.current.onHover(null)
      if (!started?.id) return
      const moved = Math.hypot(event.clientX - started.x, event.clientY - started.y)
      if (moved > TAP_MAX_MOVE || performance.now() - started.at > TAP_MAX_MS) return
      latest.current.onOpen(started.id)
    }
    const handleCancel = () => {
      press = null
      latest.current.onHover(null)
      element.style.cursor = ''
    }

    element.addEventListener('pointerdown', handleDown)
    element.addEventListener('pointermove', handleMove)
    element.addEventListener('pointerup', handleUp)
    element.addEventListener('pointercancel', handleCancel)
    element.addEventListener('pointerleave', handleCancel)
    return () => {
      element.removeEventListener('pointerdown', handleDown)
      element.removeEventListener('pointermove', handleMove)
      element.removeEventListener('pointerup', handleUp)
      element.removeEventListener('pointercancel', handleCancel)
      element.removeEventListener('pointerleave', handleCancel)
    }
  }, [camera, element])

  return null
}
