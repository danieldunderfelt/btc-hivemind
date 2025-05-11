import type { Router } from '@server/trpc'
import { env } from '@src/env'
import { QueryClient } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCContext, createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<Router>()

export const queryClient = new QueryClient()

const trpcClient = createTRPCClient<Router>({
  links: [httpBatchLink({ url: `${env.VITE_APP_URL}/trpc` })],
})

export const trpc = createTRPCOptionsProxy<Router>({
  client: trpcClient,
  queryClient,
})
