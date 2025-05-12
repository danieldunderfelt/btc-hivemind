import { env } from '@/env'
import { mergePaths } from '@/lib/utils'
import { emailOTPClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: env.VITE_APP_URL,
  basePath: mergePaths('/auth'),
  plugins: [emailOTPClient()],
  fetchOptions: {
    credentials: 'include',
  },
})

export const { signIn, signUp, useSession, signOut } = authClient
