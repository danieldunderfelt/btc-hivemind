import { trpc } from '@/lib/trpc'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export function useResolvedGuesses() {
  const resolvedGuessesQuery = useQuery(trpc.resolvedGuesses.queryOptions())

  const resolvedGuessesQueryKey = trpc.resolvedGuesses.queryKey()
  const queryClient = useQueryClient()

  return {
    query: resolvedGuessesQuery,
    queryKey: resolvedGuessesQueryKey,
    refresh: () => queryClient.invalidateQueries({ queryKey: resolvedGuessesQueryKey }),
  }
}
