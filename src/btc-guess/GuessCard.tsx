import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc'
import type { GuessViewRowType } from '@server/guess/types'
import { useMutation } from '@tanstack/react-query'
import { addMinutes, isBefore } from 'date-fns'
import { useMemo } from 'react'
import { toast } from 'sonner'

export default function GuessCard({
  guess,
  refreshGuess,
}: {
  guess: GuessViewRowType
  refreshGuess: () => void
}) {
  const isUp = guess.guess === 'up'

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(guess.guessPrice))

  const formattedTime = new Date(guess.guessedAt).toLocaleString()

  const resolveMutation = useMutation(
    trpc.resolveGuess.mutationOptions({
      onSuccess: (status) => {
        if (status === 'success') {
          refreshGuess()
        } else {
          toast.error('Failed to resolve guess.')
        }
      },
    }),
  )

  const canResolve = useMemo(
    () =>
      isBefore(addMinutes(guess.guessedAt, 1), new Date()) &&
      !guess.resolvedAt &&
      !guess.startResolvingAt,
    [guess],
  )

  console.log(guess, canResolve)

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className={`font-bold text-lg ${isUp ? 'text-green-500' : 'text-red-500'}`}>
          {isUp ? '↑ Up' : '↓ Down'}
        </span>
        <div>
          <span className="text-gray-500 text-sm">{formattedTime}</span>
          <Button
            disabled={!canResolve}
            onClick={() => {
              resolveMutation.mutate({ guessId: guess.guessId })
              refreshGuess()
              toast.success('Guess is resolving.')
            }}
            className="rounded-md bg-blue-500 px-2 py-1 text-white">
            Resolve
          </Button>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-gray-600 text-sm">Price at guess:</p>
        <p className="font-semibold text-lg">{formattedPrice}</p>
      </div>
    </div>
  )
}
