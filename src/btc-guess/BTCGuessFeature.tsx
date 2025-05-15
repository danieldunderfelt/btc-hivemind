import CurrentGuess from '@/btc-guess/CurrentGuess'
import GuessesList from '@/btc-guess/GuessesList'
import { useLatestGuess } from '@/btc-guess/useLatestGuess'
import { useResolvedGuesses } from '@/btc-guess/useResolvedGuesses'
import BtcPriceDisplay from '@/components/BtcPriceDisplay'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc'
import NumberFlow from '@number-flow/react'
import type { GuessType, GuessViewRowType } from '@server/guess/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'

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

  const {
    query: latestGuessQuery,
    queryKey: latestGuessQueryKey,
    refresh: refreshLatestGuess,
  } = useLatestGuess()

  const { query: resolvedGuessesQuery, refresh: refreshResolvedGuesses } = useResolvedGuesses()
  const [focusCurrentGuess, setFocusCurrentGuess] = useState(
    !latestGuessQuery.data ? false : !latestGuessQuery.data.resolvedAt,
  )

  useEffect(() => {
    if (latestGuessQuery.data && !latestGuessQuery.data.resolvedAt) {
      setFocusCurrentGuess(true)
    }
  }, [latestGuessQuery.data])

  const showCurrentGuess = useMemo(() => {
    if (!latestGuessQuery.data) {
      return false
    }

    return focusCurrentGuess
  }, [latestGuessQuery.data, focusCurrentGuess])

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

  const refreshGuess = () => {
    refreshLatestGuess()
    refreshResolvedGuesses()
  }

  const onGuess = (guess: GuessType) => {
    setFocusCurrentGuess(true)
    return addGuessMutation.mutate({ guess })
  }

  const onGuessDone = () => {
    setFocusCurrentGuess(false)
    refreshResolvedGuesses()
  }

  const points = useMemo(
    () =>
      resolvedGuessesQuery.data?.reduce((acc, guess) => acc + (guess.isCorrect ? 1 : -1), 0) ?? 0,
    [resolvedGuessesQuery.data],
  )

  return (
    <div className="flex flex-col gap-8 pb-4">
      <BtcPriceDisplay className="relative z-20" />
      <AnimatePresence mode="popLayout" propagate={true} initial={false}>
        {!showCurrentGuess ? (
          <motion.div
            key="add-guess"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 38, mass: 1, bounce: 0.2 }}
            className="flex justify-center gap-2 pb-4">
            <Button onClick={() => onGuess('down')} disabled={showCurrentGuess}>
              It's going down
              <ArrowDownIcon className="size-4" />
            </Button>
            <Button onClick={() => onGuess('up')} disabled={showCurrentGuess}>
              <ArrowUpIcon className="size-4" />
              It's going up
            </Button>
          </motion.div>
        ) : (
          <CurrentGuess key="current-guess" onDone={onGuessDone} />
        )}
      </AnimatePresence>
      <div className="flex flex-col items-center gap-6">
        <div className="relative z-30 flex w-full flex-row items-center justify-center gap-2 text-xl">
          <NumberFlow value={points} format={{ notation: 'standard' }} className="font-medium" />
          <span>Points</span>
        </div>
        <GuessesList className="w-full max-w-2xl" guesses={resolvedGuessesQuery.data ?? []} />
      </div>
    </div>
  )
}
