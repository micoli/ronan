interface StartScreenProps {
  ready: boolean
  canResume: boolean
  onStart: () => void
  onResume: () => void
}

export function StartScreen({ ready, canResume, onStart, onResume }: StartScreenProps) {
  return (
    <main className="screen">
      <h1 className="title">RONAN</h1>
      <p className="mono-dim">Une histoire à écouter. Chaque choix ouvre une branche.</p>
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
    </main>
  )
}
