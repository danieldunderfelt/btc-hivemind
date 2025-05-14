import GuessCard from '@/btc-guess/GuessCard'
import GuessesList from '@/btc-guess/GuessesList'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc'
import { useMutation, useQuery } from '@tanstack/react-query'
import { addMinutes, isBefore } from 'date-fns'

export default function BTCGuessFeature() {
  const addGuessMutation = useMutation(trpc.addGuess.mutationOptions())
  const resolvedGuessesQuery = useQuery(trpc.resolvedGuesses.queryOptions())

  const latestUserGuessQuery = useQuery({
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

      return 1000 * 30
    },
  })

  const refreshGuess = () => {
    latestUserGuessQuery.refetch()
    resolvedGuessesQuery.refetch()
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-center gap-2">
        <Button
          onClick={() =>
            addGuessMutation.mutate(
              { guess: 'up' },
              {
                onSuccess: refreshGuess,
              },
            )
          }
          disabled={!!latestUserGuessQuery.data}>
          Guess UP
        </Button>
        <Button
          onClick={() => addGuessMutation.mutate({ guess: 'down' })}
          disabled={!!latestUserGuessQuery.data}>
          Guess DOWN
        </Button>
      </div>
      {latestUserGuessQuery.data ? (
        <GuessCard guess={latestUserGuessQuery.data} refreshGuess={refreshGuess} />
      ) : (
        <div className="rounded-lg border p-4 shadow-sm">
          <p className="text-gray-600 text-sm">
            No guesses currently. Make a guess by clicking either button above!
          </p>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-lg">Previous guesses</h2>
        <GuessesList guesses={resolvedGuessesQuery.data ?? []} />
      </div>
    </div>
  )
}
