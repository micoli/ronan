import type { PlayerStatus } from '../player/useSoundCloudPlayer'

interface PlayerControlsProps {
  status: PlayerStatus
  backTitle: string | null
  onBack: () => void
  onTogglePause: () => void
  onReplay: () => void
}

export function PlayerControls({ status, backTitle, onBack, onTogglePause, onReplay }: PlayerControlsProps) {
  return (
    <div className="controls">
      {backTitle !== null && (
        <button className="icon-button" aria-label={`Revenir à ${backTitle}`} title={backTitle} onClick={onBack}>
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
