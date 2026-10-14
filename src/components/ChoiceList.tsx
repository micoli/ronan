import type { Choice } from '../story/types'

interface ChoiceListProps {
  choices: Choice[]
  onChoose: (to: string) => void
}

export function ChoiceList({ choices, onChoose }: ChoiceListProps) {
  return (
    <ul className="choice-list">
      {choices.map((choice) => (
        <li key={`${choice.to}-${choice.label}`}>
          <button className="button" onClick={() => onChoose(choice.to)}>
            {choice.label}
          </button>
        </li>
      ))}
    </ul>
  )
}
