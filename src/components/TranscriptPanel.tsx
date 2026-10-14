interface TranscriptPanelProps {
  transcript: string
}

export function TranscriptPanel({ transcript }: TranscriptPanelProps) {
  return (
    <details className="transcript">
      <summary>Transcription</summary>
      <p>{transcript}</p>
    </details>
  )
}
