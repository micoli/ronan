import type { Branch } from '../session/session'

interface ChoiceListProps {
  branches: Branch[]
  onOpen: (pointId: string) => void
}

export function ChoiceList({ branches, onOpen }: ChoiceListProps) {
  return (
    <ul className="choice-list">
      {branches.map((branch) => (
        <li key={branch.id}>
          <button className="button" onClick={() => onOpen(branch.id)}>
            {branch.label}
          </button>
        </li>
      ))}
    </ul>
  )
}
