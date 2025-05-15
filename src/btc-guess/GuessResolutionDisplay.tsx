import { cn } from '@/lib/utils'

export default function GuessResolutionDisplay({
  isCorrect,
  className,
}: {
  isCorrect: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'text-nowrap font-medium text-sm/4',
        isCorrect ? 'text-green-600' : 'text-red-600',
        className,
      )}>
      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
    </span>
  )
}
