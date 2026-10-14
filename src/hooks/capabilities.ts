import { useSyncExternalStore } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const subscribeReducedMotion = (onChange: () => void) => {
  const media = window.matchMedia(REDUCED_MOTION_QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

export const usePrefersReducedMotion = (): boolean =>
  useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  )

export const hasWebGL = (): boolean => {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export interface Quality {
  maxDpr: number
  stars: number
  ringSegments: number
}

export const detectQuality = (): Quality => {
  const lowPower = navigator.hardwareConcurrency <= 4 || window.matchMedia('(pointer: coarse)').matches
  return lowPower
    ? { maxDpr: 1.5, stars: 350, ringSegments: 96 }
    : { maxDpr: 2, stars: 900, ringSegments: 160 }
}
