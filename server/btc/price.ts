import { cachedValue } from '@server/lib/cache'
import { env } from '../env'

const useProdApi = env.NODE_ENV === 'production'

async function cryptoComparePrice(cached = true) {
  const url = `https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD`
  const urlWithApiKey = useProdApi
    ? `${url}&extraParams=bitflip.verycool.dev&api_key=${env.CRYPTOCOMPARE_API_KEY}`
    : url

  const data = await cachedValue(urlWithApiKey, cached ? 1000 * 10 : 0, async () => {
    const response = await fetch(urlWithApiKey).then((res) => res.json())
    return response.USD as number
  })

  return data || 0
}

export async function getPrice(cached = true) {
  return await cryptoComparePrice(cached)
}

/* 
These API's did NOT work out.

const MOBULA_API_PATH = '/api/1/market/data?asset=Bitcoin'
const MOBULA_API_URL = useProdApi ? 'https://production-api.mobula.io' : 'https://api.mobula.io'

async function getMobulaPrice() {
  const url = `${MOBULA_API_URL}${MOBULA_API_PATH}`

  const response = await fetch(url, {
    headers: (useProdApi
      ? {
          Authorization: env.MOBULA_API_KEY,
          'Content-Type': 'application/json',
        }
      : {
          'Content-Type': 'application/json',
        }) as HeadersInit,
  }).then((res) => res.json())

  console.log('response', response.data.price)
  return (response.data.price || 0) as number
}

const CMC_API_URL = useProdApi
  ? 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest'
  : 'https://sandbox-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest'

const use_CMC_API_KEY = useProdApi ? env.CMC_API_KEY : 'b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c'

async function getCMCPrice() {
  const url = `${CMC_API_URL}?slug=bitcoin`

  function getCacheTTL(response: { quote: { USD: { last_updated: string } } }) {
    const lastUpdatedVal = response.quote.USD.last_updated

    if (!lastUpdatedVal) {
      return 1000 * 60
    }

    const lastUpdated = new Date(lastUpdatedVal)
    const lastUpdatedTime = lastUpdated.getTime()

    const now = Date.now()
    const oneMinuteMs = 1000 * 60 * 1.5

    const difference = lastUpdatedTime + oneMinuteMs - now
    console.log('difference', difference / 1000)

    return Math.max(100, difference)
  }

  const data = await cachedValue(url, getCacheTTL, async () => {
    const response = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': use_CMC_API_KEY,
        Accept: 'application/json',
      },
    }).then((res) => res.json())

    return (response.data['1'] || response.data.bitcoin) as {
      quote: { USD: { price: number; last_updated: string } }
    }
  })

  if (!data) {
    return 0
  }

  console.log('data', data.quote.USD.price, data.quote.USD.last_updated)
  return data.quote.USD.price || 0
} */
