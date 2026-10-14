import { describe, expect, it } from 'vitest'
import { initialSession, isValidSaved, sessionReducer, toSaved } from './session'
import type { Story } from '../story/types'

const story: Story = {
  start: 'a',
  nodes: {
    a: { id: 'a', title: 'A', soundcloudUrl: 'u', choices: [{ label: 'x', to: 'b' }] },
    b: { id: 'b', title: 'B', soundcloudUrl: 'u', choices: [] },
  },
}

describe('sessionReducer', () => {
  it('starts on the given node with an empty path', () => {
    expect(sessionReducer(initialSession, { type: 'start', startId: 'a' })).toEqual({
      currentNodeId: 'a',
      path: [],
      choicesRevealed: false,
    })
  })

  it('moves forward and records the path, hiding choices again', () => {
    const revealed = sessionReducer(sessionReducer(initialSession, { type: 'start', startId: 'a' }), { type: 'reveal' })
    expect(sessionReducer(revealed, { type: 'choose', to: 'b' })).toEqual({
      currentNodeId: 'b',
      path: ['a'],
      choicesRevealed: false,
    })
  })

  it('ignores a choice before the story started', () => {
    expect(sessionReducer(initialSession, { type: 'choose', to: 'b' })).toBe(initialSession)
  })

  it('restarts to the initial state', () => {
    const moved = sessionReducer(sessionReducer(initialSession, { type: 'start', startId: 'a' }), { type: 'choose', to: 'b' })
    expect(sessionReducer(moved, { type: 'restart' })).toEqual(initialSession)
  })
})

describe('saved session', () => {
  it('round-trips through toSaved', () => {
    const session = { currentNodeId: 'b', path: ['a'], choicesRevealed: true }
    expect(toSaved(session)).toEqual({ currentNodeId: 'b', path: ['a'] })
    expect(toSaved(initialSession)).toBeNull()
  })

  it('rejects saves referencing unknown nodes', () => {
    expect(isValidSaved({ currentNodeId: 'b', path: ['a'] }, story)).toBe(true)
    expect(isValidSaved({ currentNodeId: 'zzz', path: [] }, story)).toBe(false)
    expect(isValidSaved({ currentNodeId: 'a', path: ['zzz'] }, story)).toBe(false)
    expect(isValidSaved(null, story)).toBe(false)
  })
})
