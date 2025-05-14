import { Button } from '@/components/ui/button'
import { getFormattedPrice } from '@/lib/getFormattedPrice'
import { trpc } from '@/lib/trpc'
import { cn } from '@/lib/utils'
import type { GuessViewRowType } from '@server/guess/types'
import { useMutation } from '@tanstack/react-query'
import { addMinutes, isBefore } from 'date-fns'
import { useMemo } from 'react'
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
  const isUp = guess.guess === 'up'
  const formattedGuessPrice = getFormattedPrice(Number(guess.guessPrice))
  const formattedTime = new Date(guess.guessedAt).toLocaleString()
  const isResolved = !!guess.resolvedAt
  const isCorrect = guess.isCorrect

  const formattedResolvedPrice =
    isResolved && guess.resolvedPrice !== null
      ? getFormattedPrice(Number(guess.resolvedPrice))
      : null

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
      !isResolved &&
      isBefore(addMinutes(guess.guessedAt, 1), new Date()) &&
      !guess.startResolvingAt,
    [guess, isResolved],
  )

  return (
    <div className={cn('rounded-lg border shadow-sm', isResolved ? 'p-3' : 'p-4', className)}>
      <div className={cn('flex items-center justify-between', !isResolved && 'mb-2')}>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-bold',
              isUp ? 'text-green-500' : 'text-red-500',
              !isResolved && 'text-lg',
            )}>
            {isUp ? '↑ Up' : '↓ Down'}
          </span>
          {isResolved && (
            <span
              className={cn(
                'ml-2 font-medium text-sm',
                isCorrect ? 'text-green-600' : 'text-red-600',
              )}>
              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">{formattedTime}</span>
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
        </div>
      </div>

      {isResolved ? (
        <div className="mt-1 flex justify-between text-sm">
          <div>
            <span className="text-gray-600">Guess: </span>
            <span className="font-medium">{formattedGuessPrice}</span>
          </div>
          {formattedResolvedPrice !== null && (
            <div>
              <span className="text-gray-600">Resolved: </span>
              <span className="font-medium">{formattedResolvedPrice}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-2">
          <p className="text-gray-600 text-sm">Price at guess:</p>
          <p className="font-semibold text-lg">{formattedGuessPrice}</p>
        </div>
      )}
    </div>
  )
}
