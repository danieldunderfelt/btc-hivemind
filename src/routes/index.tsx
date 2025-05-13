import BTCGuessFeature from '@/btc-guess/BTCGuessFeature'
import GuessCard from '@/components/GuessCard'
import PageContainer from '@/components/PageContainer'
import { trpc } from '@/lib/trpc'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const latestUserGuessQuery = useQuery(trpc.latestUserGuess.queryOptions())

  return (
    <PageContainer innerClassName="max-w-none">
      <BTCGuessFeature />
      {latestUserGuessQuery.data && <GuessCard guess={latestUserGuessQuery.data} />}
    </PageContainer>
  )
}
