import { env } from '@src/env'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: env.VITE_APP_URL,
})

export const { signIn, signUp, useSession } = createAuthClient()
