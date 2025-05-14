import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
import { Resource } from 'sst'
import { env } from '../env'

// This might stop working if the session token expires.
const sqs = new SQSClient({
  region: 'eu-central-1',
  credentials: {
    accessKeyId: env.SST_AWS_ACCESS_KEY_ID,
    secretAccessKey: env.SST_AWS_SECRET_ACCESS_KEY,
    sessionToken: env.SST_AWS_SESSION_TOKEN,
  },
})

export async function sendMessage(messageBody: string) {
  try {
    const result = await sqs.send(
      new SendMessageCommand({
        QueueUrl: Resource.AppQueue.url,
        MessageBody: messageBody,
        DelaySeconds: 5,
      }),
    )

    console.log('Message sent to queue', result)
  } catch (error) {
    console.error('Error sending message to queue', error)
  }
}
