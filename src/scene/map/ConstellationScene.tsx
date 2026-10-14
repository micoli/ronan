import { Canvas } from '@react-three/fiber'
import { Billboard, OrbitControls } from '@react-three/drei'
import { useMemo, useRef, useState, type ElementRef, type RefObject } from 'react'
import type { PointStatus } from '../../map/availability'
import type { ExperienceMap } from '../../map/types'
import type { Quality } from '../../hooks/capabilities'
import type { PlaybackClock } from '../../player/useSoundCloudPlayer'
import type { Branch } from '../../session/session'
import { LabelProjector, type LabelAnchor } from '../LabelProjector'
import { layoutMap } from '../layoutMap'
import { Starfield } from '../Starfield'
import { WaveformRing } from '../WaveformRing'
import { CameraFocus } from './CameraFocus'
import { MapEdges } from './MapEdges'
import { MapPoint } from './MapPoint'
import { ScreenPicker, type PickItem } from './ScreenPicker'

interface ConstellationSceneProps {
  map: ExperienceMap
  statuses: Record<string, PointStatus>
  currentId: string | null
  branches: Branch[]
  samples: number[] | null
  clockRef: RefObject<PlaybackClock>
  quality: Quality
  highlightId: string | null
  onOpen: (pointId: string) => void
}

const MAP_RADIUS = 5
const DEPTH_SCALE = 0.45
const CENTER: [number, number, number] = [0, 0, 0]
const HALO_SCALE = 0.3

export function ConstellationScene({ map, statuses, currentId, branches, samples, clockRef, quality, highlightId, onOpen }: ConstellationSceneProps) {
  const labels = useRef(new Map<string, HTMLElement>())
  const controls = useRef<ElementRef<typeof OrbitControls>>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const positions = useMemo(() => layoutMap(map, MAP_RADIUS, DEPTH_SCALE), [map])

  const emphasisId = hoveredId ?? highlightId

  const labelled = useMemo(() => {
    const items = [...branches]
    const emphasised = emphasisId ? map.points[emphasisId] : null
    if (emphasised && !items.some((item) => item.id === emphasised.id)) items.push({ id: emphasised.id, label: emphasised.title })
    return items
  }, [branches, emphasisId, map])

  const anchors = useMemo<LabelAnchor[]>(
    () => labelled.map((item) => ({ id: item.id, position: positions[item.id], forced: item.id === emphasisId })),
    [labelled, positions, emphasisId],
  )

  const pickItems = useMemo<PickItem[]>(
    () =>
      Object.keys(map.points).map((id) => ({
        id,
        position: positions[id],
        interactive: statuses[id] === 'reachable' || statuses[id] === 'visited',
      })),
    [map, positions, statuses],
  )

  const isHidden = (id: string) => map.settings.unavailable === 'hidden' && statuses[id] === 'closed'
  const currentPosition = currentId ? positions[currentId] : CENTER

  return (
    <>
      <Canvas
        className="scene"
        dpr={[1, quality.maxDpr]}
        gl={{ antialias: quality.maxDpr > 1.5, alpha: false }}
        camera={{ position: [0, 1.5, window.innerWidth < window.innerHeight ? 14 : 9.5], fov: 50 }}
      >
        <color attach="background" args={['#000000']} />
        <Starfield count={quality.stars} />
        <OrbitControls
          ref={controls}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan={false}
          rotateSpeed={0.6}
          minDistance={4}
          maxDistance={20}
          autoRotate={currentId === null}
          autoRotateSpeed={0.35}
        />
        <CameraFocus controls={controls} target={currentPosition} triggerKey={currentId ?? ''} />
        <MapEdges map={map} positions={positions} statuses={statuses} />
        {Object.values(map.points)
          .filter((point) => !isHidden(point.id))
          .map((point) => (
            <MapPoint
              key={point.id}
              point={point}
              position={positions[point.id]}
              families={point.families.map((family) => map.families[family])}
              status={statuses[point.id]}
              current={point.id === currentId}
              emphasised={point.id === emphasisId}
            />
          ))}
        {currentId && (
          <Billboard position={currentPosition}>
            <group scale={HALO_SCALE}>
              <WaveformRing samples={samples} clockRef={clockRef} segments={quality.ringSegments} tilt={0} fitToAspect={false} />
            </group>
          </Billboard>
        )}
        <ScreenPicker items={pickItems} onOpen={onOpen} onHover={setHoveredId} />
        <LabelProjector anchors={anchors} labels={labels} />
      </Canvas>
      <div className="branch-labels">
        {labelled.map((item) => (
          <button
            key={item.id}
            ref={(element) => {
              if (element) labels.current.set(item.id, element)
              else labels.current.delete(item.id)
            }}
            className="branch-label"
            disabled={statuses[item.id] !== 'reachable' && statuses[item.id] !== 'visited'}
            onClick={() => onOpen(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  )
}
