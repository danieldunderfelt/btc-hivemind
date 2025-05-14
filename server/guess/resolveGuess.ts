import { getPrice } from '@server/btc/price'
import { isGuessResolved } from '@server/guess/readGuess'
import { guessResolutions, guesses } from 'db/schema/schema'
import { and, eq, isNull, lte } from 'drizzle-orm'
import type { Ctx } from '../types'

export type ResolveGuessStatus = 'success' | 'already-resolved' | 'failed' | 'not-found'

export async function resolveGuess(
  guessProps: { guessId: string; userId: string; forceResolution?: boolean },
  ctx: Ctx,
): Promise<ResolveGuessStatus> {
  // Use forceResolution to resolve a guess that is not yet resolved
  // but locked by a previous resolution attempt.
  const { guessId, userId, forceResolution = false } = guessProps

  try {
    let resolvedDate = new Date()
    let price = await getPrice()

    if (!price) {
      return 'failed'
    }

    const guess = await ctx.db.query.guesses.findFirst({
      with: {
        guessResolutions: true,
      },
      where: and(
        eq(guesses.id, guessId),
        eq(guesses.userId, userId),
        !forceResolution ? isNull(guesses.startResolvingAt) : undefined,
        lte(guesses.guessedAt, new Date(Date.now() - 60 * 1000)), // Ensure that the guess was made at least 1 minute ago
      ),
    })

    if (!guess) {
      return 'not-found'
    }

    if (guess.guessResolutions) {
      return 'already-resolved'
    }

    await ctx.db
      .update(guesses)
      .set({
        startResolvingAt: resolvedDate,
      })
      .where(eq(guesses.id, guessId))

    let i = 0

    // Try to resolve a different price if the guess price is the same as the current price.
    // Try up to 6 times, 10 seconds apart.
    while (guess.guessPrice === price.toString() && i < 6) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 10))
      price = await getPrice()
      resolvedDate = new Date()
      i++
    }

    // If the price is STILL the same as the guess, flip a coin to resolve the guess.
    // This indicates an issue with the price API.
    if (guess.guessPrice === price.toString()) {
      const adjustment = Math.random() < 0.5 ? -1 : 1
      price = price + adjustment
      // TODO: Log this issue.
    }

    // Sanity check before inserting the guess resolution.
    if (await isGuessResolved(guessId, ctx)) {
      // Return without throw, startResolvingAt does not need to be cleared.
      return 'already-resolved'
    }

    const guessResolution = await ctx.db
      .insert(guessResolutions)
      .values({
        guessId,
        resolvedPrice: price.toString(),
        resolvedAt: resolvedDate,
      })
      .onConflictDoNothing() // Don't override any previous resolution.
      .returning()

    if (guessResolution.length === 0) {
      // Throw to clear the startResolvingAt in catch.
      throw new Error('Failed to resolve guess')
    }

    return 'success'
  } catch (error) {
    console.error('Error resolving guess', error)

    await ctx.db
      .update(guesses)
      .set({ startResolvingAt: undefined })
      .where(eq(guesses.id, guessProps.guessId))
  }

  return 'failed'
}
