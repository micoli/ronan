export type Vec3 = [number, number, number]

const PORTRAIT_MAX_ASPECT = 1

export const layoutBranches = (count: number, aspect: number): Vec3[] => {
  if (aspect < PORTRAIT_MAX_ASPECT) {
    const spacing = Math.min(1.05, 4.2 / Math.max(count, 1))
    return Array.from({ length: count }, (_, index): Vec3 => [
      index % 2 === 0 ? -0.55 : 0.55,
      1.6 + index * spacing,
      0,
    ])
  }
  return Array.from({ length: count }, (_, index): Vec3 => [
    (index - (count - 1) / 2) * 3,
    2 + (index % 2) * 0.7,
    0,
  ])
}
