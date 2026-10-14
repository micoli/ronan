interface TranscriptPanelProps {
  text: string
}

export function TranscriptPanel({ text }: TranscriptPanelProps) {
  return (
    <details className="transcript">
      <summary>Texte</summary>
      <p>{text}</p>
    </details>
  )
}
