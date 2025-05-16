import { sendEmail } from '@server/lib/email'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP } from 'better-auth/plugins'
import { env } from '../env'
import { getDb } from '../lib/db'
import { mergePaths } from '../lib/utils'
import { getVerificationEmail } from './verificationEmail'

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: 'pg',
  }),
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: ['http://localhost:5173', 'http://localhost:3000', env.WEB_URL, env.API_URL],
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
    defaultCookieAttributes: {
      secure: true,
      sameSite: 'lax',
      partitioned: true,
    },
  },
  baseURL: env.API_URL,
  basePath: mergePaths('/auth'),
  plugins: [
    emailOTP({
      sendVerificationOnSignUp: true,
      disableSignUp: false,
      async sendVerificationOTP({ email, otp, type }) {
        console.log('Sending verification OTP:', otp)
        const html = await getVerificationEmail({ email, otp })

        const mailOptions = {
          to: email,
          subject: `Your BitFlip Verification Code`,
          text: `Your verification code is: ${otp}`,
          html,
        }

        try {
          await sendEmail(mailOptions)
          console.log(`Verification OTP email sent to ${email}`)
        } catch (error) {
          console.error('Error sending verification OTP email:', error)
        }
      },
    }),
  ],
})
