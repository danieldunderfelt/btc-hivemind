import LoginView from '@/components/views/auth/Login'
import SettingsView from '@/components/views/auth/Settings'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/$pathname')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { redirectTo: string } => ({
    redirectTo: (search.redirectTo as string) || '/',
  }),
})

function RouteComponent() {
  const { pathname } = Route.useParams()

  if (pathname === 'login') {
    return <LoginView redirectTo="/" />
  }

  if (pathname === 'settings') {
    return <SettingsView />
  }

  if (pathname === 'sign-out') {
    return null
  }

  return <div>Not found</div>
}
