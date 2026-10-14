import { Canvas, useThree } from '@react-three/fiber'
import type { RefObject } from 'react'
import type { Choice } from '../story/types'
import type { Quality } from '../hooks/capabilities'
import type { PlaybackClock } from '../player/useSoundCloudPlayer'
import { ChoiceBranch } from './ChoiceBranch'
import { layoutBranches } from './layoutBranches'
import { NodeCore } from './NodeCore'
import { PathTrail } from './PathTrail'
import { Starfield } from './Starfield'
import { WaveformRing } from './WaveformRing'

interface SceneProps {
  path: string[]
  choices: Choice[]
  samples: number[] | null
  clockRef: RefObject<PlaybackClock>
  quality: Quality
  onChoose: (to: string) => void
}

const CORE_POSITION: [number, number, number] = [0, -2.1, 0]

function Branches({ choices, onChoose }: Pick<SceneProps, 'choices' | 'onChoose'>) {
  const aspect = useThree((state) => state.size.width / state.size.height)
  const targets = layoutBranches(choices.length, aspect)

  return (
    <group position={CORE_POSITION}>
      {choices.map((choice, index) => (
        <ChoiceBranch
          key={`${choice.to}-${choice.label}`}
          label={choice.label}
          target={targets[index]}
          delay={index * 0.15}
          onChoose={() => onChoose(choice.to)}
        />
      ))}
    </group>
  )
}

export function Scene({ path, choices, samples, clockRef, quality, onChoose }: SceneProps) {
  return (
    <Canvas
      className="scene"
      dpr={[1, quality.maxDpr]}
      gl={{ antialias: quality.maxDpr > 1.5, alpha: false }}
      camera={{ position: [0, 0, 7.5], fov: 50 }}
    >
      <color attach="background" args={['#000000']} />
      <Starfield count={quality.stars} />
      <group position={CORE_POSITION}>
        <PathTrail path={path} />
        <NodeCore />
        <WaveformRing samples={samples} clockRef={clockRef} segments={quality.ringSegments} />
      </group>
      <Branches choices={choices} onChoose={onChoose} />
    </Canvas>
  )
}
