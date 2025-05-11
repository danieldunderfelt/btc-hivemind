import { queryClient } from '@/lib/trpc'
import { QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'

export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
