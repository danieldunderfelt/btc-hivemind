import { drizzle as jsDrizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { Resource } from 'sst'
import { fullSchema } from './fullSchema'

export const handler = async () => {
  const client = new Pool({
    host: Resource.AppDB.host,
    port: Number(Resource.AppDB.port),
    user: Resource.AppDB.username,
    password: Resource.AppDB.password,
    database: Resource.AppDB.database,
  })

  const db = jsDrizzle({
    client,
    schema: fullSchema,
  })

  await migrate(db, {
    migrationsFolder: './drizzle',
  })
}
