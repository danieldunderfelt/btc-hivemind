import { AuthButton } from '@/components/AuthButton'

export default function AppHeader() {
  return (
    <header className="flex items-center justify-between border-gray-400/30 border-b px-2 py-2 pl-4">
      <h1>BitFlip</h1>
      <AuthButton />
    </header>
  )
}
