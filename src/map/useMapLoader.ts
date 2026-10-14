import { useEffect, useState } from 'react'
import { loadMap } from './loadMap'
import type { ExperienceMap } from './types'

export type MapLoadState =
  | { status: 'loading' }
  | { status: 'ready'; map: ExperienceMap }
  | { status: 'error'; message: string }

export const useMapLoader = (): MapLoadState => {
  const [state, setState] = useState<MapLoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    loadMap()
      .then((map) => !cancelled && setState({ status: 'ready', map }))
      .catch((error: unknown) => !cancelled && setState({ status: 'error', message: String(error instanceof Error ? error.message : error) }))
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
