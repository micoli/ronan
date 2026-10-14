import { parseStory } from './parseStory'
import type { Story } from './types'

export const storyUrl: string =
  import.meta.env.VITE_STORY_URL || `${import.meta.env.BASE_URL}story.json`

export const loadStory = async (url: string = storyUrl): Promise<Story> => {
  const response = await fetch(url, { cache: 'no-cache' })
  if (!response.ok) throw new Error(`Cannot load story (${response.status}) from ${url}`)
  return parseStory(await response.json())
}
