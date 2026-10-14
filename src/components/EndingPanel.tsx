interface EndingPanelProps {
  floating: boolean
  onRestart: () => void
}

export function EndingPanel({ floating, onRestart }: EndingPanelProps) {
  return (
    <div className={floating ? 'ending ending--floating' : 'ending'}>
      <p className="mono-dim">Fin du récit</p>
      <button className="button" onClick={onRestart}>
        Recommencer
      </button>
    </div>
  )
}
