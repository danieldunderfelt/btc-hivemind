import type { Router } from '@server/index'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { env } from '../env'

export const client = createTRPCClient<Router>({
  links: [
    httpBatchLink({
      url: env.VITE_TRPC_URL,
    }),
  ],
})
