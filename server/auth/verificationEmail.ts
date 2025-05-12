import { EmailTemplate } from '@daveyplate/better-auth-ui'
import { render } from '@react-email/render'
import React from 'react'
import { env } from '../env'

export async function getVerificationEmail({
  email,
  otp,
}: {
  email: string
  otp: string
}) {
  return render(
    EmailTemplate({
      action: 'Verify Email',
      content: React.createElement(
        React.Fragment,
        null,
        React.createElement('p', null, `Hello ${email.split('@')[0]},`),
        React.createElement('p', null, 'Your verification code for BitGuessr is:'),
        React.createElement('p', { style: { fontSize: '24px', fontWeight: 'bold' } }, otp),
      ),
      heading: 'Verify Email',
      siteName: 'BitGuessr',
      baseUrl: env.WEB_URL,
    }),
  )
}
