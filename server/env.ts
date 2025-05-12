import { createEnv } from '@t3-oss/env-core'
import { Resource } from 'sst'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    WEB_URL: z.string().url(),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.string().min(1),
    SMTP_PASSWORD: z.string().min(1),
    SMTP_FROM_EMAIL: z.string().min(1),
    API_URL: z.string().url(),
  },
  isServer: true,
  runtimeEnv: {
    ...process.env,
    WEB_URL: Resource.AppWeb.url || process.env.WEB_URL || 'http://localhost:5173',
    BETTER_AUTH_SECRET: Resource.BETTER_AUTH_SECRET.value,
    SMTP_PASSWORD: Resource.SMTP_PASSWORD.value,
  },
  emptyStringAsUndefined: true,
})
