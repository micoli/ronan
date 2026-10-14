import type { PlayerStatus } from '../player/useSoundCloudPlayer'

interface PlayerControlsProps {
  status: PlayerStatus
  canGoBack: boolean
  onBack: () => void
  onTogglePause: () => void
  onReplay: () => void
}

export function PlayerControls({ status, canGoBack, onBack, onTogglePause, onReplay }: PlayerControlsProps) {
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
    </div>
  )
}
