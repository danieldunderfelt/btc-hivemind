import GuessCard from '@/btc-guess/GuessCard'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc'
import { useMutation, useQuery } from '@tanstack/react-query'

export default function BTCGuessFeature() {
  const addGuessMutation = useMutation(trpc.addGuess.mutationOptions())
  const latestUserGuessQuery = useQuery(trpc.latestUserGuess.queryOptions())

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center gap-2">
        <Button
          onClick={() => addGuessMutation.mutate({ guess: 'up' })}
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
        <GuessCard guess={latestUserGuessQuery.data} />
      ) : (
        <div className="rounded-lg border p-4 shadow-sm">
          <p className="text-gray-600 text-sm">
            No guesses currently. Make a guess by clicking either button above!
          </p>
        </div>
      )}
    </div>
  )
}
