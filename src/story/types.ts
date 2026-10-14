export interface Choice {
  label: string
  to: string
}

export interface StoryNode {
  id: string
  title: string
  soundcloudUrl: string
  transcript?: string
  choices: Choice[]
}

export interface Story {
  start: string
  nodes: Record<string, StoryNode>
}
