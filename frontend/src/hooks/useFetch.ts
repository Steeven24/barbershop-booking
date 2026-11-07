import { useEffect, useState } from 'react'

interface FetchState<T> {
  data: T | null
  error: string | null
  loading: boolean
}

interface Resolved<T> {
  fetcher: () => Promise<T>
  data: T | null
  error: string | null
}

export function useFetch<T>(fetcher: () => Promise<T>): FetchState<T> {
  const [resolved, setResolved] = useState<Resolved<T> | null>(null)

  useEffect(() => {
    let cancelled = false
    fetcher()
      .then((data) => !cancelled && setResolved({ fetcher, data, error: null }))
      .catch((err: Error) => !cancelled && setResolved({ fetcher, data: null, error: err.message }))
    return () => {
      cancelled = true
    }
  }, [fetcher])

  // Results from a previous fetcher (e.g. another day) are stale: report loading instead
  if (resolved?.fetcher !== fetcher) return { data: null, error: null, loading: true }
  return { data: resolved.data, error: resolved.error, loading: false }
}
