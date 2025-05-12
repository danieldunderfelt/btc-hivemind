import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { Resource } from 'sst'
import { fullSchema } from '../db/fullSchema'
import { env } from './env'

function createDatabase() {
  if (env.NODE_ENV === 'development') {
    return drizzle(env.DATABASE_URL, { schema: fullSchema })
  }

  const client = new Pool({
    host: Resource.AppDB.host,
    port: Resource.AppDB.port,
    user: Resource.AppDB.username,
    password: Resource.AppDB.password,
    database: Resource.AppDB.database,
  })

  return drizzle(client, { schema: fullSchema })
}

let database: ReturnType<typeof createDatabase>

export function getDb() {
  if (!database) {
    database = createDatabase()
  }

  return database
}
