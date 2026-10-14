import type { PlayerStatus } from '../player/useSoundCloudPlayer'

interface PlayerControlsProps {
  status: PlayerStatus
  canSkip: boolean
  canGoBack: boolean
  onBack: () => void
  onTogglePause: () => void
  onReplay: () => void
  onSkip: () => void
}

export function PlayerControls({ status, canSkip, canGoBack, onBack, onTogglePause, onReplay, onSkip }: PlayerControlsProps) {
  return (
    <div className="controls">
      {canGoBack && (
        <button className="icon-button" aria-label="Revenir au passage précédent" onClick={onBack}>
          «
        </button>
      )}
      <button className="icon-button" aria-label={status === 'playing' ? 'Pause' : 'Lecture'} onClick={onTogglePause}>
        {status === 'playing' ? '❙❙' : '▶'}
      </button>
      <button className="icon-button" aria-label="Rejouer depuis le début" onClick={onReplay}>
        ↺
      </button>
      {canSkip && (
        <button className="icon-button" aria-label="Passer à la suite" onClick={onSkip}>
          »
        </button>
      )}
    </div>
  )
}
