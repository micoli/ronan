import { Canvas, useThree } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import type { Quality } from '../hooks/capabilities'
import type { PlaybackClock } from '../player/useSoundCloudPlayer'
import type { Branch } from '../session/session'
import { ChoiceBranch } from './ChoiceBranch'
import { LabelProjector, type LabelAnchor } from './LabelProjector'
import { layoutBranches, type Vec3 } from './layoutBranches'
import { NodeCore } from './NodeCore'
import { PathTrail } from './PathTrail'
import { Starfield } from './Starfield'
import { WaveformRing } from './WaveformRing'

interface SceneProps {
  trail: string[]
  branches: Branch[]
  samples: number[] | null
  clockRef: RefObject<PlaybackClock>
  quality: Quality
  onOpen: (pointId: string) => void
}

const CORE_POSITION: Vec3 = [0, -2.1, 0]
const STAGGER_SECONDS = 0.15
const GROW_SECONDS = 0.8

interface BranchesProps {
  branches: Branch[]
  labels: RefObject<Map<string, HTMLElement>>
}

function Branches({ branches, labels }: BranchesProps) {
  const aspect = useThree((state) => state.size.width / state.size.height)
  const targets = layoutBranches(branches.length, aspect)
  const anchors: LabelAnchor[] = branches.map((branch, index) => ({
    id: branch.id,
    position: [CORE_POSITION[0] + targets[index][0], CORE_POSITION[1] + targets[index][1], CORE_POSITION[2] + targets[index][2]],
  }))

  return (
    <>
      <group position={CORE_POSITION}>
        {branches.map((branch, index) => (
          <ChoiceBranch key={branch.id} target={targets[index]} delay={index * STAGGER_SECONDS} />
        ))}
      </group>
      <LabelProjector anchors={anchors} labels={labels} />
    </>
  )
}

export function LocalScene({ trail, branches, samples, clockRef, quality, onOpen }: SceneProps) {
  const labels = useRef(new Map<string, HTMLElement>())

  return (
    <>
      <Canvas
        className="scene"
        dpr={[1, quality.maxDpr]}
        gl={{ antialias: quality.maxDpr > 1.5, alpha: false }}
        camera={{ position: [0, 0, 7.5], fov: 50 }}
      >
        <color attach="background" args={['#000000']} />
        <Starfield count={quality.stars} />
        <group position={CORE_POSITION}>
          <PathTrail path={trail} />
          <NodeCore />
          <WaveformRing samples={samples} clockRef={clockRef} segments={quality.ringSegments} />
        </group>
        <Branches branches={branches} labels={labels} />
      </Canvas>
      <div className="branch-labels">
        {branches.map((branch, index) => (
          <button
            key={branch.id}
            ref={(element) => {
              if (element) labels.current.set(branch.id, element)
              else labels.current.delete(branch.id)
            }}
            className="branch-label"
            style={{ animationDelay: `${index * STAGGER_SECONDS + GROW_SECONDS * 0.7}s` }}
            onClick={() => onOpen(branch.id)}
          >
            {branch.label}
          </button>
        ))}
      </div>
    </>
  )
}
