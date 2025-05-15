import { cn } from '@/lib/utils'
import NumberFlow from '@number-flow/react'
import { AnimatePresence, motion } from 'motion/react'

export default function PriceDisplay({
  className,
  price,
  priceClassName,
}: {
  className?: string
  priceClassName?: string
  price: number | string | null
}) {
  const isOptimistic = !price || price === 'optimistic'

  return (
    <div className={cn('flex flex-col flex-nowrap items-start gap-1', className)}>
      <AnimatePresence mode="popLayout">
        {isOptimistic && (
          <motion.span
            key="price-loading"
            className={cn('h-8 w-48 animate-pulse rounded-md bg-neutral-700')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
        {!!price && !isOptimistic && (
          <motion.span
            className="flex h-8 items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}>
            <NumberFlow
              key="price"
              value={Number.parseFloat(String(price))}
              className={cn('font-medium text-lg/8', priceClassName)}
              format={{ notation: 'standard', style: 'currency', currency: 'USD' }}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
