import { cn } from '@/lib/utils'
import type { GuessViewRowType } from '@server/guess/types'
import GuessCard from './GuessCard'

export default function GuessesList({
  guesses,
  className,
}: {
  guesses: GuessViewRowType[]
  className?: string
}) {
  return (
    guesses.length > 0 && (
      <div className={cn('flex flex-col gap-2', className)}>
        {guesses.map((guess) => (
          <GuessCard key={guess.guessId} guess={guess} />
        ))}
      </div>
    )
  )
}
