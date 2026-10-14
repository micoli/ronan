import { useCallback, useEffect, useMemo, useReducer } from 'react'
import type { Story } from '../story/types'
import { initialSession, sessionReducer, toSaved } from './session'
import { readSavedSession, writeSavedSession } from './savedSessionStorage'

export const useSession = (story: Story) => {
  const [session, dispatch] = useReducer(sessionReducer, initialSession)
  const isHome = session.currentNodeId === null
  const saved = useMemo(() => (isHome ? readSavedSession(story) : null), [story, isHome])

  useEffect(() => {
    if (session.currentNodeId === null) return
    writeSavedSession(toSaved(session))
  }, [session])

  const start = useCallback(() => {
    writeSavedSession(null)
    dispatch({ type: 'start', startId: story.start })
  }, [story.start])
  const resume = useCallback(() => saved && dispatch({ type: 'resume', saved }), [saved])
  const choose = useCallback((to: string) => dispatch({ type: 'choose', to }), [])
  const back = useCallback(() => dispatch({ type: 'back' }), [])
  const revealChoices = useCallback(() => dispatch({ type: 'reveal' }), [])
  const restart = useCallback(() => {
    writeSavedSession(null)
    dispatch({ type: 'restart' })
  }, [])

  return { session, saved, start, resume, choose, back, revealChoices, restart }
}
