import { trpc } from '@/lib/trpc'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { addMinutes, isBefore } from 'date-fns'

export function useLatestGuess() {
  const latestGuessQuery = useQuery({
    ...trpc.latestUserGuess.queryOptions(),
    refetchInterval(query) {
      const guessedAt = query.state.data?.guessedAt
      const isResolved = query.state.data?.resolvedAt

      if (!guessedAt || isResolved) {
        return false
      }

      const shouldBeResolved = isBefore(addMinutes(guessedAt, 1), new Date())

      if (shouldBeResolved) {
        return 1000
      }

      return 1000 * 10
    },
  })

  const latestGuessQueryKey = trpc.latestUserGuess.queryKey()
  const queryClient = useQueryClient()

  return {
    query: latestGuessQuery,
    queryKey: latestGuessQueryKey,
    refresh: () => queryClient.invalidateQueries({ queryKey: latestGuessQueryKey }),
  }
}
