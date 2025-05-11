import { Button } from '@/components/ui/button'
import { signOut, useSession } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { Link, Navigate } from '@tanstack/react-router'

export function AuthButton({ className }: { className?: string }) {
  const { data } = useSession()

  const signOutMutation = useMutation({
    mutationFn: () => signOut(),
  })

  return (
    <>
      {!data?.session ? (
        <Button variant="outline" size="sm" asChild className={className}>
          <Link to="/auth/$pathname" search={{ redirectTo: '/' }} params={{ pathname: 'login' }}>
            Sign in
          </Link>
        </Button>
      ) : (
        <div className={cn('flex flex-row items-center gap-4', className)}>
          <p className="text-xs">{data?.user?.email}</p>
          <Button variant="outline" size="sm" onClick={() => signOutMutation.mutate()}>
            {signOutMutation.isPending ? 'Signing out...' : 'Sign out'}
          </Button>
        </div>
      )}
      {signOutMutation.isSuccess && <Navigate to="/" />}
    </>
  )
}
