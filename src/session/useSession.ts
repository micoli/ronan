import { useCallback, useEffect, useMemo, useReducer } from 'react'
import type { ExperienceMap } from '../map/types'
import { branchesOf, createSessionReducer, initialSession, openablePointIds, toSaved } from './session'
import { readSavedSession, writeSavedSession } from './savedSessionStorage'

export const useSession = (map: ExperienceMap) => {
  const reducer = useMemo(() => createSessionReducer(map), [map])
  const [session, dispatch] = useReducer(reducer, initialSession)
  const saved = useMemo(() => (session.started ? null : readSavedSession(map)), [map, session.started])
  const openable = useMemo(() => openablePointIds(map, session), [map, session])
  const branches = useMemo(() => branchesOf(map, session), [map, session])

  useEffect(() => {
    const snapshot = toSaved(session)
    if (snapshot) writeSavedSession(snapshot)
  }, [session])

  const begin = useCallback(() => {
    writeSavedSession(null)
    dispatch({ type: 'begin' })
  }, [])
  const open = useCallback((pointId: string) => dispatch({ type: 'open', pointId }), [])
  const resume = useCallback(() => saved && dispatch({ type: 'resume', saved }), [saved])
  const selectCapsule = useCallback((index: number) => dispatch({ type: 'selectCapsule', index }), [])
  const reveal = useCallback(() => dispatch({ type: 'reveal' }), [])
  const restart = useCallback(() => {
    writeSavedSession(null)
    dispatch({ type: 'restart' })
  }, [])

  return { session, saved, openable, branches, begin, open, resume, selectCapsule, reveal, restart }
}
