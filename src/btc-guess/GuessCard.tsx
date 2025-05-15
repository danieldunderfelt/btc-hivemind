import GuessDirectionDisplay from '@/btc-guess/GuessDirectionDisplay'
import GuessResolutionDisplay from '@/btc-guess/GuessResolutionDisplay'
import PriceDisplay from '@/components/PriceDisplay'
import { cn } from '@/lib/utils'
import NumberFlow from '@number-flow/react'
import type { GuessViewRowType } from '@server/guess/types'
import { addMinutes, differenceInSeconds, intlFormatDistance } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { type Ref, useEffect, useState } from 'react'

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

  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (isResolved) {
      setCountdown(null)
      return
    }

    // Initial calculation
    const endTime = addMinutes(guess.guessedAt, 1)
    const now = new Date()
    const secondsRemaining = differenceInSeconds(endTime, now)

    if (secondsRemaining <= 0) {
      setCountdown(0)
    } else {
      setCountdown(secondsRemaining)
    }

    const intervalId = setInterval(() => {
      const endTime = addMinutes(guess.guessedAt, 1)
      const now = new Date()
      const secondsRemaining = differenceInSeconds(endTime, now)

      if (secondsRemaining <= 0) {
        setCountdown(0)
        clearInterval(intervalId)
      } else {
        setCountdown(secondsRemaining)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [guess.guessedAt, isResolved])

  const showLarge = size === 'large'

  return (
    <motion.div
      ref={ref}
      layout={true}
      className={cn(
        'flex flex-col gap-6 rounded-lg border p-4 shadow-sm',
        !showLarge && 'gap-3 p-3',
        className,
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 38, mass: 1, bounce: 0.2 }}>
      <div className={cn('flex items-center justify-between gap-2', showLarge && '-mt-1 gap-4')}>
        <div className="flex flex-row items-baseline gap-2">
          <span className="text-gray-300 text-sm">Guessed</span>
          <span className="text-gray-500 text-xs">{formattedTime}</span>
        </div>

        <div className="flex flex-row items-baseline gap-2">
          <span className="text-gray-300 text-sm">{isResolved ? 'Resolved' : 'Resolving in'}</span>
          {formattedResolvedTime && (
            <span className="text-gray-500 text-xs">{formattedResolvedTime}</span>
          )}
        </div>
      </div>

      <div className={cn('flex flex-row items-end justify-between gap-2')}>
        <div className={cn('flex flex-col items-start gap-1', showLarge && 'gap-3')}>
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
          <div className={cn('flex flex-row items-center gap-2')}>
            <motion.span
              key="price-loading"
              className={cn('h-6 w-36 animate-pulse self-center rounded-md bg-neutral-700')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            {countdown !== null && countdown > 0 && (
              <NumberFlow
                value={countdown}
                format={{ notation: 'standard' }}
                suffix="s"
                className="text-gray-300 text-xl"
              />
            )}
            {countdown === 0 && !isResolved && (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            )}
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
    </motion.div>
  )
}
