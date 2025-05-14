import { resolveGuess } from '@server/guess/resolveGuess'
import { getDb } from '@server/lib/db'
import type { SQSEvent } from 'aws-lambda'

type GuessProps = {
  guessId: string
  userId: string
}

async function resolveGuesses(guesses: GuessProps[], db: ReturnType<typeof getDb>) {
  const unresolvedGuesses: { guessId: string; userId: string }[] = []

  await Promise.all(
    guesses.map(async (guess) => {
      const { guessId, userId } = guess
      const result = await resolveGuess({ guessId, userId }, { db, user: null, session: null })

      if (result === 'success') {
        console.log('Guess resolved', guessId)
      } else if (result === 'failed') {
        console.error('Failed to resolve guess, scheduling for retry', guessId)
        unresolvedGuesses.push({ guessId, userId })
      } else {
        console.log('Guess resolution not successful, not retrying', guessId)
      }
    }),
  )

  return unresolvedGuesses
}

export const handler = async (event: SQSEvent) => {
  const db = getDb()
  const unresolvedGuesses = await resolveGuesses(
    event.Records.map((record) => JSON.parse(record.body)),
    db,
  )

  // Try one more time to resolve any guesses that failed to resolve.
  if (unresolvedGuesses.length > 0) {
    console.log('Unresolved guesses', unresolvedGuesses)
    await resolveGuesses(unresolvedGuesses, db)
  }
}
