import type { Branch } from '../session/session'

interface NextPointsProps {
  branches: Branch[]
  colorOf: (pointId: string) => string
  onOpen: (pointId: string) => void
  onHighlight: (pointId: string | null) => void
}

export function NextPoints({ branches, colorOf, onOpen, onHighlight }: NextPointsProps) {
  if (branches.length === 0) return null

  return (
    <nav className="next-points" aria-label="Points accessibles">
      <p className="mono-dim">Accessibles</p>
      <ul>
        {branches.map((branch) => (
          <li key={branch.id}>
            <button
              className="next-point"
              onClick={() => onOpen(branch.id)}
              onMouseEnter={() => onHighlight(branch.id)}
              onMouseLeave={() => onHighlight(null)}
              onFocus={() => onHighlight(branch.id)}
              onBlur={() => onHighlight(null)}
            >
              <span className="next-point-swatch" style={{ background: colorOf(branch.id) }} aria-hidden="true" />
              {branch.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
