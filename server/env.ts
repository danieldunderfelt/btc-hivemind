import { createEnv } from '@t3-oss/env-core'
import { Resource } from 'sst'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    WEB_URL: z.string().url(),
    API_URL: z.string().url(),
    API_PATH: z.string().min(1),
    CRYPTOCOMPARE_API_KEY: z.string().min(1),
    SST_AWS_ACCESS_KEY_ID: z.string().min(1),
    SST_AWS_SECRET_ACCESS_KEY: z.string().min(1),
    SST_AWS_SESSION_TOKEN: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    RESEND_FROM_EMAIL: z.string().min(1),
    RESEND_FROM_NAME: z.string().min(1),
  },
  isServer: true,
  runtimeEnv: {
    ...process.env,
    WEB_URL: Resource.AppWeb.url || process.env.WEB_URL || 'http://localhost:5173',
    BETTER_AUTH_SECRET: Resource.BETTER_AUTH_SECRET.value,
    CRYPTOCOMPARE_API_KEY: Resource.CRYPTOCOMPARE_API_KEY.value,
    RESEND_API_KEY: Resource.RESEND_API_KEY.value,
  },
  emptyStringAsUndefined: true,
})
