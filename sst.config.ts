/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'btc-hivemind',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: false, //['production'].includes(input?.stage),
      home: 'aws',
      region: 'eu-central-1',
      providers: {
        aws: {
          profile: 'dev',
        },
      },
    }
  },
  async run() {
    const betterAuthSecret = new sst.Secret('BETTER_AUTH_SECRET')
    const smtpSecret = new sst.Secret('SMTP_PASSWORD')
    const mobulaApiKey = new sst.Secret('MOBULA_API_KEY')

    const env = {
      NODE_ENV: $dev ? 'development' : 'production',
      SMTP_HOST: $dev ? '' : 'smtppro.zoho.com',
      SMTP_PORT: $dev ? '' : '465',
      SMTP_FROM_EMAIL: $dev ? '' : 'daniel@dunderfelt.consulting',
      API_URL: $dev ? 'http://localhost:3000' : 'https://bitguessr.developsuperpowers.com',
      DATABASE_URL: 'postgresql://postgres:password@localhost:5432/local', // Local only
      API_PATH: '/api',
    }

    const vpc = new sst.aws.Vpc('AppVPC', {
      bastion: true,
    })

    const database = new sst.aws.Aurora('AppDB', {
      engine: 'postgres',
      scaling: {
        min: '0.5 ACU',
        max: '2 ACU',
      },
      vpc,
      dev: {
        username: 'postgres',
        password: 'password',
        database: 'local',
        port: 5432,
      },
    })

    const router = new sst.aws.Router('Router', {
      domain: 'bitguessr.developsuperpowers.com',
    })

    const web = new sst.aws.StaticSite('AppWeb', {
      build: {
        command: 'bun run build',
        output: 'dist',
      },
      environment: {
        VITE_APP_URL: env.API_URL,
        NODE_ENV: $dev ? 'development' : 'production',
        VITE_API_PATH: env.API_PATH,
      },
      dev: {
        command: 'bun dev:client',
        url: 'http://localhost:5173',
      },
      router: {
        instance: router,
        path: '/',
      },
    })

    const migrator = new sst.aws.Function('DatabaseMigrator', {
      handler: 'db/migrator.handler',
      link: [database],
      vpc,
      timeout: '1 minute',
      copyFiles: [
        {
          from: 'drizzle',
          to: './drizzle',
        },
      ],
    })

    let server: sst.aws.Function

    if (!$dev) {
      new aws.lambda.Invocation('DatabaseMigratorInvocation', {
        input: Date.now().toString(),
        functionName: migrator.name,
      })

      server = new sst.aws.Function('AppService', {
        handler: 'server/handler.handler',
        timeout: '1 minute',
        url: {
          router: {
            instance: router,
            path: env.API_PATH,
            domain: 'bitguessr.developsuperpowers.com',
          },
        },
        environment: env,
        runtime: 'nodejs22.x',
        link: [database, betterAuthSecret, smtpSecret, web, mobulaApiKey, router],
      })
    }

    new sst.x.DevCommand('dev_server', {
      dev: {
        command: 'bun dev:server',
      },
      environment: env,
      link: [database, betterAuthSecret, smtpSecret, web, mobulaApiKey, router],
    })

    return {
      api: $dev ? `http://localhost:3000${env.API_PATH}` : server!.url,
      web: web.url,
      database: {
        host: database.host,
        port: database.port,
        username: database.username,
        password: database.password,
        database: database.database,
      },
    }
  },
})
