import GuessDirectionDisplay from '@/btc-guess/GuessDirectionDisplay'
import PriceDisplay from '@/components/PriceDisplay'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc'
import { cn } from '@/lib/utils'
import NumberFlow from '@number-flow/react'
import type { GuessViewRowType } from '@server/guess/types'
import { useMutation } from '@tanstack/react-query'
import { addMinutes, differenceInSeconds, isBefore } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

export default function GuessCard({
  guess,
  refreshGuess,
  className,
}: {
  guess: GuessViewRowType
  refreshGuess?: () => void
  className?: string
}) {
  const isOptimistic = guess.guessPrice === 'optimistic'
  const formattedTime = guess.guessedAt.toLocaleString()
  const isResolved = !!guess.resolvedAt
  const isCorrect = guess.isCorrect

  const resolveMutation = useMutation(
    trpc.resolveGuess.mutationOptions({
      onSuccess: (status) => {
        if (status === 'success') {
          refreshGuess?.()
        } else {
          toast.error('Failed to resolve guess.')
        }
      },
    }),
  )

  const canResolve = useMemo(
    () =>
      !isOptimistic &&
      !isResolved &&
      isBefore(addMinutes(guess.guessedAt, 1), new Date()) &&
      !guess.startResolvingAt,
    [guess, isResolved, isOptimistic],
  )

  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (isResolved) {
      setCountdown(null)
      return
    }

    // Initial calculation
    const endTime = addMinutes(guess.guessedAt, 1)
    const now = new Date()
    const secondsRemaining = differenceInSeconds(endTime, now)

    if (secondsRemaining <= 0) {
      refreshGuess?.()
      setCountdown(0)
    } else {
      setCountdown(secondsRemaining)
    }

    const intervalId = setInterval(() => {
      const endTime = addMinutes(guess.guessedAt, 1)
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
  }, [guess.guessedAt, isResolved, refreshGuess])

  return (
    <div className={cn('gap-2 rounded-lg border p-4 shadow-sm', isResolved && 'p-3', className)}>
      <div className={cn('flex items-center justify-start gap-4', !isResolved && '-mt-1')}>
        <GuessDirectionDisplay
          guessType={guess.guess}
          resolvedStatus={isResolved ? (isCorrect ? 'correct' : 'wrong') : 'not-resolved'}
        />
        {!isResolved && refreshGuess && (
          <Button
            disabled={!canResolve || resolveMutation.isPending}
            onClick={() => {
              resolveMutation.mutate({ guessId: guess.guessId })
              toast.success('Guess is resolving.')
            }}
            className="h-auto rounded-md bg-blue-500 px-2 py-1 text-white text-xs">
            {resolveMutation.isPending ? 'Resolving...' : 'Resolve'}
          </Button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-gray-500 text-xs">{formattedTime}</span>
        </div>
      </div>

      <div
        className={cn(
          'mt-2 flex flex-row items-center justify-between gap-2',
          isResolved && 'mt-1',
        )}>
        {!isResolved && (
          <div className="-mb-1 mt-auto">
            {countdown !== null && countdown > 0 && (
              <NumberFlow
                value={countdown}
                format={{ notation: 'standard' }}
                suffix="s"
                className="text-gray-300 text-xl"
              />
            )}
            {countdown === 0 && !isResolved && (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            )}
          </div>
        )}
        <PriceDisplay
          price={guess.guessPrice}
          label="Guessed price"
          priceClassName={cn(!isResolved && 'text-xl/8')}
          className={cn('items-end', isResolved && 'flex-row items-center gap-2')}
        />
        {isResolved && (
          <PriceDisplay
            price={guess.resolvedPrice ?? 'optimistic'}
            label="Resolved price"
            className={cn('items-end', isResolved && 'flex-row items-center gap-2')}
          />
        )}
      </div>
    </div>
  )
}
