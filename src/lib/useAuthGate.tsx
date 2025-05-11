import { authClient } from '@/lib/auth'
import { useAuthenticate } from '@daveyplate/better-auth-ui'

export function useAuthGate() {
  useAuthenticate({
    authView: 'emailOTP',
  })

  const { data: session, isPending, error, refetch } = authClient.useSession()

  return {
    session: session?.session,
    user: session?.user,
    isPending,
    error,
    refetch,
  }
}
