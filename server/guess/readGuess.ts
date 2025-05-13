import { and, desc, eq, isNull } from 'drizzle-orm'
import { allGuesses, guessResolutions, guesses, resolvedGuesses } from '../../db/schema/schema'
import type { Ctx } from '../types'

export async function getPendingGuess(ctx: Ctx) {
  if (!ctx.user) {
    throw new Error('User not found')
  }

  const guess = await ctx.db
    .select()
    .from(guesses)
    .leftJoin(guessResolutions, eq(guesses.id, guessResolutions.guessId))
    .where(and(eq(guesses.userId, ctx.user.id), isNull(guessResolutions.resolvedAt)))
    .limit(1)

  console.log('guess', guess)
  return guess[0] ?? null
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

export async function getResolvedGuesses(ctx: Ctx) {
  if (!ctx.user) {
    throw new Error('User not found')
  }

  const guesses = await ctx.db
    .select()
    .from(resolvedGuesses)
    .where(eq(resolvedGuesses.userId, ctx.user.id))

  // TODO: Paginate, maybe?
  return guesses
}
