import { defineConfig } from 'drizzle-kit'
import { env } from './server/env'

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
