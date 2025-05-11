import { RDSDataClient } from '@aws-sdk/client-rds-data'
import { env } from '@server/env'
import { drizzle as awsDataDrizzle } from 'drizzle-orm/aws-data-api/pg'
import { drizzle as localDrizzle } from 'drizzle-orm/node-postgres'
import { Resource } from 'sst'
import * as authSchema from '../db/schema/auth-schema'
import * as schema from '../db/schema/schema'
function createDatabase() {
  const fullSchema = {
    ...authSchema,
    ...schema,
  }

  return env.NODE_ENV === 'development'
    ? localDrizzle(env.DATABASE_URL, { schema: fullSchema })
    : awsDataDrizzle(new RDSDataClient({ region: 'eu-central-1' }), {
        database: Resource.BTCDB.database,
        secretArn: Resource.BTCDB.secretArn,
        resourceArn: Resource.BTCDB.clusterArn,
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
