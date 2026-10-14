import { useEffect, useMemo } from 'react'
import { ErrorScreen } from './components/ErrorScreen'
import { HiddenPlayerFrame } from './components/HiddenPlayerFrame'
import { LoadingScreen } from './components/LoadingScreen'
import { StartScreen } from './components/StartScreen'
import { StoryScreen } from './components/StoryScreen'
import { detectQuality, hasWebGL, usePrefersReducedMotion } from './hooks/capabilities'
import { useSoundCloudPlayer } from './player/useSoundCloudPlayer'
import { useSession } from './session/useSession'
import type { Story } from './story/types'
import { useStoryLoader } from './story/useStoryLoader'

const REVEAL_DELAY_MS = 3000

interface ReaderProps {
  story: Story
}

function Reader({ story }: ReaderProps) {
  const { session, saved, start, resume, choose, back, revealChoices, restart } = useSession(story)
  const player = useSoundCloudPlayer()
  const reducedMotion = usePrefersReducedMotion()
  const webgl = useMemo(hasWebGL, [])
  const quality = useMemo(detectQuality, [])

  useEffect(() => {
    if (session.currentNodeId === null || session.choicesRevealed) return
    if (player.status === 'finished') return revealChoices()
    if (player.status !== 'playing') return
    const timer = setTimeout(revealChoices, REVEAL_DELAY_MS)
    return () => clearTimeout(timer)
  }, [player.status, session.currentNodeId, session.choicesRevealed, revealChoices])

  const handleStart = () => {
    start()
    player.playTrack(story.nodes[story.start].soundcloudUrl)
  }

  const handleResume = () => {
    if (!saved) return
    resume()
    player.playTrack(story.nodes[saved.currentNodeId].soundcloudUrl)
  }

  const handleChoose = (to: string) => {
    choose(to)
    player.playTrack(story.nodes[to].soundcloudUrl)
  }

  const handleBack = () => {
    const previousId = session.path.at(-1)
    if (previousId === undefined) return
    back()
    player.playTrack(story.nodes[previousId].soundcloudUrl)
  }

  if (player.status === 'error') return <ErrorScreen message="Le lecteur audio SoundCloud est inaccessible." />

  const currentNode = session.currentNodeId === null ? null : story.nodes[session.currentNodeId]

  return (
    <>
      <HiddenPlayerFrame iframeRef={player.iframeRef} initialTrackUrl={story.nodes[story.start].soundcloudUrl} />
      {currentNode === null ? (
        <StartScreen
          ready={player.status !== 'initializing'}
          canResume={saved !== null}
          onStart={handleStart}
          onResume={handleResume}
        />
      ) : (
        <StoryScreen
          node={currentNode}
          path={session.path}
          choicesRevealed={session.choicesRevealed}
          use3d={webgl && !reducedMotion}
          quality={quality}
          status={player.status}
          trackUrl={player.trackUrl}
          waveformUrl={player.waveformUrl}
          clockRef={player.clockRef}
          onChoose={handleChoose}
          onBack={handleBack}
          onRestart={restart}
          onTogglePause={player.togglePause}
          onReplay={player.replay}
        />
      )}
    </>
  )
}

export function App() {
  const loaded = useStoryLoader()
  if (loaded.status === 'loading') return <LoadingScreen />
  if (loaded.status === 'error') return <ErrorScreen message={loaded.message} />
  return <Reader story={loaded.story} />
}
