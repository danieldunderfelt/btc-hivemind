import { env } from '@/env'
import type { Router } from '@server/trpc'
import { createTRPCClient, httpBatchLink } from '@trpc/client'

export const client = createTRPCClient<Router>({
  links: [
    httpBatchLink({
      url: `${env.VITE_APP_URL}/trpc`,
    }),
  ],
})
