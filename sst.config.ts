/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'btc-hivemind',
      removal: 'remove', // input?.stage === 'production' ? 'retain' : 'remove',
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
    const cryptoCompareApiKey = new sst.Secret('CRYPTOCOMPARE_API_KEY')

    const domain =
      $app.stage === 'production'
        ? 'verycool.dev'
        : $app.stage === 'dev'
          ? 'dev.verycool.dev'
          : `${$app.stage}.dev.verycool.dev`

    function subdomain(name: string) {
      if ($app.stage === 'production') return `${name}.${domain}`
      return `${name}-${domain}`
    }

    const env = {
      NODE_ENV: $dev ? 'development' : 'production',
      SMTP_HOST: $dev ? '' : 'smtppro.zoho.com',
      SMTP_PORT: $dev ? '' : '465',
      SMTP_FROM_EMAIL: $dev ? '' : 'daniel@dunderfelt.consulting',
      API_URL: $dev ? 'http://localhost:3000' : `https://${subdomain('bitflip-api')}`,
      DATABASE_URL: 'postgresql://postgres:password@localhost:5432/local', // Local only
      API_PATH: '/',
      SST_AWS_ACCESS_KEY_ID: $interpolate`${process.env.SST_AWS_ACCESS_KEY_ID}`,
      SST_AWS_SECRET_ACCESS_KEY: $interpolate`${process.env.SST_AWS_SECRET_ACCESS_KEY}`,
      SST_AWS_SESSION_TOKEN: $interpolate`${process.env.SST_AWS_SESSION_TOKEN}`,
    }

    const vpc = new sst.aws.Vpc('AppVPC')

    const database = new sst.aws.Aurora('AppDB', {
      engine: 'postgres',
      scaling: {
        min: '0.5 ACU',
        max: '2 ACU',
      },
      vpc,
      dataApi: true,
      dev: {
        username: 'postgres',
        password: 'password',
        database: 'local',
        port: 5432,
      },
    })

    const router = new sst.aws.Router('Router', {
      domain: {
        name: domain,
        aliases: [`*.${domain}`],
      },
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
        domain: subdomain('bitflip'),
      },
    })

    const queue = new sst.aws.Queue('AppQueue')
    queue.subscribe({
      handler: 'server/queueHandler.handler',
      link: [database, betterAuthSecret, smtpSecret, web, router, cryptoCompareApiKey, queue],
      environment: env,
    })

    const server = new sst.aws.Function('AppService', {
      handler: 'server/handler.handler',
      timeout: '1 minute',
      url: {
        router: {
          instance: router,
          domain: subdomain('bitflip-api'),
        },
        cors: {
          allowOrigins: [web.url],
          allowCredentials: true,
        },
      },
      dev: false,
      environment: env,
      runtime: 'nodejs22.x',
      link: [database, betterAuthSecret, smtpSecret, web, router, cryptoCompareApiKey, queue],
    })

    const migrator = new sst.aws.Function('DatabaseMigrator', {
      handler: 'db/migrator.handler',
      link: [database],
      vpc,
      timeout: '1 minute',
      dev: false,
      copyFiles: [
        {
          from: 'drizzle',
          to: './drizzle',
        },
      ],
    })

    if (!$dev) {
      new aws.lambda.Invocation('DatabaseMigratorInvocation', {
        input: Date.now().toString(),
        functionName: migrator.name,
      })
    }

    new sst.x.DevCommand('dev_server', {
      dev: {
        command: 'bun dev:server',
      },
      environment: env,
      link: [database, betterAuthSecret, smtpSecret, web, router, cryptoCompareApiKey, queue],
    })

    return {
      api: $dev ? `http://localhost:3000` : server.url,
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
