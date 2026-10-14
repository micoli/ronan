import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { parseIndex } from '../src/experiences/parseIndex'
import { auditMap } from '../src/map/auditMap'
import { parseMap } from '../src/map/parseMap'
import type { ExperienceMap } from '../src/map/types'

const PUBLIC_DIR = resolve(import.meta.dirname, '../public')
const isUrl = (target: string): boolean => /^https?:\/\//.test(target)

interface Report {
  target: string
  errors: string[]
  warnings: string[]
  summary: string
}

const readSource = async (target: string): Promise<string> => {
  if (!isUrl(target)) return readFileSync(target, 'utf8')
  const response = await fetch(target)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.text()
}

const missingLocalImages = (map: ExperienceMap): string[] =>
  Object.values(map.points)
    .filter((point) => point.image && !/^(https?:)?\/\//.test(point.image))
    .filter((point) => !existsSync(join(PUBLIC_DIR, point.image as string)))
    .map((point) => `point "${point.id}": image "${point.image}" not found in public/`)

const describeMap = (map: ExperienceMap): string => {
  const points = Object.values(map.points)
  const capsules = points.reduce((sum, point) => sum + point.capsules.length, 0)
  return [
    `${points.length} points`,
    `${capsules} capsules`,
    `${Object.keys(map.families).length} families`,
    `${points.filter((point) => point.hinge).length} hinges`,
    `${points.filter((point) => point.final).length} final`,
    `presentation ${map.settings.presentation}`,
  ].join(', ')
}

const validateMap = (target: string, source: string): Report => {
  try {
    const map = parseMap(JSON.parse(source))
    return {
      target,
      errors: isUrl(target) ? [] : missingLocalImages(map),
      warnings: auditMap(map),
      summary: describeMap(map),
    }
  } catch (error) {
    return { target, errors: toIssues(error), warnings: [], summary: '' }
  }
}

const validateIndex = (target: string, source: string): Report => {
  try {
    const index = parseIndex(JSON.parse(source))
    const errors = isUrl(target)
      ? []
      : index.experiences
          .filter((entry) => !isUrl(entry.map) && !existsSync(resolve(dirname(target), entry.map)))
          .map((entry) => `experience "${entry.id}": map file "${entry.map}" not found`)
    return { target, errors, warnings: [], summary: `${index.experiences.length} experiences` }
  } catch (error) {
    return { target, errors: toIssues(error), warnings: [], summary: '' }
  }
}

const toIssues = (error: unknown): string[] => {
  if (error instanceof Error && 'issues' in error && Array.isArray(error.issues)) return error.issues as string[]
  return [error instanceof Error ? error.message : String(error)]
}

const defaultTargets = (): string[] => {
  const mapsDir = join(PUBLIC_DIR, 'maps')
  const maps = readdirSync(mapsDir).filter((name) => name.endsWith('.json') && name !== 'index.json')
  return [join(mapsDir, 'index.json'), ...maps.map((name) => join(mapsDir, name))]
}

const validate = async (target: string): Promise<Report> => {
  let source: string
  try {
    source = await readSource(target)
  } catch (error) {
    return { target, errors: [`cannot read: ${error instanceof Error ? error.message : String(error)}`], warnings: [], summary: '' }
  }
  const isIndex = target.endsWith('index.json') || source.includes('"experiences"')
  return isIndex ? validateIndex(target, source) : validateMap(target, source)
}

const main = async (): Promise<void> => {
  const args = process.argv.slice(2)
  const strict = args.includes('--strict')
  const targets = args.filter((arg) => !arg.startsWith('--'))
  const reports: Report[] = []
  for (const target of targets.length > 0 ? targets : defaultTargets()) reports.push(await validate(target))

  let failed = false
  for (const report of reports) {
    const label = isUrl(report.target) ? report.target : report.target.replace(`${process.cwd()}/`, '')
    const hasErrors = report.errors.length > 0
    const hasWarnings = report.warnings.length > 0
    failed ||= hasErrors || (strict && hasWarnings)
    console.log(`${hasErrors ? '✗' : '✓'} ${label}${report.summary ? ` — ${report.summary}` : ''}`)
    report.errors.forEach((issue) => console.log(`    error: ${issue}`))
    report.warnings.forEach((issue) => console.log(`    warning: ${issue}`))
  }
  console.log(failed ? '\nValidation failed.' : '\nAll files are valid.')
  process.exit(failed ? 1 : 0)
}

void main()
