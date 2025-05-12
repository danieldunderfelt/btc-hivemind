import { env } from '@/env'
import { QueryClient } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCContext, createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import type { Router } from '../../server/trpc'
export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<Router>()

export const queryClient = new QueryClient()

const trpcClient = createTRPCClient<Router>({
  links: [
    httpBatchLink({
      url: `${env.VITE_APP_URL}/trpc`,
      fetch: ((input, init) => {
        return fetch(input, {
          ...init,
          credentials: 'include',
        })
      }) satisfies typeof fetch,
    }),
  ],
})

export const trpc = createTRPCOptionsProxy<Router>({
  client: trpcClient,
  queryClient,
})
