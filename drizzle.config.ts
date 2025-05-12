import { defineConfig } from 'drizzle-kit'

console.log(process.env.DATABASE_URL)

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
