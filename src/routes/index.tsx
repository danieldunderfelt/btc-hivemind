import BTCGuessFeature from '@/btc-guess/BTCGuessFeature'
import BtcPriceDisplay from '@/components/BtcPriceDisplay'
import PageContainer from '@/components/PageContainer'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <PageContainer innerClassName="max-w-none gap-6 flex flex-col">
      <BtcPriceDisplay />
      <BTCGuessFeature />
    </PageContainer>
  )
}
