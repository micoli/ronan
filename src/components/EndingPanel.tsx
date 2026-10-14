interface EndingPanelProps {
  floating: boolean
  onRestart: () => void
  onExit?: () => void
}

export function EndingPanel({ floating, onRestart, onExit }: EndingPanelProps) {
  return (
    <div className={floating ? 'ending ending--floating' : 'ending'}>
      <p className="mono-dim">Fin de l'exploration</p>
      <div className="actions">
        <button className="button" onClick={onRestart}>
          Recommencer
        </button>
        {onExit && (
          <button className="button" onClick={onExit}>
            Autres expériences
          </button>
        )}
      </div>
    </div>
  )
}
