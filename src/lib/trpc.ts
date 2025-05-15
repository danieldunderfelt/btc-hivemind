import { env } from '@/env'
import { mergePaths } from '@/lib/utils'
import { QueryClient } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCContext, createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import superjson from 'superjson'
import type { Router } from '../../server/lib/trpc'
export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<Router>()

export const queryClient = new QueryClient()

const linkOptions = {
  transformer: superjson,
  url: `${env.VITE_APP_URL}${mergePaths('/trpc')}`,
}

const trpcClient = createTRPCClient<Router>({
  links: [
    loggerLink({
      enabled: () => !env.VITE_PROD,
    }),
    httpBatchLink({
      ...linkOptions,
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
