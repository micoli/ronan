import { useCallback, useEffect, useRef, useState } from 'react'
import { loadSoundCloudApi, type SoundCloudWidget } from './soundcloudWidget'

export type PlayerStatus = 'initializing' | 'idle' | 'loading' | 'playing' | 'paused' | 'finished' | 'error'

export interface PlaybackClock {
  positionMs: number
  durationMs: number
  updatedAt: number
  playing: boolean
}

export const currentPositionMs = (clock: PlaybackClock, now: number): number => {
  if (!clock.playing) return clock.positionMs
  const position = clock.positionMs + (now - clock.updatedAt)
  return clock.durationMs > 0 ? Math.min(position, clock.durationMs) : position
}

const idleClock: PlaybackClock = { positionMs: 0, durationMs: 0, updatedAt: 0, playing: false }

export const useSoundCloudPlayer = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const widgetRef = useRef<SoundCloudWidget | null>(null)
  const clockRef = useRef<PlaybackClock>(idleClock)
  const loadToken = useRef(0)
  const [status, setStatus] = useState<PlayerStatus>('initializing')
  const [waveformUrl, setWaveformUrl] = useState<string | null>(null)
  const [trackUrl, setTrackUrl] = useState<string | null>(null)

  const updateClock = useCallback((patch: Partial<PlaybackClock>) => {
    clockRef.current = { ...clockRef.current, updatedAt: performance.now(), ...patch }
  }, [])

  useEffect(() => {
    let cancelled = false
    loadSoundCloudApi()
      .then((api) => {
        const iframe = iframeRef.current
        if (cancelled || !iframe) return
        const widget = api.Widget(iframe)
        const { Events } = api.Widget
        widget.bind(Events.READY, () => {
          widgetRef.current = widget
          setStatus('idle')
        })
        widget.bind(Events.PLAY, () => {
          updateClock({ playing: true })
          setStatus('playing')
        })
        widget.bind(Events.PAUSE, () => {
          updateClock({ playing: false })
          setStatus((current) => (current === 'finished' ? current : 'paused'))
        })
        widget.bind(Events.FINISH, () => {
          updateClock({ playing: false, positionMs: clockRef.current.durationMs })
          setStatus('finished')
        })
        widget.bind(Events.PLAY_PROGRESS, (progress) => {
          if (progress) updateClock({ positionMs: progress.currentPosition })
        })
        widget.bind(Events.ERROR, () => setStatus('error'))
      })
      .catch(() => setStatus('error'))
    return () => {
      cancelled = true
    }
  }, [updateClock])

  const playTrack = useCallback(
    (url: string) => {
      const widget = widgetRef.current
      if (!widget) return
      const token = ++loadToken.current
      clockRef.current = { ...idleClock, updatedAt: performance.now() }
      setStatus('loading')
      setWaveformUrl(null)
      setTrackUrl(url)
      widget.load(url, {
        auto_play: true,
        show_artwork: false,
        callback: () => {
          if (token !== loadToken.current) return
          widget.play()
          widget.getCurrentSound((sound) => {
            if (token !== loadToken.current) return
            updateClock({ durationMs: sound?.duration ?? 0 })
            setWaveformUrl(sound?.waveform_url ?? null)
            setTrackUrl(sound?.permalink_url ?? url)
          })
        },
      })
    },
    [updateClock],
  )

  const togglePause = useCallback(() => {
    const widget = widgetRef.current
    if (!widget) return
    if (status === 'playing') widget.pause()
    else widget.play()
  }, [status])

  const replay = useCallback(() => {
    const widget = widgetRef.current
    if (!widget) return
    widget.seekTo(0)
    widget.play()
  }, [])

  return { iframeRef, status, waveformUrl, trackUrl, clockRef, playTrack, togglePause, replay }
}
