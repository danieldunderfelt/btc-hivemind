import { sql } from 'drizzle-orm'
import { guesses } from '../../db/schema/schema'
import type { Ctx } from '../types'
import { getPendingGuess } from './readGuess'
import type { GuessType } from './types'

export async function addGuess(
  { guess, price, guessedAt }: { guess: GuessType; price: number; guessedAt: Date },
  ctx: Ctx,
) {
  if (!ctx.user) {
    throw new Error('User not found')
  }

  const hasPendingGuess = !!(await getPendingGuess(ctx))

  if (hasPendingGuess) {
    throw new Error('User already has a pending guess.')
  }

  const guessRow = await ctx.db
    .insert(guesses)
    .values({
      userId: ctx.user.id,
      guess: sql`${guess}::guess_type`,
      guessPrice: price.toString(),
      guessedAt,
    })
    .returning()

  return guessRow[0]
}
