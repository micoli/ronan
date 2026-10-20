import type {
  Capsule,
  Connection,
  ExperienceMap,
  Family,
  FamilyShape,
  MapSettings,
  Point,
  Position,
} from './types'

export class MapValidationError extends Error {
  constructor(readonly issues: string[]) {
    super(`Invalid map:\n- ${issues.join('\n- ')}`)
  }
}

const SHAPES: FamilyShape[] = ['globe', 'octahedron', 'pyramid', 'cube', 'polyhedron']
const HEX_COLOR = /^#[0-9a-f]{6}$/i

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== ''

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

const parseSettings = (raw: unknown, issues: string[]): MapSettings => {
  const settings: MapSettings = { presentation: 'full', navigation: 'connected', unavailable: 'dimmed' }
  if (raw === undefined) return settings
  if (!isRecord(raw)) {
    issues.push('"settings" must be an object')
    return settings
  }
  if (raw.presentation !== undefined) {
    if (raw.presentation === 'local' || raw.presentation === 'full') settings.presentation = raw.presentation
    else issues.push('settings.presentation must be "local" or "full"')
  }
  if (raw.navigation !== undefined) {
    if (raw.navigation === 'connected' || raw.navigation === 'free' || raw.navigation === 'story') settings.navigation = raw.navigation
    else issues.push('settings.navigation must be "connected", "free" or "story"')
  }
  if (raw.unavailable !== undefined) {
    if (raw.unavailable === 'hidden' || raw.unavailable === 'dimmed') settings.unavailable = raw.unavailable
    else issues.push('settings.unavailable must be "hidden" or "dimmed"')
  }
  return settings
}

const parseFamilies = (raw: unknown, issues: string[]): Record<string, Family> => {
  const families: Record<string, Family> = {}
  if (raw === undefined) return families
  if (!isRecord(raw)) {
    issues.push('"families" must be an object')
    return families
  }
  for (const [id, value] of Object.entries(raw)) {
    if (!isRecord(value) || !isNonEmptyString(value.label)) {
      issues.push(`family "${id}": needs a "label"`)
      continue
    }
    if (typeof value.color !== 'string' || !HEX_COLOR.test(value.color)) {
      issues.push(`family "${id}": "color" must be a hex color like #aabbcc`)
      continue
    }
    if (!SHAPES.includes(value.shape as FamilyShape)) {
      issues.push(`family "${id}": "shape" must be one of ${SHAPES.join(', ')}`)
      continue
    }
    families[id] = { id, label: value.label, color: value.color, shape: value.shape as FamilyShape }
  }
  return families
}

const parseCapsule = (raw: unknown, pointId: string, index: number, issues: string[]): Capsule | null => {
  if (!isRecord(raw) || !isNonEmptyString(raw.soundcloudUrl)) {
    issues.push(`point "${pointId}": capsule #${index} needs a "soundcloudUrl"`)
    return null
  }
  return { soundcloudUrl: raw.soundcloudUrl, title: isNonEmptyString(raw.title) ? raw.title : undefined }
}

const parseConnection = (raw: unknown, pointId: string, index: number, issues: string[]): Connection | null => {
  if (!isRecord(raw) || !isNonEmptyString(raw.to)) {
    issues.push(`point "${pointId}": connection #${index} needs a "to"`)
    return null
  }
  const requires = raw.requires ?? []
  const unless = raw.unless ?? []
  if (!isStringArray(requires) || !isStringArray(unless)) {
    issues.push(`point "${pointId}": connection #${index} "requires" and "unless" must be arrays of point ids`)
    return null
  }
  return { to: raw.to, label: isNonEmptyString(raw.label) ? raw.label : undefined, requires, unless }
}

const parsePosition = (raw: unknown): Position | undefined =>
  Array.isArray(raw) && raw.length === 3 && raw.every((n) => typeof n === 'number') ? (raw as Position) : undefined

const parsePoint = (id: string, raw: unknown, issues: string[]): Point | null => {
  if (!isRecord(raw)) {
    issues.push(`point "${id}": must be an object`)
    return null
  }
  if (!isNonEmptyString(raw.title)) issues.push(`point "${id}": missing "title"`)
  if (!Array.isArray(raw.capsules) || raw.capsules.length === 0) issues.push(`point "${id}": needs at least one capsule`)
  if (raw.connections !== undefined && !Array.isArray(raw.connections)) issues.push(`point "${id}": "connections" must be an array`)
  if (raw.families !== undefined && !isStringArray(raw.families)) issues.push(`point "${id}": "families" must be an array of family ids`)
  if (raw.position !== undefined && !parsePosition(raw.position)) issues.push(`point "${id}": "position" must be [x, y, z]`)

  const capsules = (Array.isArray(raw.capsules) ? raw.capsules : [])
    .map((capsule, index) => parseCapsule(capsule, id, index, issues))
    .filter((capsule): capsule is Capsule => capsule !== null)
  const connections = (Array.isArray(raw.connections) ? raw.connections : [])
    .map((connection, index) => parseConnection(connection, id, index, issues))
    .filter((connection): connection is Connection => connection !== null)

  return {
    id,
    title: String(raw.title ?? ''),
    capsules,
    text: isNonEmptyString(raw.text) ? raw.text : undefined,
    image: isNonEmptyString(raw.image) ? raw.image : undefined,
    families: isStringArray(raw.families) ? raw.families : [],
    hinge: raw.hinge === true,
    final: raw.final === true,
    position: parsePosition(raw.position),
    connections,
  }
}

const checkReferences = (map: ExperienceMap, issues: string[]): void => {
  for (const startId of map.start) {
    if (!map.points[startId]) issues.push(`"start" references unknown point "${startId}"`)
  }
  for (const point of Object.values(map.points)) {
    point.families
      .filter((familyId) => !map.families[familyId])
      .forEach((familyId) => issues.push(`point "${point.id}": unknown family "${familyId}"`))
    for (const connection of point.connections) {
      if (!map.points[connection.to]) issues.push(`point "${point.id}": connection targets unknown point "${connection.to}"`)
      for (const ref of [...connection.requires, ...connection.unless]) {
        if (!map.points[ref]) issues.push(`point "${point.id}": connection to "${connection.to}" references unknown point "${ref}"`)
      }
    }
  }
}

const findOrphans = (map: ExperienceMap): string[] => {
  const seen = new Set<string>()
  const queue = [...map.start]
  while (queue.length > 0) {
    const id = queue.pop() as string
    if (seen.has(id) || !map.points[id]) continue
    seen.add(id)
    map.points[id].connections.forEach((connection) => queue.push(connection.to))
  }
  return Object.keys(map.points).filter((id) => !seen.has(id))
}

export const parseMap = (raw: unknown): ExperienceMap => {
  if (!isRecord(raw) || !isRecord(raw.points)) throw new MapValidationError(['root must contain "start" and "points"'])
  const issues: string[] = []

  const points: Record<string, Point> = {}
  for (const [id, rawPoint] of Object.entries(raw.points)) {
    const point = parsePoint(id, rawPoint, issues)
    if (point) points[id] = point
  }

  const start = isStringArray(raw.start) ? raw.start : isNonEmptyString(raw.start) ? [raw.start] : []
  if (start.length === 0) issues.push('"start" needs at least one point id')

  const map: ExperienceMap = {
    title: isNonEmptyString(raw.title) ? raw.title : 'Ronan',
    settings: parseSettings(raw.settings, issues),
    start,
    families: parseFamilies(raw.families, issues),
    points,
  }

  if (map.settings.presentation === 'local' && start.length > 1) issues.push('a "local" map needs exactly one start point')
  checkReferences(map, issues)
  if (issues.length > 0) throw new MapValidationError(issues)

  findOrphans(map).forEach((id) => issues.push(`point "${id}" cannot be reached from any start point`))
  if (issues.length > 0) throw new MapValidationError(issues)
  return map
}
