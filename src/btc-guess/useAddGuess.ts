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
  const queryFilter = trpc.guess.latestUserGuess.queryFilter()

  const addGuessMutation = useMutation(
    trpc.guess.addGuess.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries(queryFilter)

        // Optimistically update to the new value
        const nextQueryData = queryClient.setQueryData<GuessViewRowType | null>(
          queryFilter.queryKey,
          () => createOptimisticGuess(variables.guess),
        )

        return {
          optimisticUpdateResult: nextQueryData,
        }
      },
      onError: async (err) => {
        console.log('onError', err)
        queryClient.invalidateQueries(trpc.guess.latestUserGuess.queryFilter())
        return err
      },
      onSuccess: async (result) => {
        if (result) {
          queryClient.setQueryData<GuessViewRowType | null>(queryFilter.queryKey, () => ({
            ...result,
            guessId: result.id,
            resolvedAt: null,
            resolvedPrice: null,
            isCorrect: false,
            startResolvingAt: null,
          }))
        }

        await queryClient.invalidateQueries(trpc.guess.latestUserGuess.queryFilter())
      },
    }),
  )

  return {
    addGuessMutation,
  }
}
