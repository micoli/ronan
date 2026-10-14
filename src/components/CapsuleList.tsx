import type { Capsule } from '../map/types'

interface CapsuleListProps {
  capsules: Capsule[]
  activeIndex: number
  onSelect: (index: number) => void
}

export function CapsuleList({ capsules, activeIndex, onSelect }: CapsuleListProps) {
  return (
    <ol className="capsule-list">
      {capsules.map((capsule, index) => (
        <li key={capsule.soundcloudUrl + index}>
          <button className="capsule-button" aria-current={index === activeIndex} onClick={() => onSelect(index)}>
            {capsule.title ?? `Enregistrement ${index + 1}`}
          </button>
        </li>
      ))}
    </ol>
  )
}
