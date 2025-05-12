import { RDSDataClient } from '@aws-sdk/client-rds-data'
import { drizzle as awsDataDrizzle } from 'drizzle-orm/aws-data-api/pg'
import { drizzle as localDrizzle } from 'drizzle-orm/node-postgres'
import { Resource } from 'sst'
import { fullSchema } from '../db/fullSchema'
import { env } from './env'

function createDatabase() {
  return env.NODE_ENV === 'development'
    ? localDrizzle(env.DATABASE_URL, { schema: fullSchema })
    : awsDataDrizzle(new RDSDataClient({ region: 'eu-central-1' }), {
        database: Resource.AppDB.database,
        secretArn: Resource.AppDB.secretArn,
        resourceArn: Resource.AppDB.clusterArn,
        schema: fullSchema,
      })
}

let database: ReturnType<typeof createDatabase>

export function getDb() {
  if (!database) {
    database = createDatabase()
  }

  return database
}
