import { authClient } from '@/lib/auth'
import { AuthQueryProvider } from '@daveyplate/better-auth-tanstack'
import { AuthUIProviderTanstack } from '@daveyplate/better-auth-ui/tanstack'
import { Link, useRouter } from '@tanstack/react-router'
import type { PropsWithChildren } from 'react'

export default function AuthUIContextProvider({ children }: PropsWithChildren) {
  const router = useRouter()

  return (
    <AuthQueryProvider>
      <AuthUIProviderTanstack
        authClient={authClient}
        navigate={(href) => router.navigate({ href })}
        replace={(href) => router.navigate({ href, replace: true })}
        Link={({ href, ...props }) => <Link to={href} {...props} />}>
        {children}
      </AuthUIProviderTanstack>
    </AuthQueryProvider>
  )
}
