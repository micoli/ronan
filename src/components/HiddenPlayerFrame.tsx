import type { Ref } from 'react'
import { widgetEmbedUrl } from '../player/soundcloudWidget'

interface HiddenPlayerFrameProps {
  iframeRef: Ref<HTMLIFrameElement>
  initialTrackUrl: string
}

export function HiddenPlayerFrame({ iframeRef, initialTrackUrl }: HiddenPlayerFrameProps) {
  return (
    <iframe
      ref={iframeRef}
      className="hidden-player"
      title="Lecteur audio SoundCloud"
      allow="autoplay"
      tabIndex={-1}
      aria-hidden="true"
      src={widgetEmbedUrl(initialTrackUrl)}
    />
  )
}
