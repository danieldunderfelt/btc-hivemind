import { and, desc, eq, isNull } from 'drizzle-orm'
import { allGuesses, guessResolutions, resolvedGuesses } from '../../db/schema/schema'
import type { Ctx } from '../types'

export async function getPendingGuess(ctx: Ctx) {
  if (!ctx.user) {
    throw new Error('User not found')
  }

  const guess = await ctx.db
    .select()
    .from(allGuesses)
    .where(and(eq(allGuesses.userId, ctx.user.id), isNull(allGuesses.resolvedAt)))
    .limit(1)

  return guess[0] ?? null
}

export async function getResolvedGuesses(ctx: Ctx) {
  if (!ctx.user) {
    throw new Error('User not found')
  }

  const guesses = await ctx.db
    .select()
    .from(resolvedGuesses)
    .where(eq(resolvedGuesses.userId, ctx.user.id))
    .orderBy(desc(resolvedGuesses.resolvedAt))

  return guesses
}

export async function isGuessResolved(guessId: string, ctx: Ctx) {
  const guessResolution = await ctx.db.query.guessResolutions.findFirst({
    where: and(eq(guessResolutions.guessId, guessId), isNull(guessResolutions.resolvedAt)),
  })

  return !!guessResolution
}
