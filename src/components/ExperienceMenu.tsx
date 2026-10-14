import type { ExperienceEntry } from '../experiences/types'

interface ExperienceMenuProps {
  experiences: ExperienceEntry[]
  onSelect: (id: string) => void
}

export function ExperienceMenu({ experiences, onSelect }: ExperienceMenuProps) {
  return (
    <main className="screen">
      <h1 className="title">RONAN</h1>
      <p className="mono-dim">Choisissez une expérience</p>
      <ul className="experience-list">
        {experiences.map((experience) => (
          <li key={experience.id}>
            <button className="experience" onClick={() => onSelect(experience.id)}>
              <span className="experience-title">{experience.title}</span>
              {experience.description && <span className="experience-description">{experience.description}</span>}
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
