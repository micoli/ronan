import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, type RefObject } from 'react'
import { BufferAttribute, BufferGeometry } from 'three'
import { currentPositionMs, type PlaybackClock } from '../player/useSoundCloudPlayer'

interface WaveformRingProps {
  samples: number[] | null
  clockRef: RefObject<PlaybackClock>
  segments: number
}

const BASE_RADIUS = 0.95
const AMPLITUDE = 0.6
const TRACK_WINDOW = 0.06

export function WaveformRing({ samples, clockRef, segments }: WaveformRingProps) {
  const aspect = useThree((state) => state.size.width / state.size.height)
  const fitScale = Math.min(1, aspect * 1.25)
  const { geometry, positions } = useMemo(() => {
    const values = new Float32Array(segments * 3)
    const bufferGeometry = new BufferGeometry()
    bufferGeometry.setAttribute('position', new BufferAttribute(values, 3))
    return { geometry: bufferGeometry, positions: values }
  }, [segments])

  useFrame(({ clock }) => {
    const playback = clockRef.current
    const progress = playback.durationMs > 0 ? currentPositionMs(playback, performance.now()) / playback.durationMs : 0

    for (let i = 0; i < segments; i++) {
      const fraction = i / segments
      const amplitude = samples
        ? samples[Math.min(samples.length - 1, Math.floor((progress + fraction * TRACK_WINDOW) * samples.length))]
        : 0.35 + 0.35 * Math.sin(clock.elapsedTime * 2 + i * 0.25)
      const level = playback.playing ? amplitude : amplitude * 0.15
      const radius = BASE_RADIUS + level * AMPLITUDE
      const angle = fraction * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = Math.sin(angle) * radius
      positions[i * 3 + 2] = 0
    }
    geometry.attributes.position.needsUpdate = true
  })

  return (
    <lineLoop geometry={geometry} rotation={[-1.05, 0, 0]} scale={fitScale}>
      <lineBasicMaterial color="#ffffff" />
    </lineLoop>
  )
}
