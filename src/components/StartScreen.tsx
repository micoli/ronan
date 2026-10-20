interface StartScreenProps {
  ready: boolean
  canResume: boolean
  title: string
  onStart: () => void
  onResume: () => void
  onExit?: () => void
}

export function StartScreen({ ready, canResume, title, onStart, onResume, onExit }: StartScreenProps) {
  return (
    <main className="screen">
      <h1 className="title">ORNAN</h1>
      <p className="mono-dim">{title}</p>
      <div className="actions">
        {canResume && (
          <button className="button" disabled={!ready} onClick={onResume}>
            Reprendre
          </button>
        )}
        <button className="button" disabled={!ready} onClick={onStart}>
          {canResume ? 'Recommencer' : 'Commencer'}
        </button>
      </div>
      {!ready && <p className="mono-dim">Connexion au lecteur audio…</p>}
      {onExit && (
        <button className="link-button" onClick={onExit}>
          Autres expériences
        </button>
      )}
    </main>
  )
}
