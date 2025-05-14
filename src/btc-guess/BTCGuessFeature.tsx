import GuessCard from '@/btc-guess/GuessCard'
import GuessesList from '@/btc-guess/GuessesList'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc'
import NumberFlow from '@number-flow/react'
import type { GuessType, GuessViewRowType } from '@server/guess/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addMinutes, differenceInSeconds, isBefore } from 'date-fns'
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import { useEffect, useMemo } from 'react'

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

export default function BTCGuessFeature() {
  const queryClient = useQueryClient()

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

  const resolvedGuessesQuery = useQuery({
    ...trpc.resolvedGuesses.queryOptions(),
    refetchInterval: () =>
      latestGuessQuery.data?.guessedAt
        ? differenceInSeconds(new Date(), latestGuessQuery.data.guessedAt) >= 60
          ? 1000
          : 1000 * 10
        : 1000 * 60,
  })

  const latestGuessQueryKey = trpc.latestUserGuess.queryKey()

  const addGuessMutation = useMutation(
    trpc.addGuess.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: latestGuessQueryKey })
        const previousData = queryClient.getQueryData<GuessViewRowType | null>(latestGuessQueryKey)

        // Optimistically update to the new value
        const nextQueryData = queryClient.setQueryData<GuessViewRowType | null>(
          latestGuessQueryKey,
          () => createOptimisticGuess(variables.guess),
        )

        return {
          optimisticUpdateResult: nextQueryData,
          previousData,
        }
      },
      onError: (err, _, context) => {
        if (context?.previousData !== undefined) {
          queryClient.setQueryData(latestGuessQueryKey, () => context.previousData || undefined)
        }

        return err
      },
      onSuccess: () => {
        refreshGuess()
      },
    }),
  )

  useEffect(() => {
    if (!latestGuessQuery.data) {
      resolvedGuessesQuery.refetch()
    }
  }, [latestGuessQuery.data])

  const refreshGuess = () => {
    latestGuessQuery.refetch()
    resolvedGuessesQuery.refetch()
  }

  const points = useMemo(
    () =>
      resolvedGuessesQuery.data?.reduce((acc, guess) => acc + (guess.isCorrect ? 1 : -1), 0) ?? 0,
    [resolvedGuessesQuery.data],
  )

  return (
    <div className="flex flex-col gap-8 pb-4">
      {!latestGuessQuery.data ? (
        <div className="flex justify-center gap-2 pb-4">
          <Button
            onClick={() => addGuessMutation.mutate({ guess: 'up' })}
            disabled={!!latestGuessQuery.data}>
            <ArrowUpIcon className="size-4" />
            Guess UP
          </Button>
          <Button
            onClick={() => addGuessMutation.mutate({ guess: 'down' })}
            disabled={!!latestGuessQuery.data}>
            Guess DOWN
            <ArrowDownIcon className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <h2 className="font-bold text-lg">Current guess</h2>
          <GuessCard guess={latestGuessQuery.data} refreshGuess={refreshGuess} />
        </div>
      )}
      <div className="flex flex-col">
        <div className="mb-4 flex w-full flex-row items-center justify-center gap-2 text-xl">
          <NumberFlow value={points} format={{ notation: 'standard' }} className="font-medium" />
          <span>Points</span>
        </div>
        <div className="mb-1 flex w-full flex-row items-center justify-between gap-2 text-gray-500 text-xs">
          <span>Guess</span>
          <span>Resolution</span>
        </div>
        <GuessesList guesses={resolvedGuessesQuery.data ?? []} />
      </div>
    </div>
  )
}
