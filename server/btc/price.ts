import { env } from '../env'

export async function getPrice() {
  const response = await fetch('https://api.mobula.io/api/1/market/data?asset=Bitcoin', {
    headers: (env.NODE_ENV === 'production'
      ? {
          Authorization: env.MOBULA_API_KEY,
        }
      : undefined) as HeadersInit,
  })

  const data = await response.json()
  return (data.price || 0) as number
}
