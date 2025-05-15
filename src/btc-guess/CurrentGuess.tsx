import GuessCard from '@/btc-guess/GuessCard'
import { useLatestGuess } from '@/btc-guess/useLatestGuess'
import { Button } from '@/components/ui/button'
import { env } from '@/env'
import { trpc } from '@/lib/trpc'
import { cn } from '@/lib/utils'
import { ConfettiTrigger } from '@/providers/ConfettiProvider'
import NumberFlow from '@number-flow/react'
import { useMutation } from '@tanstack/react-query'
import { addMinutes, addSeconds, differenceInSeconds, isBefore } from 'date-fns'
import { CheckCircleIcon, Loader2, XCircleIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { type Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

export default function CurrentGuess({
  onDone,
  onResolved,
  ref,
}: { onDone: () => void; onResolved: () => unknown; ref?: Ref<HTMLDivElement> }) {
  const { query: latestGuessQuery } = useLatestGuess()

  const guess = latestGuessQuery.data
  const isResolved = !!guess?.resolvedAt
  const isOptimistic = guess?.guessId === 'optimistic'

  const [countdown, setCountdown] = useState<number | null>(null)
  const didResolve = useRef(false)

  const canResolve = useMemo(
    () =>
      !isOptimistic &&
      !isResolved &&
      isBefore(addMinutes(guess?.guessedAt ?? new Date(), 1), new Date()) &&
      !guess?.startResolvingAt,
    [guess, isResolved, isOptimistic],
  )

  const resolveMutation = useMutation(
    trpc.guess.resolveGuess.mutationOptions({
      onSuccess: (status) => {
        if (status === 'success') {
          onResolved()
        } else {
          toast.error('Failed to resolve guess.')
        }
      },
    }),
  )

  const onGuessResolved = useCallback(() => {
    if (!didResolve.current) {
      didResolve.current = true
      setCountdown(0)
      onResolved()
    }
  }, [onResolved])

  useEffect(() => {
    if (isResolved) {
      setCountdown(null)
      onGuessResolved()
      return
    }

    if (!guess) {
      return
    }

    // Initial calculation. Faster iteration in dev.
    const endTime = addSeconds(guess.guessedAt, env.VITE_PROD ? 60 : 10)
    const now = new Date()
    const secondsRemaining = differenceInSeconds(endTime, now)

    if (secondsRemaining <= 0) {
      setCountdown(0)
    } else {
      setCountdown(secondsRemaining)
    }

    const intervalId = setInterval(() => {
      const endTime = addSeconds(guess.guessedAt, env.VITE_PROD ? 60 : 10)
      const now = new Date()
      const secondsRemaining = differenceInSeconds(endTime, now)

      if (secondsRemaining <= 0) {
        setCountdown(0)
        clearInterval(intervalId)
      } else {
        setCountdown(secondsRemaining)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [guess?.guessedAt, isResolved, onGuessResolved])

  if (!guess) {
    return null
  }

  return (
    <motion.div
      ref={ref}
      layout={true}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 38, mass: 1, bounce: 0.2 }}
      className={cn('absolute inset-0 z-10 h-full w-full backdrop-blur-md')}>
      <motion.div
        key="current-guess-wrapper"
        layout={true}
        className="flex max-h-screen w-full flex-col items-center justify-center gap-6 px-2 pt-[13rem]">
        {!isOptimistic && isResolved ? (
          <>
            {guess.isCorrect ? (
              <ConfettiTrigger
                isActive={true}
                motionProps={{
                  initial: false,
                  animate: { opacity: 1, scale: 1 },
                  exit: { opacity: 0, scale: 0.75 },
                  transition: { type: 'spring', stiffness: 300, damping: 25, mass: 1, bounce: 0.4 },
                }}
                key="correct-guess"
                confettiKey={`${guess.guessId}-correct`}
                className="flex flex-row items-center gap-4 text-green-500">
                <CheckCircleIcon className="size-10" />
                <span className="font-medium text-lg">Correct!</span>
              </ConfettiTrigger>
            ) : (
              <motion.div
                layout={true}
                key="wrong-guess"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 38, mass: 1, bounce: 0.2 }}
                className="flex flex-row items-center gap-4 text-red-500">
                <XCircleIcon className="size-7" />
                <span className="text-lg">Wrong :(</span>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            layout={true}
            key="pending-guess"
            className="flex flex-row items-center gap-2 tabular-nums">
            <span className="animate-pulse text-base text-neutral-400">
              {countdown === 0 && !isResolved ? 'Resolving...' : 'Resolving in'}
            </span>
            {countdown !== null && countdown > 0 && (
              <NumberFlow
                value={countdown}
                format={{ notation: 'standard' }}
                suffix="s"
                className="text-gray-300 text-xl"
              />
            )}
            {countdown === 0 && !isResolved && (
              <Loader2 className="size-5 animate-spin text-white" />
            )}
          </motion.div>
        )}

        <GuessCard
          guess={guess}
          size="large"
          className="pointer-events-auto w-full max-w-2xl rounded-lg bg-background shadow-background shadow-lg"
        />

        <div className="flex flex-row gap-4">
          {/* Backup manual resolve button. */}
          {canResolve && differenceInSeconds(new Date(), guess.guessedAt) > 90 && (
            <Button
              variant="outline"
              disabled={!canResolve || resolveMutation.isPending}
              onClick={() => resolveMutation.mutate({ guessId: guess.guessId })}>
              {resolveMutation.isPending ? 'Resolving...' : 'Resolve'}
            </Button>
          )}

          <Button
            onClick={() => onDone()}
            variant="default"
            disabled={!isResolved}
            className="pointer-events-auto">
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/*  */
