import type { GuessViewRowType } from '@server/guess/types'

export default function GuessCard({ guess }: { guess: GuessViewRowType }) {
  const isUp = guess.guess === 'up'
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(guess.guessPrice))

  const formattedTime = new Date(guess.guessedAt).toLocaleString()

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className={`font-bold text-lg ${isUp ? 'text-green-500' : 'text-red-500'}`}>
          {isUp ? '↑ Up' : '↓ Down'}
        </span>
        <span className="text-gray-500 text-sm">{formattedTime}</span>
      </div>
      <div className="mt-2">
        <p className="text-gray-600 text-sm">Price at guess:</p>
        <p className="font-semibold text-lg">{formattedPrice}</p>
      </div>
    </div>
  )
}
