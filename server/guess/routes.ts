import { resolveGuess } from '@server/guess/resolveGuess'
import { sendMessage } from '@server/lib/queue'
import { z } from 'zod'
import { getPrice } from '../btc/price'
import type { Procedure } from '../types'
import { getLatestGuess, getResolvedGuesses } from './readGuess'
import { guessTypeSchema } from './types'
import { addGuess } from './writeGuess'

export function addGuessMutation(procedure: Procedure) {
  return procedure.input(z.object({ guess: guessTypeSchema })).mutation(async ({ input, ctx }) => {
    const user = ctx.user
    // Record tiemstamp ASAP when guess is made.
    const guessedAt = new Date()
    // Record price ASAP when guess is made.
    const price = await getPrice()

    if (!user) {
      // TODO: Record pending guess and attribute it to the user when they sign in later
      return null
    }

    const guess = await addGuess(
      {
        guess: input.guess,
        price,
        guessedAt,
      },
      ctx,
    )

    await sendMessage(
      {
        guessId: guess.id,
        userId: user.id,
      },
      60,
    )

    return guess
  })
}

export function resolveGuessMutation(procedure: Procedure) {
  return procedure.input(z.object({ guessId: z.string() })).mutation(async ({ input, ctx }) => {
    const user = ctx.user

    if (!user) {
      return null
    }

    return resolveGuess({ guessId: input.guessId, userId: user.id }, ctx)
  })
}

export function latestUserGuessQuery(procedure: Procedure) {
  return procedure.query(({ ctx }) => getLatestGuess(ctx))
}

export function resolvedGuessesQuery(procedure: Procedure) {
  return procedure.query(({ ctx }) => getResolvedGuesses(ctx))
}
