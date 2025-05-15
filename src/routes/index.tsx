import BTCGuessFeature from '@/btc-guess/BTCGuessFeature'
import PageContainer from '@/components/PageContainer'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <PageContainer innerClassName="gap-6 flex flex-col">
      <BTCGuessFeature />
    </PageContainer>
  )
}
