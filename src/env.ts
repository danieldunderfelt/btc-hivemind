import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  isServer: false,
  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: 'VITE_',

  client: {
    VITE_APP_URL: z.string().url(),
    VITE_PROD: z.boolean(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnvStrict: {
    VITE_APP_URL: import.meta.env.VITE_APP_URL,
    VITE_PROD: import.meta.env.PROD || false,
  },
  emptyStringAsUndefined: true,
})
