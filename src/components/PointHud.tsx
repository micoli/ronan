import type { ReactNode } from 'react'
import type { PlayerStatus } from '../player/useSoundCloudPlayer'
import type { Point } from '../map/types'
import { CapsuleList } from './CapsuleList'
import { PlayerControls } from './PlayerControls'
import { PointImage } from './PointImage'
import { SoundCloudCredit } from './SoundCloudCredit'
import { TranscriptPanel } from './TranscriptPanel'

interface PointHudProps {
  point: Point
  drawer: boolean
  capsuleIndex: number
  status: PlayerStatus
  trackUrl: string | null
  backTitle: string | null
  onBack: () => void
  onSelectCapsule: (index: number) => void
  onTogglePause: () => void
  onReplay: () => void
  children?: ReactNode
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

export function PointHud({ point, drawer, capsuleIndex, status, trackUrl, backTitle, onBack, onSelectCapsule, onTogglePause, onReplay, children }: PointHudProps) {
  return (
    <header className={drawer ? 'hud hud--drawer' : 'hud'}>
      <p className="mono-dim" aria-live="polite">
        {STATUS_LABELS[status]}
      </p>
      <h1 className="node-title">{point.hinge ? `★ ${point.title}` : point.title}</h1>
      <PlayerControls status={status} backTitle={backTitle} onBack={onBack} onTogglePause={onTogglePause} onReplay={onReplay} />
      {children}
      {point.capsules.length > 1 && <CapsuleList capsules={point.capsules} activeIndex={capsuleIndex} onSelect={onSelectCapsule} />}
      {point.image && <PointImage path={point.image} alt={point.title} />}
      {point.text && <TranscriptPanel text={point.text} />}
      <SoundCloudCredit trackUrl={trackUrl} />
    </header>
  )
}
