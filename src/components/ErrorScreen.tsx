interface ErrorScreenProps {
  message: string
}

export function ErrorScreen({ message }: ErrorScreenProps) {
  return (
    <main className="screen">
      <h1 className="title">Signal perdu</h1>
      <pre className="error-details">{message}</pre>
    </main>
  )
}
