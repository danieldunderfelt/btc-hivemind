import { z } from 'zod'
import { getPrice } from '../btc/price'
import type { Procedure } from '../types'
import { getLatestGuess } from './readGuess'
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

    // TODO: Schedule guess resolution a minute from now
    return guess
  })
}

export function latestUserGuessQuery(procedure: Procedure) {
  return procedure.query(async ({ ctx }) => getLatestGuess(ctx))
}
