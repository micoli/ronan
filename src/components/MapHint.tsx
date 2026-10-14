import type { ReactNode } from 'react'

interface MapHintProps {
  drawer: boolean
  children?: ReactNode
}

export function MapHint({ drawer, children }: MapHintProps) {
  return (
    <header className={drawer ? 'hud hud--drawer' : 'hud'}>
      <p className="mono-dim">Choisissez un point pour commencer l'écoute</p>
      {children}
    </header>
  )
}
