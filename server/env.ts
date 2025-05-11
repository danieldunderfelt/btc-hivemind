import { createEnv } from '@t3-oss/env-core'
import { Resource } from 'sst'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    WEB_URL: z.string().url(),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.string().min(1),
    SMTP_PASSWORD: z.string().min(1),
    SMTP_FROM_EMAIL: z.string().min(1),
  },
  isServer: true,
  runtimeEnv: {
    ...process.env,
    WEB_URL: Resource.SiteInfo.url,
  },
  emptyStringAsUndefined: true,
})
