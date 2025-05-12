import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import type { HonoContext } from './index'

const t = initTRPC.context<HonoContext>().create()

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.Variables.user) {
    throw new Error('Unauthorized')
  }

  return next()
})

export const publicProcedure = t.procedure

export const router = t.router({
  greet: publicProcedure
    .input(z.object({ name: z.string() }))
    .output(z.string())
    .query(({ input }) => {
      return `Hello ${input.name}!`
    }),
})

export type Router = typeof router
