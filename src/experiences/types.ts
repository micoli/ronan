export interface ExperienceEntry {
  id: string
  title: string
  description?: string
  map: string
}

export interface ExperienceIndex {
  experiences: ExperienceEntry[]
}
