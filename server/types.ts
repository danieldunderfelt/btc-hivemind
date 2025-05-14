import type { auth } from './auth/config'
import type { getDb } from './lib/db'
import type { protectedProcedure, publicProcedure } from './lib/trpc'

export type Ctx = {
  db: ReturnType<typeof getDb>
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}

export type HonoContext = {
  Variables: Ctx
}

export type Procedure = typeof publicProcedure | typeof protectedProcedure
