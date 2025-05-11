import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { authClient } from '@/lib/auth'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'

export default function LoginView({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')

  const [showOtpForm, setShowOtpForm] = useState(false)
  const router = useRouter()

  const sendOtpMutation = useMutation({
    mutationFn: (variables: { email: string }) =>
      authClient.emailOtp.sendVerificationOtp({ ...variables, type: 'sign-in' }),
    onSuccess: () => {
      setShowOtpForm(true)
    },
  })

  const signInMutation = useMutation({
    mutationFn: (variables: { otp: string; email: string }) =>
      authClient.signIn.emailOtp(variables),
    onSuccess: ({ data, error }) => {
      if (error) {
        throw error
      }

      router.navigate({ to: redirectTo, replace: true })
    },
  })

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    sendOtpMutation.reset()
    sendOtpMutation.mutate({ email })
  }

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    signInMutation.reset()
    signInMutation.mutate({ email, otp })
  }

  const displayedError = sendOtpMutation.error?.message || signInMutation.error?.message || null

  return (
    <main className="flex grow flex-col items-center justify-center gap-6 p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6 shadow-sm">
        {!showOtpForm ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block font-medium text-foreground text-sm">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={sendOtpMutation.isPending}
                className="text-gray-800 text-sm"
              />
            </div>
            <Button type="submit" className="w-full" disabled={sendOtpMutation.isPending}>
              {sendOtpMutation.isPending ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="otp"
                className="mb-2 block text-center font-medium text-foreground text-sm">
                Enter OTP sent to {email}
              </label>
              <InputOTP
                id="otp"
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={signInMutation.isPending}>
                <InputOTPGroup className="justify-center">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={signInMutation.isPending || otp.length < 6}>
              {signInMutation.isPending ? 'Verifying...' : 'Sign In'}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full text-sm"
              onClick={() => {
                setShowOtpForm(false)
                sendOtpMutation.reset()
                signInMutation.reset()
                setOtp('')
              }}
              disabled={signInMutation.isPending || sendOtpMutation.isPending}>
              Back to email
            </Button>
          </form>
        )}
        {displayedError && (
          <p className="mt-2 text-center text-destructive text-sm">{displayedError}</p>
        )}
      </div>
    </main>
  )
}
