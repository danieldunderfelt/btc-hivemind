import BTCGuessFeature from '@/btc-guess/BTCGuessFeature'
import GuessesList from '@/btc-guess/GuessesList'
import BtcPriceDisplay from '@/components/BtcPriceDisplay'
import PageContainer from '@/components/PageContainer'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <PageContainer innerClassName="max-w-none gap-4 flex flex-col">
      <BtcPriceDisplay />
      <BTCGuessFeature />
      <GuessesList />
    </PageContainer>
  )
}
