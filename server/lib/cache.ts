type CacheEntry<T> = {
  value: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<unknown>>()

export async function cachedValue<T>(
  key: string,
  ttlMs: number | ((response: T) => number),
  fetchCallback: () => Promise<T>,
): Promise<T> {
  const now = Date.now()
  const cached = cache.get(key)

  if (cached) {
    const ttl = typeof ttlMs === 'function' ? ttlMs(cached.value as T) : ttlMs

    if (now - cached.timestamp < ttl) {
      return cached.value as T
    }
  }

  const value = await fetchCallback()

  if (value) {
    cache.set(key, { value, timestamp: now })
  }

  return value
}
