interface SoundCloudCreditProps {
  trackUrl: string | null
}

export function SoundCloudCredit({ trackUrl }: SoundCloudCreditProps) {
  const href = trackUrl ?? 'https://soundcloud.com'
  return (
    <a className="credit" href={href} target="_blank" rel="noreferrer noopener">
      Audio · SoundCloud ↗
    </a>
  )
}
