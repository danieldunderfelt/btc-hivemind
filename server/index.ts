import { trpcServer } from '@hono/trpc-server' // Deno 'npm:@hono/trpc-server'
import { auth } from '@server/auth/config'
import { getDb } from '@server/db'
import { router } from '@server/trpc'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { env } from './env'

export type HonoContext = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
    db: ReturnType<typeof getDb>
  }
}

const app = new Hono<HonoContext>()
const db = getDb()

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
  '*',
  cors({
    origin: env.WEB_URL,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
)

app.use(
  '/trpc/*',
  trpcServer({
    router: router,
    endpoint: '/trpc',
  }),
)

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

export default app
