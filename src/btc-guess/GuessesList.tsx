import { getFormattedPrice } from '@/lib/getFormattedPrice'
import { trpc } from '@/lib/trpc'
import { useQuery } from '@tanstack/react-query'

export default function GuessesList() {
  const resolvedGuessesQuery = useQuery(trpc.resolvedGuesses.queryOptions())

  return (
    <>
      {resolvedGuessesQuery.data && resolvedGuessesQuery.data.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-3 font-bold text-xl">Resolved Guesses</h2>
          <div className="space-y-2">
            {resolvedGuessesQuery.data.map((guess) => {
              const isUp = guess.guess === 'up'
              const isCorrect = guess.isCorrect

              const formattedGuessPrice = getFormattedPrice(Number(guess.guessPrice))
              const formattedResolvedPrice = getFormattedPrice(Number(guess.resolvedPrice))

              const formattedTime = new Date(guess.guessedAt).toLocaleString()

              return (
                <div key={guess.guessId} className="rounded-lg border p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                        {isUp ? '↑ Up' : '↓ Down'}
                      </span>
                      <span
                        className={`ml-2 font-medium text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                    <span className="text-gray-500 text-xs">{formattedTime}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <div>
                      <span className="text-gray-600">Guess: </span>
                      <span className="font-medium">{formattedGuessPrice}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Resolved: </span>
                      <span className="font-medium">{formattedResolvedPrice}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
