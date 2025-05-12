/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'btc-hivemind',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
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

    const env = {
      NODE_ENV: $dev ? 'development' : 'production',
      SMTP_HOST: 'smtppro.zoho.com',
      SMTP_PORT: '465',
      SMTP_FROM_EMAIL: 'daniel@dunderfelt.consulting',
      API_URL: $dev ? 'http://localhost:3000' : 'https://bitguessr.developsuperpowers.com',
      DATABASE_URL: 'postgresql://postgres:password@localhost:5432/local', // For local only
    }

    const vpc = new sst.aws.Vpc('AppVPC')

    const database = new sst.aws.Aurora('AppDB', {
      engine: 'postgres',
      scaling: {
        min: '0.5 ACU',
        max: '2 ACU',
      },
      dataApi: true,
      vpc,
      dev: {
        username: 'postgres',
        password: 'password',
        database: 'local',
        port: 5432,
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
      },
      dev: {
        command: 'bun dev:client',
        url: 'http://localhost:5173',
      },
    })

    const cluster = new sst.aws.Cluster('AppCluster', { vpc })

    const server = new sst.aws.Service('AppService', {
      cluster,
      capacity: 'spot',
      dev: {
        command: 'bun dev:server',
        url: 'http://localhost:3000',
      },
      loadBalancer: {
        domain: 'bitguessr.developsuperpowers.com',
        rules: [
          { listen: '80/http', redirect: '443/https' },
          { listen: '443/https', forward: '3000/http' },
        ],
      },
      environment: env,
      link: [database, betterAuthSecret, smtpSecret, web],
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

    if (!$dev) {
      new aws.lambda.Invocation('DatabaseMigratorInvocation', {
        input: Date.now().toString(),
        functionName: migrator.name,
      })
    }

    return {
      api: server.url,
      web: web.url,
    }
  },
})
