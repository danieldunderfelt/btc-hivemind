import BTCGuessFeature from '@/btc-guess/BTCGuessFeature'
import PageContainer from '@/components/PageContainer'
import { useAuthGate } from '@/lib/useAuthGate'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/guess')({
  component: RouteComponent,
})

function RouteComponent() {
  const user = useAuthGate()
  console.log(user.user)

  return (
    <PageContainer innerClassName="max-w-none">
      <BTCGuessFeature />
    </PageContainer>
  )
}
