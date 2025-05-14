import { cn } from '@/lib/utils'
import type { GuessType } from '@server/guess/types'

export default function GuessDirectionDisplay({
  guessType,
  resolvedStatus,
  className,
}: {
  guessType: GuessType
  resolvedStatus: 'not-resolved' | 'correct' | 'wrong'
  className?: string
}) {
  const isUp = guessType === 'up'
  const isResolved = resolvedStatus !== 'not-resolved'
  const isCorrect = resolvedStatus === 'correct'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'font-bold text-neutral-400',
          isCorrect ? 'text-green-500' : 'text-red-500',
          !isResolved && 'text-lg text-white',
        )}>
        {isUp ? '↑ Up' : '↓ Down'}
      </span>
    </div>
  )
}
