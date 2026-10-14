import type { PlayerStatus } from '../player/useSoundCloudPlayer'

interface PlayerControlsProps {
  status: PlayerStatus
  canSkip: boolean
  onTogglePause: () => void
  onReplay: () => void
  onSkip: () => void
}

export function PlayerControls({ status, canSkip, onTogglePause, onReplay, onSkip }: PlayerControlsProps) {
  return (
    <div className="controls">
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
