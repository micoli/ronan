import { useEffect, useState } from 'react'
import { loadStory } from './loadStory'
import type { Story } from './types'

export type StoryLoadState =
  | { status: 'loading' }
  | { status: 'ready'; story: Story }
  | { status: 'error'; message: string }

export const useStoryLoader = (): StoryLoadState => {
  const [state, setState] = useState<StoryLoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    loadStory()
      .then((story) => !cancelled && setState({ status: 'ready', story }))
      .catch((error: unknown) => !cancelled && setState({ status: 'error', message: String(error instanceof Error ? error.message : error) }))
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
