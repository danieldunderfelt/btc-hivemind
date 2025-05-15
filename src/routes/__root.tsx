import AppHeader from '@/components/AppHeader'
import { env } from '@/env'
import AuthUIContextProvider from '@/providers/AuthUIProvider'
import ConfettiProvider from '@/providers/ConfettiProvider'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <AuthUIContextProvider>
      <ConfettiProvider>
        <main className="flex w-full flex-col gap-4">
          <AppHeader />
          <Outlet />
        </main>
      </ConfettiProvider>
      {!env.VITE_PROD && <TanStackRouterDevtools />}
    </AuthUIContextProvider>
  ),
})
