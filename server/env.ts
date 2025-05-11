import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    DATABASE_SECRET_ARN: z.string().optional(),
    DATABASE_CLUSTER_ARN: z.string().optional(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    LOCAL_APP_URL: z.string().url().optional(),
  },
  isServer: true,
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
