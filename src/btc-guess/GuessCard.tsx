import GuessDirectionDisplay from '@/btc-guess/GuessDirectionDisplay'
import GuessResolutionDisplay from '@/btc-guess/GuessResolutionDisplay'
import PriceDisplay from '@/components/PriceDisplay'
import { cn } from '@/lib/utils'
import type { GuessViewRowType } from '@server/guess/types'
import { intlFormatDistance } from 'date-fns'
import { motion } from 'motion/react'
import type { Ref } from 'react'

export default function GuessCard({
  guess,
  className,
  size = 'small',
  ref,
}: {
  guess: GuessViewRowType
  className?: string
  size?: 'small' | 'large'
  ref?: Ref<HTMLDivElement>
}) {
  const formattedTime = intlFormatDistance(guess.guessedAt, new Date(), {
    style: 'short',
  })

  const formattedResolvedTime = guess.resolvedAt
    ? intlFormatDistance(guess.resolvedAt, new Date(), {
        style: 'short',
      })
    : null

  const isResolved = !!guess.resolvedAt
  const isCorrect = guess.isCorrect

  const showLarge = size === 'large'

  const guessedLabel = (
    <div className="flex flex-row items-baseline gap-2">
      <span className="text-gray-300 text-sm">Guessed</span>
      <span className="text-gray-500 text-xs">{formattedTime}</span>
    </div>
  )

  return (
    <motion.div
      ref={ref}
      layout={true}
      className={cn(
        'flex flex-col gap-6 rounded-lg border p-4 shadow-sm sm:p-6',
        !showLarge && 'gap-3 p-3 sm:p-4',
        className,
      )}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ type: 'spring', stiffness: 400, damping: 38, mass: 1, bounce: 0.2 }}>
      <div className={cn('flex flex-row items-end justify-between gap-2')}>
        <div
          className={cn(
            'flex flex-col items-start gap-1',
            showLarge && 'gap-3',
            !isResolved && 'gap-4',
          )}>
          <div className="flex flex-row items-baseline gap-2">
            <GuessDirectionDisplay
              guessType={guess.guess}
              resolvedStatus={isResolved ? (isCorrect ? 'correct' : 'wrong') : 'not-resolved'}
            />
            <span className="text-gray-300 text-xs">from</span>
          </div>
          <PriceDisplay
            price={guess.guessPrice}
            priceClassName={cn('text-base/4 sm:text-lg/6', !isResolved && 'text-lg/6 sm:text-xl/6')}
            className={cn('items-end', isResolved && 'flex-row items-center gap-2')}
          />
        </div>

        {!isResolved ? (
          <div className={cn('flex flex-col items-end gap-1', showLarge && 'gap-4')}>
            {guessedLabel}

            <motion.span
              key="price-loading"
              className={cn('h-6 w-32 animate-pulse rounded-md bg-neutral-700')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          </div>
        ) : (
          <div className={cn('flex flex-col items-end gap-1', showLarge && 'gap-3')}>
            <div className="flex flex-row items-baseline gap-2">
              <GuessResolutionDisplay isCorrect={isCorrect} />
              <span className="text-gray-300 text-xs">at</span>
            </div>
            <PriceDisplay
              price={guess.resolvedPrice ?? 'optimistic'}
              priceClassName={cn('text-base/4 sm:text-lg/6')}
              className={cn('flex-row-reverse items-center gap-2')}
            />
          </div>
        )}
      </div>
      {isResolved && (
        <div className={cn('flex items-center justify-between gap-2', showLarge && '-mt-1 gap-4')}>
          {guessedLabel}
          <div className="flex flex-row items-baseline gap-2">
            <span className="text-gray-300 text-sm">Resolved</span>
            <span className="text-gray-500 text-xs">{formattedResolvedTime}</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
