import { describe, expect, it } from 'vitest'
import { parseStory, StoryValidationError } from './parseStory'

const node = (choices: { label: string; to: string }[] = []) => ({
  title: 'T',
  soundcloudUrl: 'https://soundcloud.com/a/b',
  choices,
})

const issuesOf = (raw: unknown): string[] => {
  try {
    parseStory(raw)
  } catch (error) {
    if (error instanceof StoryValidationError) return error.issues
    throw error
  }
  return []
}

describe('parseStory', () => {
  it('accepts a valid story with converging choices', () => {
    const story = parseStory({
      start: 'a',
      nodes: {
        a: node([{ label: 'x', to: 'b' }, { label: 'y', to: 'c' }]),
        b: node([{ label: 'z', to: 'c' }]),
        c: node(),
      },
    })
    expect(story.start).toBe('a')
    expect(Object.keys(story.nodes)).toEqual(['a', 'b', 'c'])
    expect(story.nodes.c.choices).toEqual([])
  })

  it('keeps the optional transcript', () => {
    const story = parseStory({ start: 'a', nodes: { a: { ...node(), transcript: 'hello' } } })
    expect(story.nodes.a.transcript).toBe('hello')
  })

  it('rejects an unknown start', () => {
    expect(issuesOf({ start: 'zzz', nodes: { a: node() } })).toContain('"start" must reference an existing node')
  })

  it('rejects a choice targeting an unknown node', () => {
    const issues = issuesOf({ start: 'a', nodes: { a: node([{ label: 'x', to: 'nope' }]) } })
    expect(issues.join()).toContain('unknown node "nope"')
  })

  it('rejects unreachable nodes', () => {
    const issues = issuesOf({ start: 'a', nodes: { a: node(), orphan: node() } })
    expect(issues.join()).toContain('"orphan" is unreachable')
  })

  it('rejects a story without ending', () => {
    const issues = issuesOf({ start: 'a', nodes: { a: node([{ label: 'x', to: 'b' }]), b: node([{ label: 'y', to: 'a' }]) } })
    expect(issues.join()).toContain('no ending')
  })

  it('rejects malformed nodes', () => {
    const issues = issuesOf({ start: 'a', nodes: { a: { title: '', choices: 'x' } } })
    expect(issues.length).toBeGreaterThan(0)
  })
})
