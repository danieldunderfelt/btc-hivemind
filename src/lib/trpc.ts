import { env } from '@/env'
import { mergePaths } from '@/lib/utils'
import { QueryClient } from '@tanstack/react-query'
import {
  createTRPCClient,
  httpBatchLink,
  httpSubscriptionLink,
  loggerLink,
  retryLink,
  splitLink,
} from '@trpc/client'
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
    loggerLink(),
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: [
        retryLink({
          retry: (opts) => {
            const code = opts.error.data?.code

            if (!code) {
              // This shouldn't happen as our httpSubscriptionLink will automatically retry within when there's a non-parsable response
              console.error('No error code found, retrying', opts)
              return true
            }

            if (code === 'UNAUTHORIZED' || code === 'FORBIDDEN') {
              console.log('Retrying due to 401/403 error')
              return true
            }

            return false
          },
        }),
        httpSubscriptionLink({
          ...linkOptions,
          eventSourceOptions() {
            return {
              withCredentials: true,
            }
          },
        }),
      ],
      false: httpBatchLink({
        ...linkOptions,
        fetch: ((input, init) => {
          return fetch(input, {
            ...init,
            credentials: 'include',
          })
        }) satisfies typeof fetch,
      }),
    }),
  ],
})

export const trpc = createTRPCOptionsProxy<Router>({
  client: trpcClient,
  queryClient,
})
