import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP } from 'better-auth/plugins'
import nodemailer from 'nodemailer'
import { getDb } from '../db'
import { env } from '../env'
import { getVerificationEmail } from './verificationEmail'

console.log('NODE_ENV', env.WEB_URL, env.API_URL)

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
      domain: env.WEB_URL,
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: true,
      partitioned: true,
    },
  },
  baseURL: env.API_URL,
  plugins: [
    emailOTP({
      sendVerificationOnSignUp: true,
      disableSignUp: false,
      async sendVerificationOTP({ email, otp, type }) {
        console.log('Sending verification OTP:', otp)

        if (!env.SMTP_HOST) {
          console.log(
            'No SMTP host found, skipping email verification. Use above OTP for verification.',
          )
          return
        }

        const transporter = nodemailer.createTransport({
          pool: true,
          host: env.SMTP_HOST,
          port: Number(env.SMTP_PORT),
          secure: true,
          auth: {
            user: env.SMTP_FROM_EMAIL,
            pass: env.SMTP_PASSWORD,
          },
        })

        const html = await getVerificationEmail({ email, otp })

        const mailOptions = {
          from: `"Daniel Dunderfelt" <${env.SMTP_FROM_EMAIL}>`,
          to: email,
          subject: `Your BitGuessr Verification Code`,
          text: `Your verification code is: ${otp}`,
          html,
        }

        try {
          await transporter.sendMail(mailOptions)
          console.log(`Verification OTP email sent to ${email}`)
        } catch (error) {
          console.error('Error sending verification OTP email:', error)
        }
      },
    }),
  ],
})
