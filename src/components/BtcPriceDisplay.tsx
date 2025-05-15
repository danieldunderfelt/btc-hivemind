import PriceDisplay from '@/components/PriceDisplay'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { RefreshCwIcon } from 'lucide-react'

export default function BtcPriceDisplay({ className }: { className?: string }) {
  const btcPriceQuery = useQuery({
    ...trpc.btcPrice.queryOptions(),
    refetchInterval: 1000 * 60 * 5,
  })

  const isLoading =
    btcPriceQuery.isFetching ||
    btcPriceQuery.isRefetching ||
    btcPriceQuery.isPending ||
    btcPriceQuery.isLoading

  return (
    <div className={cn('relative flex flex-col items-center gap-2 py-4', className)}>
      <Button
        className="absolute top-2 right-2"
        onClick={() => btcPriceQuery.refetch()}
        variant="ghost"
        disabled={isLoading}>
        <RefreshCwIcon className={cn('h-4 w-4', isLoading && 'animate-spin')} />
      </Button>
      <h2 className="font-light text-lg">Bitcoin Price Now</h2>
      {btcPriceQuery.data ? (
        <PriceDisplay price={btcPriceQuery.data} priceClassName="text-2xl/6 font-semibold" />
      ) : (
        <div className="h-6 w-52 animate-pulse rounded-md bg-neutral-700" />
      )}
    </div>
  )
}
