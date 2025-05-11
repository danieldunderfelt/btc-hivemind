import { getDb } from '@server/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { env } from '../env'

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: 'pg',
  }),
  secret: env.BETTER_AUTH_SECRET,
  url: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  cookie: {
    enabled: true,
  },
})
