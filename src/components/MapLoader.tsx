import { useMapLoader } from '../map/useMapLoader'
import { ErrorScreen } from './ErrorScreen'
import { LoadingScreen } from './LoadingScreen'
import { Reader } from './Reader'

interface MapLoaderProps {
  experienceId: string
  url: string
  onExit?: () => void
}

export function MapLoader({ experienceId, url, onExit }: MapLoaderProps) {
  const loaded = useMapLoader(url)
  if (loaded.status === 'loading') return <LoadingScreen />
  if (loaded.status === 'error') return <ErrorScreen message={loaded.message} onBack={onExit} />
  return <Reader map={loaded.map} experienceId={experienceId} onExit={onExit} />
}
