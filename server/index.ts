import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './auth/config'
import { getDb } from './db'
import { env } from './env'
import { router } from './trpc'
import type { HonoContext } from './types'

const app = new Hono<HonoContext>()
const db = getDb()

app.use(
  '*',
  cors({
    origin: env.WEB_URL,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
)

app.use('*', async (ctx, next) => {
  const session = await auth.api.getSession({ headers: ctx.req.raw.headers })

  if (!session) {
    ctx.set('user', null)
    ctx.set('session', null)

    return next()
  }

  ctx.set('user', session.user)
  ctx.set('session', session.session)

  return next()
})

app.use(
  '/trpc/*',
  trpcServer({
    router: router,
    endpoint: '/trpc',
    createContext(_, c) {
      return {
        user: c.get('user'),
        session: c.get('session'),
        db,
      }
    },
  }),
)

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))
app.on(['GET'], '/check-auth', (c) => {
  const session = c.get('session')

  if (!session) {
    return c.json({ authenticated: false })
  }

  return c.json({ authenticated: true })
})

export default app
