interface EndingPanelProps {
  onRestart: () => void
}

export function EndingPanel({ onRestart }: EndingPanelProps) {
  return (
    <div className="ending">
      <p className="mono-dim">Fin du récit</p>
      <button className="button" onClick={onRestart}>
        Recommencer
      </button>
    </div>
  )
}
