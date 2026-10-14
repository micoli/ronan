import { useEffect, useState } from 'react'
import { loadIndex } from './loadIndex'
import type { ExperienceIndex } from './types'

export type IndexLoadState =
  | { status: 'loading' }
  | { status: 'ready'; index: ExperienceIndex }
  | { status: 'error'; message: string }

export const useExperienceIndex = (): IndexLoadState => {
  const [state, setState] = useState<IndexLoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    loadIndex()
      .then((index) => !cancelled && setState({ status: 'ready', index }))
      .catch((error: unknown) => !cancelled && setState({ status: 'error', message: String(error instanceof Error ? error.message : error) }))
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
