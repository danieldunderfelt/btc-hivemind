import { Resend } from 'resend'
import { env } from '../env'

const resend = new Resend(env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: { to: string; subject: string; html: string; text?: string }) {
  const result = await resend.emails.send({
    from: `${env.RESEND_FROM_NAME} <${env.RESEND_FROM_EMAIL}>`,
    to,
    subject,
    html,
    text,
  })

  if (result.error) {
    console.error(result.error)
    return null
  }

  return result
}
