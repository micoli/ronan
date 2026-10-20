export type Presentation = 'local' | 'full'
export type Navigation = 'connected' | 'free' | 'story'
export type UnavailableStyle = 'hidden' | 'dimmed'
export type FamilyShape = 'globe' | 'octahedron' | 'pyramid' | 'cube' | 'polyhedron'

export interface Capsule {
  title?: string
  soundcloudUrl: string
}

export interface Family {
  id: string
  label: string
  color: string
  shape: FamilyShape
}

export interface Connection {
  to: string
  label?: string
  requires: string[]
  unless: string[]
}

export type Position = [number, number, number]

export interface Point {
  id: string
  title: string
  capsules: Capsule[]
  text?: string
  image?: string
  families: string[]
  hinge: boolean
  final: boolean
  position?: Position
  connections: Connection[]
}

export interface MapSettings {
  presentation: Presentation
  navigation: Navigation
  unavailable: UnavailableStyle
}

export interface ExperienceMap {
  title: string
  settings: MapSettings
  start: string[]
  families: Record<string, Family>
  points: Record<string, Point>
}
