import { lazy, Suspense, type RefObject } from 'react'
import type { Quality } from '../hooks/capabilities'
import type { PlaybackClock, PlayerStatus } from '../player/useSoundCloudPlayer'
import { useWaveform } from '../player/useWaveform'
import type { StoryNode } from '../story/types'
import { ChoiceList } from './ChoiceList'
import { EndingPanel } from './EndingPanel'
import { NodeHud } from './NodeHud'

const Scene = lazy(() => import('../scene/Scene').then((module) => ({ default: module.Scene })))

interface StoryScreenProps {
  node: StoryNode
  path: string[]
  choicesRevealed: boolean
  use3d: boolean
  quality: Quality
  status: PlayerStatus
  trackUrl: string | null
  waveformUrl: string | null
  clockRef: RefObject<PlaybackClock>
  onChoose: (to: string) => void
  onBack: () => void
  onRestart: () => void
  onTogglePause: () => void
  onReplay: () => void
  onSkip: () => void
}

export function StoryScreen(props: StoryScreenProps) {
  const { node, path, choicesRevealed, use3d, quality, clockRef, onChoose, onRestart } = props
  const samples = useWaveform(props.waveformUrl)
  const isEnding = node.choices.length === 0
  const visibleChoices = choicesRevealed ? node.choices : []

  return (
    <div className="story-screen">
      {use3d && (
        <Suspense fallback={null}>
          <Scene path={path} choices={visibleChoices} samples={samples} clockRef={clockRef} quality={quality} onChoose={onChoose} />
        </Suspense>
      )}
      <NodeHud
        node={node}
        status={props.status}
        trackUrl={props.trackUrl}
        choicesRevealed={choicesRevealed}
        canGoBack={path.length > 0}
        onBack={props.onBack}
        onTogglePause={props.onTogglePause}
        onReplay={props.onReplay}
        onSkip={props.onSkip}
      />
      {!use3d && choicesRevealed && <ChoiceList choices={visibleChoices} onChoose={onChoose} />}
      {isEnding && choicesRevealed && <EndingPanel onRestart={onRestart} />}
    </div>
  )
}
