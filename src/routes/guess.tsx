import { useAuthGate } from '@/lib/useAuthGate'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/guess')({
  component: RouteComponent,
})

function RouteComponent() {
  const user = useAuthGate()

  console.log(user)

  return <div>Hello "/guess"!</div>
}
