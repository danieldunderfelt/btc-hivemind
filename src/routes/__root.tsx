import AppHeader from '@/components/AppHeader'
import AuthUIContextProvider from '@/providers/AuthUIProvider'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <AuthUIContextProvider>
      <main className="flex w-full flex-col gap-4">
        <AppHeader />
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </AuthUIContextProvider>
  ),
})
