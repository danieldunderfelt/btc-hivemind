import { createEnv } from '@t3-oss/env-core'
import { Resource } from 'sst'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    WEB_URL: z.string().url(),
    SMTP_HOST: process.env.NODE_ENV === 'production' ? z.string().min(1) : z.string().optional(),
    SMTP_PORT: process.env.NODE_ENV === 'production' ? z.string().min(1) : z.string().optional(),
    SMTP_PASSWORD:
      process.env.NODE_ENV === 'production' ? z.string().min(1) : z.string().optional(),
    SMTP_FROM_EMAIL:
      process.env.NODE_ENV === 'production' ? z.string().min(1) : z.string().optional(),
    API_URL: z.string().url(),
    API_PATH: z.string().min(1),
    MOBULA_API_KEY:
      process.env.NODE_ENV === 'production' ? z.string().min(1) : z.string().optional(),
    CMC_API_KEY: z.string().min(1),
    CRYPTOCOMPARE_API_KEY: z.string().min(1),
  },
  isServer: true,
  runtimeEnv: {
    ...process.env,
    WEB_URL: Resource.AppWeb.url || process.env.WEB_URL || 'http://localhost:5173',
    BETTER_AUTH_SECRET: Resource.BETTER_AUTH_SECRET.value,
    SMTP_PASSWORD: Resource.SMTP_PASSWORD.value,
    MOBULA_API_KEY: Resource.MOBULA_API_KEY.value,
    CMC_API_KEY: Resource.CMC_API_KEY.value,
    CRYPTOCOMPARE_API_KEY: Resource.CRYPTOCOMPARE_API_KEY.value,
  },
  emptyStringAsUndefined: true,
})
