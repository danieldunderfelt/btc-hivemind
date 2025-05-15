import BTCGuessFeature from '@/btc-guess/BTCGuessFeature'
import { AuthButton } from '@/components/AuthButton'
import BtcPriceDisplay from '@/components/BtcPriceDisplay'
import PageContainer from '@/components/PageContainer'
import { useSession } from '@/lib/auth'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const session = useSession()

  return (
    <PageContainer innerClassName="gap-6 flex flex-col">
      {session.data?.user ? (
        <BTCGuessFeature />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Suspense fallback={<Loader2 className="size-8 animate-spin self-center" />}>
            <BtcPriceDisplay />
          </Suspense>

          <h1 className="mb-4 font-bold text-2xl">BitFlip</h1>
          <p className="text-gray-500">A simple game to guess the price of Bitcoin.</p>
          <p className="mb-2 text-gray-500">Sign in to start guessing.</p>
          <AuthButton />
        </div>
      )}
    </PageContainer>
  )
}
