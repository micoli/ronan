import { lazy, Suspense, type RefObject } from 'react'
import type { Quality } from '../hooks/capabilities'
import type { PointStatus } from '../map/availability'
import type { ExperienceMap, Point } from '../map/types'
import type { PlaybackClock, PlayerStatus } from '../player/useSoundCloudPlayer'
import { useWaveform } from '../player/useWaveform'
import type { Branch } from '../session/session'
import { ChoiceList } from './ChoiceList'
import { EndingPanel } from './EndingPanel'
import { MapHint } from './MapHint'
import { PointHud } from './PointHud'

const LocalScene = lazy(() => import('../scene/LocalScene').then((module) => ({ default: module.LocalScene })))
const ConstellationScene = lazy(() =>
  import('../scene/map/ConstellationScene').then((module) => ({ default: module.ConstellationScene })),
)

interface MapScreenProps {
  map: ExperienceMap
  statuses: Record<string, PointStatus>
  point: Point | null
  capsuleIndex: number
  trail: string[]
  branches: Branch[]
  finished: boolean
  use3d: boolean
  quality: Quality
  status: PlayerStatus
  trackUrl: string | null
  waveformUrl: string | null
  clockRef: RefObject<PlaybackClock>
  backTitle: string | null
  onOpen: (pointId: string) => void
  onBack: () => void
  onSelectCapsule: (index: number) => void
  onRestart: () => void
  onTogglePause: () => void
  onReplay: () => void
}

export function MapScreen(props: MapScreenProps) {
  const { map, statuses, point, trail, branches, finished, use3d, quality, clockRef, onOpen, onRestart } = props
  const samples = useWaveform(props.waveformUrl)
  const isFull = map.settings.presentation === 'full'
  const drawer = use3d && isFull

  return (
    <div className="story-screen">
      {use3d && (
        <Suspense fallback={null}>
          {isFull ? (
            <ConstellationScene
              map={map}
              statuses={statuses}
              currentId={point?.id ?? null}
              branches={branches}
              samples={samples}
              clockRef={clockRef}
              quality={quality}
              onOpen={onOpen}
            />
          ) : (
            <LocalScene trail={trail} branches={branches} samples={samples} clockRef={clockRef} quality={quality} onOpen={onOpen} />
          )}
        </Suspense>
      )}
      {point ? (
        <PointHud
          point={point}
          drawer={drawer}
          capsuleIndex={props.capsuleIndex}
          status={props.status}
          trackUrl={props.trackUrl}
          backTitle={props.backTitle}
          onBack={props.onBack}
          onSelectCapsule={props.onSelectCapsule}
          onTogglePause={props.onTogglePause}
          onReplay={props.onReplay}
        />
      ) : (
        <MapHint />
      )}
      {!use3d && <ChoiceList branches={branches} onOpen={onOpen} />}
      {finished && <EndingPanel floating={drawer} onRestart={onRestart} />}
    </div>
  )
}
