import type { Choice, Story, StoryNode } from './types'

export class StoryValidationError extends Error {
  constructor(readonly issues: string[]) {
    super(`Invalid story:\n- ${issues.join('\n- ')}`)
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== ''

const parseChoice = (raw: unknown, nodeId: string, index: number, issues: string[]): Choice | null => {
  if (!isRecord(raw) || !isNonEmptyString(raw.label) || !isNonEmptyString(raw.to)) {
    issues.push(`node "${nodeId}": choice #${index} needs a non-empty "label" and "to"`)
    return null
  }
  return { label: raw.label, to: raw.to }
}

const parseNode = (id: string, raw: unknown, issues: string[]): StoryNode | null => {
  if (!isRecord(raw)) {
    issues.push(`node "${id}": must be an object`)
    return null
  }
  if (!isNonEmptyString(raw.title)) issues.push(`node "${id}": missing "title"`)
  if (!isNonEmptyString(raw.soundcloudUrl)) issues.push(`node "${id}": missing "soundcloudUrl"`)
  if (!Array.isArray(raw.choices)) {
    issues.push(`node "${id}": "choices" must be an array (empty for an ending)`)
    return null
  }
  const choices = raw.choices
    .map((choice, index) => parseChoice(choice, id, index, issues))
    .filter((choice): choice is Choice => choice !== null)
  return {
    id,
    title: String(raw.title ?? ''),
    soundcloudUrl: String(raw.soundcloudUrl ?? ''),
    transcript: isNonEmptyString(raw.transcript) ? raw.transcript : undefined,
    choices,
  }
}

const findUnreachable = (start: string, nodes: Record<string, StoryNode>): string[] => {
  const seen = new Set<string>()
  const queue = [start]
  while (queue.length > 0) {
    const id = queue.pop() as string
    if (seen.has(id) || !nodes[id]) continue
    seen.add(id)
    nodes[id].choices.forEach((choice) => queue.push(choice.to))
  }
  return Object.keys(nodes).filter((id) => !seen.has(id))
}

export const parseStory = (raw: unknown): Story => {
  const issues: string[] = []
  if (!isRecord(raw) || !isRecord(raw.nodes)) throw new StoryValidationError(['root must contain "start" and "nodes"'])

  const nodes: Record<string, StoryNode> = {}
  for (const [id, rawNode] of Object.entries(raw.nodes)) {
    const node = parseNode(id, rawNode, issues)
    if (node) nodes[id] = node
  }

  const start = raw.start
  if (!isNonEmptyString(start) || !nodes[start]) issues.push(`"start" must reference an existing node`)

  for (const node of Object.values(nodes)) {
    node.choices
      .filter((choice) => !nodes[choice.to])
      .forEach((choice) => issues.push(`node "${node.id}": choice "${choice.label}" targets unknown node "${choice.to}"`))
  }

  if (issues.length > 0) throw new StoryValidationError(issues)

  const startId = start as string
  findUnreachable(startId, nodes).forEach((id) => issues.push(`node "${id}" is unreachable from "${startId}"`))
  if (!Object.values(nodes).some((node) => node.choices.length === 0)) issues.push('story has no ending (a node with no choices)')
  if (issues.length > 0) throw new StoryValidationError(issues)

  return { start: startId, nodes }
}
