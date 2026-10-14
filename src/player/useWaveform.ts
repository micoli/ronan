import { useEffect, useState } from 'react'

const cache = new Map<string, number[]>()

const normalize = (samples: number[], height: number): number[] => {
  const max = height > 0 ? height : Math.max(...samples, 1)
  return samples.map((sample) => Math.min(1, Math.max(0, sample / max)))
}

export const useWaveform = (url: string | null): number[] | null => {
  const [samples, setSamples] = useState<number[] | null>(null)

  useEffect(() => {
    setSamples(null)
    if (!url) return
    const cached = cache.get(url)
    if (cached) return setSamples(cached)
    let cancelled = false
    fetch(url)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((json: { samples?: number[]; height?: number }) => {
        if (cancelled || !Array.isArray(json.samples) || json.samples.length === 0) return
        const normalized = normalize(json.samples, json.height ?? 0)
        cache.set(url, normalized)
        setSamples(normalized)
      })
      .catch(() => {
        // generic pulse is used when the waveform is unavailable
      })
    return () => {
      cancelled = true
    }
  }, [url])

  return samples
}
