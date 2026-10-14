import { useEffect, useState } from 'react'
import { loadMap } from './loadMap'
import type { ExperienceMap } from './types'

export type MapLoadState =
  | { status: 'loading' }
  | { status: 'ready'; map: ExperienceMap }
  | { status: 'error'; message: string }

export const useMapLoader = (url: string): MapLoadState => {
  const [state, setState] = useState<MapLoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    loadMap(url)
      .then((map) => !cancelled && setState({ status: 'ready', map }))
      .catch((error: unknown) => !cancelled && setState({ status: 'error', message: String(error instanceof Error ? error.message : error) }))
    return () => {
      cancelled = true
    }
  }, [url])

  return state
}
