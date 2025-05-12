import * as authSchema from './schema/auth-schema'
import * as schema from './schema/schema'

export const fullSchema = {
  ...authSchema,
  ...schema,
}
