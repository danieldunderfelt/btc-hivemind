import PriceDisplay from '@/components/PriceDisplay'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc'
import { cn } from '@/lib/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import { RefreshCwIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { useDeferredValue } from 'react'
import { useSpinDelay } from 'spin-delay'

export default function BtcPriceDisplay({ className }: { className?: string }) {
  const btcPriceQuery = useSuspenseQuery({
    ...trpc.btcPrice.queryOptions(),
    refetchInterval: 1000 * 60 * 5,
  })

  const priceValue = useDeferredValue(btcPriceQuery.data)

  const isLoading =
    btcPriceQuery.isFetching ||
    btcPriceQuery.isRefetching ||
    btcPriceQuery.isPending ||
    btcPriceQuery.isLoading

  const isLoadingWithDelay = useSpinDelay(isLoading)

  return (
    <motion.div
      layoutId="btc-price-display"
      className={cn('relative flex flex-col items-center gap-2 py-4', className)}>
      <h2 className="font-light text-lg">Bitcoin Price Now</h2>

      {priceValue ? (
        <>
          <div className="flex flex-row items-center gap-2">
            <PriceDisplay price={priceValue} priceClassName="text-2xl/6 font-semibold" />
            <Button
              onClick={() => btcPriceQuery.refetch()}
              variant="ghost"
              disabled={isLoadingWithDelay}
              className="-mr-6">
              <RefreshCwIcon className={cn('size-4', isLoadingWithDelay && 'animate-spin')} />
            </Button>
          </div>
          <span className="text-center text-[0.6rem] text-neutral-500">
            Price shown is cached and may not be fully up to date.
            <br />
            Guesses are based on fresh data.
          </span>
        </>
      ) : (
        <div className="h-6 w-52 animate-pulse rounded-md bg-neutral-700" />
      )}
    </motion.div>
  )
}
