import { env } from '@/env'
import { trpc } from '@/lib/trpc'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { addSeconds, isBefore } from 'date-fns'

export function useLatestGuess() {
  const latestGuessQuery = useQuery(
    trpc.guess.latestUserGuess.queryOptions(undefined, {
      refetchInterval(query) {
        const guessedAt = query.state.data?.guessedAt
        const isResolved = query.state.data?.resolvedAt

        if (!guessedAt || isResolved) {
          return false
        }

        const shouldBeResolved = isBefore(
          // Faster iteration in dev.
          addSeconds(guessedAt, env.VITE_PROD ? 60 : 10),
          new Date(),
        )

        if (shouldBeResolved) {
          return 1000
        }

        return 1000 * 10
      },
    }),
  )

  const queryClient = useQueryClient()

  return {
    query: latestGuessQuery,
    refresh: () => queryClient.invalidateQueries(trpc.guess.latestUserGuess.queryFilter()),
  }
}
