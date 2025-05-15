import { getPrice } from '@server/btc/price'
import { initTRPC } from '@trpc/server'
import { HTTPException } from 'hono/http-exception'
import superjson from 'superjson'
import {
  addGuessMutation,
  latestUserGuessQuery,
  resolveGuessMutation,
  resolvedGuessesQuery,
} from '../guess/routes'
import type { Ctx } from '../types'

const t = initTRPC.context<Ctx>().create({
  transformer: superjson,
  errorFormatter: (opts) => {
    console.error('opts', opts.error)

    return {
      message: opts.error.message || 'Unknown error',
    }
  },
})

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }

  return next()
})

export const publicProcedure = t.procedure

const guessRouter = t.router({
  addGuess: addGuessMutation(publicProcedure),
  latestUserGuess: latestUserGuessQuery(protectedProcedure),
  resolvedGuesses: resolvedGuessesQuery(protectedProcedure),
  resolveGuess: resolveGuessMutation(protectedProcedure),
})

export const router = t.router({
  guess: guessRouter,
  btcPrice: publicProcedure.query(async ({ ctx }) => getPrice()),
})

export type Router = typeof router
