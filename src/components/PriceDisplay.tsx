import { cn } from '@/lib/utils'
import NumberFlow from '@number-flow/react'

export default function PriceDisplay({
  className,
  price,
  label,
  priceClassName,
  labelClassName,
}: {
  className?: string
  priceClassName?: string
  labelClassName?: string
  price: number | string | null
  label?: string
}) {
  const isOptimistic = !price || price === 'optimistic'

  return (
    <div className={cn('-mb-1.5 flex flex-col flex-nowrap items-start gap-1', className)}>
      {label && (
        <span className={cn('text-nowrap text-gray-500 text-xs/none uppercase', labelClassName)}>
          {label}
        </span>
      )}
      <span
        className={cn(
          'flex h-8 items-center',
          isOptimistic && 'w-48 animate-pulse rounded-md bg-neutral-700',
        )}>
        {!!price && !isOptimistic && (
          <NumberFlow
            value={Number.parseFloat(String(price))}
            className={cn('font-medium text-lg/8', priceClassName)}
            format={{ notation: 'standard', style: 'currency', currency: 'USD' }}
          />
        )}
      </span>
    </div>
  )
}
