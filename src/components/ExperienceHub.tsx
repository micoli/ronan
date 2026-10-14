import { useState } from 'react'
import { resolveMapUrl } from '../experiences/loadIndex'
import { readSelectedExperienceId, writeSelectedExperienceId } from '../experiences/selectedExperienceUrl'
import { useExperienceIndex } from '../experiences/useExperienceIndex'
import { ErrorScreen } from './ErrorScreen'
import { ExperienceMenu } from './ExperienceMenu'
import { LoadingScreen } from './LoadingScreen'
import { MapLoader } from './MapLoader'

export function ExperienceHub() {
  const loaded = useExperienceIndex()
  const [selectedId, setSelectedId] = useState<string | null>(readSelectedExperienceId)

  if (loaded.status === 'loading') return <LoadingScreen />
  if (loaded.status === 'error') return <ErrorScreen message={loaded.message} />

  const { experiences } = loaded.index
  const hasChoice = experiences.length > 1
  const selected = experiences.find((experience) => experience.id === selectedId) ?? (hasChoice ? null : experiences[0])

  const select = (id: string) => {
    writeSelectedExperienceId(id)
    setSelectedId(id)
  }
  const exit = () => {
    writeSelectedExperienceId(null)
    setSelectedId(null)
  }

  if (!selected) return <ExperienceMenu experiences={experiences} onSelect={select} />
  return <MapLoader key={selected.id} experienceId={selected.id} url={resolveMapUrl(selected)} onExit={hasChoice ? exit : undefined} />
}
