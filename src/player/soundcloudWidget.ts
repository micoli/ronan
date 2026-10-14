export interface SoundCloudSound {
  waveform_url?: string
  duration?: number
  permalink_url?: string
}

export interface SoundCloudProgress {
  currentPosition: number
}

export interface SoundCloudWidget {
  bind(event: string, listener: (payload?: SoundCloudProgress) => void): void
  load(url: string, options: { auto_play?: boolean; callback?: () => void; [key: string]: unknown }): void
  play(): void
  pause(): void
  seekTo(milliseconds: number): void
  getCurrentSound(callback: (sound: SoundCloudSound | null) => void): void
}

interface SoundCloudApi {
  Widget: ((iframe: HTMLIFrameElement) => SoundCloudWidget) & {
    Events: Record<'READY' | 'PLAY' | 'PAUSE' | 'FINISH' | 'PLAY_PROGRESS' | 'ERROR', string>
  }
}

declare global {
  interface Window {
    SC?: SoundCloudApi
  }
}

const API_URL = 'https://w.soundcloud.com/player/api.js'
let apiPromise: Promise<SoundCloudApi> | null = null

export const loadSoundCloudApi = (): Promise<SoundCloudApi> => {
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve, reject) => {
    if (window.SC) return resolve(window.SC)
    const script = document.createElement('script')
    script.src = API_URL
    script.async = true
    script.onload = () => (window.SC ? resolve(window.SC) : reject(new Error('SoundCloud API unavailable')))
    script.onerror = () => {
      apiPromise = null
      reject(new Error('Cannot load the SoundCloud player'))
    }
    document.head.appendChild(script)
  })
  return apiPromise
}

export const widgetEmbedUrl = (trackUrl: string): string =>
  `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&visual=false&show_artwork=false`
