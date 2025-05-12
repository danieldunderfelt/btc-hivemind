import { AuthButton } from '@/components/AuthButton'
import { Link } from '@tanstack/react-router'

export default function AppHeader() {
  return (
    <header className="flex items-center justify-between border-gray-400/30 border-b px-2 py-2 pl-4">
      <h1>BitGuessr</h1>
      <div className="flex gap-4">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>
        <Link to="/guess" className="[&.active]:font-bold">
          Guess
        </Link>
      </div>
      <AuthButton />
    </header>
  )
}
