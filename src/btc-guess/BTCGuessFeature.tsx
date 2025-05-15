import CurrentGuess from '@/btc-guess/CurrentGuess'
import GuessesList from '@/btc-guess/GuessesList'
import { useAddGuess } from '@/btc-guess/useAddGuess'
import { useLatestGuess } from '@/btc-guess/useLatestGuess'
import { useResolvedGuesses } from '@/btc-guess/useResolvedGuesses'
import BtcPriceDisplay from '@/components/BtcPriceDisplay'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc'
import NumberFlow from '@number-flow/react'
import type { GuessType } from '@server/guess/types'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowDownIcon, ArrowUpIcon, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Suspense, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useSpinDelay } from 'spin-delay'

export default function BTCGuessFeature() {
  const queryClient = useQueryClient()

  const { query: latestGuessQuery } = useLatestGuess()
  const { query: resolvedGuessesQuery } = useResolvedGuesses()
  const { addGuessMutation } = useAddGuess()

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

  const currentGuess = useDeferredValue(showCurrentGuess ? latestGuessQuery.data : null)
  const resolvedGuesses = useDeferredValue(resolvedGuessesQuery.data ?? [])

  const refreshGuess = () => {
    queryClient.invalidateQueries(trpc.guess.pathFilter())
    queryClient.invalidateQueries(trpc.btcPrice.queryFilter())
  }

  const onGuess = (guess: GuessType) => {
    queryClient.invalidateQueries(trpc.btcPrice.queryFilter())
    return addGuessMutation.mutate({ guess })
  }

  const onGuessDone = () => {
    setFocusCurrentGuess(false)
  }

  const points = useMemo(
    () => resolvedGuesses.reduce((acc, guess) => acc + (guess.isCorrect ? 1 : -1), 0) ?? 0,
    [resolvedGuesses],
  )

  const loadingGuess = useSpinDelay(addGuessMutation.isPending)

  return (
    <div className="flex flex-col gap-7 pb-4">
      <Suspense fallback={<Loader2 className="size-8 animate-spin self-center" />}>
        <BtcPriceDisplay className="relative z-20" />
      </Suspense>
      <AnimatePresence mode="popLayout" propagate={true} initial={false}>
        {!currentGuess ? (
          <motion.div
            key="add-guess"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 38, mass: 1, bounce: 0.2 }}
            className="flex flex-col items-center justify-center gap-4 pb-4">
            <h2 className="text-center font-light text-sm">
              Has the price of Bitcoin gone up or down after 1 minute?
            </h2>
            <div className="flex flex-row items-center gap-2">
              <Button
                isLoading={loadingGuess}
                onClick={() => onGuess('down')}
                disabled={showCurrentGuess}>
                <ArrowDownIcon className="size-4" />
                It's going down
              </Button>
              <Button
                isLoading={loadingGuess}
                onClick={() => onGuess('up')}
                disabled={showCurrentGuess}>
                It's going up
                <ArrowUpIcon className="size-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <CurrentGuess
            key="current-guess"
            onDone={onGuessDone}
            onResolved={refreshGuess}
            guess={currentGuess}
          />
        )}
      </AnimatePresence>
      <div className="flex flex-col items-center gap-6">
        <div className="relative z-30 flex w-full flex-row items-center justify-center gap-2 text-xl">
          <NumberFlow value={points} format={{ notation: 'standard' }} className="font-medium" />
          <span>{points === 1 ? 'Point' : 'Points'}</span>
        </div>
        <GuessesList className="w-full max-w-2xl" guesses={resolvedGuesses} />
      </div>
    </div>
  )
}
