const PARAM = 'map'

export const readSelectedExperienceId = (): string | null => new URLSearchParams(window.location.search).get(PARAM)

export const writeSelectedExperienceId = (id: string | null): void => {
  const url = new URL(window.location.href)
  if (id === null) url.searchParams.delete(PARAM)
  else url.searchParams.set(PARAM, id)
  window.history.replaceState(null, '', url)
}
