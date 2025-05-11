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
    const vpc = new sst.aws.Vpc('BTCVPC')

    const database = new sst.aws.Aurora('BTCDB', {
      engine: 'postgres',
      scaling: {
        min: '1 ACU',
        max: '10 ACU',
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

    const cluster = new sst.aws.Cluster('BTCluster', { vpc })
    const server = new sst.aws.Service('BTCService', {
      cluster,
      loadBalancer: {
        ports: [{ listen: '80/http', forward: '3000/http' }],
      },
      dev: {
        command: 'bun dev:server',
      },
      link: [database, betterAuthSecret],
      environment: {
        LOCAL_APP_URL: $dev ? 'http://localhost:5173' : '',
      },
    })

    const web = new sst.aws.StaticSite('BTCWeb', {
      build: {
        command: 'bun run build',
        output: 'dist',
      },
      environment: {
        VITE_APP_URL: $dev ? 'http://localhost:3000' : server.url,
      },
      dev: {
        command: 'bun dev:client',
      },
    })

    return {
      api: server.url,
      web: web.url,
    }
  },
})
