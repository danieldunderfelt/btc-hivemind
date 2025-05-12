import { desc, eq, isNull } from 'drizzle-orm'
import { allGuesses, guessResolutions, guesses } from '../../db/schema/schema'
import type { Ctx } from '../types'

export async function getPendingGuess(ctx: Ctx) {
  if (!ctx.user) {
    throw new Error('User not found')
  }

  const guess = await ctx.db.query.guesses.findFirst({
    with: {
      guessResolutions: {
        where: isNull(guessResolutions.resolvedAt),
      },
    },
    where: eq(guesses.userId, ctx.user.id),
  })

  if (!guess) {
    return null
  }

  return guess
}

export async function getLatestGuess(ctx: Ctx) {
  if (!ctx.user) {
    throw new Error('User not found')
  }

  const guess = await ctx.db
    .select()
    .from(allGuesses)
    .where(eq(allGuesses.userId, ctx.user.id))
    .orderBy(desc(allGuesses.guessedAt))
    .limit(1)

  if (!guess) {
    return null
  }

  return guess[0]
}
