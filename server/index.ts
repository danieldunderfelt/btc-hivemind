import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './auth/config'
import { getDb } from './db'
import { env } from './env'
import { router } from './trpc'

export type HonoContext = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
    db: ReturnType<typeof getDb>
  }
}

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

app.use('*', async (c, next) => {
  c.set('db', db)
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    c.set('user', null)
    c.set('session', null)
    return next()
  }

  c.set('user', session.user)
  c.set('session', session.session)

  return next()
})

app.use(
  '/trpc/*',
  trpcServer({
    router: router,
    endpoint: '/trpc',
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
