interface ErrorScreenProps {
  message: string
  onBack?: () => void
}

export function ErrorScreen({ message, onBack }: ErrorScreenProps) {
  return (
    <main className="screen">
      <h1 className="title">Signal perdu</h1>
      <pre className="error-details">{message}</pre>
      {onBack && (
        <button className="button" onClick={onBack}>
          Autres expériences
        </button>
      )}
    </main>
  )
}
