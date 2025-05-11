import { getVerificationEmail } from '@server/auth/verificationEmail'
import { getDb } from '@server/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP } from 'better-auth/plugins'
import nodemailer from 'nodemailer'
import { env } from '../env'

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: 'pg',
  }),
  secret: env.BETTER_AUTH_SECRET,
  url: env.BETTER_AUTH_URL,
  trustedOrigins: [
    'http://localhost:5173',
    'http://localhost:3000',
    env.BETTER_AUTH_URL,
    env.WEB_URL,
  ],
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  plugins: [
    emailOTP({
      sendVerificationOnSignUp: true,
      disableSignUp: false,
      async sendVerificationOTP({ email, otp, type }) {
        // TODO: Replace with actual email sending logic
        console.log(`Email OTP for ${email}: ${otp} (type: ${type})`)

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

        console.log(await transporter.verify())

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
