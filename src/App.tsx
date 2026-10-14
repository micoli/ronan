import { ExperienceHub } from './components/ExperienceHub'
import { MapLoader } from './components/MapLoader'
import { singleMapUrl } from './experiences/loadIndex'

const CUSTOM_EXPERIENCE_ID = 'custom'

export function App() {
  if (singleMapUrl) return <MapLoader experienceId={CUSTOM_EXPERIENCE_ID} url={singleMapUrl} />
  return <ExperienceHub />
}
