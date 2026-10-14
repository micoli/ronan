import type { PlayerStatus } from '../player/useSoundCloudPlayer'
import type { StoryNode } from '../story/types'
import { PlayerControls } from './PlayerControls'
import { SoundCloudCredit } from './SoundCloudCredit'
import { TranscriptPanel } from './TranscriptPanel'

interface NodeHudProps {
  node: StoryNode
  status: PlayerStatus
  trackUrl: string | null
  choicesRevealed: boolean
  canGoBack: boolean
  onBack: () => void
  onTogglePause: () => void
  onReplay: () => void
  onSkip: () => void
}

const STATUS_LABELS: Record<PlayerStatus, string> = {
  initializing: 'Initialisation',
  idle: 'En attente',
  loading: 'Chargement',
  playing: 'Transmission',
  paused: 'Pause',
  finished: 'Fin de transmission',
  error: 'Erreur audio',
}

export function NodeHud({ node, status, trackUrl, choicesRevealed, canGoBack, onBack, onTogglePause, onReplay, onSkip }: NodeHudProps) {
  return (
    <header className="hud">
      <p className="mono-dim" aria-live="polite">
        {STATUS_LABELS[status]}
      </p>
      <h1 className="node-title">{node.title}</h1>
      <PlayerControls
        status={status}
        canSkip={!choicesRevealed && node.choices.length > 0}
        canGoBack={canGoBack}
        onBack={onBack}
        onTogglePause={onTogglePause}
        onReplay={onReplay}
        onSkip={onSkip}
      />
      {node.transcript && <TranscriptPanel transcript={node.transcript} />}
      <SoundCloudCredit trackUrl={trackUrl} />
    </header>
  )
}
