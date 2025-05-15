import GuessCard from '@/btc-guess/GuessCard'
import { useLatestGuess } from '@/btc-guess/useLatestGuess'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc'
import { cn } from '@/lib/utils'
import { ConfettiTrigger } from '@/providers/ConfettiProvider'
import { useMutation } from '@tanstack/react-query'
import { addMinutes, isBefore } from 'date-fns'
import { CheckCircleIcon, XCircleIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { type Ref, useMemo } from 'react'
import { toast } from 'sonner'

type GuessPhase = 'none' | 'pending' | 'resolving' | 'correct' | 'wrong'

export default function CurrentGuess({
  onDone,
  ref,
}: { onDone: () => void; ref?: Ref<HTMLDivElement> }) {
  const { query: latestGuessQuery, refresh: refreshLatestGuess } = useLatestGuess()
  const guess = latestGuessQuery.data

  const resolveMutation = useMutation(
    trpc.resolveGuess.mutationOptions({
      onSuccess: (status) => {
        if (status === 'success') {
          refreshLatestGuess()
        } else {
          toast.error('Failed to resolve guess.')
        }
      },
    }),
  )

  const isOptimistic = guess?.guessPrice === 'optimistic'
  const isResolved = !!guess?.resolvedAt

  const canResolve = useMemo(
    () =>
      !isOptimistic &&
      !isResolved &&
      isBefore(addMinutes(guess?.guessedAt ?? new Date(), 1), new Date()) &&
      !guess?.startResolvingAt,
    [guess, isResolved, isOptimistic],
  )

  if (!guess) {
    return null
  }

  return (
    <motion.div
      ref={ref}
      layout={true}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 38, mass: 1, bounce: 0.2 }}
      className={cn('absolute inset-0 z-10 h-full w-full backdrop-blur-md')}>
      <motion.div
        key="current-guess-wrapper"
        layout={true}
        className="flex max-h-screen w-full flex-col items-center justify-center gap-6 px-2 pt-52">
        {isResolved && guess.isCorrect ? (
          <ConfettiTrigger
            isActive={isResolved && !!guess?.isCorrect}
            motionProps={{
              layout: true,
              initial: { opacity: 0, scale: 1.5 },
              animate: { opacity: 1, scale: 1 },
              exit: { opacity: 0, scale: 0.75 },
              transition: { type: 'spring', stiffness: 300, damping: 25, mass: 1, bounce: 0.4 },
            }}
            key="correct-guess"
            confettiKey={`${guess.guessId}-correct`}
            className="flex flex-row items-center gap-4 text-green-500">
            <CheckCircleIcon className="size-10" />
            <span className="font-medium text-lg">Correct!</span>
          </ConfettiTrigger>
        ) : isResolved && !guess.isCorrect ? (
          <motion.div
            layout={true}
            key="wrong-guess"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 38, mass: 1, bounce: 0.2 }}
            className="flex flex-row items-center gap-4 text-red-500">
            <XCircleIcon className="size-7" />
            <span className="text-lg">Wrong :(</span>
          </motion.div>
        ) : (
          <motion.div layout={true} key="pending-guess">
            <span className="animate-pulse text-base text-neutral-400">Pending...</span>
          </motion.div>
        )}

        <GuessCard
          guess={guess}
          size="large"
          className="pointer-events-auto w-full max-w-2xl rounded-lg bg-background shadow-background shadow-lg"
        />
        <Button
          onClick={() => onDone()}
          variant="default"
          disabled={!isResolved}
          className="pointer-events-auto">
          Done
        </Button>
      </motion.div>
    </motion.div>
  )
}

/* <Button
  disabled={!canResolve || resolveMutation.isPending}
  onClick={() => {
    resolveMutation.mutate({ guessId: guess.guessId })
    toast.success('Guess is resolving.')
  }}
  className="h-auto rounded-md bg-blue-500 px-2 py-1 text-white text-xs">
  {resolveMutation.isPending ? 'Resolving...' : 'Resolve'}
</Button> */
