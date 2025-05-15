import { trpc } from '@/lib/trpc'
import type { GuessType, GuessViewRowType } from '@server/guess/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

function createOptimisticGuess(guess: GuessType) {
  return {
    guessId: 'optimistic',
    userId: 'optimistic',
    guess,
    guessedAt: new Date(),
    guessPrice: 'optimistic',
    resolvedAt: null,
    resolvedPrice: null,
    isCorrect: false,
    startResolvingAt: null,
  } satisfies GuessViewRowType
}

export function useAddGuess() {
  const queryClient = useQueryClient()

  const addGuessMutation = useMutation(
    trpc.guess.addGuess.mutationOptions({
      onMutate: async (variables) => {
        const queryFilter = trpc.guess.latestUserGuess.queryFilter()

        await queryClient.cancelQueries(queryFilter)
        const previousData = queryClient.getQueryData<GuessViewRowType | null>(queryFilter.queryKey)

        // Optimistically update to the new value
        const nextQueryData = queryClient.setQueryData<GuessViewRowType | null>(
          queryFilter.queryKey,
          () => createOptimisticGuess(variables.guess),
        )

        return {
          optimisticUpdateResult: nextQueryData,
          previousData,
        }
      },
      onError: (err, _, context) => {
        if (context?.previousData !== undefined) {
          const queryFilter = trpc.guess.latestUserGuess.queryFilter()
          queryClient.setQueryData(queryFilter.queryKey, () => context.previousData || undefined)
        }

        return err
      },
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.guess.pathFilter())
      },
    }),
  )

  return {
    addGuessMutation,
  }
}
