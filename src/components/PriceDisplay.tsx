import { cn } from '@/lib/utils'
import NumberFlow from '@number-flow/react'

export default function PriceDisplay({
  className,
  price,
  label,
  priceClassName,
}: {
  className?: string
  priceClassName?: string
  price: number | string | null
  label?: string
}) {
  const isOptimistic = !price || price === 'optimistic'

  return (
    <div className={cn('flex flex-col items-start gap-1', className)}>
      {label && <span className="text-gray-500 text-xs uppercase">{label}</span>}
      <span className={cn(isOptimistic && 'h-6 w-48 animate-pulse rounded-md bg-neutral-700')}>
        {!!price && !isOptimistic && (
          <NumberFlow
            value={Number.parseFloat(String(price))}
            className={cn('font-medium text-lg', priceClassName)}
            format={{ notation: 'standard', style: 'currency', currency: 'USD' }}
          />
        )}
      </span>
    </div>
  )
}
