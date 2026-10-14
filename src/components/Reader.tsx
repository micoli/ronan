import { useEffect, useMemo } from 'react'
import { detectQuality, hasWebGL, usePrefersReducedMotion } from '../hooks/capabilities'
import { isExplorationFinished } from '../map/availability'
import type { ExperienceMap } from '../map/types'
import { useSoundCloudPlayer } from '../player/useSoundCloudPlayer'
import { statusesOf } from '../session/session'
import { useSession } from '../session/useSession'
import { ErrorScreen } from './ErrorScreen'
import { HiddenPlayerFrame } from './HiddenPlayerFrame'
import { MapScreen } from './MapScreen'
import { StartScreen } from './StartScreen'

const REVEAL_DELAY_MS = 3000

interface ReaderProps {
  map: ExperienceMap
  experienceId: string
  onExit?: () => void
}

export function Reader({ map, experienceId, onExit }: ReaderProps) {
  const { session, saved, openable, branches, begin, open, resume, selectCapsule, reveal, restart } = useSession(map, experienceId)
  const player = useSoundCloudPlayer()
  const reducedMotion = usePrefersReducedMotion()
  const webgl = useMemo(hasWebGL, [])
  const quality = useMemo(detectQuality, [])

  useEffect(() => {
    if (!session.pendingReveal) return
    if (player.status === 'finished') return reveal()
    if (player.status !== 'playing') return
    const timer = setTimeout(reveal, REVEAL_DELAY_MS)
    return () => clearTimeout(timer)
  }, [player.status, session.pendingReveal, reveal])

  const playCapsule = (pointId: string, index: number) => {
    const capsule = map.points[pointId].capsules[index]
    if (capsule) player.playTrack(capsule.soundcloudUrl)
  }

  const handleStart = () => {
    if (map.settings.presentation === 'full') return begin()
    const startId = map.start[0]
    open(startId)
    playCapsule(startId, 0)
  }

  const handleResume = () => {
    if (!saved) return
    resume()
    if (saved.currentPointId) playCapsule(saved.currentPointId, 0)
  }

  const handleOpen = (pointId: string) => {
    if (!openable.has(pointId)) return
    open(pointId)
    playCapsule(pointId, 0)
  }

  const handleSelectCapsule = (index: number) => {
    if (session.currentPointId === null) return
    selectCapsule(index)
    playCapsule(session.currentPointId, index)
  }

  if (player.status === 'error') return <ErrorScreen message="Le lecteur audio SoundCloud est inaccessible." />

  const current = session.currentPointId === null ? null : map.points[session.currentPointId]
  const previous = session.previousPointId === null ? null : map.points[session.previousPointId]
  const trail = session.journey.filter((id) => id !== session.currentPointId)
  const statuses = statusesOf(map, session)
  const finished = !session.pendingReveal && isExplorationFinished(map, new Set(session.journey), session.currentPointId)

  return (
    <>
      <HiddenPlayerFrame iframeRef={player.iframeRef} initialTrackUrl={Object.values(map.points)[0].capsules[0].soundcloudUrl} />
      {session.started ? (
        <MapScreen
          map={map}
          statuses={statuses}
          point={current}
          capsuleIndex={session.capsuleIndex}
          trail={trail}
          branches={branches}
          finished={finished}
          use3d={webgl && !reducedMotion}
          quality={quality}
          status={player.status}
          trackUrl={player.trackUrl}
          waveformUrl={player.waveformUrl}
          clockRef={player.clockRef}
          backTitle={previous?.title ?? null}
          onOpen={handleOpen}
          onBack={() => session.previousPointId && handleOpen(session.previousPointId)}
          onSelectCapsule={handleSelectCapsule}
          onRestart={restart}
          onExit={onExit}
          onTogglePause={player.togglePause}
          onReplay={player.replay}
        />
      ) : (
        <StartScreen
          ready={player.status !== 'initializing'}
          canResume={saved !== null}
          title={map.title}
          onStart={handleStart}
          onResume={handleResume}
          onExit={onExit}
        />
      )}
    </>
  )
}
