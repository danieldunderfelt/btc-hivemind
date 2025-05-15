import { useLatestGuess } from '@/btc-guess/useLatestGuess'
import { trpc } from '@/lib/trpc'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'

export function useResolvedGuesses() {
  const queryClient = useQueryClient()
  const { query: latestGuessQuery } = useLatestGuess()

  const resolvedGuessesQuery = useQuery(
    trpc.guess.resolvedGuesses.queryOptions(
      {
        // Add these to make the query revalidate when the latest guess changes.
        latestGuessId: latestGuessQuery.data?.guessId,
        latestResolvedAt: latestGuessQuery.data?.resolvedAt?.toISOString(),
      },
      {
        placeholderData: keepPreviousData,
        enabled: latestGuessQuery.data?.guessId !== 'optimistic',
        staleTime: 1000 * 60,
      },
    ),
  )

  return {
    query: resolvedGuessesQuery,
    refresh: () => queryClient.invalidateQueries(trpc.guess.resolvedGuesses.queryFilter()),
  }
}
