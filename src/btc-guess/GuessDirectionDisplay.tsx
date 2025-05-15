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
    <div
      className={cn(
        'flex flex-nowrap items-center gap-2 text-nowrap font-bold text-base/4 text-neutral-400',
        isCorrect ? 'text-green-500' : 'text-red-500',
        !isResolved && 'text-lg/4 text-white',
        className,
      )}>
      {isUp ? '↑ Up' : '↓ Down'}
    </div>
  )
}
